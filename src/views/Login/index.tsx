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
          <h1>Kryptos</h1>

          {/* Subtitle */}
          <p>
          Unleash secure and decentralized communication with Kryptos!
          </p>

          {/* Login button */}
          <DynamicWidget />
        </div>
      </main>
    </div>
  )
}
