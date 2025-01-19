import { useContext, useRef, useState } from 'react'
import { FaArrowLeft, FaPlus, FaSearch } from 'react-icons/fa'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { JSX } from 'react/jsx-runtime'
import Chat from '../../components/Chat'
import Profile from '../../components/Profile'
import { ControlInputContext } from '../../modules/ControlInputContext'
import { MessengerContext } from '../../modules/MessengerContext'
import './style.scss'

// Chat control options
enum ChatOption {
  Search,
  New,
}

// Links options to icons
const controlsData: {
  [key in ChatOption]: {
    icon: JSX.Element
    route: string
    name: string
    inputPlaceholder: string
  }
} = {
  [ChatOption.Search]: {
    icon: <FaSearch />,
    name: 'search-chats',
    route: '/',
    inputPlaceholder: 'Who to search for',
  },
  [ChatOption.New]: {
    icon: <FaPlus />,
    name: 'new-chat',
    route: '/new',
    inputPlaceholder: 'Type an address',
  },
}

export default function Chats() {
  // =====================================
  // === CONTROL OPTIONS
  // =====================================

  // Messenger actions
  const { selectedChat, closeChat } = useContext(MessengerContext)

  // =====================================
  // === CONTROL OPTIONS
  // =====================================

  // Which chat control option is selected
  const [currentOption, setCurrentOption] = useState<null | ChatOption>(null)

  // Get data for current option
  const getOptionData = (option?: number) =>
    controlsData[(option as unknown as ChatOption) ?? currentOption]

  // Navigate route
  const navigate = useNavigate()

  const { search: queryParams } = useLocation()

  // Sets the option from a string
  const setOption = (value: string) => {
    const parsedValue = parseInt(value)

    if (currentOption == parsedValue) {
      setInputValue('')
      setCurrentOption(null)
      navigate(`/${queryParams}`)
      return
    }

    // Set the option
    setCurrentOption(parsedValue)

    // Focus the input
    inputRef.current?.focus()

    // Navigate to the option's route
    navigate(getOptionData(parsedValue).route + queryParams)
  }

  // =====================================
  // === INPUT HANDLING
  // =====================================

  // State of the input
  const [inputValue, setInputValue] = useState('')

  // Ref to field
  const inputRef = useRef<HTMLInputElement>(null)

  const closeInput = () => {
    setCurrentOption(null)
    setInputValue('')
  }

  return (
    <div id="chats">
      {/* Profile & Chat Select */}
      <main className={`main-menu ${selectedChat != null ? 'hidden' : ''}`}>
        {/* Profile */}
        <Profile />

        {/* Main controls */}
        <div className="control-panel">
          {/* Options */}
          <div className="options">
            {Object.entries(controlsData).map(([option, { icon }]) => (
              <div
                key={option}
                className={`option ${
                  parseInt(option) == currentOption ? 'selected' : ''
                }`}
                onClick={() => setOption(option)}
              >
                {icon}
              </div>
            ))}
          </div>

          <div className={`controls ${currentOption != null ? 'active' : ''}`}>
            {/* Input text */}
            <input
              ref={inputRef}
              type="text"
              placeholder={getOptionData()?.inputPlaceholder}
              value={inputValue}
              onChange={({ target }) => setInputValue(target.value)}
            />
          </div>
        </div>

        <ControlInputContext.Provider
          value={{
            input: inputValue,
            setInput: setInputValue,
            closeInput,
          }}
        >
          <Outlet />
        </ControlInputContext.Provider>
      </main>

      {/* Chat view */}
      <div className={`chat-view ${selectedChat != null ? 'visible' : ''}`}>
        {/* Back arrow */}
        <div className="back" onClick={closeChat}>
          <FaArrowLeft />
        </div>

        <Chat address={selectedChat} />
      </div>
    </div>
  )
}
