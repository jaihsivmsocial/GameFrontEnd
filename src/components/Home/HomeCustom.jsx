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

  // IMPROVED: Use environment variable with fallback for pixel streaming URL
  const pixelStreamingUrl = "http://15.237.174.180"

  // Main camera definition - IMPROVED: Use the pixel streaming URL
  const mainCamera = useMemo(
    () => ({
      id: 1,
      src: pixelStreamingUrl, // Use the pixel streaming URL
      streamId: "stream-1",
      image: "/assets/img/camera/video-camera.png",
      isPixelStreaming: true, // Flag to indicate this is pixel streaming
    }),
    [pixelStreamingUrl],
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
  const iframeRef = useRef(null) // ADDED: Reference for iframe

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

      // ADDED: For pixel streaming, we could send a message to the iframe
      if (iframeRef.current && mainCamera.isPixelStreaming) {
        try {
          // Example of sending quality settings to the pixel streaming iframe
          iframeRef.current.contentWindow.postMessage(
            {
              type: "qualityChange",
              quality: quality,
              frameRate: frameRate,
            },
            "*",
          )
        } catch (err) {
          console.error("Error sending quality settings to iframe:", err)
        }
      }
    },
    [useWebRTC, mainCamera.isPixelStreaming],
  )

  // ADDED: Handle iframe load event
  const handleIframeLoad = useCallback(() => {
    console.log("Pixel streaming iframe loaded")
    setIsLoading(false)
    handleVideoPlay()
  }, [handleVideoPlay])

  // ADDED: Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error("Pixel streaming iframe failed to load")
    setIsLoading(false)
    // You could implement a fallback here if needed
  }, [])

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

        {/* IMPROVED: Render iframe for pixel streaming or WebRTC for regular streaming */}
        {mainCamera.isPixelStreaming ? (
          <div className={styles.videoPlayer} style={{ width: "100%", height: "100%", position: "relative" }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={mainCamera.src}
              className={styles.videoPlayer}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="autoplay; fullscreen; microphone; camera"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>
        ) : useWebRTC ? (
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
              // Show a placeholder image on error
              const videoElement = e.target
              const parent = videoElement.parentElement
              if (parent) {
                const img = document.createElement("img")
                img.src = "/placeholder.svg?height=480&width=640"
                img.alt = mainCamera.name || "Camera Feed"
                img.className = videoElement.className
                parent.replaceChild(img, videoElement)
              }
            }}
          >
            <source src={mainCamera.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Camera name */}
        <div className={styles.cameraLabel}>
          <span>{mainCamera.name || "Camera Feed"}</span>
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
            <div>{mainCamera.name || "Camera Feed"}</div>
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
        <div className="position-absolute bottom-0 end-0 p-2 d-none d-md-block" style={{ zIndex: 20 }}>
          <VideoQualitySettings
            streamId={mainCamera.streamId}
            initialQuality={qualitySettings[mainCamera.streamId]?.quality || "auto"}
            initialFrameRate={qualitySettings[mainCamera.streamId]?.frameRate || "60"}
            onQualityChange={(quality, frameRate) => handleQualityChange(quality, frameRate, mainCamera.streamId)}
          />
        </div>

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
    isLoading,
    handleIframeLoad,
    handleIframeError,
  ])

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
            background: "linear-gradient(to right, #090909, #081e2e)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            overflow: "hidden",
            zIndex: 30,
            marginTop: "-61px", // Overlap with video section
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
            }}
          >
            <div
              className="container"
              style={{
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(to right, rgb(15, 67, 72) 0%, rgb(8 22 23) 40%, rgba(2, 2, 2, 0) 100%)",
              }}
            >
              <Image
                src="/assets/img/chat/chatmob.png?height=16&width=16"
                width={16}
                height={16}
                alt="Chat"
                style={{ marginRight: "6px" }}
              />
              <span
                style={{
                  color: "#fff",
                  fontSize: "15px",
                }}
              >
                {viewerCount} chatting right now
              </span>
            </div>
            <div style={{ position: "absolute", top: "190px", right: "10px", zIndex: "20" }}>
              <VideoQualitySettings
                streamId={mainCamera.streamId}
                initialQuality={qualitySettings[mainCamera.streamId]?.quality || "auto"}
                initialFrameRate={qualitySettings[mainCamera.streamId]?.frameRate || "60"}
                onQualityChange={(quality, frameRate) => handleQualityChange(quality, frameRate, mainCamera.streamId)}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflow: "hidden", marginTop: "22px" }}>
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
          ></div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#040404",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            height: "60px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            zIndex: 40,
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
          }}
        >
          <StreamBottomBar />
        </div>
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
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Single View Mode - Only showing main camera */}
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

        {/* Chat Overlay */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            height: "65%",
            width: "300px",
            zIndex: 25,
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
          zIndex: 40,
          backgroundColor: "#211c17",
        }}
      >
        <StreamBottomBar />
      </div>
    </div>
  )
}
