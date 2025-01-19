import { DecodedMessage } from '@xmtp/xmtp-js'

export default interface Chat {
  send: (message: string) => Promise<DecodedMessage>

  messages: { [id: string]: DecodedMessage }

  peerAddress: string

  latestMessage?: DecodedMessage
}
