"use client"
import { useEffect, useState, useRef } from "react"
import styles from "../../custonCss/home.module.css"
import Image from "next/image"
import AuthHeaderButtons from "../../components/register/SignupLogin"
import ReplyMessage from "../../components/chat/reply-message"
import { useSocket } from "../../components/contexts/SocketContext"
import { useMediaQuery } from "../../components/chat/use-mobile"
import StreamBottomBar from "@/components/stream-bottom-bar"
import { MessageCircle, Gem, Send } from "lucide-react" // Import Lucide icons
import { usePathname } from "next/navigation" // Import usePathname

const getValidImageUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "/placeholder.svg?height=30&width=30"
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url
  }
  return "/placeholder.svg?height=30&width=30"
}

const isUrl = (text) => {
  try {
    new URL(text)
    return true
  } catch {
    return false
  }
}

const formatContent = (content) => {
  if (!content) return null
  const lines = content.split("\n")
  return lines.map((line, index) => {
    if (isUrl(line.trim())) {
      return (
        <span key={index} className={styles.originalMessageUrl}>
          {line}
        </span>
      )
    }
    return (
      <span key={index} className={styles.originalMessageContent}>
        {line}
      </span>
    )
  })
}

const getUserColor = (username) => {
  const specificColors = {
    "DEVILL-MONSTER": "#FF6347", // Tomato (reddish)
    JAMES5423: "#8A2BE2", // BlueViolet (purple)
    SARAHx420: "#E67E22", // Carrot Orange (burnt orange/brown)
    AECH: "#00CED1", // DarkTurquoise (teal/cyan)
    TWEETTEERR: "#6A5ACD", // SlateBlue (purple-blue)
    ADON: "#FFD700", // Gold
    JACK: "#32CD32", // LimeGreen
  }
  if (specificColors[username]) {
    return specificColors[username]
  }
  const fallbackColors = ["#FF4C4C", "#CCCCCC", "#FF9900", "#99FFFF", "#66CCFF", "#FF69B4", "#ADFF2F"]
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash % fallbackColors.length)
  return fallbackColors[index]
}

const RealTimeChatComp = ({ streamId = "default-stream", isReadOnly = false }) => {
  const [activeTab, setActiveTab] = useState("chat")
  const { socket, isConnected, messages, setMessages, updateSocketAuth, getAuthDetails, currentUserData } = useSocket()
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [waitingForAuth, setWaitingForAuth] = useState(false)
  const [pendingMessage, setPendingMessage] = useState("")
  const [replyTo, setReplyTo] = useState(null)
  const [showReplyUI, setShowReplyUI] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [rateLimitMessage, setRateLimitMessage] = useState("")
  const rateLimitTimerRef = useRef(null)
  const pathname = usePathname() // Get the current pathname

  useEffect(() => {
    const { isLoggedIn } = getAuthDetails()
    if (waitingForAuth && pendingMessage && isLoggedIn) {
      setWaitingForAuth(false)
      setMessage(pendingMessage)
      setPendingMessage("")
    }
  }, [waitingForAuth, pendingMessage, getAuthDetails])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleAuthStateChange = (loggedIn, user) => {
    console.log("Auth state changed:", loggedIn, user)
    updateSocketAuth()
    if (loggedIn) {
      setShowAuthModal(false)
    }
  }

  const handleReply = (msg) => {
    if (isReadOnly) return
    const { isLoggedIn } = getAuthDetails()
    if (!isLoggedIn) {
      setWaitingForAuth(true)
      setShowAuthModal(true)
      return
    }
    setReplyTo(msg)
    setShowReplyUI(true)
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleAfterReplySent = () => {
    setReplyTo(null)
    setShowReplyUI(false)
  }

  const handleCancelReply = () => {
    setReplyTo(null)
    setShowReplyUI(false)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (isReadOnly) return
    if (!message.trim() || !socket || !isConnected) return
    const { isLoggedIn, anonymousId, customUsername } = getAuthDetails()
    if (!isLoggedIn) {
      setPendingMessage(message)
      setWaitingForAuth(true)
      setShowAuthModal(true)
      return
    }
    if (isRateLimited) {
      setRateLimitMessage("Please wait before sending more messages")
      return
    }
    const messageContent = message.trim()
    const senderDetails = {
      id: isLoggedIn ? currentUserData?.id : anonymousId,
      username: isLoggedIn ? currentUserData?.username : customUsername,
      profilePicture: isLoggedIn ? getValidImageUrl(currentUserData?.avatar) : "/placeholder.svg?height=40&width=40",
      isAnonymous: !isLoggedIn,
    }
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      streamId,
      timestamp: Date.now(),
      sender: senderDetails,
      replyTo: null,
      isPending: true,
    }
    setMessages((prev) => [...prev, tempMessage])
    console.log("Sending message via socket:", {
      content: messageContent,
      streamId,
      replyTo: null,
      sender: senderDetails,
    })
    socket.emit("send_message", {
      content: messageContent,
      streamId,
      replyTo: null,
      sender: senderDetails,
    })
    setMessage("")
  }

  useEffect(() => {
    if (!socket) return

    const handleError = (error) => {
      console.error("Socket error:", error)
      if (error.code === "RATE_LIMIT") {
        setIsRateLimited(true)
        setRateLimitMessage(error.message)
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

  // Mobile UI rendering (unchanged from previous version)
  if (isMobile) {
    return (
      <div
        className={styles.chatSection}
        style={{
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
          paddingBottom: isReadOnly ? "0px" : "30px",
          marginLeft: "7px",
          marginRight: "7px",
          paddingTop: "9px",
          border: "none",
        }}
      >
        <div
          className={styles.chatMessages}
          style={{
            flex: 1,
            overflowY: isReadOnly ? "hidden" : "auto",
            padding: "8px",
            marginBottom: isReadOnly ? "0px" : "48px",
            backgroundColor: "transparent",
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
                    marginBottom: "8px",
                    opacity: msg.isPending ? 0.7 : 1,
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      marginRight: "10px",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={getValidImageUrl(msg.sender?.profilePicture) || "/placeholder.svg?height=40&width=40"}
                      width={40}
                      height={40}
                      alt="User avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
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
                        fontSize: "14px",
                        wordBreak: "break-word",
                        display: "flex",
                        alignItems: "baseline",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          color: getUserColor(msg.sender?.username || ""),
                          marginRight: "4px",
                        }}
                      >
                        {msg.sender?.username}:
                      </span>
                      <span style={{ color: "#E6E6E6" }}>{formatContent(msg.content)}</span>
                    </div>
                    {msg.highlight && (
                      <div
                        style={{
                          color: "#4ade80",
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
              {messages.map((msg, index) => {
                if (msg.notification) {
                  return (
                    <div
                      key={`notification-${index}`}
                      style={{
                        textAlign: "center",
                        color: "#4ade80",
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
        {showReplyUI && replyTo && !isReadOnly && (
          <ReplyMessage
            username={replyTo.sender.username}
            onSend={handleAfterReplySent}
            onCancel={handleCancelReply}
            message={message}
            setMessage={setMessage}
            streamId={streamId}
            replyTo={replyTo}
          />
        )}
        {!showReplyUI && !isReadOnly && (
          <form
            onSubmit={handleSendMessage}
            className={styles.chatInput}
            style={{
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
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                height: "45px",
                marginRight: "8px",
                overflow: "hidden",
                marginBottom: "25px",
              }}
            >
              <input
                type="text"
                placeholder="Type Here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!isConnected}
                className={styles.messageInput}
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
                disabled={!isConnected || !message.trim()}
                className={styles.sendButton}
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
                <Send size={20} color="white" />
              </button>
            </div>
          </form>
        )}
        {!isReadOnly && (
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
          ></div>
        )}
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

  // Desktop UI
  return (
    <div
      className={styles.chatSection}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%", // Ensure it takes full width of its parent container
        background: "linear-gradient(to right, #090909, #081e2e)",
        overflow: "hidden",
        borderLeft: "1px solid #0ea5e9", // Added this line for the vertical separator
      }}
    >
      {/* Toggle Buttons */}
      {pathname !== "/chat" && ( // Conditionally render based on pathname
        <div
          className={styles.topTabs}
          style={{
            display: "flex",
            width: "100%",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <button
            className={`${styles.tabButton} ${activeTab === "chat" ? styles.active : ""}`}
            onClick={() => setActiveTab("chat")}
            style={{
              flex: 1,
              padding: "15px 0",
              backgroundColor: activeTab === "chat" ? "#0ea5e9" : "transparent",
              border: "none",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background-color 0.3s ease",
              borderRadius: "9px",
            }}
          >
            <MessageCircle size={20} />
            CHAT
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "bet" ? styles.active : ""}`}
            onClick={() => setActiveTab("bet")}
            style={{
              flex: 1,
              padding: "15px 0",
              backgroundColor: activeTab === "bet" ? "#0ea5e9" : "transparent",
              border: "none",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background-color 0.3s ease",
              borderRadius: "9px",
            }}
          >
            <Gem size={20} />
            BET
          </button>
        </div>
      )}
      {/* Chat Section */}
      {activeTab === "chat" ? (
        <>
          <div
            className={styles.chatMessages}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "15px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.length === 0 ? (
              <div
                className={styles.systemMessage}
                style={{
                  textAlign: "center",
                  color: "#9ca3af",
                  padding: "10px",
                  fontSize: "14px",
                }}
              >
                No messages yet
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    opacity: msg.isPending ? 0.7 : 1,
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      flexShrink: 0,
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
                  <div style={{ flex: 1, wordBreak: "break-word" }}>
                    {msg.replyTo && (
                      <div
                        style={{
                          borderLeft: "2px solid rgba(255, 255, 255, 0.2)",
                          paddingLeft: "8px",
                          marginBottom: "4px",
                          fontSize: "11px",
                          color: "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>{msg.replyTo.username}: </span>
                        {formatContent(msg.replyTo.content)}
                      </div>
                    )}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: getUserColor(msg.sender?.username || ""),
                        marginRight: "5px",
                      }}
                    >
                      {msg.sender?.username}:
                    </span>
                    <span style={{ color: "#E6E6E6" }}>{formatContent(msg.content)}</span>
                    {msg.highlight && (
                      <div
                        style={{
                          color: "#4ade80",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {msg.highlight}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          {showReplyUI && replyTo && !isReadOnly && (
            <ReplyMessage
              username={replyTo.sender.username}
              onSend={handleAfterReplySent}
              onCancel={handleCancelReply}
              message={message}
              setMessage={setMessage}
              streamId={streamId}
              replyTo={replyTo}
            />
          )}
          {!showReplyUI && !isReadOnly && (
            <form
              onSubmit={handleSendMessage}
              style={{
                display: "flex",
                padding: "15px",
                borderTop: "1px solid #1e293b",
                backgroundColor: "#090909",
                gap: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!isConnected}
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "none",
                  padding: "10px 15px",
                  fontSize: "14px",
                  color: "#333",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!isConnected || !message.trim()}
                style={{
                  backgroundColor: "#0ea5e9",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  padding: "10px 15px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  transition: "background-color 0.3s ease",
                }}
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </>
      ) : (
        <StreamBottomBar />
      )}
      {isRateLimited && rateLimitMessage && (
        <div
          style={{
            color: "#ffc107",
            padding: "8px",
            textAlign: "center",
            fontSize: "14px",
            backgroundColor: "rgba(0,0,0,0.7)",
            position: "absolute",
            bottom: "70px",
            left: 0,
            right: 0,
          }}
        >
          {rateLimitMessage}
        </div>
      )}
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
