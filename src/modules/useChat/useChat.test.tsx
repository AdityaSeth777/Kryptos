import { render, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Chat from '../../types/Chat.interface'
import useChat from '.'
import { MessengerContext } from '../MessengerContext'
import conversationToChat from '../conversationToChat'
import { Conversation } from '@xmtp/xmtp-js'
import { initialMessageCount } from '../../config'

const address = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const peerAddress = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

const messageStream: AsyncGenerator & {
  messages?: { id: string }[]
  unsubscribeFn?: jest.Mock
} = (async function* () {})()

const conversation = {
  peerAddress,
  send: jest.fn(),
  messages: jest.fn(),
  streamMessages: jest.fn(),
}

const messengerContext = {
  messenger: { conversations: { newConversation: jest.fn() } },
}

// Mock config

jest.mock('../../config', () => ({
  initialMessageCount: 1,
}))

// Mock conversation

jest.mock(
  '../conversationToChat',
  () =>
    (
      conversation: { peerAddress: string; send: jest.Mock },
      messages: { id: string }[]
    ) => ({
      send: conversation.send,
      messages: messages ?? {},
      peerAddress: conversation.peerAddress,
    })
)

// Mock XMTP

jest.mock('@xmtp/xmtp-js', () => ({
  Conversation: jest.fn().mockImplementation(() => ({})),
  SortDirection: { SORT_DIRECTION_DESCENDING: null },
}))

beforeEach(() => {
  jest.resetAllMocks()

  messageStream.messages = []
  messageStream.unsubscribeFn = jest.fn()

  conversation.send = jest.fn()
  conversation.messages = jest.fn().mockResolvedValue([])
  conversation.streamMessages = jest.fn().mockResolvedValue(messageStream)

  messengerContext.messenger.conversations.newConversation = jest
    .fn()
    .mockResolvedValue(conversation)
})

describe('useChat chat definition', () => {
  it('should return null if no messenger is available', () => {
    let result: Chat | null = null

    const MockContextConsumer = () => {
      result = useChat(address)

      return <div></div>
    }

    render(
      <BrowserRouter>
        <MessengerContext.Provider value={{ messenger: null } as any}>
          <MockContextConsumer />
        </MessengerContext.Provider>
      </BrowserRouter>
    )

    expect(result).toBeNull()
  })

  it('should return a chat corresponding to the conversation retrieved by the messenger', async () => {
    let result: Chat | null = null

    const MockContextConsumer = () => {
      result = useChat(address)

      return <div></div>
    }

    render(
      <BrowserRouter>
        <MessengerContext.Provider value={messengerContext as any}>
          <MockContextConsumer />
        </MessengerContext.Provider>
      </BrowserRouter>
    )

    await waitFor(() =>
      expect(result).toEqual(
        conversationToChat(conversation as unknown as Conversation)
      )
    )
  })

  it('should return null if an error is found', async () => {
    // Make new conversation reject
    messengerContext.messenger.conversations.newConversation = jest
      .fn()
      .mockRejectedValueOnce(null)

    let result: Chat | null = null

    const MockContextConsumer = () => {
      result = useChat(address)

      return <div></div>
    }

    render(
      <BrowserRouter>
        <MessengerContext.Provider value={messengerContext as any}>
          <MockContextConsumer />
        </MessengerContext.Provider>
      </BrowserRouter>
    )

    await waitFor(() => expect(result).toBeNull())
  })
})

describe('useChat sync chat messages', () => {
  it('should initialize chat messages to first few conversation messages, limited by config', async () => {
    let result: Chat | null = null

    const MockContextConsumer = () => {
      result = useChat(address)

      return <div></div>
    }

    const allMessages = [{ id: 'a' }, { id: 'b' }]

    conversation.messages = jest
      .fn()
      .mockImplementation(({ limit }) =>
        Promise.resolve(allMessages.slice(0, limit))
      )

    render(
      <BrowserRouter>
        <MessengerContext.Provider value={messengerContext as any}>
          <MockContextConsumer />
        </MessengerContext.Provider>
      </BrowserRouter>
    )

    await waitFor(() =>
      expect(Object.keys(result!.messages)).toHaveLength(initialMessageCount)
    )

    expect(result!.messages).toHaveProperty(allMessages[0].id)
  })

  it('should start streaming and update chat with any new messages', async () => {
    let result: Chat | null = null

    const MockContextConsumer = () => {
      result = useChat(address)

      return <div></div>
    }

    // Message that was already there
    const storedMessage = { id: 'z' }

    // Messages to be sent
    const messagesToSend = [{ id: 'a' }, { id: 'b' }]

    // Allows generator to send second message
    let sendSecondMessage = () => {}

    // Bars generator form sending second message
    const secondMessageDelay = new Promise<void>(
      (resolve) => (sendSecondMessage = resolve)
    )

    // Generator to be used in stream
    const mockMessageGenerator: AsyncGenerator & {
      messages?: { id: string }[]
    } = (async function* () {
      // Initially provide one message
      yield messagesToSend[0]
      // Wait delay
      await secondMessageDelay
      // Send next message
      yield messagesToSend[1]
    })()

    mockMessageGenerator.messages = [storedMessage]

    // Mock stream to the generator
    conversation.streamMessages = jest
      .fn()
      .mockResolvedValue(mockMessageGenerator)

    render(
      <BrowserRouter>
        <MessengerContext.Provider value={messengerContext as any}>
          <MockContextConsumer />
        </MessengerContext.Provider>
      </BrowserRouter>
    )

    // Get stored message
    await waitFor(() =>
      expect(result!.messages).toHaveProperty(storedMessage.id)
    )

    // Get first message
    await waitFor(() =>
      expect(result!.messages).toHaveProperty(messagesToSend[0].id)
    )
    expect(Object.keys(result!.messages as any)).toHaveLength(2)

    // Send second message
    sendSecondMessage()

    // Should get it
    await waitFor(() =>
      expect(result!.messages).toHaveProperty(messagesToSend[1].id)
    )
    expect(Object.keys(result!.messages as any)).toHaveLength(3)
  })

  it('should stop streaming if effect collects', async () => {
    const MockContextConsumer = () => {
      useChat(address)

      return <div></div>
    }

    // Generator to be used in stream
    const mockMessageGenerator: AsyncGenerator & {
      messages?: { id: string }[]
      unsubscribeFn?: jest.Mock
    } = (async function* () {
      await new Promise(() => {})
    })()

    mockMessageGenerator.messages = []
    mockMessageGenerator.unsubscribeFn = jest.fn()

    // Mock stream to the generator
    conversation.streamMessages = jest
      .fn()
      .mockResolvedValue(mockMessageGenerator)

    // Spy on stream
    const streamNextSpy = jest.spyOn(mockMessageGenerator, 'next')

    const layout = render(
      <BrowserRouter>
        <MessengerContext.Provider value={messengerContext as any}>
          <MockContextConsumer />
        </MessengerContext.Provider>
      </BrowserRouter>
    )

    // After calling next
    await waitFor(() => expect(streamNextSpy).toHaveBeenCalled())

    // Unmount
    layout.unmount()

    // Stream return should be called
    await waitFor(() =>
      expect(mockMessageGenerator.unsubscribeFn).toHaveBeenCalled()
    )
  })
})
