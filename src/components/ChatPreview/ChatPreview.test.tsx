import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DecodedMessage } from '@xmtp/xmtp-js'
import react from 'react'
import ChatPreview from '.'

describe('ChatPreview UX', () => {
  it('should display peer address and latest message', () => {
    const peerAddress = '0xrandomaddress'
    const latestMessage = {
      content: 'hello there',
    } as unknown as DecodedMessage

    const layout = render(
      <ChatPreview
        chat={{ peerAddress, latestMessage, messages: {}, send: jest.fn() }}
      />
    )

    expect(layout.baseElement.textContent).toContain(peerAddress)
    expect(layout.baseElement.textContent).toContain(latestMessage.content)
  })

  it("should trigger chat open when chat isn't open", () => {
    const peerAddress = '0xrandomaddress'
    const latestMessage = {
      content: 'hello there',
    } as unknown as DecodedMessage

    // Mock use context
    const openChat = jest.fn()
    const closeChat = jest.fn()

    react.useContext = jest.fn().mockImplementation(() => ({
      openChat,
      closeChat,
      selectedChat: '0xSomeoneElse',
    }))

    const layout = render(
      <ChatPreview
        chat={{ peerAddress, latestMessage, messages: {}, send: jest.fn() }}
      />
    )

    const panel = layout.baseElement.querySelector('.chat-preview')!

    // Open chat
    userEvent.click(panel)

    expect(openChat).toHaveBeenCalled()
  })

  it('should trigger chat close when chat is open', () => {
    const peerAddress = '0xrandomaddress'
    const latestMessage = {
      content: 'hello there',
    } as unknown as DecodedMessage

    // Mock use context
    const openChat = jest.fn()
    const closeChat = jest.fn()

    react.useContext = jest.fn().mockImplementation(() => ({
      openChat,
      closeChat,
      selectedChat: peerAddress,
    }))

    const layout = render(
      <ChatPreview
        chat={{ peerAddress, latestMessage, messages: {}, send: jest.fn() }}
      />
    )

    const panel = layout.baseElement.querySelector('.chat-preview')!

    // Open chat
    userEvent.click(panel)

    expect(closeChat).toHaveBeenCalled()
  })
})
