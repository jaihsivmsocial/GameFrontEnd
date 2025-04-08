"use client"

import Image from "next/image"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import styles from "../../viewscreen/screen.module.css"
import { useSocket } from "../contexts/SocketContext"
import apiService from "../contexts/api-service"
import WebRTCStream from "../../components/Home/WebRTCConnection"
import VideoQualitySettings from "../Home/VideoQualitySettings"
import RealTimeChatCompWrapper from "../chat/RealTimeChatCompWrapper"
import StreamBottomBar from "../../components/stream-bottom-bar"
import { useMediaQuery } from "../../components/chat/use-mobile"


export default function HomeCustom() {
  // Media query for mobile detection
  const isMobile = useMediaQuery("(max-width: 768px)")

  // State for mobile bottom sections
  const [activeMobileSection, setActiveMobileSection] = useState(null) // 'donate', 'bet', or null

  // Main camera definition
  const mainCamera = useMemo(
    () => ({
      id: 1,
      src: "/assets/videos/videoplayback.mp4",
      streamId: "stream-1",
      image: "/assets/img/camera/video-camera.png",
    }),
    [],
  )

  const socketContext = useSocket()
  const socket = socketContext?.socket
  const isConnected = socketContext?.isConnected || false

  const [viewerCount, setViewerCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState(false) // Track if video is currently playing
  const [useWebRTC, setUseWebRTC] = useState(true) // Default to using WebRTC
  const [qualitySettings, setQualitySettings] = useState({
    "stream-1": { quality: "auto", frameRate: "60" },
  })
  const videoRef = useRef(null)

  // Handle video pause - decrement viewer count
  const handleVideoPause = useCallback(() => {
    // If not active, don't do anything
    if (!activeVideo) return

    console.log(`Video stopped playing for camera ${mainCamera.id}`)

    // Mark video as inactive
    setActiveVideo(false)

    // Leave the stream room via socket
    if (socket && isConnected) {
      console.log(`Leaving stream room for ${mainCamera.streamId}`)
      socket.emit("leave_stream", { streamId: mainCamera.streamId })
    }

    // Also decrement via API as a fallback
    apiService
      .decrementViewerCount(mainCamera.streamId)
      .then((response) => {
        if (response.success) {
          console.log(`Decremented viewer count for ${mainCamera.name} to ${response.viewerCount}`)
          // Update local state with the new count
          setViewerCount(response.viewerCount)
        }
      })
      .catch((err) => {
        console.error(`Failed to decrement viewer count for camera ${mainCamera.id}:`, err)
      })
  }, [activeVideo, mainCamera, socket, isConnected])

  // Handle video play - increment viewer count
  const handleVideoPlay = useCallback(() => {
    // If already active, don't do anything
    if (activeVideo) return

    console.log(`Video started playing for camera ${mainCamera.id}`)

    // Mark video as active
    setActiveVideo(true)

    // Join the stream room via socket
    if (socket && isConnected) {
      console.log(`Joining stream room for ${mainCamera.streamId}`)
      socket.emit("join_stream", { streamId: mainCamera.streamId })
    }

    // Also increment via API as a fallback
    apiService
      .incrementViewerCount(mainCamera.streamId)
      .then((response) => {
        if (response.success) {
          console.log(`Incremented viewer count for ${mainCamera.name} to ${response.viewerCount}`)
          // Update local state with the new count
          setViewerCount(response.viewerCount)
        }
      })
      .catch((err) => {
        console.error(`Failed to increment viewer count for camera ${mainCamera.id}:`, err)
      })
  }, [activeVideo, mainCamera, socket, isConnected])

  // Function to fetch viewer count from API
  const fetchViewerCount = useCallback(async () => {
    try {
      const response = await apiService.getViewerCount(mainCamera.streamId)
      if (response.success) {
        setViewerCount(response.viewerCount)
      }
    } catch (error) {
      console.error(`Error fetching viewer count for camera ${mainCamera.id}:`, error)
    }
  }, [mainCamera])

  // Fetch initial viewer count
  useEffect(() => {
    setIsLoading(true)
    fetchViewerCount().finally(() => setIsLoading(false))
  }, [fetchViewerCount])

  // Socket connection for real-time viewer count
  useEffect(() => {
    if (!socket || !isConnected) return

    // Handle viewer count updates
    const handleViewerCount = ({ streamId, count }) => {
      if (streamId === mainCamera.streamId) {
        console.log(`Received viewer count update for ${streamId}: ${count}`)
        setViewerCount(count)
      }
    }

    // Listen for viewer count updates
    socket.on("viewer_count", handleViewerCount)

    // Send heartbeat every 30 seconds to keep viewer count accurate
    const heartbeatInterval = setInterval(() => {
      if (activeVideo) {
        console.log("Sending heartbeat for stream:", mainCamera.streamId)
        socket.emit("heartbeat", { streamIds: [mainCamera.streamId] })
      }
    }, 30000)

    return () => {
      socket.off("viewer_count", handleViewerCount)
      clearInterval(heartbeatInterval)
    }
  }, [socket, isConnected, mainCamera, activeVideo])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Decrement viewer count if active
      if (activeVideo && socket && isConnected) {
        socket.emit("leave_stream", { streamId: mainCamera.streamId })
      }
    }
  }, [activeVideo, mainCamera, socket, isConnected])

  // Auto-play the main camera
  useEffect(() => {
    handleVideoPlay()
  }, [handleVideoPlay])

  // Store video element reference
  const setVideoRef = useCallback((element) => {
    if (element) {
      videoRef.current = element
    }
  }, [])

  // Handle quality change
  const handleQualityChange = useCallback(
    (quality, frameRate, cameraStreamId) => {
      console.log(`Quality changed for ${cameraStreamId}: ${quality}, Frame rate: ${frameRate}`)

      // Update quality settings
      setQualitySettings((prev) => ({
        ...prev,
        [cameraStreamId]: { quality, frameRate },
      }))

      // Apply quality settings to the video element if it exists
      if (videoRef.current && !useWebRTC) {
        // For regular videos, we can just set the CSS properties
        videoRef.current.style.objectFit = "cover" // Maintain aspect ratio but fill container
      }
    },
    [useWebRTC],
  )

  const renderCameraView = useCallback(() => {
    const isActive = activeVideo

    return (
      <div className={`${styles.cameraContainer} ${styles.mainCameraView}`} style={{ position: "relative", zIndex: 1 }}>
        {/* Camera icon in top left */}
        <div className={styles.cameraIconCircle}>
          <Image src="/placeholder.svg?height=16&width=16" width={16} height={16} alt="Camera" />
        </div>

        {/* Info button in top right */}
        <div className={styles.infoButton}>
          <Image src="/placeholder.svg?height=16&width=16" width={16} height={16} alt="Info" />
        </div>

        {/* WebRTC Stream or fallback video */}
        {useWebRTC ? (
          <WebRTCStream
            streamId={mainCamera.streamId}
            className={styles.videoPlayer}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            ref={(el) => setVideoRef(el)}
            quality={qualitySettings[mainCamera.streamId]?.quality || "auto"}
            frameRate={qualitySettings[mainCamera.streamId]?.frameRate || "60"}
          />
        ) : (
          // Fallback to regular video element
          <>
            {mainCamera.src.endsWith(".png") || mainCamera.src.endsWith(".jpg") || mainCamera.src.endsWith(".jpeg") ? (
              <Image
                src={mainCamera.src || "/placeholder.svg"}
                alt={mainCamera.name}
                fill
                className={styles.videoPlayer}
                onLoad={handleVideoPlay}
                onError={() => {}}
              />
            ) : (
              <video
                ref={(el) => setVideoRef(el)}
                className={styles.videoPlayer}
                muted
                loop
                playsInline
                autoPlay
                controls
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoPause}
                onError={(e) => {
                  console.log(`Failed to load video: ${mainCamera.src}`)
                  // Try alternative path if the original fails
                  const videoElement = e.target
                  const originalSrc = mainCamera.src
                  const alternativeSrc = originalSrc.startsWith("/assets/")
                    ? originalSrc.replace("/assets/", "/")
                    : `/assets${originalSrc}`

                  videoElement.src = alternativeSrc
                  console.log(`Trying alternative path: ${alternativeSrc}`)

                  // If that also fails, show a placeholder
                  videoElement.onerror = () => {
                    console.log(`Alternative path also failed: ${alternativeSrc}`)
                    // Replace with a placeholder image
                    const parent = videoElement.parentElement
                    if (parent) {
                      const img = document.createElement("img")
                      img.src = "/placeholder.svg?height=480&width=640"
                      img.alt = mainCamera.name
                      img.className = videoElement.className
                      parent.replaceChild(img, videoElement)
                    }
                  }
                }}
              >
                <source src={mainCamera.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </>
        )}

        {/* Camera name */}
        <div className={styles.cameraLabel}>
          <span>{mainCamera.name}</span>
        </div>

        <div className={styles.mainCam} style={{ zIndex: 30 }}>
          <div className={styles.camIcon}>
            <Image
              src="/placeholder.svg?height=24&width=24"
              width={24}
              height={24}
              alt="Camera"
              className={styles.icon}
            />
          </div>
          <div className={styles.camText}>
            <div>{mainCamera.name}</div>
          </div>
        </div>

        <div className={styles.liveIndicator} style={{ zIndex: 30 }}>
          <div className={styles.viewerCount}>
            <Image
              src="/assets/img/iconImage/livefeed_3106921.png"
              width={16}
              height={16}
              alt="Viewers"
              className={styles.icon}
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=16&width=16"
                console.log("Failed to load image: /assets/img/iconImage/livefeed_3106921.png")
              }}
            />
            {viewerCount}
          </div>
        </div>

        {/* Add Video Quality Settings component */}
        <VideoQualitySettings
          streamId={mainCamera.streamId}
          initialQuality={qualitySettings[mainCamera.streamId]?.quality || "auto"}
          initialFrameRate={qualitySettings[mainCamera.streamId]?.frameRate || "60"}
          onQualityChange={(quality, frameRate) => handleQualityChange(quality, frameRate, mainCamera.streamId)}
        />

        {/* Show active indicator */}
        {isActive && (
          <div className={styles.activeIndicator}>
            <div className={styles.activeDot}></div>
          </div>
        )}
      </div>
    )
  }, [
    activeVideo,
    useWebRTC,
    qualitySettings,
    mainCamera,
    handleVideoPlay,
    handleVideoPause,
    setVideoRef,
    handleQualityChange,
    viewerCount,
  ])

  // Render donation section for mobile
  const renderDonationSection = () => {
    return (
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          padding: "15px",
          borderRadius: "16px 16px 0 0",
          position: "fixed",
          bottom: "60px",
          left: 0,
          right: 0,
          zIndex: 50,
          boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.5)",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ color: "#06b6d4", fontWeight: "bold", fontSize: "16px" }}>Donate</span>
          <button
            onClick={() => setActiveMobileSection(null)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <span style={{ fontSize: "14px", color: "#06b6d4", fontWeight: "bold" }}>Want to donate?</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1e293b",
              borderRadius: "4px",
              marginRight: "5px",
              position: "relative",
              height: "40px",
              flex: 1,
            }}
          >
            <span style={{ color: "#06b6d4", marginLeft: "8px", marginRight: "5px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
                  fill="#06b6d4"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Enter amount here..."
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                padding: "0",
                width: "calc(100% - 60px)",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "8px",
                color: "#9ca3af",
                fontSize: "10px",
                cursor: "pointer",
              }}
            >
              CLEAR
            </span>
          </div>

          <button
            style={{
              backgroundColor: "#06b6d4",
              border: "none",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 5L19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <button
            style={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "4px",
              color: "#06b6d4",
              padding: "8px 12px",
              fontSize: "14px",
              flex: 1,
            }}
          >
            +1.00
          </button>

          <button
            style={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "4px",
              color: "#06b6d4",
              padding: "8px 12px",
              fontSize: "14px",
              flex: 1,
            }}
          >
            +5.00
          </button>

          <button
            style={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "4px",
              color: "#06b6d4",
              padding: "8px 12px",
              fontSize: "14px",
              flex: 1,
            }}
          >
            +10.00
          </button>
        </div>

        <div style={{ display: "flex", marginBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
            <input type="checkbox" id="giftToPlayer" style={{ marginRight: "5px", width: "16px", height: "16px" }} />
            <label htmlFor="giftToPlayer" style={{ fontSize: "14px", margin: 0, color: "white" }}>
              Gift to Player
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <input type="checkbox" id="addToPrizepool" style={{ marginRight: "5px", width: "16px", height: "16px" }} />
            <label htmlFor="addToPrizepool" style={{ fontSize: "14px", margin: 0, color: "white" }}>
              Add to Prizepool
            </label>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px dashed #475569",
            borderBottom: "1px dashed #475569",
            paddingTop: "8px",
            paddingBottom: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <span style={{ color: "#06b6d4", fontSize: "14px" }}>$5 shows up on stream</span>
          <span style={{ color: "#9ca3af", fontSize: "14px" }}>$50 fireworks</span>
        </div>
      </div>
    )
  }

  // Render betting section for mobile
  const renderBettingSection = () => {
    return (
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          padding: "15px",
          borderRadius: "16px 16px 0 0",
          position: "fixed",
          bottom: "60px",
          left: 0,
          right: 0,
          zIndex: 50,
          boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.5)",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ color: "#06b6d4", fontWeight: "bold", fontSize: "16px" }}>Place a Bet</span>
          <button
            onClick={() => setActiveMobileSection(null)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "15px",
            position: "relative",
          }}
        >
          <div>
            <span style={{ fontSize: "16px", color: "white" }}>Will </span>
            <span style={{ color: "#06b6d4", fontSize: "16px" }}>James5423</span>
            <span style={{ fontSize: "16px", color: "white" }}> survive the full 5 minutes?</span>
          </div>
          <div
            style={{
              position: "absolute",
              right: "0",
              backgroundColor: "#7f1d1d",
              border: "1px solid #b91c1c",
              borderRadius: "4px",
              color: "white",
              padding: "2px 8px",
              fontSize: "14px",
            }}
          >
            00:36
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
          <button
            style={{
              backgroundColor: "#166534",
              border: "1px solid #15803d",
              borderRadius: "8px",
              color: "#22c55e",
              padding: "10px 15px",
              fontSize: "16px",
              fontWeight: "bold",
              position: "relative",
              width: "48%",
              height: "50px",
            }}
          >
            YES
            <span
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                backgroundColor: "#15803d",
                borderRadius: "0 8px 0 8px",
                padding: "2px 6px",
                fontSize: "12px",
                color: "white",
              }}
            >
              52%
            </span>
          </button>

          <button
            style={{
              backgroundColor: "#7f1d1d",
              border: "1px solid #b91c1c",
              borderRadius: "8px",
              color: "#ef4444",
              padding: "10px 15px",
              fontSize: "16px",
              fontWeight: "bold",
              position: "relative",
              width: "48%",
              height: "50px",
            }}
          >
            NO
            <span
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                backgroundColor: "#b91c1c",
                borderRadius: "0 8px 0 8px",
                padding: "2px 6px",
                fontSize: "12px",
                color: "white",
              }}
            >
              48%
            </span>
          </button>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1e293b",
              borderRadius: "8px",
              position: "relative",
              height: "50px",
              width: "100%",
              marginBottom: "10px",
            }}
          >
            <span style={{ color: "#06b6d4", marginLeft: "15px", marginRight: "10px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
                  fill="#06b6d4"
                />
              </svg>
            </span>
            <span style={{ color: "#06b6d4", fontSize: "18px", fontWeight: "bold" }}>100</span>
            <span
              style={{
                position: "absolute",
                right: "15px",
                color: "#9ca3af",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              CLEAR
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#06b6d4",
                padding: "10px",
                fontSize: "14px",
                flex: 1,
              }}
            >
              +1.00
            </button>

            <button
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#06b6d4",
                padding: "10px",
                fontSize: "14px",
                flex: 1,
              }}
            >
              +5.00
            </button>

            <button
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#06b6d4",
                padding: "10px",
                fontSize: "14px",
                flex: 1,
              }}
            >
              +10.00
            </button>
          </div>
        </div>

        <button
          style={{
            backgroundColor: "#06b6d4",
            border: "none",
            borderRadius: "8px",
            color: "white",
            padding: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            width: "100%",
            marginBottom: "10px",
          }}
        >
          PLACE BET
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: "#9ca3af",
          }}
        >
          <div>
            <span>Total Bets:</span>
            <span style={{ color: "#06b6d4" }}> $3,560</span>
          </div>

          <div>
            <span>Potential Payout:</span>
            <span style={{ color: "#06b6d4" }}> $187</span>
          </div>
        </div>
      </div>
    )
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div
        className={styles.mainAndGameWrapper}
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          height: "100vh",
        }}
      >
        {/* Main content area with video stream */}
        <div
          className={styles.mainContent}
          style={{
            flex: "0 0 auto",
            height: "40vh",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Video Section */}
          <div
            className={styles.videoSection}
            style={{
              height: "100%",
              position: "relative",
              zIndex: 1,
            }}
          >
            {renderCameraView()}
          </div>
        </div>

        {/* Chat Section - Below the video stream */}
        <div
          style={{
            flex: "1 1 auto",
            width: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            overflow: "hidden",
            zIndex: 30,
            marginTop: "-10px", // Slightly overlap with video section
            boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.3)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Image
                src="/placeholder.svg?height=16&width=16"
                width={16}
                height={16}
                alt="Chat"
                style={{ marginRight: "6px" }}
              />
              <span style={{ color: "#fff", fontSize: "14px" }}>{viewerCount} chatting right now</span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <Image src="/placeholder.svg?height=20&width=20" width={20} height={20} alt="Settings" />
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <Image src="/placeholder.svg?height=20&width=20" width={20} height={20} alt="Fullscreen" />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <RealTimeChatCompWrapper streamId={mainCamera.streamId} />
          </div>

          {/* Scroll down indicator */}
          <div
            style={{
              textAlign: "center",
              padding: "5px 0",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
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
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#0f172a",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            height: "60px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            zIndex: 40,
          }}
        >
          <button
            onClick={() => setActiveMobileSection("donate")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              color: "#06b6d4",
              padding: "5px 0",
              width: "20%",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
                fill="#06b6d4"
              />
            </svg>
            <span style={{ fontSize: "12px", marginTop: "2px" }}>Donate</span>
          </button>

          <button
            onClick={() => setActiveMobileSection("bet")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              color: "#06b6d4",
              padding: "5px 0",
              width: "20%",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="12" cy="12" r="2" stroke="#06b6d4" strokeWidth="2" />
              <path d="M16 8L18 6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 16L6 18" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 16L18 18" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 8L6 6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "12px", marginTop: "2px" }}>Bet</span>
          </button>

          <button
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              color: "white",
              padding: "5px 0",
              width: "20%",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 2H8C7.44772 2 7 2.44772 7 3V21C7 21.5523 7.44772 22 8 22H16C16.5523 22 17 21.5523 17 21V3C17 2.44772 16.5523 2 16 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 18H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: "12px", marginTop: "2px" }}>Shop</span>
          </button>

          <button
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              color: "white",
              padding: "5px 0",
              width: "20%",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 10L19.5528 7.72361C19.8343 7.58281 20 7.30279 20 7V5C20 4.44772 19.5523 4 19 4H5C4.44772 4 4 4.44772 4 5V7C4 7.30279 4.16571 7.58281 4.44721 7.72361L9 10L4.44721 12.2764C4.16571 12.4172 4 12.6972 4 13V15C4 15.5523 4.44772 16 5 16H19C19.5523 16 20 15.5523 20 15V13C20 12.6972 19.8343 12.4172 19.5528 12.2764L15 10Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M5 20L19 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: "12px", marginTop: "2px" }}>Clips</span>
          </button>

          <button
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              color: "white",
              padding: "5px 0",
              width: "20%",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontSize: "12px", marginTop: "2px" }}>Settings</span>
          </button>
        </div>

        {/* Conditional rendering of mobile sections */}
        {activeMobileSection === "donate" && renderDonationSection()}
        {activeMobileSection === "bet" && renderBettingSection()}
      </div>
    )
  }

  // Desktop layout (original)
  return (
    <div
      className={styles.mainAndGameWrapper}
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Main content area with fixed height and scrollable */}
      <div
        className={styles.mainContent}
        style={{
          flex: 1,
          overflow: "hidden", // Change from "auto" to "hidden"
          position: "relative", // Add position relative
        }}
      >
        {/* Single View Mode - Only showing main camera */}
        <div
          className={styles.videoSection}
          style={{
            height: "100%", // Change from 80% to 100%
            position: "relative",
            zIndex: 1,
          }}
        >
          {renderCameraView()}
        </div>

        {/* Chat Overlay */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            height: "65%",
            width: "300px",
            zIndex: 25, // Increase from 10 to 25
            overflow: "hidden",
          }}
        >
          <RealTimeChatCompWrapper streamId={mainCamera.streamId} />
        </div>
      </div>

      {/* Bottom Bar - Fixed at bottom */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          width: "100%",
          zIndex: 40, // Increase from 20 to 40
          backgroundColor: "rgba(0, 0, 0, 0.8)", // Add background color for better visibility
        }}
      >
        <StreamBottomBar />
      </div>
    </div>
  )
}
