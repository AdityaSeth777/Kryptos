import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react'
import ProfilePicture from '../ProfilePicture'
import './style.scss'

export default function Profile() {
  const { primaryWallet, user } = useDynamicContext()

  if (primaryWallet == null || user == null) return null

  return (
    <div id="profile">
      {/* Profile picture */}
      <ProfilePicture address={primaryWallet.address} />

      <div className="vertical">
        {/* Nickname */}
        <h1>{user.alias}</h1>

        {/* Dynamic options */}
        <DynamicWidget />
      </div>
    </div>
  )
}
