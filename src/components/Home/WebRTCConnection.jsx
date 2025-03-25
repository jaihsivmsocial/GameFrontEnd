// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import { useSocket } from "../contexts/SocketContext"

// export default function WebRTCStream({
//   streamId,
//   isPublisher = false,
//   className = "",
//   onPlay = () => {},
//   onPause = () => {},
// }) {
//   const socketContext = useSocket()
//   const socket = socketContext?.socket
//   const videoRef = useRef(null)
//   const peerConnectionRef = useRef(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [usingFallback, setUsingFallback] = useState(false)
//   const fallbackInitializedRef = useRef(false)

//   // ICE servers configuration
//   const iceServers = [
//     { urls: "stun:stun.l.google.com:19302" },
//     { urls: "stun:stun1.l.google.com:19302" },
//     { urls: "stun:stun2.l.google.com:19302" },
//   ]

//   // Join stream room when component mounts
//   useEffect(() => {
//     if (!socket || !streamId) return

//     // Explicitly join the stream room to increment viewer count
//     socket.emit("join_stream", { streamId })

//     // Cleanup: leave the stream room when component unmounts
//     return () => {
//       socket.emit("leave_stream", { streamId })
//     }
//   }, [socket, streamId])

//   // Initialize WebRTC - moved to a separate function to avoid recreation on every render
//   const initWebRTC = useCallback(async () => {
//     if (!socket || !streamId) return

//     try {
//       setIsLoading(true)
//       setError(null)

//       // Create peer connection
//       const peerConnection = new RTCPeerConnection({ iceServers })
//       peerConnectionRef.current = peerConnection

//       // Handle ICE candidates
//       peerConnection.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("ice_candidate", {
//             streamId,
//             candidate: event.candidate,
//             isViewer: !isPublisher,
//           })
//         }
//       }

//       // Set connection state change handler
//       peerConnection.onconnectionstatechange = () => {
//         console.log(`Connection state: ${peerConnection.connectionState}`)
//         if (peerConnection.connectionState === "failed" || peerConnection.connectionState === "disconnected") {
//           console.log("WebRTC connection failed, using fallback")
//           setUsingFallback(true)
//         }
//       }

//       if (isPublisher) {
//         // Publisher logic - get local media and create offer
//         const localStream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         })

//         // Display local stream
//         if (videoRef.current) {
//           videoRef.current.srcObject = localStream
//         }

//         // Add tracks to peer connection
//         localStream.getTracks().forEach((track) => {
//           peerConnection.addTrack(track, localStream)
//         })

//         // Create and send offer
//         const offer = await peerConnection.createOffer()
//         await peerConnection.setLocalDescription(offer)

//         socket.emit("broadcaster_offer", { streamId, offer })
//       } else {
//         // Viewer logic - handle remote stream
//         peerConnection.ontrack = (event) => {
//           if (videoRef.current && event.streams[0]) {
//             videoRef.current.srcObject = event.streams[0]
//             setIsLoading(false)

//             // Auto-play the video when we get a stream
//             videoRef.current
//               .play()
//               .then(() => {
//                 setIsPlaying(true)
//                 onPlay()
//               })
//               .catch((err) => {
//                 console.error("Error auto-playing video:", err)
//                 // May need user interaction to play
//               })
//           }
//         }

//         // Request to view stream
//         socket.emit("viewer_request", { streamId })
//       }

//       return peerConnection
//     } catch (err) {
//       console.error("WebRTC initialization error:", err)
//       setError("Failed to initialize WebRTC")
//       setIsLoading(false)
//       setUsingFallback(true)
//       return null
//     }
//   }, [socket, streamId, isPublisher, onPlay, iceServers])

//   // Set up WebRTC connection and socket event handlers
//   useEffect(() => {
//     if (!socket) return

//     // Socket event handlers for WebRTC signaling
//     const handleBroadcasterAnswer = async ({ streamId: receivedStreamId, answer }) => {
//       if (receivedStreamId !== streamId || !isPublisher || !peerConnectionRef.current) return

//       try {
//         await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
//         setIsLoading(false)
//       } catch (err) {
//         console.error("Error setting remote description:", err)
//         setError("Connection error")
//         setUsingFallback(true)
//       }
//     }

//     const handleViewerOffer = async ({ streamId: receivedStreamId, offer }) => {
//       if (receivedStreamId !== streamId || isPublisher || !peerConnectionRef.current) return

//       try {
//         await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))

//         const answer = await peerConnectionRef.current.createAnswer()
//         await peerConnectionRef.current.setLocalDescription(answer)

//         socket.emit("viewer_answer", { streamId, answer })
//       } catch (err) {
//         console.error("Error handling viewer offer:", err)
//         setError("Connection error")
//         setUsingFallback(true)
//       }
//     }

//     const handleIceCandidate = async ({ streamId: receivedStreamId, candidate }) => {
//       if (receivedStreamId !== streamId || !peerConnectionRef.current) return

//       try {
//         await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
//       } catch (err) {
//         console.error("Error adding ICE candidate:", err)
//       }
//     }

//     const handleError = ({ message }) => {
//       setError(message)
//       setIsLoading(false)
//       setUsingFallback(true)
//     }

//     // Register socket event listeners
//     socket.on("broadcaster_answer", handleBroadcasterAnswer)
//     socket.on("viewer_offer", handleViewerOffer)
//     socket.on("ice_candidate", handleIceCandidate)
//     socket.on("error", handleError)

//     // Initialize WebRTC
//     initWebRTC()

//     // Set a timeout to fall back to regular video if WebRTC doesn't connect
//     const fallbackTimeout = setTimeout(() => {
//       if (isLoading && !isPlaying) {
//         console.log(`WebRTC connection timeout for stream: ${streamId}, using fallback`)
//         setUsingFallback(true)
//       }
//     }, 8000)

//     // Cleanup function
//     return () => {
//       // Remove socket event listeners
//       socket.off("broadcaster_answer", handleBroadcasterAnswer)
//       socket.off("viewer_offer", handleViewerOffer)
//       socket.off("ice_candidate", handleIceCandidate)
//       socket.off("error", handleError)

//       clearTimeout(fallbackTimeout)

//       // Close peer connection and release media resources
//       if (peerConnectionRef.current) {
//         peerConnectionRef.current.close()
//         peerConnectionRef.current = null
//       }

//       if (videoRef.current && videoRef.current.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
//         videoRef.current.srcObject = null
//       }

//       // Notify that we're no longer playing
//       if (isPlaying) {
//         setIsPlaying(false)
//         onPause()
//       }
//     }
//   }, [socket, streamId, isPublisher, initWebRTC, onPlay, onPause, isPlaying, isLoading])

//   // For fallback when WebRTC fails, use a regular video element
//   useEffect(() => {
//     // Only initialize fallback once and only when needed
//     if (usingFallback && !fallbackInitializedRef.current && videoRef.current) {
//       fallbackInitializedRef.current = true
//       console.log(`Using fallback video for stream: ${streamId}`)

//       // Clear any existing srcObject
//       if (videoRef.current.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
//         videoRef.current.srcObject = null
//       }

//       // Determine video source based on streamId
//       let videoSource
//       switch (streamId) {
//         case "stream-1":
//           videoSource = "/assets/videos/videoplayback.mp4"
//           break
//         case "stream-2":
//           videoSource = "/assets/videos/video1.mp4"
//           break
//         case "stream-3":
//           videoSource = "/assets/videos/office.mp4"
//           break
//         case "stream-4":
//           videoSource = "/assets/videos/orchestra.mp4"
//           break
//         default:
//           videoSource = "/assets/videos/videoplayback.mp4"
//       }

//       // Set the src attribute
//       videoRef.current.src = videoSource

//       // Add buffer to prevent stuttering
//       videoRef.current.preload = "auto"

//       // Set playback rate to normal
//       videoRef.current.playbackRate = 1.0

//       // Increase buffer size
//       if (videoRef.current.buffered && videoRef.current.duration) {
//         try {
//           videoRef.current.currentTime = 0
//         } catch (e) {
//           console.error("Error setting currentTime:", e)
//         }
//       }

//       videoRef.current
//         .play()
//         .then(() => {
//           setIsLoading(false)
//           setIsPlaying(true)
//           onPlay()
//         })
//         .catch((err) => {
//           console.error("Error playing fallback video:", err)
//           setError("Could not play video. Click to play.")
//         })
//     }
//   }, [usingFallback, streamId, onPlay, isPublisher])

//   // Handle play/pause events
//   const handlePlay = () => {
//     setIsPlaying(true)
//     onPlay()
//   }

//   const handlePause = () => {
//     setIsPlaying(false)
//     onPause()
//   }

//   return (
//     <div className="relative w-full h-full">
//       {isLoading && !usingFallback && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
//         </div>
//       )}

//       {error && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
//           <div className="bg-red-500 text-white px-4 py-2 rounded">{error}</div>
//         </div>
//       )}

//       <video
//         ref={videoRef}
//         className={`w-full h-full object-cover ${className}`}
//         autoPlay
//         playsInline
//         muted={isPublisher}
//         controls={!isPublisher}
//         onPlay={handlePlay}
//         onPause={handlePause}
//         onEnded={handlePause}
//         onClick={() => {
//           if (videoRef.current && !isPlaying) {
//             videoRef.current.play().catch((err) => console.error("Error playing video on click:", err))
//           }
//         }}
//       />

//       {usingFallback && (
//         <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded opacity-70">
//           Fallback
//         </div>
//       )}
//     </div>
//   )
// }


"use client"

import { useEffect, useRef, useState, useCallback, forwardRef } from "react"
import { useSocket } from "../contexts/SocketContext"
import apiService from "../contexts/api-service"

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
    const [currentQuality, setCurrentQuality] = useState(quality)
    const [currentFrameRate, setCurrentFrameRate] = useState(frameRate)

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

      console.log(`Registering as viewer for stream: ${streamId}`)
      viewerRegisteredRef.current = true

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

      console.log(`Unregistering as viewer for stream: ${streamId}`)
      viewerRegisteredRef.current = false

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
        }
      }
    }, [socket, streamId, isPlaying])

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        // Unregister as viewer when component unmounts
        unregisterViewer()

        // Clear any intervals
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
        }
      }
    }, [unregisterViewer])

    // Get the correct video source based on streamId and quality
    const getVideoSource = useCallback((streamId, videoQuality) => {
      // Map of base video sources by stream ID
      const baseVideoSources = {
        "stream-1": "/assets/videos/videoplayback",
        "stream-2": "/assets/videos/video1",
        "stream-3": "/assets/videos/office",
        "stream-4": "/assets/videos/orchestra",
        "default-stream": "/assets/videos/videoplayback",
      }

      // Get the base path
      let basePath = baseVideoSources[streamId]

      if (!basePath) {
        // Try to extract a number from the streamId and use it to select a video
        const streamNumber = streamId.match(/\d+/)?.[0] || "1"
        const index = Number.parseInt(streamNumber, 10) % 4 // Cycle through 4 videos

        const fallbackBasePaths = [
          "/assets/videos/videoplayback",
          "/assets/videos/video1",
          "/assets/videos/office",
          "/assets/videos/orchestra",
        ]

        basePath = fallbackBasePaths[index] || fallbackBasePaths[0]
      }

      // In a real implementation, you would have different resolution versions of each video
      // For this demo, we'll simulate different qualities by appending the quality to the path

      // If quality is auto, use the highest quality (1080p)
      const actualQuality = videoQuality === "auto" ? "1080p" : videoQuality

      // Create a path that includes the quality
      // In a real implementation, you would have actual different resolution files
      // For example: /assets/videos/videoplayback-1080p.mp4, /assets/videos/videoplayback-720p.mp4, etc.
      const qualityPath = `${basePath}-${actualQuality.replace("p", "")}.mp4`

      console.log(`Loading ${actualQuality} version: ${qualityPath}`)

      // For this demo, we'll fall back to the original video if the quality-specific one doesn't exist
      return qualityPath
    }, [])

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

        // Try multiple paths for the video
        const tryVideoSource = (source) => {
          console.log(`Trying video source: ${source}`)

          // Create a temporary video element to test if the source loads
          const tempVideo = document.createElement("video")
          tempVideo.muted = true
          tempVideo.preload = "metadata"

          // Set up event handlers
          tempVideo.onloadedmetadata = () => {
            console.log(`Source loaded successfully: ${source}`)

            // If this source works, use it in the actual video element
            if (videoRef.current) {
              videoRef.current.src = source

              // Set playback rate based on frame rate
              videoRef.current.playbackRate = frameRate === "60" ? 1.0 : 0.5

              // Ensure the video maintains its container size
              videoRef.current.style.objectFit = "cover"

              // Add quality indicator
              setCurrentQuality(quality)
              setCurrentFrameRate(frameRate)

              // Play the video
              videoRef.current
                .play()
                .then(() => {
                  setIsLoading(false)
                  setIsPlaying(true)
                  registerViewer() // Register as viewer when video starts playing
                  onPlay()
                })
                .catch((err) => {
                  console.error("Error playing fallback video:", err)
                  setError("Could not play video. Click to play.")
                })
            }
          }

          tempVideo.onerror = () => {
            console.error(`Source failed to load: ${source}`)

            // Try alternative paths
            if (source.includes("-")) {
              // If quality-specific video fails, try the base video
              const basePath = source.substring(0, source.lastIndexOf("-")) + ".mp4"
              console.log(`Quality-specific video not found, trying base video: ${basePath}`)
              tryVideoSource(basePath)
            } else if (source.includes("/assets/")) {
              // Try without /assets/ prefix
              tryVideoSource(source.replace("/assets/", "/"))
            } else if (!source.startsWith("/assets/")) {
              // Try with /assets/ prefix
              tryVideoSource(`/assets${source.startsWith("/") ? "" : "/"}${source}`)
            } else {
              // If all attempts fail, try a default video
              tryVideoSource("/assets/videos/videoplayback.mp4")
            }
          }

          // Start loading the source
          tempVideo.src = source
        }

        // Start trying sources
        tryVideoSource(videoSource)
      }
    }, [usingFallback, streamId, onPlay, quality, frameRate, getVideoSource, registerViewer])

    // Update video quality when quality setting changes
    useEffect(() => {
      // Check if this is a small view - if so, only apply quality changes when necessary
      const isSmallView = className.includes("smallVideo")

      // For small views in multi-view, only apply high-impact quality changes
      // to avoid unnecessary video reloading
      if (isSmallView && quality !== currentQuality) {
        // For small views, only change quality if it's a significant change
        // (e.g., from high to low or low to high)
        const currentQualityValue = getQualityValue(currentQuality)
        const newQualityValue = getQualityValue(quality)

        // If the quality change is minor and this is a small view, just update the state
        // without reloading the video
        if (Math.abs(currentQualityValue - newQualityValue) < 2) {
          setCurrentQuality(quality)
          setCurrentFrameRate(frameRate)
          return
        }
      }

      if (usingFallback && fallbackInitializedRef.current && videoRef.current && quality !== currentQuality) {
        console.log(`Quality changed from ${currentQuality} to ${quality}`)

        // Get current playback position and state
        const currentTime = videoRef.current.currentTime
        const wasPlaying = !videoRef.current.paused

        // Show loading indicator
        setIsLoading(true)

        // Get the appropriate video source for the new quality
        const videoSource = getVideoSource(streamId, quality)
        console.log(`Updating video quality to ${quality}, source: ${videoSource}`)

        // Create a temporary video element to test if the source loads
        const tempVideo = document.createElement("video")
        tempVideo.muted = true
        tempVideo.preload = "metadata"

        tempVideo.onloadedmetadata = () => {
          console.log(`New quality source loaded successfully: ${videoSource}`)

          // If this source works, use it in the actual video element
          if (videoRef.current) {
            videoRef.current.src = videoSource

            // Set playback rate based on frame rate
            videoRef.current.playbackRate = frameRate === "60" ? 1.0 : 0.5

            // Restore playback position
            videoRef.current.currentTime = currentTime

            // Update current quality state
            setCurrentQuality(quality)

            // Hide loading indicator
            setIsLoading(false)

            // Resume playback if it was playing
            if (wasPlaying) {
              videoRef.current.play().catch((err) => {
                console.error("Error resuming video after quality change:", err)
              })
            }
          }
        }

        tempVideo.onerror = () => {
          console.error(`New quality source failed to load: ${videoSource}`)

          // Try alternative paths
          if (videoSource.includes("-")) {
            // If quality-specific video fails, try the base video
            const basePath = videoSource.substring(0, videoSource.lastIndexOf("-")) + ".mp4"
            console.log(`Quality-specific video not found, using base video: ${basePath}`)

            if (videoRef.current) {
              videoRef.current.src = basePath
              videoRef.current.currentTime = currentTime
              setIsLoading(false)

              if (wasPlaying) {
                videoRef.current.play().catch((err) => {
                  console.error("Error resuming video after quality change fallback:", err)
                })
              }
            }
          } else {
            // If all attempts fail, keep the current video
            setIsLoading(false)
            console.log("Failed to change quality, keeping current video")
          }
        }

        // Start loading the source
        tempVideo.src = videoSource
      }

      // Update frame rate if changed
      if (usingFallback && videoRef.current && frameRate !== currentFrameRate) {
        console.log(`Frame rate changed from ${currentFrameRate} to ${frameRate}`)
        videoRef.current.playbackRate = frameRate === "60" ? 1.0 : 0.5
        setCurrentFrameRate(frameRate)
      }
    }, [quality, frameRate, usingFallback, streamId, currentQuality, currentFrameRate, getVideoSource, className])

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
            setUsingFallback(true)
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
            setError("Could not access camera/microphone")
            setUsingFallback(true)
          }
        } else {
          // Viewer logic - handle remote stream
          peerConnection.ontrack = (event) => {
            if (videoRef.current && event.streams[0]) {
              videoRef.current.srcObject = event.streams[0]
              videoRef.current.style.objectFit = "cover" // Maintain aspect ratio but fill container
              setIsLoading(false)

              // Auto-play the video when we get a stream
              videoRef.current
                .play()
                .then(() => {
                  setIsPlaying(true)
                  registerViewer() // Register as viewer when WebRTC stream starts playing
                  onPlay()
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
        setError("Failed to initialize WebRTC")
        setIsLoading(false)
        setUsingFallback(true)
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
          setIsLoading(false)
        } catch (err) {
          console.error("Error setting remote description:", err)
          setError("Connection error")
          setUsingFallback(true)
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
          setError("Connection error")
          setUsingFallback(true)
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
        setError(message)
        setIsLoading(false)
        setUsingFallback(true)
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
        if (isLoading && !isPlaying) {
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
        unregisterViewer()
      }
    }, [socket, streamId, isPublisher, initWebRTC, onPlay, onPause, isPlaying, isLoading, unregisterViewer])

    // Handle play/pause events
    const handlePlay = () => {
      setIsPlaying(true)
      registerViewer() // Register as viewer when video starts playing
      onPlay()
    }

    const handlePause = () => {
      setIsPlaying(false)
      unregisterViewer() // Unregister as viewer when video is paused
      onPause()
    }

    // Handle video ended event
    const handleEnded = () => {
      setIsPlaying(false)
      unregisterViewer() // Unregister as viewer when video ends
      onPause()
    }

    // Handle video load error
    const handleVideoError = (e) => {
      console.error("Video error:", e)

      if (!usingFallback) {
        // If not already using fallback, switch to it
        setUsingFallback(true)
      } else if (videoRef.current) {
        // If already using fallback and still getting errors, try alternative sources
        const currentSrc = videoRef.current.src

        // Try alternative path
        const alternativePath = currentSrc.includes("/assets/")
          ? currentSrc.replace("/assets/", "/")
          : `/assets${currentSrc.startsWith("/") ? "" : "/"}${currentSrc}`

        console.log(`Video error, trying alternative path: ${alternativePath}`)
        videoRef.current.src = alternativePath
      }
    }

    const getQualityValue = (qualityString) => {
      if (qualityString === "auto") return 5 // Highest quality
      const numericValue = Number.parseInt(qualityString.replace("p", ""))

      // Map resolution to a numeric value
      if (numericValue >= 1080) return 5
      if (numericValue >= 720) return 4
      if (numericValue >= 480) return 3
      if (numericValue >= 360) return 2
      if (numericValue >= 240) return 1
      return 0 // Lowest quality
    }

    return (
      <div ref={containerRef} className="relative w-full h-full">
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

        {/* Quality indicator */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {currentQuality === "auto" ? "Auto (1080p)" : currentQuality} • {currentFrameRate} FPS
          {usingFallback && " • Fallback"}
        </div>
      </div>
    )
  },
)

WebRTCStream.displayName = "WebRTCStream"

export default WebRTCStream











