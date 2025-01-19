import { Conversation, DecodedMessage } from '@xmtp/xmtp-js'
import getDaysAgo from '../../helpers/getDaysAgo'
import conversationToChat, {
  conversationToChatInitialize,
  conversationsToChats,
} from '.'

jest.mock('@xmtp/xmtp-js', () => ({
  Conversation: jest.fn().mockImplementation(() => ({})),
  SortDirection: { SORT_DIRECTION_DESCENDING: null },
}))

describe('conversationToChat', () => {
  it('should create a valid Chat object and assign it in any provided messages', () => {
    const conversation = {
      peerAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      send: jest.fn(),
    }

    const messages = {
      a: {
        content: 'a',
        sent: getDaysAgo(2),
        id: 'a',
      } as unknown as DecodedMessage,
      b: {
        content: 'b',
        sent: new Date(),
        id: 'b',
      } as unknown as DecodedMessage,
      c: {
        content: 'c',
        sent: getDaysAgo(3),
        id: 'c',
      } as unknown as DecodedMessage,
      d: {
        content: 'd',
        sent: getDaysAgo(2),
        id: 'd',
      } as unknown as DecodedMessage,
    }

    const chat = conversationToChat(
      conversation as unknown as Conversation,
      messages
    )

    expect(chat).toHaveProperty('send')
    expect(chat).toHaveProperty('messages')
    expect(Object.keys(chat.messages)).toHaveLength(
      Object.keys(messages).length
    )
    expect(chat).toHaveProperty('peerAddress', conversation.peerAddress)
    expect(chat).toHaveProperty('latestMessage', messages.b)
  })

  it('should map returned chat "send" to original conversation "send"', () => {
    const originalSend = jest.fn()

    const conversation = {
      peerAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      send: originalSend,
    }

    const chat = conversationToChat(conversation as unknown as Conversation)

    // Call chat send
    const message = 'test message'

    chat.send(message)

    // Should have called original send
    expect(originalSend).toHaveBeenCalledWith(message)
  })

  it('should fetch the latest message with the initialize method', async () => {
    const latestMessage = {
      content: 'b',
      sent: new Date(),
      id: 'b',
    }

    const conversation = {
      peerAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      send: jest.fn(),
      messages: jest.fn().mockResolvedValue([latestMessage]),
    }

    const messages = {
      c: {
        content: 'c',
        sent: getDaysAgo(3),
        id: 'c',
      } as unknown as DecodedMessage,
    }

    const chatWithMessage = await conversationToChatInitialize(
      conversation as unknown as Conversation,
      messages
    )

    expect(chatWithMessage).not.toHaveProperty('latestMessage', messages.c)
    expect(chatWithMessage).toHaveProperty('latestMessage', latestMessage)

    const chatNoMessage = await conversationToChatInitialize(
      conversation as unknown as Conversation
    )

    expect(chatNoMessage).toHaveProperty('latestMessage', latestMessage)
  })

  it('should convert array of conversations into a chat dictionary', async () => {
    const conversations = [
      {
        peerAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        send: jest.fn(),
        messages: jest.fn().mockResolvedValue([]),
      },
      {
        peerAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        send: jest.fn(),
        messages: jest.fn().mockResolvedValue([]),
      },
    ]

    const chats = await conversationsToChats(
      conversations as unknown as Conversation[]
    )

    expect(Object.keys(chats)).toHaveLength(2)
    expect(chats).toHaveProperty(conversations[0].peerAddress)
    expect(chats).toHaveProperty(conversations[1].peerAddress)
  })
})
