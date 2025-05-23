"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useNavigation } from "./context/NavigationContext"
import { useSocket } from "../components/contexts/SocketContext"
import apiService from "../components/contexts/api-service"

const SpectateButton = ({ streamId = "stream-1" }) => {
  const [hover, setHover] = useState(false)
  const { activeButton, setActiveButton } = useNavigation()
  const isActive = activeButton === "spectate"
  const [viewerCount, setViewerCount] = useState(0)
  const [isStreamActive, setIsStreamActive] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [hasIncrementedCount, setHasIncrementedCount] = useState(false)

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Socket connection
  const socketContext = useSocket()
  const socket = socketContext?.socket
  const isConnected = socketContext?.isConnected || false

  // Updated gradient to match the image
  const baseGradient = "linear-gradient(90deg, #00a0e9 0%, #0073d5 50%, #0046c0 100%)"

  const handleClick = () => {
    setActiveButton("spectate")
    // Toggle active state when button is clicked
    if (!isStreamActive) {
      handleStreamActivate()
    } else {
      handleStreamDeactivate()
    }
  }

  // Function to fetch viewer count from API without incrementing
  const fetchViewerCount = useCallback(async () => {
    try {
      const response = await apiService.getViewerCount(streamId)
      if (response.success) {
        setViewerCount(response.viewerCount)
      }
    } catch (error) {
      console.error(`Error fetching viewer count:`, error)
    }
  }, [streamId])

  // Handle stream activation - increment viewer count
  const handleStreamActivate = useCallback(() => {
    // If already active or already incremented, don't do anything
    if (isStreamActive || hasIncrementedCount) return

    console.log(`Stream activated for ${streamId}`)

    // Mark stream as active
    setIsStreamActive(true)

    // Check if we've already incremented the count in this session
    const sessionKey = `viewed-stream-${streamId}`
    const hasViewedStream = sessionStorage.getItem(sessionKey)

    if (!hasViewedStream) {
      // Mark that this instance has incremented the count
      setHasIncrementedCount(true)

      // Join the stream room via socket
      if (socket && isConnected) {
        console.log(`Joining stream room for ${streamId}`)
        // Add viewer ID to socket auth
        socket.auth = {
          ...socket.auth,
          viewerId: apiService.getViewerId()
        }
        socket.emit("join_stream", { streamId })
      }

      // Also increment via API as a fallback
      apiService
        .incrementViewerCount(streamId)
        .then((response) => {
          if (response.success) {
            console.log(`Incremented viewer count for stream to ${response.viewerCount}`)
            // Update local state with the new count
            setViewerCount(response.viewerCount)
            // Store in session storage to prevent duplicate counts on refresh
            sessionStorage.setItem(sessionKey, "true")
          }
        })
        .catch((err) => {
          console.error(`Failed to increment viewer count:`, err)
        })
    } else {
      console.log("Already counted as a viewer, not incrementing count")
    }
  }, [isStreamActive, hasIncrementedCount, streamId, socket, isConnected])

  // Handle stream deactivation - decrement viewer count
  const handleStreamDeactivate = useCallback(() => {
    // If not active or hasn't incremented, don't do anything
    if (!isStreamActive || !hasIncrementedCount) return

    console.log(`Stream deactivated for ${streamId}`)

    // Mark stream as inactive
    setIsStreamActive(false)

    // Reset the increment flag
    setHasIncrementedCount(false)

    // Leave the stream room via socket
    if (socket && isConnected) {
      console.log(`Leaving stream room for ${streamId}`)
      socket.emit("leave_stream", { streamId })
    }

    // Also decrement via API as a fallback
    apiService
      .decrementViewerCount(streamId)
      .then((response) => {
        if (response.success) {
          console.log(`Decremented viewer count for stream to ${response.viewerCount}`)
          // Update local state with the new count
          setViewerCount(response.viewerCount)
          // Remove from session storage
          sessionStorage.removeItem(`viewed-stream-${streamId}`)
        }
      })
      .catch((err) => {
        console.error(`Failed to decrement viewer count:`, err)
      })
  }, [isStreamActive, hasIncrementedCount, streamId, socket, isConnected])

  // Use the beforeunload event to ensure cleanup happens before page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isStreamActive && hasIncrementedCount) {
        // Use sendBeacon for more reliable delivery during page unload
        const viewerId = apiService.getViewerId()
        const url = `${apiService.baseUrl}/streams/${streamId}/viewers/decrement`
        
        navigator.sendBeacon(
          url,
          JSON.stringify({
            streamId,
            viewerId
          })
        )
        
        // Also try to send a socket message
        if (socket && isConnected) {
          socket.emit("leave_stream", { streamId })
        }
        
        // Remove from session storage
        sessionStorage.removeItem(`viewed-stream-${streamId}`)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isStreamActive, streamId, socket, isConnected, hasIncrementedCount])

  // Fetch initial viewer count without incrementing
  useEffect(() => {
    fetchViewerCount()

    // Set up a session storage check to prevent multiple increments
    const hasViewedStream = sessionStorage.getItem(`viewed-stream-${streamId}`)

    if (!hasViewedStream && !hasIncrementedCount) {
      // This is a new session, increment the count
      handleStreamActivate()
    } else {
      // Just mark the stream as active without incrementing
      setIsStreamActive(true)
      console.log("Already counted as a viewer, not incrementing count")
    }

    // Clean up on component unmount
    return () => {
      if (hasIncrementedCount) {
        handleStreamDeactivate()
      }
    }
  }, [fetchViewerCount, handleStreamActivate, handleStreamDeactivate, streamId, hasIncrementedCount])

  // Socket connection for real-time viewer count
  useEffect(() => {
    if (!socket || !isConnected) return

    // Handle viewer count updates
    const handleViewerCount = ({ streamId: receivedStreamId, count }) => {
      if (receivedStreamId === streamId) {
        console.log(`Received viewer count update for ${streamId}: ${count}`)
        setViewerCount(count)
      }
    }

    // Listen for viewer count updates
    socket.on("viewer_count", handleViewerCount)

    // Send heartbeat every 30 seconds to keep viewer count accurate
    const heartbeatInterval = setInterval(() => {
      if (isStreamActive && hasIncrementedCount) {
        console.log("Sending heartbeat for stream:", streamId)
        socket.emit("heartbeat", { streamIds: [streamId] })
        
        // Also send the new viewer_heartbeat event
        const viewerId = apiService.getViewerId()
        if (viewerId) {
          socket.emit("viewer_heartbeat", {
            streamId,
            viewerId,
            timestamp: Date.now()
          })
        }
      }
    }, 30000)

    return () => {
      socket.off("viewer_count", handleViewerCount)
      clearInterval(heartbeatInterval)
    }
  }, [socket, isConnected, streamId, isStreamActive, hasIncrementedCount])

  // Format viewer count with commas
  const formattedViewerCount = viewerCount.toLocaleString()

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Link
        href="/Shop"
        className="btn text-white d-flex align-items-center justify-content-center"
        style={{
          background: isActive ? baseGradient : "#071019",
          border: `0.5px solid ${isActive ? "#0046c0" : "#FFFFFF"}`,
          width: isMobileView ? "115px" : "178px", // Different width based on device
          height: isMobileView ? "30px" : "37px", // Different height based on device
          fontWeight: "bold",
          fontSize: isMobileView ? "12px" : "14px", // Adjust font size for better proportions
          font: "Poppins",
          letterSpacing: "1px",
          boxShadow: hover ? "0 0 5px rgba(0, 160, 233, 0.5)" : "0 0 5px rgba(0, 70, 192, 0.4)",
          padding: "0",
          overflow: "hidden",
          gap: "8px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: isMobileView ? "0" : "12px",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleClick}
      >
        <img
          src={isActive ? "/assets/img/iconImage/eye 1.png" : "/assets/img/iconImage/eye 1.png"}
          alt="eye icon"
          width={isMobileView ? "18" : "20"} // Slightly smaller icon for mobile
          height={isMobileView ? "18" : "20"}
          style={{ marginRight: "4px" }}
        />
        SPECTATE
      </Link>

      {/* Viewer count display */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "5px",
          fontSize: isMobileView ? "10px" : "12px", // Smaller font for mobile
          color: "white",
          fontWeight: "normal",
        }}
      >
        <img
          src="/assets/img/bg/Rectangle 39343.png"
          alt="Red indicator"
          width="10px"
          height="10px"
          style={{
            marginLeft: isMobileView ? "0" : "-50px", // Remove negative margin on mobile
          }}
          onError={(e) => {
            // Fallback to the original red dot div if image fails to load
            e.target.style.display = "none"
            const parent = e.target.parentNode
            const redDot = document.createElement("div")
            redDot.style.width = "30px"
            redDot.style.height = "30px"
            redDot.style.backgroundColor = "#ff0000"
            redDot.style.borderRadius = "50%"
            redDot.style.marginLeft = isMobileView ? "0" : "200px"

            parent.insertBefore(redDot, e.target)
          }}
        />
        {formattedViewerCount} Viewers
      </div>
    </div>
  )
}

export default SpectateButton