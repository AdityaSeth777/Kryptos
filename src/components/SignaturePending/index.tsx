import { useDynamicContext } from '@dynamic-labs/sdk-react'
import { useContext } from 'react'
import { SignaturePendingContext } from '../../modules/SignaturePendingContext'
import { ReactComponent as PendingAnimation } from './pending.svg'
import './style.scss'

export default function SignaturePending() {
  const { handleLogOut } = useDynamicContext()
  const { pendingText, setPendingText } = useContext(SignaturePendingContext)

  const logout = () => {
    setPendingText('')
    handleLogOut()
  }

  if (pendingText == '') return null

  return (
    <div id="signature-pending">
      <div className="modal">
        {/* Loading wheel */}
        <PendingAnimation />

        {/* Title */}
        <h2>Signature Requested</h2>

        {/* Text */}
        <p>{pendingText}...</p>

        {/* Log out button */}
        <button onClick={logout}>Sign out</button>
      </div>
    </div>
  )
}
