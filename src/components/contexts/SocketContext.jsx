"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"

const SocketContext = createContext({ socket: null, isConnected: false })

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    // Initialize socket connection if it doesn't exist
    if (!socketRef.current) {
      const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

      // Create socket instance
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: {
          anonymousId:
            typeof localStorage !== "undefined"
              ? localStorage.getItem("anonymousId") || `anon-${Math.random().toString(36).substring(2, 10)}`
              : `anon-${Math.random().toString(36).substring(2, 10)}`,
          customUsername:
            typeof localStorage !== "undefined" ? localStorage.getItem("username") || "Anonymous" : "Anonymous",
          customProfilePicture: typeof localStorage !== "undefined" ? localStorage.getItem("profilePicture") || "" : "",
        },
      })

      // Save anonymousId for future connections
      if (
        typeof localStorage !== "undefined" &&
        !localStorage.getItem("anonymousId") &&
        socketRef.current.auth.anonymousId
      ) {
        localStorage.setItem("anonymousId", socketRef.current.auth.anonymousId)
      }
    }

    const socket = socketRef.current

    // Socket event handlers
    const onConnect = () => {
      setIsConnected(true)
      console.log("Socket connected")
    }
    const onDisconnect = () => {
      setIsConnected(false)
      console.log("Socket disconnected")
    }

    const onError = (error) => {
      console.error("Socket error:", error)
    }

    // Register event listeners
    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("error", onError)

    // Connect if not already connected
    if (!socket.connected) {
      socket.connect()
    }

    // Cleanup function
    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("error", onError)
    }
  }, [])

  return <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>{children}</SocketContext.Provider>
}

