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
          marginLeft:"12px",
          marginRight:"12px", 
          paddingTop:"25px"
          
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
            >
            </div>
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
        {/* {showReplyUI && replyTo && (
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
        )} */}

        {!showReplyUI && (
          <form
            onSubmit={handleSendMessage}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 15px",
              backgroundColor: "transparent",
              position: "absolute",
              bottom: "49px", // Move up from the bottom to make room for scroll indicator
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
                backgroundColor: "#0ea5e9", // Brighter blue to match the screenshot
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
              onClose={() => setShowAuthModal(false)}
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
      {!showReplyUI && isMobile && (
  // <form
  //   onSubmit={handleSendMessage}
  //   style={{
  //     display: "flex",
  //     alignItems: "center",
  //     padding: "10px 15px",
  //     backgroundColor: "transparent",
  //     position: "absolute",
  //     bottom: "30px",
  //     left: 0,
  //     right: 0,
  //     width: "100%",
  //     zIndex: 5,
  //   }}
  // >
  //   <div
  //     style={{
  //       flex: 1,
  //       backgroundColor: "white",
  //       borderRadius: "25px",
  //       display: "flex",
  //       alignItems: "center",
  //       height: "45px",
  //       overflow: "hidden",
  //     }}
  //   >
  //     <input
  //       type="text"
  //       placeholder="Type Here..."
  //       value={message}
  //       onChange={(e) => setMessage(e.target.value)}
  //       disabled={!connected}
  //       style={{
  //         flex: 1,
  //         backgroundColor: "transparent",
  //         color: "#999",
  //         border: "none",
  //         padding: "8px 15px",
  //         fontSize: "16px",
  //         height: "100%",
  //         outline: "none",
  //       }}
  //     />
  //     <div style={{ marginRight: "10px", cursor: "pointer" }}>
  //       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path
  //           d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
  //           stroke="#CCCCCC"
  //           strokeWidth="2"
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //         />
  //         <path
  //           d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
  //           stroke="#CCCCCC"
  //           strokeWidth="2"
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //         />
  //         <path d="M9 9H9.01" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  //         <path d="M15 9H15.01" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  //       </svg>
  //     </div>
  //     <button
  //       type="submit"
  //       disabled={!connected || !message.trim()}
  //       style={{
  //         backgroundColor: "#00A3FF",
  //         border: "none",
  //         borderRadius: "4px",
  //         cursor: "pointer",
  //         padding: 0,
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //         height: "40px",
  //         width: "50px",
  //         margin: "0 2px 0 0",
  //         transition: "transform 0.2s",
  //       }}
  //     >
  //       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  //         <path
  //           d="M12 5L19 12L12 19"
  //           stroke="white"
  //           strokeWidth="2"
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //         />
  //       </svg>
  //     </button>
  //   </div>
  // </form>
 <></>
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
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      )}
    </div>
  )
}

export default RealTimeChatComp