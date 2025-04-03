"use client"

import Image from "next/image"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import styles from "../../viewscreen/screen.module.css"
import { useSocket } from "../contexts/SocketContext"
import apiService from "../contexts/api-service"
import WebRTCStream from "../../components/Home/WebRTCConnection"
import VideoQualitySettings from "../Home/VideoQualitySettings"
import RealTimeChatCompWrapper from "../Home/RealTimeChatCompWrapper"
import StreamBottomBar from "../../components/stream-bottom-bar"

export default function HomeCustom() {
  // Main camera definition
  const mainCamera = useMemo(
    () => ({
      id: 1,
      name: "Street Cam",
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
      <div className={`${styles.cameraContainer} ${styles.mainCameraView}`}>
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

        <div className={styles.mainCam}>
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

        <div className={styles.liveIndicator}>
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

  // Calculate the height to leave space for the bottom bar
  const bottomBarHeight = 138 // Height of the bottom bar in pixels

  return (
    <div
      className={`${styles.mainAndGameWrapper}`}
      style={{
        position: "relative",
        height: "100vh", // Full viewport height
        paddingBottom: `${bottomBarHeight}px`, // Add padding at the bottom to make space for the bar
      }}
    >
      <div
        className={styles.mainContent}
        style={{
          height: `calc(100% - ${bottomBarHeight}px)`, // Adjust height to leave space for bottom bar
        }}
      >
        {/* Single View Mode - Only showing main camera */}
        <div
          className={styles.videoSection}
          style={{
            height: "100%", // Make video section take full height of the adjusted container
          }}
        >
          {renderCameraView()}
        </div>
      </div>

      {/* Chat Overlay */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          height: "65%", // Reduced height to match screenshot exactly
          width: "300px",
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        <RealTimeChatCompWrapper streamId={mainCamera.streamId} />
      </div>

      {/* Bottom Betting/Donation Bar */}
      <StreamBottomBar />
    </div>
  )
}

