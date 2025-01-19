import { useContext } from 'react'
import { ControlInputContext } from '../../modules/ControlInputContext'
import { MessengerContext } from '../../modules/MessengerContext'
import ChatPreview from '../ChatPreview'
import { ReactComponent as EmptyPicture } from './empty.svg'
import './style.scss'

export default function SearchChats() {
  // Consume chats for current user
  const { chats } = useContext(MessengerContext)

  // Consume input
  const { input } = useContext(ControlInputContext)

  // Treated input
  const treatedInput = input.trim().toLowerCase()

  const filteredChats = Object.values(chats).filter((chat) => {
    if (treatedInput == '') return true

    if (chat.peerAddress.includes(treatedInput)) return true
    if (
      (chat.latestMessage?.content as string | undefined)?.includes(
        treatedInput
      )
    )
      return true

    return false
  })

  if (filteredChats.length == 0)
    return (
      <div className="no-chats">
        <p>Couldn't find any chats.</p>

        <EmptyPicture />
      </div>
    )

  return (
    <div className="chats">
      {/* Chats */}
      {filteredChats.map((chat) => (
        <ChatPreview chat={chat} key={chat.peerAddress} />
      ))}
    </div>
  )
}
