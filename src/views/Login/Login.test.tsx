import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import Login from '.'

const dynamicWidgetId = 'dynamic plz hire'

jest.mock('@dynamic-labs/sdk-react', () => ({
  DynamicWidget: () => <div data-testid={dynamicWidgetId}></div>,
}))

describe('Login UX', () => {
  it('should display website title and Dynamic widget', () => {
    const layout = render(<Login />)

    expect(layout.baseElement.textContent).toContain('Whispr')

    expect(layout.getByTestId(dynamicWidgetId)).toBeInTheDocument()
  })
})
