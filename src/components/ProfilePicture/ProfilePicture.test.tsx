import { render } from '@testing-library/react'
import ProfilePicture from '.'

describe('ProfilePicture UX', () => {
  it('should render', () => {
    const layout = render(
      <ProfilePicture address="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" />
    )

    expect(layout.baseElement.children.length).toBeGreaterThan(0)
  })
})
