import { Conversation, DecodedMessage, SortDirection } from '@xmtp/xmtp-js'
import Chat from '../../types/Chat.interface'

// Turns conversation to chat
export default function conversationToChat(
  conversation: Conversation,
  messages?: Chat['messages']
): Chat {
  let latestMessage: DecodedMessage | undefined

  if (messages != undefined && Object.keys(messages).length > 0)
    latestMessage = Object.values(messages).sort(
      ({ sent: sentA }, { sent: sentB }) => {
        if (sentA.getTime() > sentB.getTime()) return -1
        if (sentA.getTime() === sentB.getTime()) return 0
        return 1
      }
    )[0]

  return {
    send: (message) => conversation.send(message),
    messages: messages ?? {},
    peerAddress: conversation.peerAddress,
    latestMessage,
  }
}

export async function conversationToChatInitialize(
  conversation: Conversation,
  messages?: Chat['messages']
): Promise<Chat> {
  // Get one message for it
  const newMessages = await conversation.messages({
    limit: 1,
    direction: SortDirection.SORT_DIRECTION_DESCENDING,
  })

  // Include this message
  if (newMessages.length > 0) {
    const [newMessage] = newMessages

    if (messages === undefined) messages = { [newMessage.id]: newMessage }
    else messages[newMessage.id] = newMessage
  }

  // Get the chat
  return conversationToChat(conversation, messages)
}

export async function conversationsToChats(
  conversations: Conversation[]
): Promise<{ [address: string]: Chat }> {
  const chats: { [address: string]: Chat } = {}

  // Turn each conversation into a chat, and initialize them
  for (const conversation of conversations)
    chats[conversation.peerAddress] = await conversationToChatInitialize(
      conversation
    )

  return chats
}
