import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DecodedMessage } from '@xmtp/xmtp-js'
import React from 'react'
import Chat from '.'
import getDaysAgo from '../../helpers/getDaysAgo'
import ChatType from '../../types/Chat.interface'

// Mock useChat

const address = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

const mockChat: ChatType = {
  messages: {},
  peerAddress: address,
  send: jest.fn().mockResolvedValue({ content: '' }),
}

jest.mock('../../modules/useChat', () => () => mockChat)

describe('Chat UX', () => {
  beforeEach(() => {
    mockChat.messages = {}
    mockChat.peerAddress = address
    ;(mockChat.send as jest.Mock<any, any>)
      .mockClear()
      .mockResolvedValue({ content: '' })
    delete mockChat.latestMessage
  })

  it('should display peer info', () => {
    const layout = render(<Chat address={address} />)

    expect(layout.baseElement.textContent).toContain(address)
  })

  it('should show message content, sent time and also sent date if more than a day old', () => {
    mockChat.messages = {
      a: {
        content: 'Hey you',
        sent: new Date(2020, 1, 2, 3, 4),
        id: 'a',
      } as unknown as DecodedMessage,
    }

    const layout = render(<Chat address={address} />)

    expect(layout.baseElement.textContent).toContain(
      mockChat.messages.a.content
    )

    expect(layout.baseElement.textContent).toContain(
      mockChat.messages.a.sent.getMinutes().toString()
    )

    expect(layout.baseElement.textContent).toContain(
      mockChat.messages.a.sent.getHours().toString()
    )

    expect(layout.baseElement.textContent).toContain(
      mockChat.messages.a.sent.getDate().toString()
    )

    expect(layout.baseElement.textContent).toContain(
      (mockChat.messages.a.sent.getMonth() + 1).toString()
    )
  })

  it('should display messages in order of sent time and show latest message first', () => {
    mockChat.messages = {
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
        sent: getDaysAgo(1),
        id: 'd',
      } as unknown as DecodedMessage,
    }
    mockChat.latestMessage = mockChat.messages.b

    const layout = render(<Chat address={address} />)

    const messageContainer = layout.baseElement.querySelector(
      '.messages'
    ) as HTMLDivElement

    // First message from bottom up is the element's last child
    expect(messageContainer.lastChild!.textContent).toContain(
      mockChat.latestMessage.content
    )

    // From oldest to newest
    expect(messageContainer.children[0].textContent).toContain(
      mockChat.messages.c.content
    )
    expect(messageContainer.children[1].textContent).toContain(
      mockChat.messages.a.content
    )
    expect(messageContainer.children[2].textContent).toContain(
      mockChat.messages.d.content
    )
    expect(messageContainer.children[3].textContent).toContain(
      mockChat.messages.b.content
    )
  })

  it('should not display messages if no address is provided', () => {
    mockChat.messages = {
      a: {
        content: 'Hey you',
        sent: new Date(),
        id: 'a',
      } as unknown as DecodedMessage,
    }

    const layout = render(<Chat address={null} />)

    // The container should not be visible

    const messageContainer = layout.baseElement.querySelector(
      '.messages'
    ) as HTMLDivElement | null

    expect(messageContainer).toBe(null)
  })

  it('should send new message on click send or press enter', () => {
    const layout = render(<Chat address={address} />)

    const field = layout.getByPlaceholderText(/Write a message/i)

    // Type message
    userEvent.type(field, 'New message')

    // Hit send
    userEvent.click(layout.baseElement.querySelector('.send')!)

    expect(mockChat.send).toHaveBeenCalledTimes(1)

    // Type another message
    userEvent.type(field, 'Another message')

    // Hit enter
    fireEvent.keyUp(field, { key: 'Enter' })

    expect(mockChat.send).toHaveBeenCalledTimes(2)
  })

  it('should not send message if message is empty', () => {
    const layout = render(<Chat address={address} />)

    // Hit send
    userEvent.click(layout.baseElement.querySelector('.send')!)

    expect(mockChat.send).not.toHaveBeenCalled()
  })

  it('should close on Esc', () => {
    const closeChat = jest.fn()

    jest.spyOn(React, 'useContext').mockImplementation(() => ({ closeChat }))

    const layout = render(<Chat address={address} />)

    fireEvent.keyUp(layout.baseElement, { key: 'Escape' })

    expect(closeChat).toHaveBeenCalled()
  })

  it('should assign correct sender type classes to message elements', () => {
    jest
      .spyOn(React, 'useContext')
      .mockImplementation(() => ({ closeChat: jest.fn() }))

    mockChat.messages = {
      a: {
        content: 'Hey you',
        sent: new Date(),
        id: 'a',
        senderAddress: '0xMe',
      } as unknown as DecodedMessage,
      b: {
        content: 'Hey test',
        sent: new Date(),
        id: 'b',
        senderAddress: address,
      } as unknown as DecodedMessage,
    }

    const layout = render(<Chat address={address} />)

    expect(
      layout.getByText(mockChat.messages.a.content).parentElement
    ).toHaveClass('outgoing')

    expect(
      layout.getByText(mockChat.messages.b.content).parentElement
    ).toHaveClass('incoming')
  })

  it('should adjust field height on keyup', () => {
    const inputRef = { current: { style: { height: '' }, scrollHeight: '10' } }

    jest.spyOn(React, 'useRef').mockImplementation(() => inputRef)
    jest
      .spyOn(React, 'useContext')
      .mockImplementation(() => ({ closeChat: jest.fn() }))

    const layout = render(<Chat address={address} />)

    const field = layout.getByPlaceholderText(/Write a message/i)

    fireEvent.keyUp(field)

    expect(inputRef.current.style.height).toBe(
      inputRef.current.scrollHeight + 'px'
    )
  })

  it('should handle null refs like a champ', () => {
    const inputRef = {
      get current() {
        return null
      },
      set current(value) {},
    }

    jest.spyOn(React, 'useRef').mockImplementation(() => inputRef)
    jest
      .spyOn(React, 'useContext')
      .mockImplementation(() => ({ closeChat: jest.fn() }))

    const layout = render(<Chat address={address} />)

    const field = layout.getByPlaceholderText(/Write a message/i)

    fireEvent.keyUp(field)
  })

  it('should never ever call send more than once per sendMessage call', () => {
    const state: [string, () => void] = [
      '',
      jest.fn().mockImplementation((callback: (value: string) => string) => {
        // Call twice
        callback('test')
        callback('test')
      }),
    ]

    jest.spyOn(React, 'useState').mockImplementation(() => state)

    jest.spyOn(React, 'useRef').mockImplementation(() => ({ current: null }))
    jest
      .spyOn(React, 'useContext')
      .mockImplementation(() => ({ closeChat: jest.fn() }))

    const layout = render(<Chat address={address} />)

    userEvent.click(layout.baseElement.querySelector('.send')!)

    expect(mockChat.send).toHaveBeenCalledTimes(1)
  })
})
