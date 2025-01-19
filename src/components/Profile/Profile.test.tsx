import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import Profile from '.'

const dynamicContext: {
  primaryWallet: null | { address: string }
  user: null | { alias: string }
} = {
  primaryWallet: null,
  user: null,
}

const dynamicWidgetId = 'dynamic plz hire'

jest.mock('@dynamic-labs/sdk-react', () => ({
  useDynamicContext: () => dynamicContext,
  DynamicWidget: () => <div data-testid={dynamicWidgetId}></div>,
}))

describe('Profile UX', () => {
  it('should not display if user is not authenticated', () => {
    const layout = render(<Profile />)

    expect(layout.baseElement.textContent).toBeFalsy()
  })

  it('should display Dynamic widget, alias and address if authenticated', () => {
    dynamicContext.user = { alias: 'bob' }
    dynamicContext.primaryWallet = { address: '0xAddress' }

    const layout = render(<Profile />)

    expect(layout.baseElement.textContent).toContain(dynamicContext.user.alias)

    expect(layout.getByTestId(dynamicWidgetId)).toBeInTheDocument()
  })
})
