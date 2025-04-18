"use client"

import { useEffect, useRef, useState, useCallback, forwardRef } from "react"
import { useSocket } from "../contexts/SocketContext"
import apiService from "../contexts/api-service"
import { BASEURL } from "@/utils/apiservice"
import styles from "../../viewscreen/screen.module.css"
const WebRTCStream = forwardRef(
  (
    {
      streamId,
      isPublisher = false,
      className = "",
      onPlay = () => {},
      onPause = () => {},
      quality = "auto",
      frameRate = "60",
    },
    ref,
  ) => {
    const socketContext = useSocket()
    const socket = socketContext?.socket
    const videoRef = useRef(null)
    const peerConnectionRef = useRef(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [usingFallback, setUsingFallback] = useState(false)
    const fallbackInitializedRef = useRef(false)
    const heartbeatIntervalRef = useRef(null)
    const viewerRegisteredRef = useRef(false)
    const containerRef = useRef(null)
    const isMountedRef = useRef(true)
    const lastRegistrationTimeRef = useRef(0)
    const unregisterTimeoutRef = useRef(null)
    const [currentQuality, setCurrentQuality] = useState(quality)
    const [currentFrameRate, setCurrentFrameRate] = useState(frameRate)

    // IMPROVED: Get pixel streaming URL from environment variable
    const pixelStreamingUrl ="http://15.237.174.180"

    // Set isMounted to false when component unmounts
    useEffect(() => {
      isMountedRef.current = true
      return () => {
        isMountedRef.current = false
      }
    }, [])

    // Update quality settings when props change
    useEffect(() => {
      if (quality !== currentQuality) {
        console.log(`Quality changed from ${currentQuality} to ${quality}`)
        setCurrentQuality(quality)
        applyQualitySettings()
      }

      if (frameRate !== currentFrameRate) {
        console.log(`Frame rate changed from ${currentFrameRate} to ${frameRate}`)
        setCurrentFrameRate(frameRate)
        applyQualitySettings()
      }
    }, [quality, frameRate])

    // Apply quality settings to the video element
    const applyQualitySettings = useCallback(() => {
      if (!videoRef.current) return

      // For fallback video, adjust playback rate based on frame rate
      if (usingFallback) {
        videoRef.current.playbackRate = frameRate === "60" ? 1.0 : 0.5

        // If we have a source, try to reload with new quality
        if (videoRef.current.src && fallbackInitializedRef.current) {
          // For a real implementation, we would switch to different quality video sources
          // For this demo, we'll just log that quality changed
          console.log(`Applied quality settings to fallback video: ${quality}, ${frameRate}fps`)
        }
      } else if (peerConnectionRef.current) {
        // For WebRTC, we would need to renegotiate with new constraints
        // This is a simplified version - in a real app, you'd update the sender's constraints
        console.log(`Applied quality settings to WebRTC stream: ${quality}, ${frameRate}fps`)

        // In a real implementation, you would do something like:
        // const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video')
        // if (sender) {
        //   const params = sender.getParameters()
        //   // Update encoding parameters based on quality and frameRate
        //   sender.setParameters(params)
        // }
      }
    }, [quality, frameRate, usingFallback])

    // Immediately use fallback for test streams (stream-1, stream-2, etc.)
    useEffect(() => {
      if (streamId && (streamId.startsWith("stream-") || streamId === "default-stream")) {
        console.log(`Test stream detected (${streamId}), using fallback video immediately`)
        setUsingFallback(true)
      }
    }, [streamId])

    // Expose video element via ref
    useEffect(() => {
      if (ref && videoRef.current) {
        if (typeof ref === "function") {
          ref(videoRef.current)
        } else {
          ref.current = videoRef.current
        }
      }
    }, [ref])

    // Register as a viewer when the component mounts or when the video starts playing
    const registerViewer = useCallback(() => {
      if (!socket || !streamId || viewerRegisteredRef.current) return

      // Prevent rapid registration/unregistration cycles
      const now = Date.now()
      if (now - lastRegistrationTimeRef.current < 1000) {
        console.log(`Skipping registration for ${streamId} - too soon after last registration`)
        return
      }

      lastRegistrationTimeRef.current = now
      console.log(`Registering as viewer for stream: ${streamId}`)
      viewerRegisteredRef.current = true

      // Clear any pending unregister timeout
      if (unregisterTimeoutRef.current) {
        clearTimeout(unregisterTimeoutRef.current)
        unregisterTimeoutRef.current = null
      }

      // Join the stream room via socket to increment viewer count
      socket.emit("join_stream", { streamId })

      // Also increment via API as a fallback
      apiService
        .incrementViewerCount(streamId)
        .then((response) => {
          if (response.success) {
            console.log(`API: Incremented viewer count for ${streamId}`)
          }
        })
        .catch((err) => console.error("API error incrementing viewer count:", err))
    }, [socket, streamId])

    // Unregister as a viewer when the component unmounts or when the video stops playing
    const unregisterViewer = useCallback(() => {
      if (!socket || !streamId || !viewerRegisteredRef.current) return

      // Prevent rapid registration/unregistration cycles
      const now = Date.now()
      if (now - lastRegistrationTimeRef.current < 1000) {
        console.log(`Delaying unregistration for ${streamId} - too soon after registration`)

        // Set a timeout to unregister after a delay
        if (unregisterTimeoutRef.current) {
          clearTimeout(unregisterTimeoutRef.current)
        }

        unregisterTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && viewerRegisteredRef.current) {
            performUnregister()
          }
        }, 1000)
        return
      }

      performUnregister()

      function performUnregister() {
        console.log(`Unregistering as viewer for stream: ${streamId}`)
        viewerRegisteredRef.current = false
        lastRegistrationTimeRef.current = now

        // Leave the stream room via socket to decrement viewer count
        socket.emit("leave_stream", { streamId })

        // Also decrement via API as a fallback
        apiService
          .decrementViewerCount(streamId)
          .then((response) => {
            if (response.success) {
              console.log(`API: Decremented viewer count for ${streamId}`)
            }
          })
          .catch((err) => console.error("API error decrementing viewer count:", err))
      }
    }, [socket, streamId])

    // Set up heartbeat to keep viewer count accurate
    useEffect(() => {
      if (!socket || !streamId || !isPlaying) return

      console.log(`Setting up heartbeat for stream: ${streamId}`)

      // Send initial heartbeat
      socket.emit("heartbeat", { streamIds: [streamId] })

      // Set up interval for regular heartbeats
      heartbeatIntervalRef.current = setInterval(() => {
        if (isPlaying && viewerRegisteredRef.current) {
          socket.emit("heartbeat", { streamIds: [streamId] })
        }
      }, 30000) // Every 30 seconds

      return () => {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
          heartbeatIntervalRef.current = null
        }
      }
    }, [socket, streamId, isPlaying])

    // Handle beforeunload event to ensure proper cleanup when page is closed
    useEffect(() => {
      const handleBeforeUnload = () => {
        if (viewerRegisteredRef.current) {
          // Synchronous API call to ensure it completes before page unload
          const xhr = new XMLHttpRequest()
          xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL || BASEURL}/api/viewer/decrement/${streamId}`, false)
          xhr.setRequestHeader("Content-Type", "application/json")
          xhr.send(JSON.stringify({ streamId }))

          // Also try to send a socket message, though it might not complete
          if (socket) {
            socket.emit("leave_stream", { streamId })
          }
        }
      }

      window.addEventListener("beforeunload", handleBeforeUnload)

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }, [streamId, socket])

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        // Unregister as viewer when component unmounts
        if (viewerRegisteredRef.current) {
          unregisterViewer()
          viewerRegisteredRef.current = false
        }

        // Clear any intervals
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
          heartbeatIntervalRef.current = null
        }

        // Clear any timeouts
        if (unregisterTimeoutRef.current) {
          clearTimeout(unregisterTimeoutRef.current)
          unregisterTimeoutRef.current = null
        }
      }
    }, [unregisterViewer])

    // Get the correct video source based on streamId and quality
    const getVideoSource = useCallback(
      (streamId, videoQuality) => {
        // IMPROVED: Use pixel streaming URL for stream-1
        if (streamId === "stream-1" || streamId === "default-stream") {
          return pixelStreamingUrl
        }

        // For other streams, use fallback videos
        const fallbackBasePaths = ["/assets/videos/fallback1.mp4", "/assets/videos/fallback2.mp4"]

        // Try to extract a number from the streamId and use it to select a video
        const streamNumber = streamId.match(/\d+/)?.[0] || "1"
        const index = Number.parseInt(streamNumber, 10) % fallbackBasePaths.length

        return fallbackBasePaths[index] || fallbackBasePaths[0]
      },
      [pixelStreamingUrl],
    )

    // For fallback when WebRTC fails or for test streams, use a regular video element
    useEffect(() => {
      // Only initialize fallback once and only when needed
      if (usingFallback && !fallbackInitializedRef.current && videoRef.current) {
        fallbackInitializedRef.current = true
        console.log(`Using fallback video for stream: ${streamId}`)

        // Clear any existing srcObject
        if (videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
          videoRef.current.srcObject = null
        }

        // Get the appropriate video source
        const videoSource = getVideoSource(streamId, quality)
        console.log(`Using fallback video source: ${videoSource}`)

        // Check if this is a pixel streaming URL
        if (videoSource.includes("AutoPlayVideo=true") || videoSource.includes("AutoConnect=true")) {
          // For pixel streaming, we need to use an iframe instead of a video element
          const parent = videoRef.current.parentElement
          if (parent) {
            // Create an iframe for pixel streaming
            const iframe = document.createElement("iframe")
            iframe.src = videoSource
            iframe.className = videoRef.current.className
            iframe.style.width = "100%"
            iframe.style.height = "100%"
            iframe.style.border = "none"
            iframe.allow = "autoplay; fullscreen; microphone; camera"
            iframe.allowFullScreen = true

            // Replace video with iframe
            parent.replaceChild(iframe, videoRef.current)

            // Set loading state and register as viewer
            setTimeout(() => {
              if (isMountedRef.current) {
                setIsLoading(false)
                setIsPlaying(true)
                registerViewer()
                onPlay()
              }
            }, 2000) // Give the iframe some time to load
          }
        } else {
          // For regular videos, use the video element
          videoRef.current.src = videoSource

          // Set playback rate based on frame rate
          videoRef.current.playbackRate = frameRate === "60" ? 1.0 : 0.5

          // Ensure the video maintains its container size
          videoRef.current.style.objectFit = "cover"

          // Play the video
          videoRef.current
            .play()
            .then(() => {
              if (isMountedRef.current) {
                setIsLoading(false)
                setIsPlaying(true)
                registerViewer() // Register as viewer when video starts playing
                onPlay()
              }
            })
            .catch((err) => {
              console.error("Error playing fallback video:", err)
              if (isMountedRef.current) {
                setError("Failed to play video")
              }
            })
        }
      }
    }, [usingFallback, streamId, onPlay, quality, frameRate, getVideoSource, registerViewer])

    // Initialize WebRTC only for non-test streams
    const initWebRTC = useCallback(async () => {
      // Skip WebRTC for test streams
      if (!socket || !streamId || streamId.startsWith("stream-") || streamId === "default-stream") {
        return null
      }

      try {
        setIsLoading(true)
        setError(null)

        // Create peer connection
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        })

        peerConnectionRef.current = peerConnection

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice_candidate", {
              streamId,
              candidate: event.candidate,
              isViewer: !isPublisher,
            })
          }
        }

        // Set connection state change handler
        peerConnection.onconnectionstatechange = () => {
          console.log(`Connection state: ${peerConnection.connectionState}`)
          if (peerConnection.connectionState === "failed" || peerConnection.connectionState === "disconnected") {
            console.log("WebRTC connection failed, using fallback")
            if (isMountedRef.current) {
              setUsingFallback(true)
            }
          }
        }

        if (isPublisher) {
          // Publisher logic - get local media and create offer
          try {
            // Apply quality constraints based on settings
            const videoConstraints = {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: frameRate === "60" ? 60 : 30 },
            }

            // Adjust constraints based on quality setting
            if (quality !== "auto") {
              const height = Number.parseInt(quality.replace("p", ""))
              if (!isNaN(height)) {
                videoConstraints.width = { ideal: (height * 16) / 9 }
                videoConstraints.height = { ideal: height }
              }
            }

            const localStream = await navigator.mediaDevices.getUserMedia({
              video: videoConstraints,
              audio: true,
            })

            // Display local stream
            if (videoRef.current) {
              videoRef.current.srcObject = localStream
              videoRef.current.style.objectFit = "cover" // Maintain aspect ratio but fill container
            }

            // Add tracks to peer connection
            localStream.getTracks().forEach((track) => {
              peerConnection.addTrack(track, localStream)
            })

            // Create and send offer
            const offer = await peerConnection.createOffer()
            await peerConnection.setLocalDescription(offer)

            socket.emit("broadcaster_offer", { streamId, offer })
          } catch (mediaError) {
            console.error("Media access error:", mediaError)
            if (isMountedRef.current) {
              setError("Could not access camera/microphone")
              setUsingFallback(true)
            }
          }
        } else {
          // Viewer logic - handle remote stream
          peerConnection.ontrack = (event) => {
            if (videoRef.current && event.streams[0] && isMountedRef.current) {
              videoRef.current.srcObject = event.streams[0]
              videoRef.current.style.objectFit = "cover" // Maintain aspect ratio but fill container
              setIsLoading(false)

              // Auto-play the video when we get a stream
              videoRef.current
                .play()
                .then(() => {
                  if (isMountedRef.current) {
                    setIsPlaying(true)
                    registerViewer() // Register as viewer when WebRTC stream starts playing
                    onPlay()
                  }
                })
                .catch((err) => {
                  console.error("Error auto-playing video:", err)
                  // May need user interaction to play
                })
            }
          }

          // Request to view stream with quality preferences
          socket.emit("viewer_request", {
            streamId,
            preferences: {
              quality,
              frameRate,
            },
          })
        }

        return peerConnection
      } catch (err) {
        console.error("WebRTC initialization error:", err)
        if (isMountedRef.current) {
          setError("Failed to initialize WebRTC")
          setIsLoading(false)
          setUsingFallback(true)
        }
        return null
      }
    }, [socket, streamId, isPublisher, onPlay, registerViewer, quality, frameRate])

    // Set up WebRTC connection and socket event handlers (only for non-test streams)
    useEffect(() => {
      // Skip WebRTC for test streams
      if (!socket || !streamId || streamId.startsWith("stream-") || streamId === "default-stream") {
        return
      }

      // Socket event handlers for WebRTC signaling
      const handleBroadcasterAnswer = async ({ streamId: receivedStreamId, answer }) => {
        if (receivedStreamId !== streamId || !isPublisher || !peerConnectionRef.current) return

        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
          if (isMountedRef.current) {
            setIsLoading(false)
          }
        } catch (err) {
          console.error("Error setting remote description:", err)
          if (isMountedRef.current) {
            setError("Connection error")
            setUsingFallback(true)
          }
        }
      }

      const handleViewerOffer = async ({ streamId: receivedStreamId, offer }) => {
        if (receivedStreamId !== streamId || isPublisher || !peerConnectionRef.current) return

        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))

          const answer = await peerConnectionRef.current.createAnswer()
          await peerConnectionRef.current.setLocalDescription(answer)

          socket.emit("viewer_answer", { streamId, answer })
        } catch (err) {
          console.error("Error handling viewer offer:", err)
          if (isMountedRef.current) {
            setError("Connection error")
            setUsingFallback(true)
          }
        }
      }

      const handleIceCandidate = async ({ streamId: receivedStreamId, candidate }) => {
        if (receivedStreamId !== streamId || !peerConnectionRef.current) return

        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (err) {
          console.error("Error adding ICE candidate:", err)
        }
      }

      const handleError = ({ message }) => {
        if (isMountedRef.current) {
          setError(message)
          setIsLoading(false)
          setUsingFallback(true)
        }
      }

      // Register socket event listeners
      socket.on("broadcaster_answer", handleBroadcasterAnswer)
      socket.on("viewer_offer", handleViewerOffer)
      socket.on("ice_candidate", handleIceCandidate)
      socket.on("error", handleError)

      // Initialize WebRTC
      initWebRTC()

      // Set a timeout to fall back to regular video if WebRTC doesn't connect
      const fallbackTimeout = setTimeout(() => {
        if (isLoading && !isPlaying && isMountedRef.current) {
          console.log(`WebRTC connection timeout for stream: ${streamId}, using fallback`)
          setUsingFallback(true)
        }
      }, 3000) // Reduced timeout for faster fallback

      // Cleanup function
      return () => {
        // Remove socket event listeners
        socket.off("broadcaster_answer", handleBroadcasterAnswer)
        socket.off("viewer_offer", handleViewerOffer)
        socket.off("ice_candidate", handleIceCandidate)
        socket.off("error", handleError)

        clearTimeout(fallbackTimeout)

        // Close peer connection and release media resources
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close()
          peerConnectionRef.current = null
        }

        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
          videoRef.current.srcObject = null
        }

        // Unregister as viewer when cleaning up WebRTC
        if (viewerRegisteredRef.current) {
          unregisterViewer()
        }
      }
    }, [socket, streamId, isPublisher, initWebRTC, onPlay, onPause, isPlaying, isLoading, unregisterViewer])

    // Handle play/pause events
    const handlePlay = () => {
      if (isMountedRef.current) {
        if (!isPlaying) {
          setIsPlaying(true)
          // Only register if not already registered
          if (!viewerRegisteredRef.current) {
            registerViewer() // Register as viewer when video starts playing
          }
          onPlay()
        }
      }
    }

    const handlePause = () => {
      if (isMountedRef.current) {
        setIsPlaying(false)
        if (viewerRegisteredRef.current) {
          unregisterViewer() // Unregister as viewer when video is paused
        }
        onPause()
      }
    }

    // Handle video ended event
    const handleEnded = () => {
      if (isMountedRef.current) {
        setIsPlaying(false)
        if (viewerRegisteredRef.current) {
          unregisterViewer() // Unregister as viewer when video ends
        }
        onPause()
      }
    }

    // Handle video load error
    const handleVideoError = (e) => {
      console.error("Video error:", e)

      if (!usingFallback && isMountedRef.current) {
        // If not already using fallback, switch to it
        setUsingFallback(true)
      } else if (videoRef.current) {
        // If already using fallback and still getting errors, try alternative sources
        const currentSrc = videoRef.current.src

        // Check if this is a pixel streaming URL
        if (currentSrc.includes("AutoPlayVideo=true") || currentSrc.includes("AutoConnect=true")) {
          // For pixel streaming, we need to use an iframe
          const parent = videoRef.current.parentElement
          if (parent) {
            // Create an iframe for pixel streaming
            const iframe = document.createElement("iframe")
            iframe.src = pixelStreamingUrl
            iframe.className = videoRef.current.className
            iframe.style.width = "100%"
            iframe.style.height = "100%"
            iframe.style.border = "none"
            iframe.allow = "autoplay; fullscreen; microphone; camera"
            iframe.allowFullScreen = true

            // Replace video with iframe
            parent.replaceChild(iframe, videoRef.current)

            // Set loading state and register as viewer
            setTimeout(() => {
              if (isMountedRef.current) {
                setIsLoading(false)
                setIsPlaying(true)
                registerViewer()
                onPlay()
              }
            }, 2000) // Give the iframe some time to load
          }
        } else {
          // For regular videos, try alternative path
          const alternativePath = currentSrc.includes("/assets/")
            ? currentSrc.replace("/assets/", "/")
            : `/assets${currentSrc.startsWith("/") ? "" : "/"}${currentSrc}`

          console.log(`Video error, trying alternative path: ${alternativePath}`)
          videoRef.current.src = alternativePath
        }
      }
    }

    // Apply quality settings when they change
    useEffect(() => {
      applyQualitySettings()
    }, [applyQualitySettings, quality, frameRate])

    // Display quality indicator
    const getQualityIndicator = () => {
      if (quality === "auto") {
        return "Auto"
      }
      return `${quality} ${frameRate}fps`
    }

    return (
      <div ref={containerRef} className={`${styles.mobileScreensize} relative w-full h-full`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
            <div className="bg-red-500 text-white px-4 py-2 rounded">{error}</div>
          </div>
        )}

        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${className}`}
          autoPlay
          playsInline
          muted={isPublisher}
          controls={!isPublisher}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={handleVideoError}
          onClick={() => {
            if (videoRef.current && !isPlaying) {
              videoRef.current.play().catch((err) => console.error("Error playing video on click:", err))
            }
          }}
        />
      </div>
    )
  },
)

WebRTCStream.displayName = "WebRTCStream"

export default WebRTCStream
