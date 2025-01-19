import '@testing-library/jest-dom'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as router from 'react-router-dom'
import Chats from '.'
import React, { useContext } from 'react'
import { ControlInputContext } from '../../modules/ControlInputContext'

// Mock chat

const chatProps: { address: null | string } = { address: null }

jest.mock(
  '../../components/Chat',
  () =>
    ({ address }: { address: string | null }) => {
      chatProps.address = address

      return <div></div>
    }
)

// Mock router

const mockOutlet = {
  component: () => <div data-testid="content"></div>,
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),

  Outlet: () => mockOutlet.component(),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}))

// Mock XMTP

jest.mock('@xmtp/xmtp-js', () => ({
  Conversation: jest.fn().mockImplementation(() => ({})),
  SortDirection: { SORT_DIRECTION_DESCENDING: null },
}))

// Mock dynamic

const dynamicContext: {
  primaryWallet: null | { address: string }
  user: null | { alias: string }
} = {
  primaryWallet: null,
  user: null,
}

jest.mock('@dynamic-labs/sdk-react', () => ({
  useDynamicContext: () => dynamicContext,
  DynamicWidget: () => <div></div>,
}))

const navigate = jest.fn()

let useNavigateMock: jest.SpyInstance = jest.spyOn(router, 'useNavigate')
let useLocationMock: jest.SpyInstance = jest.spyOn(router, 'useLocation')

beforeEach(() => {
  jest.resetAllMocks()

  useNavigateMock.mockImplementation(() => navigate)

  useLocationMock.mockImplementation(
    () => ({ search: '' } as unknown as router.Location)
  )

  chatProps.address = null
})

describe('Chats UX', () => {
  it('renders outlet', () => {
    const layout = render(<Chats />)

    expect(layout.getByTestId('content')).toBeDefined()
  })

  it('sets/unsets the clicked option as current, focuses/clears the input and triggers a navigation without overriding url query params', async () => {
    // Expect these query params to remain intact on the navigation call
    const queryParams = '?chat=0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    useLocationMock.mockImplementation(() => ({ search: queryParams }))

    const layout = render(<Chats />)

    // Get the elements
    const option = layout.baseElement.querySelector('.option') as HTMLDivElement
    const input = layout.getByRole('textbox')

    // Click it
    userEvent.click(option)

    // It must be selected
    await waitFor(() => expect(option).toHaveClass('selected'))

    // Input is focused
    expect(input).toHaveFocus()

    // Navigation doesn't clear query params
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining(queryParams))

    // Type something in input
    userEvent.type(input, 'something')

    // Now we click option again
    userEvent.click(option)

    // It must no longer be selected
    await waitFor(() => expect(option).not.toHaveClass('selected'))

    // Input is cleared
    expect(input).toHaveValue('')

    // Navigation doesn't clear query params
    expect(navigate).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(queryParams)
    )
  })

  it('should provide control over input', async () => {
    let providedData = {
      input: '',
      closeInput: () => {},
      setInput: (value: string) => {},
    }

    mockOutlet.component = () => {
      providedData = useContext(ControlInputContext)

      return <div></div>
    }

    const layout = render(<Chats />)

    // Get elements
    const input = layout.getByRole('textbox')

    // Type something
    const typeValue = 'something'
    userEvent.type(input, typeValue)

    // Should provide this value
    await waitFor(() => expect(providedData.input).toBe(typeValue))

    // Set new input value
    const setValue = 'monty python'
    act(() => providedData.setInput(setValue))

    // Should see this in input field
    await waitFor(() => expect(input).toHaveValue(setValue))

    // Close input
    act(() => providedData.closeInput())

    // Should see field empty
    await waitFor(() => expect(input).toHaveValue(''))
  })
})

describe('Chats chat view', () => {
  it('should start hidden', () => {
    const layout = render(<Chats />)

    expect(layout.baseElement.querySelector('.chat-view')).not.toHaveClass(
      'visible'
    )
  })

  it('should be visible and pass address to Chat component when a chat is selected, and should call close chat if back arrow is clicked', () => {
    // Spy on close method
    const closeChat = jest.fn()
    const selectedChat = '0xBoy'

    const contextMock = jest
      .spyOn(React, 'useContext')
      .mockImplementation(() => ({ selectedChat, closeChat }))

    const layout = render(<Chats />)

    // Should now be visible
    expect(layout.baseElement.querySelector('.chat-view')).toHaveClass(
      'visible'
    )

    // Should have passed address prop
    expect(chatProps).toHaveProperty('address', selectedChat)

    // Click back
    userEvent.click(layout.baseElement.querySelector('.back')!)

    // Should call close
    expect(closeChat).toHaveBeenCalled()

    contextMock.mockRestore()
  })
})
