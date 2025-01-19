import { Conversation, DecodedMessage, SortDirection } from '@xmtp/xmtp-js'
import { useContext, useEffect, useState } from 'react'
import { MessengerContext } from '../MessengerContext'
import conversationToChat from '../conversationToChat'
import Chat from '../../types/Chat.interface'
import { initialMessageCount } from '../../config'

// Syncs a single chat
export default function useChat(address: string | null) {
  const { messenger } = useContext(MessengerContext)

  // Get this chat
  const [conversation, setConversation] = useState<Conversation | null>(null)

  // Store messages
  const [messages, setMessages] = useState<Chat['messages']>({})

  // Set messages from array
  const setMessagesFromArray = (
    newMessages: DecodedMessage[],
    override = false
  ) =>
    setMessages((messages) => ({
      ...(override ? {} : messages),
      ...Object.fromEntries(
        newMessages.map((message) => [message.id, message])
      ),
    }))

  // Sync conversation to messenger
  useEffect(() => {
    // Treat empty chats
    if (address == null || messenger == null) {
      setConversation(null)
      return
    }

    messenger.conversations
      // Fetch new conversation
      .newConversation(address)
      // Set it locally
      .then(setConversation)
      // Reset if error found
      .catch(() => setConversation(null))
  }, [messenger, address])

  // Sync conversation messages
  useEffect(() => {
    if (conversation == null) return

    // Stops streaming
    let stopStreaming = () => {}

    // Resolves when this effect is cleaned up
    const cleanupPromise = new Promise<{ value: null; done: true }>(
      (resolve) => (stopStreaming = () => resolve({ value: null, done: true }))
    )

    conversation
      // Fetch first few messages
      .messages({
        limit: initialMessageCount,
        direction: SortDirection.SORT_DIRECTION_DESCENDING,
      })
      .then((newMessages) => {
        // Add them
        setMessagesFromArray(newMessages, true)

        // Start streaming new messages
        return conversation.streamMessages()
      })
      .then(async (messageStream) => {
        // console.log('streaming new messages for', conversation.peerAddress)

        // Get any cached messages
        setMessagesFromArray(messageStream.messages)

        while (true) {
          // Get new message
          const { value, done } = await Promise.race([
            messageStream.next(),
            cleanupPromise,
          ])

          // console.log('stream in:', (value as any)?.content, done)

          // Stop if done
          if (done) {
            if (messageStream.unsubscribeFn != undefined)
              messageStream.unsubscribeFn()
            break
          }

          // Get as message
          const message = value as DecodedMessage

          // Add the new message
          setMessages((messages) => ({ ...messages, [message.id]: message }))
        }

        // console.log('FINISH streaming new messages')
      })

    return stopStreaming
  }, [conversation])

  return conversation == null
    ? null
    : conversationToChat(conversation, messages)
}
