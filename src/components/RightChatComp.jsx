"use client"
import { useEffect, useState, useRef } from "react"
import styles from "../custonCss/home.module.css"
import Image from "next/image"
import io from "socket.io-client"
import AuthHeaderButtons from "../components/SignupLogin"
import ReplyMessage from "../components/chat/reply-message"
import { BASEURL } from "@/utils/apiservice"

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

// Check if the content is a URL
const isUrl = (text) => {
  try {
    new URL(text)
    return true
  } catch {
    return false
  }
}

// Format the message content
const formatContent = (content) => {
  if (!content) return null

  // Split content by lines
  const lines = content.split("\n")

  return lines.map((line, index) => {
    if (isUrl(line.trim())) {
      return (
        <div key={index} className={styles.originalMessageUrl}>
          {line}
        </div>
      )
    }
    return (
      <div key={index} className={styles.originalMessageContent}>
        {line}
      </div>
    )
  })
}

const RealTimeChatComp = ({ streamId = "default-stream" }) => {
  // We'll always keep the chat open since we're removing the toggle functionality
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

  // Reply related states
  const [replyTo, setReplyTo] = useState(null)
  const [showReplyUI, setShowReplyUI] = useState(false)

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
      const newAnonId = `anon-${Math.random().toString(36).substring(2, 10)}`
      setAnonymousId(newAnonId)
      localStorage.setItem("anonymousId", newAnonId)
    }

    // Connect to socket server
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL || BASEURL}`, {
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

      // Add random reactions to some messages for demo purposes
      if (Math.random() > 0.7) {
        newMessage.reactions = []
        if (Math.random() > 0.5) {
          newMessage.reactions.push({ emoji: "👍", count: Math.floor(Math.random() * 3) + 1 })
        }
        if (Math.random() > 0.7) {
          newMessage.reactions.push({ emoji: "🔥", count: Math.floor(Math.random() * 2) + 1 })
        }
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

        // Add random reactions to some messages for demo purposes
        if (Math.random() > 0.7) {
          msg.reactions = []
          if (Math.random() > 0.5) {
            msg.reactions.push({ emoji: "👍", count: Math.floor(Math.random() * 3) + 1 })
          }
          if (Math.random() > 0.7) {
            msg.reactions.push({ emoji: "🔥", count: Math.floor(Math.random() * 2) + 1 })
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
  }, [anonymousId, streamId, isLoggedIn, userData])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch initial messages via API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || BASEURL}/api/messages/${streamId}`)

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

            // Add random reactions to some messages for demo purposes
            if (Math.random() > 0.7) {
              msg.reactions = []
              if (Math.random() > 0.5) {
                msg.reactions.push({ emoji: "👍", count: Math.floor(Math.random() * 3) + 1 })
              }
              if (Math.random() > 0.7) {
                msg.reactions.push({ emoji: "🔥", count: Math.floor(Math.random() * 2) + 1 })
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
  }

  // Send message function - now checks for authentication and handles rate limiting
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [rateLimitMessage, setRateLimitMessage] = useState("")
  const rateLimitTimerRef = useRef(null)

  // Handle reply button click
  const handleReply = (msg) => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken")
    if (!token) {
      // Show auth modal if not logged in
      setShowAuthModal(true)
      return
    }

    setReplyTo(msg)
    setShowReplyUI(true)
    // Scroll to the reply UI
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  // Handle after reply is sent
  const handleAfterReplySent = () => {
    // Clear the reply states
    setReplyTo(null)
    setShowReplyUI(false)
  }

  // Cancel reply
  const handleCancelReply = () => {
    setReplyTo(null)
    setShowReplyUI(false)
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

    // If currently rate limited, show feedback
    if (isRateLimited) {
      // Show a temporary message that we're rate limited
      setRateLimitMessage("Please wait before sending more messages")
      return
    }

    console.log("Sending message via socket:", {
      content: message,
      streamId,
      replyTo: null,
    })

    // Send message via socket
    socket.emit("send_message", {
      content: message,
      streamId,
      replyTo: null,
    })

    // Clear the message
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

  useEffect(() => {
    if (!socket) return

    const handleError = (error) => {
      console.error("Socket error:", error)

      // Handle rate limiting errors
      if (error.code === "RATE_LIMIT") {
        setIsRateLimited(true)
        setRateLimitMessage(error.message)

        // Clear rate limit after the suggested retry time
        if (rateLimitTimerRef.current) {
          clearTimeout(rateLimitTimerRef.current)
        }

        rateLimitTimerRef.current = setTimeout(
          () => {
            setIsRateLimited(false)
            setRateLimitMessage("")
          },
          (error.retryAfter || 2) * 1000,
        )
      }
    }

    socket.on("error", handleError)

    return () => {
      socket.off("error", handleError)
      if (rateLimitTimerRef.current) {
        clearTimeout(rateLimitTimerRef.current)
      }
    }
  }, [socket])

  // Sample data for demo purposes
  const demoMessages = [
    {
      id: "demo1",
      sender: { username: "DeviL007", profilePicture: "/placeholder.svg?height=40&width=40" },
      content: "LMAOOOOOOOOOOOO",
      timestamp: new Date().toISOString(),
    },
    {
      id: "demo2",
      sender: { username: "R3nn0", profilePicture: "/placeholder.svg?height=40&width=40" },
      content: "Great shottt man!",
      reactions: [{ emoji: "👍", count: 2 }],
      timestamp: new Date().toISOString(),
    },
    {
      id: "demo3",
      sender: { username: "SubroZa", profilePicture: "/placeholder.svg?height=40&width=40", verified: true },
      content: "How are you playing this gooooood???????",
      timestamp: new Date().toISOString(),
    },
    {
      id: "demo4",
      sender: { username: "R3nn0", profilePicture: "/placeholder.svg?height=40&width=40" },
      content: "Great shottt man!",
      reactions: [{ emoji: "👍", count: 2 }],
      timestamp: new Date().toISOString(),
    },
  ]

  // Use demo messages if no real messages are available
  const displayMessages = messages.length > 0 ? messages : demoMessages

  return (
    <div className={styles.chatSection}>
      {/* We're removing the header section */}

      <div className={styles.chatMessages}>
        {displayMessages.length === 0 ? (
          <div className={styles.systemMessage}>No messages yet. Start chatting!</div>
        ) : (
          displayMessages.map((msg) => (
            <div key={msg.id} className={styles.chatMessage}>
              {/* User avatar */}
              <div className={styles.userAvatar}>
                <Image
                  src={getValidImageUrl(msg.sender?.profilePicture) || "/placeholder.svg?height=40&width=40"}
                  width={40}
                  height={40}
                  alt="User avatar"
                  className={styles.avatar}
                />
              </div>

              {/* Message content */}
              <div className={styles.messageContent}>
                {/* Username with optional verified badge */}
                <div className={styles.originalMessageUsername}>
                  {msg.sender?.username || "Anonymous"}
                  {msg.sender?.verified && <span className={styles.verifiedBadge}>✓</span>}
                </div>

                {/* If this is a reply, show the original message */}
                {msg.replyTo && (
                  <div className={styles.replyMessage}>
                    <div className={styles.originalMessageUsername}>{msg.replyTo.username}</div>
                    {formatContent(msg.replyTo.content)}
                  </div>
                )}

                {/* Show the message content */}
                {formatContent(msg.content)}

                {/* Show reactions if any */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className={styles.messageReactions}>
                    {msg.reactions.map((reaction, index) => (
                      <div key={index} className={styles.reaction}>
                        {reaction.emoji} {reaction.count > 1 && reaction.count}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Show reply UI when replying to a message */}
      {showReplyUI && replyTo && (
        <ReplyMessage
          username={replyTo.sender.username}
          onSend={handleAfterReplySent}
          onCancel={handleCancelReply}
          message={message}
          setMessage={setMessage}
          streamId={streamId}
          replyTo={replyTo}
          socket={socket}
        />
      )}

      {!showReplyUI && (
        <form onSubmit={handleSendMessage} className={styles.chatInput}>
          <input
            type="text"
            placeholder="Type Here..."
            className={styles.messageInput}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!connected}
          />
          <button type="button" className={styles.emojiButton}>
            😊
          </button>
          <button type="submit" className={styles.sendButton} disabled={!connected || !message.trim()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      )}

      {isRateLimited && rateLimitMessage && <div className={styles.rateLimitMessage}>{rateLimitMessage}</div>}

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
    </div>
  )
}

export default RealTimeChatComp


