"use client"
import { useEffect, useState, useRef } from "react"
import styles from "../custonCss/home.module.css"
import sidebarStyles from "../custonCss/sidebar.module.css"
import Image from "next/image"
import io from "socket.io-client"
import AuthHeaderButtons from "../components/SignupLogin"

// Helper function to validate and fix image URLs
const getValidImageUrl = (url) => {
  // Check if the URL is valid (starts with http://, https://, or /)
  if (!url || typeof url !== "string") {
    return "/placeholder.svg?height=30&width=30"
  }

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url
  }

  // If it's not a valid URL format, use a placeholder
  return "/placeholder.svg?height=30&width=30"
}

const RealTimeChatComp = ({ streamId = "default-stream" }) => {
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [connected, setConnected] = useState(false)
  const [anonymousId, setAnonymousId] = useState("")
  const messagesEndRef = useRef(null)

  // Auth related states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  // Check if user is logged in
  useEffect(() => {
    // Check for auth token in localStorage
    const token = localStorage.getItem("authToken")
    if (token) {
      setIsLoggedIn(true)
      // You could fetch user data here if needed
      const username = localStorage.getItem("username")
      const avatar = localStorage.getItem("avatar") || "/placeholder.svg?height=40&width=40"
      setUserData({ username, avatar })
    } else {
      setIsLoggedIn(false)
      setUserData(null)
    }
  }, [])

  // Initialize socket connection
  useEffect(() => {
    // Generate a random anonymous ID if not already set
    if (!anonymousId) {
      setAnonymousId(`anon-${Math.random().toString(36).substring(2, 10)}`)
    }

    // Connect to socket server
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      transports: ["websocket"],
      auth: {
        anonymousId,
        customUsername: `User${Math.floor(Math.random() * 10000)}`,
        realUsername: isLoggedIn && userData ? userData.username : null,
        token: localStorage.getItem("authToken") || null,
      },
    })

    // Socket event listeners
    newSocket.on("connect", () => {
      console.log("Connected to socket server")
      setConnected(true)

      // Join the stream room
      newSocket.emit("join_stream", { streamId })
    })

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server")
      setConnected(false)
    })

    newSocket.on("new_message", (newMessage) => {
      console.log("New message received:", newMessage)
      // Fix any invalid profile picture URLs
      if (newMessage.sender && newMessage.sender.profilePicture) {
        newMessage.sender.profilePicture = getValidImageUrl(newMessage.sender.profilePicture)
      }
      setMessages((prev) => [...prev, newMessage])
    })

    newSocket.on("recent_messages", (recentMessages) => {
      console.log("Recent messages received:", recentMessages)
      // Fix any invalid profile picture URLs in recent messages
      const fixedMessages = recentMessages.map((msg) => {
        if (msg.sender && msg.sender.profilePicture) {
          return {
            ...msg,
            sender: {
              ...msg.sender,
              profilePicture: getValidImageUrl(msg.sender.profilePicture),
            },
          }
        }
        return msg
      })
      setMessages(fixedMessages)
    })

    newSocket.on("error", (error) => {
      console.error("Socket error:", error)
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.emit("leave_stream", { streamId })
        newSocket.disconnect()
      }
    }
  }, [anonymousId, streamId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch initial messages via API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/${streamId}`,
        )
        const data = await response.json()
        if (data.messages && data.messages.length > 0) {
          // Fix any invalid profile picture URLs in fetched messages
          const fixedMessages = data.messages.map((msg) => {
            if (msg.sender && msg.sender.profilePicture) {
              return {
                ...msg,
                sender: {
                  ...msg.sender,
                  profilePicture: getValidImageUrl(msg.sender.profilePicture),
                },
              }
            }
            return msg
          })
          setMessages(fixedMessages)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()
  }, [streamId])

  // Handle auth state changes from AuthHeaderButtons
  const handleAuthStateChange = (loggedIn, user) => {
    console.log("Auth state changed:", loggedIn, user)
    setIsLoggedIn(loggedIn)
    setUserData(user)
    setShowAuthModal(false)

    // If logged in, update the chat header with the username
    if (loggedIn && user) {
      // Force a re-render by updating the state
      setIsChatOpen(isChatOpen)
    }
  }

  // Send message function - now checks for authentication
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim() || !socket || !connected) return

    // Check if user is logged in
    const token = localStorage.getItem("authToken")
    if (!token) {
      // Show auth modal if not logged in
      setShowAuthModal(true)
      return
    }

    // If logged in, send the message
    socket.emit("send_message", {
      content: message,
      streamId,
    })

    setMessage("")
  }

  useEffect(() => {
    if (socket) {
      // Update socket auth when login status changes
      socket.auth = {
        ...socket.auth,
        realUsername: isLoggedIn && userData ? userData.username : null,
        token: localStorage.getItem("authToken") || null,
      }

      // Reconnect to apply the new auth
      if (isLoggedIn && userData) {
        socket.disconnect().connect()
      }
    }
  }, [isLoggedIn, userData, socket])

  return (
    <>
      {isChatOpen ? (
        <div className={styles.chatSection}>
          <div className={styles.chatHeader}>
            <div className={styles.worldchat}>
              <button onClick={toggleChat} className={styles.arrowButton}>
                <Image
                  src="/assets/img/iconImage/arrow.png?height=16&width=16"
                  width={16}
                  height={16}
                  alt="Chat"
                  className={styles.icon}
                />
              </button>
              <h5>WORLDCHAT {isLoggedIn && userData ? `(${userData.username})` : ""}</h5>
              <button className={styles.usersButton}>
                <Image
                  src="/assets/img/iconImage/human.png?height=20&width=20"
                  width={20}
                  height={20}
                  alt="Users"
                  className={styles.icon}
                />
              </button>
            </div>
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <div className={styles.systemMessage}>No messages yet. Start chatting!</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={styles.chatMessage}>
                  <p className={styles.messageText}>{msg.content}</p>
                  <div className={styles.messageUser}>
                    <div className={styles.userAvatar}>
                      <Image
                        src={getValidImageUrl(msg.sender?.profilePicture) || "/placeholder.svg?height=30&width=30"}
                        width={30}
                        height={30}
                        alt="User avatar"
                        className={styles.avatar}
                      />
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{msg.sender?.username || "Anonymous"}</div>
                      <div className={styles.userLocation}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <button className={styles.shareButton}>
                      <Image
                        src="/placeholder.svg?height=16&width=16"
                        width={16}
                        height={16}
                        alt="Share"
                        className={styles.icon}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={styles.chatInput}>
            <input
              type="text"
              placeholder="Type here..."
              className={styles.messageInput}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!connected}
            />
            <button type="button" className={styles.emojiButton}>
              <Image
                src="/assets/img/chat/emoji.png?height=20&width=20"
                width={20}
                height={20}
                alt="Emoji"
                className={styles.icon}
              />
            </button>
            <button type="submit" className={styles.sendButton} disabled={!connected || !message.trim()}>
              <Image
                src="/assets/img/chat/paper-plane_9187575.png?height=20&width=20"
                width={20}
                height={20}
                alt="Send"
                className={styles.icon}
              />
            </button>
          </form>
        </div>
      ) : (
        <div className={sidebarStyles.worldchatSidebar}>
          <button onClick={toggleChat} className={sidebarStyles.arrowButton}>
            <Image
              src="/assets/img/iconImage/right.png?height=16&width=16"
              width={16}
              height={16}
              alt="Open Chat"
              className={sidebarStyles.icon}
            />
          </button>
          <div className={sidebarStyles.verticalText}>WORLDCHAT</div>
          <button className={sidebarStyles.usersButton}>
            <Image
              src="/assets/img/iconImage/human.png?height=20&width=20"
              width={20}
              height={20}
              alt="Users"
              className={sidebarStyles.icon}
            />
          </button>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(2px)",
            zIndex: 1050,
          }}
        >
          <AuthHeaderButtons
            initialView="signup"
            onAuthStateChange={handleAuthStateChange}
            isModal={true}
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      )}
    </>
  )
}

export default RealTimeChatComp

