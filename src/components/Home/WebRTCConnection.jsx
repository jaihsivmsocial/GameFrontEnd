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
    const isMountedRef = useRef(true)
    const lastRegistrationTimeRef = useRef(0)
    const unregisterTimeoutRef = useRef(null)
    const [currentQuality, setCurrentQuality] = useState(quality)
    const [currentFrameRate, setCurrentFrameRate] = useState(frameRate)

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
          xhr.open(
            "POST",
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/viewer/decrement/${streamId}`,
            false,
          )
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

      // In a real implementation, we would append quality to the path
      // For example: `/assets/videos/videoplayback-720p.mp4`
      // For this demo, we'll just return the base video
      return `${basePath}.mp4`
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
            if (videoRef.current && isMountedRef.current) {
              videoRef.current.src = source

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
                    setError("Could not play video. Click to play.")
                  }
                })
            }
          }

          tempVideo.onerror = () => {
            console.error(`Source failed to load: ${source}`)

            // Try alternative paths
            if (source.includes("/assets/")) {
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

        // Try alternative path
        const alternativePath = currentSrc.includes("/assets/")
          ? currentSrc.replace("/assets/", "/")
          : `/assets${currentSrc.startsWith("/") ? "" : "/"}${currentSrc}`

        console.log(`Video error, trying alternative path: ${alternativePath}`)
        videoRef.current.src = alternativePath
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
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {getQualityIndicator()}
        </div>

        {usingFallback && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            Fallback
          </div>
        )}
      </div>
    )
  },
)

WebRTCStream.displayName = "WebRTCStream"

export default WebRTCStream










