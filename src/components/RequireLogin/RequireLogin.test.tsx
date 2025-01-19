import { render } from '@testing-library/react'
import RequireLogin from '.'
import React from 'react'

// Mock dynamic

const dynamicContext: {
  user: null | { alias: string }
} = {
  user: null,
}

jest.mock('@dynamic-labs/sdk-react', () => ({
  useDynamicContext: () => dynamicContext,
}))

// Mock router

jest.mock('react-router-dom', () => ({
  Navigate: () => <div data-testid="navigate"></div>,
  Outlet: () => <div data-testid="content"></div>,
}))

// Mock provider

jest.mock('../../modules/SignaturePendingContext', () => ({
  SignaturePendingContext: {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="provider">{children}</div>
    ),
  },
}))

// Mock signature pending

jest.mock('../SignaturePending', () => () => {
  return <div></div>
})

describe('RequireLogin UX', () => {
  beforeEach(() => {
    dynamicContext.user = null
  })

  it('should redirect when authentication is required but not provided', () => {
    const layout = render(
      <RequireLogin authenticationState="authenticated" redirectTo="/" />
    )

    expect(layout.getByTestId('navigate')).toBeDefined()
  })

  it('should redirect when no authentication is required but provided', () => {
    dynamicContext.user = { alias: 'bob' }

    const layout = render(
      <RequireLogin authenticationState="not authenticated" redirectTo="/" />
    )

    expect(layout.getByTestId('navigate')).toBeDefined()
  })

  it('should display content and provide when authentication is neither required neither provided', () => {
    jest.spyOn(React, 'useState').mockImplementation(() => ['', jest.fn()])

    const layout = render(
      <RequireLogin authenticationState="not authenticated" redirectTo="/" />
    )

    expect(layout.getByTestId('provider')).toBeDefined()
    expect(layout.getByTestId('content')).toBeDefined()
  })

  it('should display content and provide when authentication is required and provided', () => {
    jest.spyOn(React, 'useState').mockImplementation(() => ['', jest.fn()])

    dynamicContext.user = { alias: 'bob' }

    const layout = render(
      <RequireLogin authenticationState="authenticated" redirectTo="/" />
    )

    expect(layout.getByTestId('provider')).toBeDefined()
    expect(layout.getByTestId('content')).toBeDefined()
  })
})
