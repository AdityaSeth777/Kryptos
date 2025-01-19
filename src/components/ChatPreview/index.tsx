import { useContext } from 'react'
import { AiOutlineCheck } from 'react-icons/ai'
import { MessengerContext } from '../../modules/MessengerContext'
import Chat from '../../types/Chat.interface'
import ProfilePicture from '../ProfilePicture'
import './style.scss'

export default function ChatPreview({ chat }: { chat: Chat }) {
  // Consume chats for current user
  const { openChat, closeChat, selectedChat } = useContext(MessengerContext)

  // Handle clicking a chat
  const handleSelect = () => {
    if (chat.peerAddress === selectedChat) closeChat()
    else openChat(chat.peerAddress)
  }

  return (
    <div
      className={`chat-preview ${
        chat.peerAddress === selectedChat && 'selected'
      }`}
      onClick={handleSelect}
    >
      {/* Peer's picture */}
      <ProfilePicture address={chat.peerAddress} size={40} />

      {/* Conversation details */}
      <div className="text">
        {/* Name */}
        <div className="address">
          {/* First 3 letters */}
          <p className="prefix">{chat.peerAddress.slice(0, 3)}</p>
          <p>{chat.peerAddress.slice(3)}</p>
        </div>

        {/* Latest message */}
        {chat.latestMessage && (
          <small>
            {chat.latestMessage.senderAddress !== chat.peerAddress && (
              <AiOutlineCheck />
            )}
            {chat.latestMessage.content}
          </small>
        )}
      </div>
    </div>
  )
}
