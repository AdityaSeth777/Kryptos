import { createContext } from 'react'

interface SignaturePendingInterface {
  pendingText: string
  setPendingText: React.Dispatch<React.SetStateAction<string>>
}

export const SignaturePendingContext = createContext<SignaturePendingInterface>(
  {
    pendingText: '',
    setPendingText: (newText: any) => {},
  }
)
