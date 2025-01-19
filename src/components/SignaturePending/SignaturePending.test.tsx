import { render } from '@testing-library/react'
import SignaturePending from '.'
import React from 'react'
import userEvent from '@testing-library/user-event'

const context = {
  pendingText: '',
  setPendingText: jest.fn(),
}

const mockHandleLogOut = jest.fn()

jest.mock('@dynamic-labs/sdk-react', () => ({
  useDynamicContext: () => ({
    handleLogOut: mockHandleLogOut,
  }),
}))

describe('SignaturePending UX', () => {
  it('should not display when no text is provided', () => {
    jest.spyOn(React, 'useContext').mockImplementation(() => context)

    const layout = render(<SignaturePending />)

    expect(layout.baseElement.textContent).toBeFalsy()
  })

  it('should display informing text', () => {
    context.pendingText = 'Test text'
    jest.spyOn(React, 'useContext').mockImplementation(() => context)

    const layout = render(<SignaturePending />)

    expect(layout.baseElement.textContent).toContain(context.pendingText)
    expect(layout.getByText(/Signature Requested/i)).toBeDefined()
  })

  it('should logout when user clicks log out button', () => {
    context.pendingText = 'Test text'
    jest.spyOn(React, 'useContext').mockImplementation(() => context)

    const layout = render(<SignaturePending />)

    userEvent.click(layout.getByRole('button', { name: /Sign out/i }))

    expect(mockHandleLogOut).toHaveBeenCalled()
  })
})
