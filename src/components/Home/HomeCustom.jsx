

"use client"

import Image from "next/image"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import styles from "../../viewscreen/screen.module.css"
import { useSocket } from "../contexts/SocketContext"
import apiService from "../contexts/api-service"
import WebRTCStream from "../../components/Home/WebRTCConnection"
import VideoQualitySettings from "../Home/VideoQualitySettings"



export default function HomeCustom() {
  // Define cameras that will be shown in multi-view (excluding main camera initially)
  const otherCameras = useMemo(
    () => [
      { id: 2, name: "Shopping Mall", src: "/assets/videos/video1.mp4", streamId: "stream-2" },
      { id: 3, name: "Office", src: "/assets/videos/office.mp4", streamId: "stream-3" },
      { id: 4, name: "Orchestra", src: "/assets/videos/orchestra.mp4", streamId: "stream-4" },
    ],
    [],
  )

  // Main camera that starts in single view
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

  // All cameras array for convenience
  const allCameras = useMemo(() => [mainCamera, ...otherCameras], [mainCamera, otherCameras])

  // console.log("HomeCustom component rendering with the following cameras:", {
  //   main: mainCamera,
  //   others: otherCameras,
  //   allCameras: allCameras,
  // })
  const socketContext = useSocket()
  const socket = socketContext?.socket
  const isConnected = socketContext?.isConnected || false

  const [isChatOpen, setIsChatOpen] = useState(true)
  const [viewMode, setViewMode] = useState("single")
  const [selectedCamera, setSelectedCamera] = useState(1) // Set to main camera ID initially
  const [viewerCounts, setViewerCounts] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeVideos, setActiveVideos] = useState({}) // Track which videos are currently playing
  const [useWebRTC, setUseWebRTC] = useState(true) // Default to using WebRTC
  const [videoQuality, setVideoQuality] = useState("auto")
  const [videoFrameRate, setVideoFrameRate] = useState("60")
  const videoRefs = useRef({})

  // Track previous active videos to properly clean up
  const previousActiveVideosRef = useRef({})

  // Add these state variables after the existing state declarations
  const [qualitySettings, setQualitySettings] = useState({
    // Default settings for each camera
    "stream-1": { quality: "auto", frameRate: "60" },
    "stream-2": { quality: "auto", frameRate: "60" },
    "stream-3": { quality: "auto", frameRate: "60" },
    "stream-4": { quality: "auto", frameRate: "60" },
  })

  // Handle video pause - decrement viewer count
  const handleVideoPause = useCallback(
    (cameraId) => {
      // If not active, don't do anything
      if (!activeVideos[cameraId]) return

      // Find the camera
      const camera = allCameras.find((cam) => cam.id === cameraId)
      if (!camera) return

      console.log(`Video stopped playing for camera ${cameraId}`)

      // Mark this video as inactive
      setActiveVideos((prev) => {
        const newState = { ...prev }
        delete newState[cameraId]
        return newState
      })

      // Leave the stream room via socket
      if (socket && isConnected) {
        console.log(`Leaving stream room for ${camera.streamId}`)
        socket.emit("leave_stream", { streamId: camera.streamId })
      }

      // Also decrement via API as a fallback
      apiService
        .decrementViewerCount(camera.streamId)
        .then((response) => {
          if (response.success) {
            console.log(`Decremented viewer count for ${camera.name} to ${response.viewerCount}`)
            // Update local state with the new count
            setViewerCounts((prev) => ({
              ...prev,
              [camera.id]: response.viewerCount,
            }))
          }
        })
        .catch((err) => {
          console.error(`Failed to decrement viewer count for camera ${cameraId}:`, err)
        })
    },
    [activeVideos, allCameras, socket, isConnected],
  )

  // Handle video play - increment viewer count
  const handleVideoPlay = useCallback(
    (cameraId) => {
      // If already active, don't do anything
      if (activeVideos[cameraId]) return

      // Find the camera
      const camera = allCameras.find((cam) => cam.id === cameraId)
      if (!camera) return

      console.log(`Video started playing for camera ${cameraId}`)

      // Mark this video as active
      setActiveVideos((prev) => ({
        ...prev,
        [cameraId]: true,
      }))

      // Join the stream room via socket
      if (socket && isConnected) {
        console.log(`Joining stream room for ${camera.streamId}`)
        socket.emit("join_stream", { streamId: camera.streamId })
      }

      // Also increment via API as a fallback
      apiService
        .incrementViewerCount(camera.streamId)
        .then((response) => {
          if (response.success) {
            console.log(`Incremented viewer count for ${camera.name} to ${response.viewerCount}`)
            // Update local state with the new count
            setViewerCounts((prev) => ({
              ...prev,
              [camera.id]: response.viewerCount,
            }))
          }
        })
        .catch((err) => {
          console.error(`Failed to increment viewer count for camera ${cameraId}:`, err)
        })
    },
    [activeVideos, allCameras, socket, isConnected],
  )

  // Function to fetch viewer counts from API
  const fetchViewerCounts = useCallback(async () => {
    try {
      const counts = { ...viewerCounts }
      let updated = false

      for (const camera of allCameras) {
        try {
          const response = await apiService.getViewerCount(camera.streamId)
          if (response.success) {
            counts[camera.id] = response.viewerCount
            updated = true
          }
        } catch (error) {
          console.error(`Error fetching viewer count for camera ${camera.id}:`, error)
        }
      }

      if (updated) {
        setViewerCounts(counts)
      }
    } catch (error) {
      console.error("Error fetching viewer counts:", error)
    }
  }, [viewerCounts, allCameras])

  // Fetch initial viewer counts
  useEffect(() => {
    setIsLoading(true)
    fetchViewerCounts().finally(() => setIsLoading(false))
  }, [fetchViewerCounts])

  // Socket connection for real-time viewer counts
  useEffect(() => {
    if (!socket || !isConnected) return

    // Handle viewer count updates
    const handleViewerCount = ({ streamId, count }) => {
      console.log(`Received viewer count update for ${streamId}: ${count}`)

      // Find the camera with this streamId
      const camera = allCameras.find((cam) => cam.streamId === streamId)

      if (camera) {
        setViewerCounts((prev) => ({
          ...prev,
          [camera.id]: count,
        }))
      }
    }

    // Listen for viewer count updates
    socket.on("viewer_count", handleViewerCount)

    // Send heartbeat every 30 seconds to keep viewer counts accurate
    const heartbeatInterval = setInterval(() => {
      // Get list of active stream IDs
      const activeStreamIds = Object.keys(activeVideos)
        .map((id) => {
          const camera = allCameras.find((cam) => cam.id === Number.parseInt(id))
          return camera ? camera.streamId : null
        })
        .filter(Boolean)

      if (activeStreamIds.length > 0) {
        console.log("Sending heartbeat for streams:", activeStreamIds)
        socket.emit("heartbeat", { streamIds: activeStreamIds })
      }
    }, 30000)

    return () => {
      socket.off("viewer_count", handleViewerCount)
      clearInterval(heartbeatInterval)
    }
  }, [socket, isConnected, allCameras, activeVideos])

  // Get current camera for single view
  const getCurrentCamera = useCallback(() => {
    if (selectedCamera === mainCamera.id) return mainCamera
    return otherCameras.find((cam) => cam.id === selectedCamera) || mainCamera
  }, [selectedCamera, mainCamera, otherCameras])

  // Track changes in active videos to properly clean up
  useEffect(() => {
    // Check for videos that were active but are no longer active
    const prevActiveVideos = previousActiveVideosRef.current

    Object.keys(prevActiveVideos).forEach((cameraId) => {
      if (!activeVideos[cameraId]) {
        // This video was active but is no longer active
        // Make sure it's properly cleaned up
        const camera = allCameras.find((cam) => cam.id === Number(cameraId))
        if (camera && socket && isConnected) {
          console.log(`Ensuring cleanup for camera ${cameraId} (${camera.streamId})`)
          socket.emit("leave_stream", { streamId: camera.streamId })
        }
      }
    })

    // Update the ref with current active videos
    previousActiveVideosRef.current = { ...activeVideos }
  }, [activeVideos, allCameras, socket, isConnected])

  const toggleViewMode = useCallback(() => {
    const newViewMode = viewMode === "single" ? "multi" : "single"

    // Leave all current streams
    Object.keys(activeVideos).forEach((cameraId) => {
      handleVideoPause(Number.parseInt(cameraId))
    })

    setViewMode(newViewMode)

    // Reset active videos
    setActiveVideos({})

    // When switching to single view, only the selected camera should be active
    if (newViewMode === "single") {
      const currentCamera = getCurrentCamera()
      setTimeout(() => handleVideoPlay(currentCamera.id), 100)
    }
  }, [viewMode, getCurrentCamera, activeVideos, handleVideoPlay, handleVideoPause])

  // Handle camera selection change
  const handleCameraChange = useCallback(
    (newCameraId) => {
      // If there's a currently selected camera, leave its stream
      if (selectedCamera) {
        const currentCamera = allCameras.find((cam) => cam.id === selectedCamera)
        if (currentCamera) {
          handleVideoPause(currentCamera.id)
        }
      }

      // Set the new selected camera
      setSelectedCamera(newCameraId)

      // If in single view, play the new camera's video
      if (viewMode === "single") {
        setTimeout(() => handleVideoPlay(newCameraId), 100)
      }
    },
    [selectedCamera, allCameras, viewMode, handleVideoPause, handleVideoPlay],
  )

  // Then update the expandCamera function to use this
  const expandCamera = useCallback(
    (camera) => {
      // Leave all current streams
      Object.keys(activeVideos).forEach((cameraId) => {
        handleVideoPause(Number.parseInt(cameraId))
      })

      // Set new camera and switch to single view
      handleCameraChange(camera.id)
      setViewMode("single")

      // Reset active videos
      setActiveVideos({})
    },
    [activeVideos, handleVideoPause, handleCameraChange],
  )

  // Replace the existing handleQualityChange function with this one
  const handleQualityChange = useCallback(
    (quality, frameRate, cameraStreamId) => {
      console.log(`Quality changed for ${cameraStreamId}: ${quality}, Frame rate: ${frameRate}`)

      // Update quality settings for this specific camera
      setQualitySettings((prev) => ({
        ...prev,
        [cameraStreamId]: { quality, frameRate },
      }))

      // Apply quality settings to the video element if it exists
      const cameraId = allCameras.find((cam) => cam.streamId === cameraStreamId)?.id
      if (cameraId && videoRefs.current[cameraId]) {
        const videoElement = videoRefs.current[cameraId]

        // Apply quality settings based on the selected option
        if (quality !== "auto" && !useWebRTC) {
          // For regular videos, we can just set the CSS properties
          videoElement.style.objectFit = "cover" // Maintain aspect ratio but fill container
        }
      }
    },
    [allCameras, useWebRTC],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Decrement viewer count for all active videos
      Object.keys(activeVideos).forEach((cameraId) => {
        const camera = allCameras.find((cam) => cam.id === Number.parseInt(cameraId))
        if (camera && socket && isConnected) {
          socket.emit("leave_stream", { streamId: camera.streamId })
        }
      })
    }
  }, [activeVideos, allCameras, socket, isConnected])

  // Auto-play the selected camera in single view mode
  useEffect(() => {
    if (viewMode === "single") {
      const currentCamera = getCurrentCamera()
      handleVideoPlay(currentCamera.id)
    }
  }, [viewMode, selectedCamera, getCurrentCamera, handleVideoPlay])

  // Store video element references
  const setVideoRef = useCallback((element, cameraId) => {
    if (element) {
      videoRefs.current[cameraId] = element
    }
  }, [])

  const renderCameraView = useCallback(
    (camera, isMain = false) => {
      const viewerCount = viewerCounts[camera.id] || 0
      const isActive = activeVideos[camera.id]

      return (
        <div className={`${styles.cameraContainer} ${isMain ? styles.mainCameraView : ""}`}>
          {/* Camera icon in top left */}
          <div className={styles.cameraIconCircle}>
            <Image src="/placeholder.svg?height=16&width=16" width={16} height={16} alt="Camera" />
          </div>

          {/* Info button in top right */}
          <div className={styles.infoButton}>
            <Image src="/placeholder.svg?height=16&width=16" width={16} height={16} alt="Info" />
          </div>

          {/* In the renderCameraView function, update the WebRTCStream component props */}
          {useWebRTC ? (
            <WebRTCStream
              streamId={camera.streamId}
              className={isMain ? styles.videoPlayer : styles.smallVideo}
              onPlay={() => handleVideoPlay(camera.id)}
              onPause={() => handleVideoPause(camera.id)}
              ref={(el) => setVideoRef(el, camera.id)}
              quality={qualitySettings[camera.streamId]?.quality || "auto"}
              frameRate={qualitySettings[camera.streamId]?.frameRate || "60"}
            />
          ) : (
            // Fallback to regular video elements
            <>
              {camera.src.endsWith(".png") || camera.src.endsWith(".jpg") || camera.src.endsWith(".jpeg") ? (
                <Image
                  src={camera.src || "/placeholder.svg"}
                  alt={camera.name}
                  fill
                  className={isMain ? styles.videoPlayer : styles.smallVideo}
                  onLoad={() => handleVideoPlay(camera.id)}
                  onError={() => {}}
                />
              ) : (
                <video
                  ref={(el) => setVideoRef(el, camera.id)}
                  className={isMain ? styles.videoPlayer : styles.smallVideo}
                  muted
                  loop
                  playsInline
                  autoPlay={isMain || viewMode === "multi"}
                  controls={isMain}
                  onPlay={() => handleVideoPlay(camera.id)}
                  onPause={() => handleVideoPause(camera.id)}
                  onEnded={() => handleVideoPause(camera.id)}
                  onError={(e) => {
                    console.log(`Failed to load video: ${camera.src}`)
                    // Try alternative path if the original fails
                    const videoElement = e.target
                    const originalSrc = camera.src
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
                        img.alt = camera.name
                        img.className = videoElement.className
                        parent.replaceChild(img, videoElement)
                      }
                    }
                  }}
                >
                  <source src={camera.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </>
          )}

          {/* Camera name and expand button */}
          <div className={styles.cameraLabel}>
            <span>{camera.name}</span>
            {!isMain && (
              <button className={styles.expandButton} onClick={() => expandCamera(camera)}>
                <span>Expand</span>
              </button>
            )}
          </div>

          {isMain && (
            <>
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
                  <div>{camera.name}</div>
                  <div className={styles.changeView} onClick={toggleViewMode}>
                    Change View
                  </div>
                </div>
              </div>

              <div className={styles.liveIndicator}>
                <div className={styles.liveIcon}>
                  <Image
                    src="/assets/img/live.png"
                    width={16}
                    height={16}
                    alt="Live"
                    className={styles.icon}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=16&width=16"
                      console.log("Failed to load image: /assets/img/live.png")
                    }}
                  />
                  LIVE
                </div>
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
              {/* <div className={styles.infoBox}>
                <p>Did you know that there are Segways you can ride in Starlight Plaza?</p>
              </div> */}

              {/* Add Video Quality Settings component */}
              <VideoQualitySettings
                streamId={camera.streamId}
                initialQuality={qualitySettings[camera.streamId]?.quality || "auto"}
                initialFrameRate={qualitySettings[camera.streamId]?.frameRate || "60"}
                onQualityChange={(quality, frameRate) => handleQualityChange(quality, frameRate, camera.streamId)}
              />
            </>
          )}

          {/* Show viewer count for non-main cameras in multi-view */}
          {!isMain && (
            <div className={styles.smallViewerCount}>
              <Image
                src="/assets/img/iconImage/livefeed_3106921.png"
                width={12}
                height={12}
                alt="Viewers"
                className={styles.icon}
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=16&width=16"
                  console.log("Failed to load image: /assets/img/iconImage/livefeed_3106921.png")
                }}
              />
              <span>{viewerCount}</span>
            </div>
          )}

          {/* Show active indicator */}
          {isActive && (
            <div className={styles.activeIndicator}>
              <div className={styles.activeDot}></div>
            </div>
          )}
        </div>
      )
    },
    [
      viewerCounts,
      viewMode,
      activeVideos,
      useWebRTC,
      qualitySettings,
      handleVideoPlay,
      handleVideoPause,
      expandCamera,
      toggleViewMode,
      setVideoRef,
      handleQualityChange,
    ],
  )

  return (
    <div className={`${styles.mainAndGameWrapper} ${!isChatOpen ? styles.fullWidth : ""}`}>
      <div className={styles.mainContent}>
        {viewMode === "single" ? (
          // Single View Mode
          <div className={styles.videoSection}>{renderCameraView(getCurrentCamera(), true)}</div>
        ) : (
          // Multi View Mode
          <div className={styles.multiViewSection}>
            <div className={styles.multiViewGrid}>
              {/* Main camera is always first in multi-view */}
              <div className={`${styles.multiViewItem} ${selectedCamera === mainCamera.id ? styles.activeCamera : ""}`}>
                {renderCameraView(mainCamera)}
              </div>

              {/* Other cameras */}
              {otherCameras.map((camera) => (
                <div
                  key={camera.id}
                  className={`${styles.multiViewItem} ${selectedCamera === camera.id ? styles.activeCamera : ""}`}
                >
                  {renderCameraView(camera)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Game Section */}
      {/* <div className={styles.gameSection}>
        <div className={styles.gameContainer}>
          <div className="relative w-full h-[230px]">
            <Image
              src="/assets/img/funds/2d.png"
              alt="Game platform"
              fill
              className={styles.gamePlatform}
              priority
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=230&width=800"
                console.log("Failed to load game platform image: /assets/img/funds/2d.png")
              }}
            />
          </div>
          <div className={styles.gameControls}>
            <div className={styles.controlsLeft}>
              <div className={styles.controlsGrid}>
                <button className={styles.controlKey}>W</button>
                <button className={styles.controlKey}>A</button>
                <button className={styles.controlKey}>S</button>
                <button className={styles.controlKey}>D</button>
              </div>
              <div className={styles.controlLabel}>Move</div>
            </div>
            <div className={styles.controlsRight}>
              <button className={styles.spaceKey}>SPACE</button>
              <div className={styles.controlLabel}>
                Jump and
                <br />
                Double Jump
              </div>
            </div>
          </div>
          <div className={styles.gameSettings}>
            <button
              className={styles.settingsButton}
              onClick={() => setUseWebRTC(!useWebRTC)}
              title={useWebRTC ? "Switch to video files" : "Switch to WebRTC"}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button className={styles.fullscreenButton}>
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div> */}
    </div>
  )
}







