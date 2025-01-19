import { render } from '@testing-library/react'
import SearchChats from '.'
import React from 'react'

const context: {
  chats: { peerAddress: string; latestMessage?: { content: string } }[]
  input: string
} = {
  chats: [],
  input: '',
}

jest.mock('../ChatPreview', () => () => {
  return <div data-testid="chat-preview" />
})

describe('SearchChats UX', () => {
  beforeEach(() => {
    context.chats = []
    context.input = ''
  })

  it('starts displaying all chats', () => {
    context.chats = [{ peerAddress: 'one' }, { peerAddress: 'two' }]
    jest.spyOn(React, 'useContext').mockImplementation(() => context)

    const layout = render(<SearchChats />)

    expect(layout.getAllByTestId('chat-preview')).toHaveLength(
      context.chats.length
    )
  })

  it('filters on address', () => {
    context.chats = [{ peerAddress: 'one' }, { peerAddress: 'two' }]
    context.input = 'one'

    jest.spyOn(React, 'useContext').mockImplementation(() => context)

    const layout = render(<SearchChats />)

    expect(layout.getAllByTestId('chat-preview')).toHaveLength(1)
    expect(layout.baseElement.textContent).not.toContain('two')
  })

  it('filters on latest message', () => {
    context.chats = [
      { peerAddress: 'one' },
      { peerAddress: 'two', latestMessage: { content: 'wyd' } },
    ]
    context.input = 'wyd'

    jest.spyOn(React, 'useContext').mockImplementation(() => context)

    const layout = render(<SearchChats />)

    expect(layout.getAllByTestId('chat-preview')).toHaveLength(1)
    expect(layout.baseElement.textContent).not.toContain('one')
  })

  it('displays message when there are no chats', () => {
    jest.spyOn(React, 'useContext').mockImplementation(() => context)

    const layout = render(<SearchChats />)

    expect(layout.getByText(/couldn't find any chats/i)).toBeDefined()
  })
})
