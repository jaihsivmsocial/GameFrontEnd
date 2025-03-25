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

    // Apply quality settings
    useEffect(() => {
      if (!videoRef.current) return

      // Apply quality settings based on the selected option
      if (quality !== "auto" && !isPublisher) {
        console.log(`Applying quality: ${quality}, frame rate: ${frameRate}`)

        // For regular videos, we can adjust CSS properties
        if (usingFallback) {
          const height = Number.parseInt(quality.replace("p", ""))
          if (!isNaN(height)) {
            videoRef.current.style.maxHeight = `${height}px`
          }
        }
      } else if (usingFallback) {
        // Auto quality - remove any restrictions
        videoRef.current.style.maxHeight = "none"
      }
    }, [quality, frameRate, isPublisher, usingFallback])

    // Get the correct video source based on streamId
    const getVideoSource = useCallback((streamId) => {
      // Map streamId to the correct video source
      const videoSources = {
        "stream-1": "/assets/videos/videoplayback.mp4",
        "stream-2": "/assets/videos/video1.mp4",
        "stream-3": "/assets/videos/office.mp4",
        "stream-4": "/assets/videos/orchestra.mp4",
        "default-stream": "/assets/videos/videoplayback.mp4",
      }

      // Check if we have a predefined source for this streamId
      if (videoSources[streamId]) {
        return videoSources[streamId]
      }

      // Try to extract a number from the streamId and use it to select a video
      const streamNumber = streamId.match(/\d+/)?.[0] || "1"
      const index = Number.parseInt(streamNumber, 10) % 4 // Cycle through 4 videos

      const fallbackSources = [
        "/assets/videos/videoplayback.mp4",
        "/assets/videos/video1.mp4",
        "/assets/videos/office.mp4",
        "/assets/videos/orchestra.mp4",
      ]

      return fallbackSources[index] || fallbackSources[0]
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
        const videoSource = getVideoSource(streamId)
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

              // Apply quality settings
              if (quality !== "auto") {
                const height = Number.parseInt(quality.replace("p", ""))
                if (!isNaN(height)) {
                  videoRef.current.style.maxHeight = `${height}px`
                }
              }

              // Set playback rate based on frame rate
              videoRef.current.playbackRate = frameRate === "60" ? 1.0 : 0.5

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
            setUsingFallback(true)
          }
        }

        if (isPublisher) {
          // Publisher logic - get local media and create offer
          try {
            const localStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            })

            // Display local stream
            if (videoRef.current) {
              videoRef.current.srcObject = localStream
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

          // Request to view stream
          socket.emit("viewer_request", { streamId })
        }

        return peerConnection
      } catch (err) {
        console.error("WebRTC initialization error:", err)
        setError("Failed to initialize WebRTC")
        setIsLoading(false)
        setUsingFallback(true)
        return null
      }
    }, [socket, streamId, isPublisher, onPlay, registerViewer])

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

    return (
      <div className="relative w-full h-full">
        {isLoading && !usingFallback && (
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

        {usingFallback && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded opacity-70">
            Fallback
          </div>
        )}
      </div>
    )
  },
)

WebRTCStream.displayName = "WebRTCStream"

export default WebRTCStream






