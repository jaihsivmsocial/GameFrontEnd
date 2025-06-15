"use client"

import { useState, useEffect, useRef } from "react"
import { likeVideo, addComment, shareVideo, getDownloadUrl, generateShareableUrl } from "@/components/clipsorts/api"
import { Modal, Form, Button } from "react-bootstrap"
import { BASEURL } from "@/utils/apiservice"

export default function VideoCard({ video, isActive }) {
  const [liked, setLiked] = useState(video.isLiked || false)
  const [likesCount, setLikesCount] = useState(video.likesCount || 0)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState(video.comments || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [showCopyToast, setShowCopyToast] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const videoRef = useRef(null)

  // Set isMounted to true when component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check if user is authenticated by looking for token in localStorage
  const isAuthenticated = isMounted && !!localStorage.getItem("authToken")

  useEffect(() => {
    if (!isMounted) return

    if (videoRef.current) {
      if (isActive) {
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
            })
            .catch((err) => {
              console.error("Autoplay failed:", err)
              setIsPlaying(false)
            })
        }
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [isActive, isMounted])

  const togglePlayPause = () => {
    if (!isMounted) return

    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Play failed:", err)
            setIsPlaying(false)
          })
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  const handleLike = async () => {
    if (!isMounted) return

    if (!isAuthenticated) {
      alert("Please log in to like videos")
      return
    }

    try {
      const newLikedState = !liked
      setLiked(newLikedState)
      setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1))

      await likeVideo(video.id)
    } catch (error) {
      console.error("Failed to like video:", error)
      // Revert UI state on error
      setLiked(!liked)
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1))
    }
  }

  const handleComment = async (e) => {
    if (!isMounted) return

    e.preventDefault()

    if (!isAuthenticated) {
      alert("Please log in to comment")
      return
    }

    if (!comment.trim()) return

    try {
      setIsSubmitting(true)
      const newComment = await addComment(video.id, { text: comment })

      setComments((prev) => [newComment, ...prev])
      setComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyLink = async () => {
    if (!isMounted) return

    try {
      const shareableUrl = generateShareableUrl(video.id)

      // Check if clipboard API is available (requires HTTPS in production)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareableUrl)
      } else {
        // Fallback for non-HTTPS or older browsers
        const textArea = document.createElement("textarea")
        textArea.value = shareableUrl
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand("copy")
          textArea.remove()
        } catch (err) {
          textArea.remove()
          throw new Error("Copy failed")
        }
      }

      setShowCopyToast(true)
      setTimeout(() => setShowCopyToast(false), 4000)
    } catch (err) {
      console.error("Failed to copy link:", err)

      // Show a more user-friendly error with the URL
      const shareableUrl = generateShareableUrl(video.id)

      // Try to show the URL in a prompt as fallback
      if (window.prompt) {
        window.prompt("Copy this link:", shareableUrl)
      } else {
        alert(`Copy this link: ${shareableUrl}`)
      }
    }
  }

  // Helper function to check if a URL is accessible
  const isUrlAccessible = async (url) => {
    if (!isMounted) return false

    try {
      const response = await fetch(url, { method: "HEAD" })
      return response.ok
    } catch (error) {
      return false
    }
  }

  const handleSaveToDevice = async () => {
    if (!isMounted || isDownloading) return

    try {
      setIsDownloading(true)

      // First try to get the download URL from the API
      let downloadUrl
      try {
        const downloadData = await getDownloadUrl(video.id)
        downloadUrl = downloadData.url
      } catch (apiError) {
        console.warn("Failed to get download URL from API, using direct video URL:", apiError)
        downloadUrl = video.url
      }

      // Check if the URL is accessible
      const isAccessible = await isUrlAccessible(downloadUrl)
      if (!isAccessible) {
        console.warn("Download URL is not accessible, falling back to direct video URL")
        downloadUrl = video.url
      }

      // Generate a filename
      const filename = `${video.title || "video"}.mp4`

      // Create a blob from the video URL
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status}`)
      }

      const blob = await response.blob()

      // Create a URL for the blob
      const blobUrl = URL.createObjectURL(blob)

      // Create a download link
      const downloadLink = document.createElement("a")
      downloadLink.href = blobUrl
      downloadLink.download = filename
      downloadLink.style.display = "none"

      // Add the link to the DOM and click it
      document.body.appendChild(downloadLink)
      downloadLink.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(blobUrl)
      }, 100)

      // Log the download (optional)
      try {
        await fetch(`${BASEURL}/api/videos/${video.id}/download`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
      } catch (logError) {
        console.error("Failed to log download:", logError)
      }
    } catch (error) {
      console.error("Failed to download video:", error)
      alert("Failed to download video. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (!isMounted) return

    try {
      const shareableUrl = generateShareableUrl(video.id)

      // Call API to increment share count (don't fail if this fails)
      try {
        await shareVideo(video.id)
      } catch (apiError) {
        console.warn("Failed to increment share count:", apiError)
      }

      // Check if Web Share API is available and supported
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: video.title || "Check out this video",
          text: video.description || `Video by @${video.user?.username || "user"}`,
          url: shareableUrl,
        }

        // Check if the data can be shared
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          return
        }
      }

      // Fallback to clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareableUrl)
      } else {
        // Manual copy fallback
        const textArea = document.createElement("textarea")
        textArea.value = shareableUrl
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand("copy")
          textArea.remove()
        } catch (err) {
          textArea.remove()
          throw new Error("Copy failed")
        }
      }

      setShowCopyToast(true)
      setTimeout(() => setShowCopyToast(false), 3000)
    } catch (error) {
      console.error("Failed to share video:", error)

      // If it's not a user cancellation, show fallback
      if (error.name !== "AbortError") {
        const shareableUrl = generateShareableUrl(video.id)

        if (window.prompt) {
          window.prompt("Share this link:", shareableUrl)
        } else {
          alert(`Share this link: ${shareableUrl}`)
        }
      }
    }
  }

  const handleVideoLoad = () => {
    setIsVideoLoaded(true)
  }

  const handleVideoError = (e) => {
    console.error("Video error:", e)
    setIsVideoLoaded(false)
  }

  // Show a loading state until the component is mounted on the client
  if (!isMounted) {
    return (
      <div className="position-relative h-100 d-flex justify-content-center align-items-center bg-dark">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="video-card-container position-relative h-100">
      {/* Loading spinner (shows when video is loading) */}
      {!isVideoLoaded && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        src={video.url}
        className="w-100 h-100 object-fit-cover"
        loop
        playsInline
        muted={false}
        controls={false}
        onClick={togglePlayPause}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
      />

      {/* Play button overlay (shows when paused) */}
      {!isPlaying && isVideoLoaded && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          onClick={togglePlayPause}
        >
          <div
            className="rounded-circle d-flex justify-content-center align-items-center"
            style={{ width: "70px", height: "70px", backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <i className="bi bi-play-fill text-white" style={{ fontSize: "40px" }}></i>
          </div>
        </div>
      )}

      {/* Right side action buttons */}
      <div
        className="position-absolute end-0 bottom-0 p-3 d-flex flex-column align-items-center gap-4"
        style={{ bottom: "120px" }}
      >
        {/* Copy Link Button */}
        <div className="d-flex flex-column align-items-center" style={{ cursor: "pointer" }} onClick={handleCopyLink}>
          <div
            className="rounded-circle d-flex justify-content-center align-items-center"
            style={{ width: "44px", height: "44px", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <i className="bi bi-link-45deg text-white" style={{ fontSize: "20px" }}></i>
          </div>
          <span className="text-white" style={{ fontSize: "12px", marginTop: "4px" }}>
            Copy Link
          </span>
        </div>

        {/* Save to Device Button */}
        <div
          className="d-flex flex-column align-items-center"
          style={{ cursor: isDownloading ? "default" : "pointer" }}
          onClick={handleSaveToDevice}
        >
          <div
            className="rounded-circle d-flex justify-content-center align-items-center"
            style={{ width: "44px", height: "44px", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            {isDownloading ? (
              <div className="spinner-border spinner-border-sm text-white" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <i className="bi bi-download text-white" style={{ fontSize: "20px" }}></i>
            )}
          </div>
          <span className="text-white" style={{ fontSize: "12px", marginTop: "4px" }}>
            {isDownloading ? "Downloading..." : "Save to Device"}
          </span>
        </div>

        {/* Share Button */}
        <div className="d-flex flex-column align-items-center" style={{ cursor: "pointer" }} onClick={handleShare}>
          <div
            className="rounded-circle d-flex justify-content-center align-items-center"
            style={{ width: "44px", height: "44px", backgroundColor: "#a4ff00" }}
          >
            <i className="bi bi-arrow-up-right" style={{ fontSize: "20px", color: "black" }}></i>
          </div>
          <span className="text-white" style={{ fontSize: "12px", marginTop: "4px" }}>
            Share
          </span>
        </div>

        {/* More Options Button */}
        <div className="d-flex justify-content-center align-items-center" style={{ width: "44px", height: "44px" }}>
          <i className="bi bi-three-dots text-white" style={{ fontSize: "24px" }}></i>
        </div>
      </div>

      {/* Bottom user info */}
      <div className="position-absolute start-0 bottom-0 p-3 d-flex align-items-center" style={{ maxWidth: "70%" }}>
        <img
          src={video.user?.avatar || "/placeholder.svg?height=40&width=40&query=user"}
          alt={video.user?.username}
          className="rounded-circle me-2"
          style={{ width: "44px", height: "44px", border: "2px solid white" }}
        />
        <div className="text-white">
          <div className="fw-bold">@{video.user?.username}</div>
          <div>{video.title}</div>
        </div>
      </div>

      {/* Enhanced Copy Link Toast Notification */}
      {showCopyToast && (
        <div
          className="position-absolute top-50 start-50 translate-middle p-3 bg-dark text-white rounded-3 shadow"
          style={{ zIndex: 1050, maxWidth: "320px" }}
        >
          <div className="d-flex align-items-start">
            <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
            <div>
              <div className="fw-bold mb-1">Link copied!</div>
              <div className="small text-muted">
                Share this link anywhere for rich previews with video thumbnail, title, and creator info. Perfect for
                social media, messaging apps, and more!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      <Modal show={showComments} onHide={() => setShowComments(false)} centered contentClassName="bg-dark text-white">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>Comments</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {isAuthenticated ? (
            <Form onSubmit={handleComment} className="mb-4">
              <Form.Group className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !comment.trim()}
                  style={{
                    background: "linear-gradient(90deg, #00a0e9 0%, #0073d5 50%, #0046c0 100%)",
                    border: "none",
                  }}
                >
                  {isSubmitting ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    "Post"
                  )}
                </Button>
              </Form.Group>
            </Form>
          ) : (
            <p className="text-center mb-4">Please log in to comment</p>
          )}

          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="d-flex mb-3">
                <img
                  src={comment.user?.avatar || "/placeholder.svg?height=32&width=32&query=user"}
                  alt={comment.user?.username || comment.username}
                  className="rounded-circle me-2"
                  width="32"
                  height="32"
                />
                <div>
                  <div className="fw-bold">{comment.user?.username || comment.username}</div>
                  <div>{comment.text}</div>
                  <div className="text-muted small">
                    {new Date(comment.createdAt || comment.timestamp || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No comments yet</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}
