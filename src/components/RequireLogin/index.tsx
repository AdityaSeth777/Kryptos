import { useDynamicContext } from '@dynamic-labs/sdk-react'
import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { SignaturePendingContext } from '../../modules/SignaturePendingContext'
import SignaturePending from '../SignaturePending'

export default function RequireLogin({
  authenticationState,
  redirectTo,
}: {
  authenticationState: 'authenticated' | 'not authenticated'
  redirectTo: string
}) {
  // Get data from current user
  const { user } = useDynamicContext()

  // Create a context for signature pending view
  const [pendingText, setPendingText] = useState('')
  const signaturePending = { pendingText, setPendingText }

  // Ensure authentication constraint is met
  if (
    (user == null && authenticationState == 'authenticated') ||
    (user != null && authenticationState == 'not authenticated')
  )
    return <Navigate to={redirectTo} />

  // Show content and provide signature context
  return (
    <SignaturePendingContext.Provider value={signaturePending}>
      <SignaturePending />
      <Outlet />
    </SignaturePendingContext.Provider>
  )
}
