import { render } from '@testing-library/react'
import NewChat from '.'
import React from 'react'
import userEvent from '@testing-library/user-event'
import * as router from 'react-router'

const navigateMock = jest.fn()

describe('NewChat UX', () => {
  beforeEach(() => {
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigateMock)
  })

  it('should request address on empty field', () => {
    const layout = render(<NewChat />)

    expect(layout.getByText(/please provide an address/i)).toBeDefined()
  })

  it('should reject gibberish', () => {
    React.useContext = jest.fn().mockImplementation(() => ({
      input: 'gibberish',
      closeInput: jest.fn(),
    }))

    const layout = render(<NewChat />)

    expect(layout.getByText(/not a valid Ethereum address/i)).toBeDefined()
  })

  it('should open chat for valid address on click', () => {
    const address = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    const openChat = jest.fn()
    const closeInput = jest.fn()

    React.useContext = jest.fn().mockImplementation(() => ({
      input: address,
      closeInput,
      openChat,
    }))

    const layout = render(<NewChat />)

    // Expect to see address
    expect(layout.baseElement.textContent).toContain(address)

    const panel = layout.baseElement.querySelector('.chat-preview')!

    // Open chat
    userEvent.click(panel)

    expect(closeInput).toHaveBeenCalled()
    expect(openChat).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith('/')
  })
})
