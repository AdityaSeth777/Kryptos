import { useDynamicContext } from '@dynamic-labs/sdk-react'
import { JsonRpcSigner } from '@ethersproject/providers'
import { Client, DecodedMessage } from '@xmtp/xmtp-js'
import { ReactNode, useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessengerContext } from '../../modules/MessengerContext'
import { SignaturePendingContext } from '../../modules/SignaturePendingContext'
import { conversationsToChats } from '../../modules/conversationToChat'
import Chat from '../../types/Chat.interface'

// Signature pending text
export const pendingMessage = 'We are connecting you to our messenger client'

export default function Messenger({ children }: { children: ReactNode }) {
  // Consume signature pending
  const { setPendingText } = useContext(SignaturePendingContext)

  // ===================================
  // === MESSENGER CLIENT
  // ===================================

  // Get wallet from dynamic
  const { primaryWallet, handleLogOut } = useDynamicContext()

  // Unlinks wallet
  const logout = () => (primaryWallet == undefined ? null : handleLogOut())

  // The messenger interface
  const [messenger, setMessenger] = useState<null | Client>(null)

  // Synchronize the messenger to the signed user
  useEffect(() => {
    // If no wallet, no messenger
    if (primaryWallet == null) {
      setMessenger(null)
      return
    }

    // If messenger already has this address, ignore
    if (primaryWallet.address == messenger?.address) return

    // Get the wallet's signer
    primaryWallet.connector
      .getSigner()
      .then((signer) => {
        // Set signature pending
        setPendingText(pendingMessage)

        // const environment =
        //   !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
        //     ? 'dev'
        //     : 'production'

        // ;(Client.create as any).mockResolvedValue(42)

        return Client.create(signer as JsonRpcSigner)
      })
      .then((newMessenger) => {
        setMessenger(newMessenger)

        // Conclude signature
        setPendingText('')
      })
      .catch((error) => {
        console.log('failed to get messenger', error)
        logout()

        // Cancel signature
        setPendingText('')
      })
  }, [primaryWallet])

  // ===================================
  // === CHATS SYNCHRONIZATION
  // ===================================

  // Chats of the current user
  const [chats, setChats] = useState<{ [address: string]: Chat }>({})

  useEffect(() => {
    if (messenger == undefined) {
      setChats({})
      return
    }

    // Initializes chats
    messenger.conversations.list().then(async (newConversations) => {
      // Turn them into chats
      const newChats = await conversationsToChats(newConversations)

      setChats((chats) => ({ ...chats, ...newChats }))
    })

    // Stops streaming
    let stopStreaming = () => {}

    // Resolves when this effect is cleaned up
    const cleanupPromise = new Promise<{ value: null; done: true }>(
      (resolve) => (stopStreaming = () => resolve({ value: null, done: true }))
    )

    // Stream new conversations for this user
    messenger.conversations.streamAllMessages().then(async (messageStream) => {
      while (true) {
        // Get new conversation
        const { value, done } = await Promise.race([
          messageStream.next(),
          cleanupPromise,
        ])

        // Get as message
        const message = value as DecodedMessage

        // Stop if done
        if (done) {
          messageStream.return(null)
          break
        }

        // Add the new conversation to the chats
        setChats((chats) => ({
          ...chats,
          [message.conversation.peerAddress]: {
            messages: { [message.id]: message },
            peerAddress: message.conversation.peerAddress,
            latestMessage: message,
            send: (targetMessage) => message.conversation.send(targetMessage),
          },
        }))
      }
    })

    return stopStreaming
  }, [messenger])

  // =====================================
  // === CURRENT CHAT HANDLING
  // =====================================

  // Grab currently open chat address
  const [searchParams, setSearchParams] = useSearchParams()

  // Get current chat
  const [selectedChat, setSelectedChat] = useState<null | string>(null)

  // Open a chat
  const openChat = (address: string) => setSearchParams({ chat: address })

  // Close a chat
  const closeChat = () => setSearchParams({})

  // Sync selected chat to url param
  useEffect(() => setSelectedChat(searchParams.get('chat')), [searchParams])

  return (
    <MessengerContext.Provider
      value={{ messenger, chats, openChat, closeChat, selectedChat }}
    >
      {children}
    </MessengerContext.Provider>
  )
}
