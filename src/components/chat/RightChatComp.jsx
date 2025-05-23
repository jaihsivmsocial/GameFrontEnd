"use client"
import { useEffect, useState, useRef } from "react"
import styles from "../../custonCss/home.module.css"
import Image from "next/image"
import io from "socket.io-client"
import AuthHeaderButtons from "../../components/register/SignupLogin"
import ReplyMessage from "../../components/chat/reply-message"
import { BASEURL } from "@/utils/apiservice"
import { useMediaQuery } from "../../components/chat/use-mobile"

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
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Auth related states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)
  // Add a flag to track if we're waiting for auth
  const [waitingForAuth, setWaitingForAuth] = useState(false)
  // Store the message that was being sent when auth was required
  const [pendingMessage, setPendingMessage] = useState("")

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

      // If we were waiting for auth and now we're logged in, send the pending message
      if (waitingForAuth && pendingMessage) {
        // Reset the waiting flag
        setWaitingForAuth(false)

        // Set the message from the pending message
        setMessage(pendingMessage)

        // Clear the pending message
        setPendingMessage("")

        // We don't auto-send here to give the user a chance to review
      }
    } else {
      setIsLoggedIn(false)
      setUserData(null)
    }
  }, [waitingForAuth, pendingMessage])

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
        // Use the actual username as customUsername if available
        customUsername: isLoggedIn && userData ? userData.username : `User${Math.floor(Math.random() * 10000)}`,
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

      // Check if this is a duplicate of a pending message we already added
      if (newMessage.id.startsWith("msg-")) {
        // Remove any temporary messages with the same content and sender
        setMessages((prev) => {
          const filtered = prev.filter(
            (msg) =>
              !(
                msg.isPending &&
                msg.content === newMessage.content &&
                msg.sender.username === newMessage.sender.username
              ),
          )
          return [...filtered, newMessage]
        })
      } else {
        setMessages((prev) => [...prev, newMessage])
      }
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

    // Only close the auth modal if login was successful
    if (loggedIn) {
      setShowAuthModal(false)

      // If we were waiting for auth, set the flag to trigger the useEffect
      if (waitingForAuth) {
        // Keep the modal closed, we'll handle the message in the useEffect
        setWaitingForAuth(true)
      }
    }

    // Update socket auth when login status changes
    if (socket && loggedIn) {
      socket.auth = {
        ...socket.auth,
        customUsername: loggedIn && user ? user.username : `User${Math.floor(Math.random() * 10000)}`,
        realUsername: loggedIn && user ? user.username : null,
        token: localStorage.getItem("authToken") || null,
      }

      // Reconnect to apply the new auth
      socket.disconnect().connect()
    }
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
      setWaitingForAuth(true)
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
      // Store the current message before showing auth modal
      setPendingMessage(message)

      // Set waiting flag to true
      setWaitingForAuth(true)

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

    // Store message content in a variable for reuse
    const messageContent = message.trim()

    // Create a temporary message object for immediate display
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      streamId,
      timestamp: Date.now(),
      sender: {
        id: anonymousId,
        username: userData?.username || "You",
        profilePicture: userData?.avatar || "/placeholder.svg?height=40&width=40",
        isAnonymous: false,
      },
      replyTo: null,
      isPending: true, // Mark as pending to potentially style differently
    }

    // Add to messages immediately for instant feedback
    setMessages((prev) => [...prev, tempMessage])

    console.log("Sending message via socket:", {
      content: messageContent,
      streamId,
      replyTo: null,
    })

    // Send message via socket
    socket.emit("send_message", {
      content: messageContent,
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
        // Use the actual username as customUsername if available
        customUsername: isLoggedIn && userData ? userData.username : `User${Math.floor(Math.random() * 10000)}`,
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

  // Mobile UI rendering
  if (isMobile) {
    return (
      <div
        className={styles.chatSection}
        style={{
          background: "linear-gradient(90deg, #0b1526 0%, #0a1a2e 100%)",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
          paddingBottom: "30px",
          marginLeft: "12px",
          marginRight: "12px",
          paddingTop: "25px",
        }}
      >
        <div
          className={styles.chatMessages}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0",
            marginBottom: "48px", // Increased to make room for input and scroll indicator
          }}
        >
          {messages.length === 0 ? (
            <div
              className={styles.systemMessage}
              style={{
                textAlign: "center",
                color: "#202c36",
                padding: "10px",
                fontSize: "12px",
              }}
            ></div>
          ) : (
            <div style={{ width: "100%" }}>
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    padding: "8px 10px",
                    marginBottom: "2px",
                    backgroundColor: "rgba(30, 30, 40, 0.4)",
                    borderRadius: "8px",
                    margin: "6px 10px",
                    border: "1px solid white",
                    // Add subtle styling for pending messages
                    opacity: msg.isPending ? 0.7 : 1,
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      marginRight: "10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        marginBottom: "2px",
                      }}
                    >
                      <Image
                        src={getValidImageUrl(msg.sender?.profilePicture) || "/placeholder.svg?height=30&width=30"}
                        width={30}
                        height={30}
                        alt="User avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#06b6d4", // Cyan color for username
                        marginBottom: "2px",
                      }}
                    >
                      {msg.sender?.username || "Anonymous"}
                    </div>
                    {msg.replyTo && (
                      <div
                        style={{
                          borderLeft: "2px solid rgba(255, 255, 255, 0.2)",
                          padding: "2px 8px",
                          marginBottom: "4px",
                          fontSize: "11px",
                          color: "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>{msg.replyTo.username}: </span>
                        {msg.replyTo.content}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "13px",
                        color: "white",
                        wordBreak: "break-word",
                      }}
                    >
                      {formatContent(msg.content)}
                    </div>
                    {/* Add colored line below message if needed */}
                    {msg.highlight && (
                      <div
                        style={{
                          color: "#4ade80", // Green color for highlights
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {msg.highlight}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* System notifications */}
              {messages.map((msg, index) => {
                // Check if there's a notification to display after this message
                if (msg.notification) {
                  return (
                    <div
                      key={`notification-${index}`}
                      style={{
                        textAlign: "center",
                        color: "#4ade80", // Green color for notifications
                        fontSize: "12px",
                        padding: "4px 0",
                        margin: "2px 0",
                      }}
                    >
                      {msg.notification}
                    </div>
                  )
                }
                return null
              })}
            </div>
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
          <form
            onSubmit={handleSendMessage}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 15px",
              backgroundColor: "transparent",
              position: "absolute",
              bottom: "49px",
              left: 0,
              right: 0,
              width: "100%",
              zIndex: 5,
            }}
          >
            <div
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                height: "40px",
                marginRight: "8px",
                overflow: "hidden",
              }}
            >
              <input
                type="text"
                placeholder="Type Here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!connected}
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  color: "#333",
                  border: "none",
                  padding: "8px 15px",
                  fontSize: "14px",
                  height: "100%",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!connected || !message.trim()}
                style={{
                  backgroundColor: "#0ea5e9",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "40px",
                  width: "40px",
                  transition: "transform 0.2s",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M22 2L15 22L11 13L2 9L22 2Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </form>
        )}

        {/* Scroll down indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: 0,
            right: 0,
            textAlign: "center",
            padding: "5px 0",
            color: "white",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            backgroundColor: "rgba(13, 18, 30, 0.8)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            zIndex: 4,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9L12 16L5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          SCROLL DOWN
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9L12 16L5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {isRateLimited && rateLimitMessage && (
          <div
            style={{
              color: "#ffc107",
              padding: "8px",
              textAlign: "center",
              fontSize: "14px",
              backgroundColor: "transparent",
              border: "none",
              position: "absolute",
              bottom: "70px",
              left: 0,
              right: 0,
            }}
          >
            {rateLimitMessage}
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
              onClose={() => {
                // Reset waiting state and clear pending message when user manually closes the modal
                setWaitingForAuth(false)
                setPendingMessage("")
                setShowAuthModal(false)
              }}
            />
          </div>
        )}
      </div>
    )
  }

  // Desktop UI (original implementation)
  return (
    <div className={styles.chatSection}>
      <div className={styles.chatMessages}>
        {messages.length === 0 ? (
          <div className={styles.systemMessage}>No messages yet</div>
        ) : (
          <table className={styles.chatTable} cellSpacing="0" cellPadding="0" border="0">
            <tbody>
              {messages.map((msg, index) => (
                <tr key={msg.id} className={styles.chatRow}>
                  <td className={styles.profileCell}>
                    <div className={styles.userAvatar}>
                      <Image
                        src={getValidImageUrl(msg.sender?.profilePicture) || "/placeholder.svg?height=40&width=40"}
                        width={40}
                        height={40}
                        alt="User avatar"
                        className={styles.avatar}
                      />
                    </div>
                    <div className={styles.originalMessageUsername}>{msg.sender?.username || "Anonymous"}</div>
                  </td>
                  <td className={styles.messageCell}>
                    <div className={styles.messageCellContent}>
                      {/* If this is a reply, show the original message */}
                      {msg.replyTo && (
                        <div className={styles.replyMessage}>
                          <div className={styles.replyUsername}>{msg.replyTo.username}</div>
                          {formatContent(msg.replyTo.content)}
                        </div>
                      )}

                      {formatContent(msg.content)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <button type="submit" className={styles.sendButton} disabled={!connected || !message.trim()}>
            <Image
              src="/assets/img/chat/send-message.png?height=20&width=20"
              width={20}
              height={20}
              alt="Send"
              className={styles.icon}
            />
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
            onClose={() => {
              // Reset waiting state and clear pending message when user manually closes the modal
              setWaitingForAuth(false)
              setPendingMessage("")
              setShowAuthModal(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default RealTimeChatComp
