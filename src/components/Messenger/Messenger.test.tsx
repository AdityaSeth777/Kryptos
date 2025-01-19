import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/react'
import { Client } from '@xmtp/xmtp-js'
import React, { useContext, useEffect } from 'react'
import * as router from 'react-router-dom'
import { BrowserRouter, useSearchParams } from 'react-router-dom'
import Messenger, { pendingMessage } from '.'
import { MessengerContext } from '../../modules/MessengerContext'
import Chat from '../../types/Chat.interface'

// Helper values

const address = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const peerAddress1 = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const peerAddress2 = '0xcccccccccccccccccccccccccccccccccccccccc'

// Route spy

const getSearchParamsMock = () =>
  jest
    .spyOn(router, 'useSearchParams')
    .mockImplementation(
      () =>
        [{ get: jest.fn() }, jest.fn()] as unknown as [
          URLSearchParams,
          router.SetURLSearchParams
        ]
    )

// Mock conversations
jest.mock('../../modules/conversationToChat', () => ({
  conversationsToChats: (conversations: { peerAddress: string }[]) => {
    const chats: { [address: string]: Chat } = {}

    // Turn each conversation into a chat, and initialize them
    for (const conversation of conversations)
      chats[conversation.peerAddress] = {
        messages: {},
        peerAddress: conversation.peerAddress,
        send: jest.fn(),
      }

    return chats
  },
}))

// Mock dynamic

const mockDynamicContext: {
  handleLogOut: jest.Mock
  primaryWallet: null | {
    address: string
    connector: { getSigner: jest.Mock }
  }
} = {
  handleLogOut: jest.fn(),
  primaryWallet: null,
}

jest.mock('@dynamic-labs/sdk-react', () => ({
  useDynamicContext: () => mockDynamicContext,
}))

// Mock XMTP

jest.mock('@xmtp/xmtp-js', () => {
  type mockMessenger = {
    address: string
    conversations: { streamAllMessages: jest.Mock; list: jest.Mock }
  }

  const Client: jest.Mock & {
    create?: jest.Mock
    mockMessenger?: mockMessenger
  } = jest.fn()

  Client.create = jest.fn()
  Client.mockMessenger = {
    address: '',
    conversations: { streamAllMessages: jest.fn(), list: jest.fn() },
  }

  return { Client }
})

// Keep mocks clean and tidy

beforeEach(() => {
  jest.clearAllMocks()

  mockDynamicContext.primaryWallet = null
  mockDynamicContext.handleLogOut.mockRestore()

  const mockMessenger = (Client as any).mockMessenger
  Client.create = jest.fn().mockResolvedValue(mockMessenger)
  mockMessenger.conversations.list = jest.fn().mockResolvedValue([])
  mockMessenger.conversations.streamAllMessages = jest
    .fn()
    .mockResolvedValue((async function* () {})())
})

describe('Messenger UX', () => {
  it('should render children', () => {
    const testId = 'test child'

    const layout = render(
      <BrowserRouter>
        <Messenger>
          <div data-testid={testId}></div>
        </Messenger>
      </BrowserRouter>
    )

    expect(layout.getByTestId(testId)).toBeInTheDocument()
  })

  it('should provide selected chat control', async () => {
    // Mock url query
    const setSearchParams = jest.fn()

    const searchParamsMock = jest
      .spyOn(router, 'useSearchParams')
      .mockImplementation(
        () =>
          [{ get: jest.fn() }, setSearchParams] as unknown as [
            URLSearchParams,
            router.SetURLSearchParams
          ]
      )

    // Store provided methods
    let openChat: ((address: string) => void) | null = null
    let closeChat: () => void

    const MockContextConsumer = () => {
      ;({ openChat, closeChat } = useContext(MessengerContext))

      return <div></div>
    }

    render(
      <Messenger>
        <MockContextConsumer />
      </Messenger>
    )

    // Wait for methods to be defined
    await waitFor(() => expect(openChat).not.toBeNull())

    // Open the chat
    openChat!(peerAddress1)

    // Should have set query params
    expect(setSearchParams).toHaveBeenCalledWith({ chat: peerAddress1 })
    expect(setSearchParams).toHaveBeenCalledTimes(1)

    // Close the chat
    closeChat!()

    expect(setSearchParams).toHaveBeenCalledWith({})
    expect(setSearchParams).toHaveBeenCalledTimes(2)

    searchParamsMock.mockRestore()
  })

  it('should update selected chat to correspond to URL query params', async () => {
    const chatsToSelect = ['0xBobsAddress', '0xAnneAddress']

    let result: string | null = null

    const MockContextConsumer = () => {
      const { selectedChat } = useContext(MessengerContext)
      const [, setSearchParams] = useSearchParams()

      useEffect(() => {
        result = selectedChat
      }, [selectedChat])

      useEffect(() => {
        // Set to bob
        setSearchParams({ chat: chatsToSelect[0] })

        // Wait and set to Anne
        setTimeout(() => setSearchParams({ chat: chatsToSelect[1] }), 50)
      }, [])

      return <div></div>
    }

    render(
      <BrowserRouter>
        <Messenger>
          <MockContextConsumer />
        </Messenger>
      </BrowserRouter>
    )

    // Expect first chat to be selected
    await waitFor(() => expect(result).toBe(chatsToSelect[0]))

    // Expect second chat to be selected
    await waitFor(() => expect(result).toBe(chatsToSelect[1]))
  })
})

describe('Messenger creation', () => {
  it('should provide null messenger if there is no wallet', async () => {
    let result: Client | null = null

    const MockContextConsumer = () => {
      const { messenger } = useContext(MessengerContext)

      useEffect(() => {
        result = messenger
      }, [messenger])

      return <div></div>
    }

    render(
      <BrowserRouter>
        <Messenger>
          <MockContextConsumer />
        </Messenger>
      </BrowserRouter>
    )

    expect(result).toBeNull()
  })

  it('should, if there is a wallet, set a pending message, create a messenger client, set the messenger to the new client, and then remove the pending message', async () => {
    // Define a wallet
    mockDynamicContext.primaryWallet = {
      address,
      connector: { getSigner: jest.fn().mockResolvedValue(undefined) },
    }

    // Mock search params to avoid need of a router wrapper
    const searchParamsSpy = getSearchParamsMock()

    // Spy on pendingText
    const setPendingText = jest.fn()

    const contextSpy = jest
      .spyOn(React, 'useContext')
      .mockImplementation(() => ({ setPendingText }))

    // Checks if messenger is defined
    let messengerResult: Client | null

    const MockContextConsumer = () => {
      const { messenger } = useContext(MessengerContext)

      useEffect(() => {
        messengerResult = messenger
      }, [messenger])

      return <div></div>
    }

    render(
      <Messenger>
        <MockContextConsumer />
      </Messenger>
    )

    // Wait for pending text call
    await waitFor(() =>
      expect(setPendingText).toHaveBeenNthCalledWith(1, pendingMessage)
    )

    // Expect messenger creation call too
    expect(Client.create).toHaveBeenCalled()

    // Wait for pending text erase
    await waitFor(() => expect(setPendingText).toHaveBeenNthCalledWith(2, ''))

    // Expect messenger to now be defined
    await waitFor(() =>
      expect(messengerResult).toBe((Client as any).mockMessenger)
    )

    searchParamsSpy.mockRestore()
    contextSpy.mockRestore()
  })

  it('should call logout and remove pending message if anything goes wrong', async () => {
    // Define a wallet
    mockDynamicContext.primaryWallet = {
      address,
      connector: { getSigner: jest.fn().mockResolvedValue(undefined) },
    }

    // Mock search params to avoid need of a router wrapper
    const searchParamsSpy = getSearchParamsMock()

    // Reject creation
    ;(Client.create as jest.Mock).mockRejectedValue(null)

    // Spy on pendingText
    const setPendingText = jest.fn()

    const contextSpy = jest
      .spyOn(React, 'useContext')
      .mockImplementation(() => ({ setPendingText }))

    render(
      <Messenger>
        <div />
      </Messenger>
    )

    // Logout
    await waitFor(() =>
      expect(mockDynamicContext.handleLogOut).toHaveBeenCalled()
    )

    // Clear pending text
    expect(setPendingText).toHaveBeenCalledWith('')

    searchParamsSpy.mockRestore()
    contextSpy.mockRestore()
  })
})

describe('Chats synchronization', () => {
  it('should set no chats if no messenger is available', () => {
    let result: { [address: string]: Chat } | null = null

    const MockContextConsumer = () => {
      const { chats } = useContext(MessengerContext)

      useEffect(() => {
        result = chats
      }, [chats])

      return <div></div>
    }

    render(
      <BrowserRouter>
        <Messenger>
          <MockContextConsumer />
        </Messenger>
      </BrowserRouter>
    )

    expect(result).toEqual({})
  })

  it("should initialize chats to messenger's conversations", async () => {
    // Define a wallet
    mockDynamicContext.primaryWallet = {
      address,
      connector: { getSigner: jest.fn().mockResolvedValue(undefined) },
    }

    // Mock conversations messages
    ;(Client as any).mockMessenger.conversations.list = jest
      .fn()
      .mockResolvedValue([
        { peerAddress: peerAddress1 },
        { peerAddress: peerAddress2 },
      ])

    // Mock consumer
    let result: { [address: string]: Chat } | null = null

    const MockContextConsumer = () => {
      const { chats } = useContext(MessengerContext)

      useEffect(() => {
        result = chats
      }, [chats])

      return <div></div>
    }

    render(
      <BrowserRouter>
        <Messenger>
          <MockContextConsumer />
        </Messenger>
      </BrowserRouter>
    )

    await waitFor(() => expect(result).toHaveProperty(peerAddress1))
    expect(result).toHaveProperty(peerAddress2)
    expect(Object.keys(result as any)).toHaveLength(2)
  })

  it('should start streaming and update chats with any new messages', async () => {
    // Define a wallet
    mockDynamicContext.primaryWallet = {
      address,
      connector: { getSigner: jest.fn().mockResolvedValue(undefined) },
    }

    // Generator to be used in stream
    const mockMessageGenerator = async function* () {
      // Initially provide one message
      yield messagesToSend[0]

      // Wait delay
      await secondMessageDelay

      // Send next message
      yield messagesToSend[1]
    }

    // Allows generator to send second message
    let sendSecondMessage = () => {}

    // Bars generator form sending second message
    const secondMessageDelay = new Promise<void>(
      (resolve) => (sendSecondMessage = resolve)
    )

    // Spy on peer 1 send method
    const peer1Send = jest.fn()

    // Messages to be sent
    const messagesToSend = [
      {
        conversation: { peerAddress: peerAddress1, send: peer1Send },
        id: 'a',
      },
      {
        conversation: { peerAddress: peerAddress2, send: jest.fn() },
        id: 'b',
      },
    ]

    // Mock stream to the generator
    ;(Client as any).mockMessenger.conversations.streamAllMessages = jest
      .fn()
      .mockResolvedValue(mockMessageGenerator())

    // Mock consumer
    let result: { [address: string]: Chat } | null = null

    const MockContextConsumer = () => {
      const { chats } = useContext(MessengerContext)

      useEffect(() => {
        result = chats
      }, [chats])

      return <div></div>
    }

    render(
      <BrowserRouter>
        <Messenger>
          <MockContextConsumer />
        </Messenger>
      </BrowserRouter>
    )

    // Get first message
    await waitFor(() => expect(result).toHaveProperty(peerAddress1))
    expect(Object.keys(result as any)).toHaveLength(1)

    // Send second message
    sendSecondMessage()

    // Should get it
    await waitFor(() => expect(result).toHaveProperty(peerAddress2))
    expect(Object.keys(result as any)).toHaveLength(2)

    // Chat send should correspond to original conversation send
    const testMessage = 'test'

    result![peerAddress1].send(testMessage)

    expect(peer1Send).toHaveBeenCalledWith(testMessage)
  })

  it('should stop streaming if effect collects', async () => {
    // Define a wallet
    mockDynamicContext.primaryWallet = {
      address,
      connector: { getSigner: jest.fn().mockResolvedValue(undefined) },
    }

    // Generator to be used in stream
    const mockMessageGenerator = (async function* () {
      // Never end
      await new Promise(() => {})
    })()

    // Spy on stream
    const streamReturnSpy = jest.spyOn(mockMessageGenerator, 'return')
    const streamNextSpy = jest.spyOn(mockMessageGenerator, 'next')

    // Mock stream to the generator
    ;(Client as any).mockMessenger.conversations.streamAllMessages = jest
      .fn()
      .mockResolvedValue(mockMessageGenerator)

    const layout = render(
      <BrowserRouter>
        <Messenger>
          <div />
        </Messenger>
      </BrowserRouter>
    )

    // After calling next
    await waitFor(() => expect(streamNextSpy).toHaveBeenCalled())

    // Unmount
    layout.unmount()

    // Stream return should be called
    await waitFor(() => expect(streamReturnSpy).toHaveBeenCalled())
  })

  it('should not throw', async () => {
    // Define a wallet
    mockDynamicContext.primaryWallet = {
      address,
      connector: { getSigner: jest.fn().mockResolvedValue(undefined) },
    }

    // Generator to be used in stream
    const mockMessageGenerator = (async function* () {
      // Never end
      await new Promise(() => {})
    })()

    // Spy on stream
    const streamReturnSpy = jest.spyOn(mockMessageGenerator, 'return')
    const streamNextSpy = jest.spyOn(mockMessageGenerator, 'next')

    // Mock stream to the generator
    ;(Client as any).mockMessenger.conversations.streamAllMessages = jest
      .fn()
      .mockResolvedValue(mockMessageGenerator)

    const layout = render(
      <BrowserRouter>
        <Messenger>
          <div />
        </Messenger>
      </BrowserRouter>
    )

    // After calling next
    await waitFor(() => expect(streamNextSpy).toHaveBeenCalled())

    // Unmount
    layout.unmount()

    // Stream return should be called
    await waitFor(() => expect(streamReturnSpy).toHaveBeenCalled())
  })
})
