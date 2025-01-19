import { createContext } from 'react'

interface ControlInputInterface {
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  closeInput: () => void
}

export const ControlInputContext = createContext<ControlInputInterface>({
  input: '',
  setInput: (newValue: any) => {},
  closeInput: () => {},
})
