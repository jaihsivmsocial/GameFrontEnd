


"use client"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import io from "socket.io-client"
import { BASEURL } from "@/utils/apiservice" // Assuming BASEURL is defined here or passed

const SocketContext = createContext(null)

// Helper function to validate and fix image URLs
const getValidImageUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "/placeholder.svg?height=30&width=30"
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url
  }
  return "/placeholder.svg?height=30&width=30"
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([]) // Centralized state for messages
  const anonymousIdRef = useRef(null) // Use ref for anonymousId to persist across renders

  // Function to get current auth details (reads from localStorage)
  const getAuthDetails = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const username = typeof window !== "undefined" ? localStorage.getItem("username") : null
    const avatar = typeof window !== "undefined" ? localStorage.getItem("avatar") : null
    const isLoggedIn = !!token

    if (!anonymousIdRef.current && typeof window !== "undefined") {
      let storedAnonId = localStorage.getItem("anonymousId")
      if (!storedAnonId) {
        storedAnonId = `anon-${Math.random().toString(36).substring(2, 10)}`
        localStorage.setItem("anonymousId", storedAnonId)
      }
      anonymousIdRef.current = storedAnonId
    }

    return {
      anonymousId: anonymousIdRef.current,
      customUsername: isLoggedIn && username ? username : `User${Math.floor(Math.random() * 10000)}`,
      realUsername: isLoggedIn && username ? username : null,
      token: token,
      isLoggedIn: isLoggedIn,
      userData: isLoggedIn ? { username, avatar } : null,
    }
  }, [])

  useEffect(() => {
    const authDetails = getAuthDetails()
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL || BASEURL}`, {
      transports: ["websocket"],
      auth: {
        anonymousId: authDetails.anonymousId,
        customUsername: authDetails.customUsername,
        realUsername: authDetails.realUsername,
        token: authDetails.token,
      },
    })

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id)
      setIsConnected(true)
      // Join default stream on connect
      newSocket.emit("join_stream", { streamId: "default-stream" }) // Ensure all instances join the same stream
    })

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

    newSocket.on("new_message", (newMessage) => {
      console.log("New message received in context:", newMessage)
      if (newMessage.sender && newMessage.sender.profilePicture) {
        newMessage.sender.profilePicture = getValidImageUrl(newMessage.sender.profilePicture)
      }
      setMessages((prev) => {
        // Filter out any temporary messages with the same content and sender
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
    })

    newSocket.on("recent_messages", (recentMessages) => {
      console.log("Recent messages received in context:", recentMessages)
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
      console.error("Socket error in context:", error)
      // Handle rate limiting or other errors here if needed
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [getAuthDetails]) // Re-run effect if auth details change (e.g., login/logout)

  // Function to update socket auth and reconnect (for login/logout)
  const updateSocketAuth = useCallback(() => {
    if (socket) {
      const authDetails = getAuthDetails()
      socket.auth = {
        anonymousId: authDetails.anonymousId,
        customUsername: authDetails.customUsername,
        realUsername: authDetails.realUsername,
        token: authDetails.token,
      }
      socket.disconnect().connect() // Reconnect to apply new auth
    }
  }, [socket, getAuthDetails])

  // Provide the messages and socket instance to consumers
  const contextValue = {
    socket,
    isConnected,
    messages,
    setMessages, // Allow components to directly manipulate messages (e.g., for pending messages)
    updateSocketAuth, // Expose function to trigger auth update
    getAuthDetails, // Expose function to get current auth details
  }

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
