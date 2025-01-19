import { DynamicWidget } from '@dynamic-labs/sdk-react'
import { ReactComponent as ChatPicture } from './chat.svg'
import './style.scss'

export default function Login() {
  return (
    <div id="login">
      <main>
        {/* Chatting picture */}
        <ChatPicture />

        {/* Interactive panel */}
        <div className="panel">
          {/* Title */}
          <h1>Whispr</h1>

          {/* Subtitle */}
          <p>
            Where Web3 gets together to whisper across the blockchain, untamed
            by centralization
          </p>

          {/* Login button */}
          <DynamicWidget />
        </div>
      </main>
    </div>
  )
}
