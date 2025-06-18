"use client"

import { useState, useEffect, useRef } from "react"
import {
  likeVideo,
  addComment,
  shareVideo,
  getDownloadUrl,
  generateShareableUrl,
  incrementVideoView,
} from "@/components/clipsorts/api"
import { Modal, Form, Button } from "react-bootstrap"

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
  const [showShareModal, setShowShareModal] = useState(false)
  const [viewsCount, setViewsCount] = useState(video.views || 0) // NEW: State for real-time views
  const [sharesCount, setSharesCount] = useState(video.shares || 0) // NEW: State for real-time shares
  const videoRef = useRef(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
              // NEW: Increment view every time video starts playing and is active
              // Removed hasViewedRef to allow repeated views to count
              incrementVideoView(video.id)
                .then((data) => {
                  if (data && typeof data.views === "number") {
                    setViewsCount(data.views) // Update views in real-time
                  }
                })
                .catch((err) => console.error("Failed to increment view:", err))
            })
            .catch((err) => {
              console.error("Autoplay failed (likely due to browser policy, user interaction needed):", err)
              setIsPlaying(false)
            })
        }
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [isActive, isMounted, video.id]) // Add video.id to dependency array

  const togglePlayPause = () => {
    if (!isMounted) return

    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true)
            // NEW: Increment view on manual play
            // Removed hasViewedRef to allow repeated views to count
            incrementVideoView(video.id)
              .then((data) => {
                if (data && typeof data.views === "number") {
                  setViewsCount(data.views) // Update views in real-time
                }
              })
              .catch((err) => console.error("Failed to increment view:", err))
          })
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

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareableUrl)
      } else {
        // Fallback for older browsers or non-secure contexts
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
        } catch (err) {
          console.error("Fallback copy failed:", err)
          throw new Error("Copy failed")
        } finally {
          // Ensure textarea is removed regardless of success or failure
          document.body.removeChild(textArea)
        }
      }

      setShowCopyToast(true)
      setTimeout(() => setShowCopyToast(false), 4000)
    } catch (err) {
      console.error("Failed to copy link:", err)
      const shareableUrl = generateShareableUrl(video.id)
      if (window.prompt) {
        window.prompt("Copy this link:", shareableUrl)
      } else {
        alert(`Copy this link: ${shareableUrl}`)
      }
    }
  }

  const handleSaveToDevice = async () => {
    if (!isMounted || isDownloading) return

    try {
      setIsDownloading(true)

      let downloadUrl
      try {
        const downloadData = await getDownloadUrl(video.id)
        downloadUrl = downloadData.url
      } catch (apiError) {
        console.warn("Failed to get download URL from API, using direct video URL:", apiError)
        downloadUrl = video.url
      }

      const filename = `${video.title || "video"}.mp4`
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status}`)
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const downloadLink = document.createElement("a")
      downloadLink.href = blobUrl
      downloadLink.download = filename
      downloadLink.style.display = "none" // Hide the link
      document.body.appendChild(downloadLink) // Temporarily add to DOM

      downloadLink.click() // Programmatically click the link

      // Clean up: revoke object URL and remove the element immediately
      URL.revokeObjectURL(blobUrl)
      document.body.removeChild(downloadLink) // Fix for "removeChild" error
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

      try {
        // NEW: Update sharesCount in real-time
        const shareResponse = await shareVideo(video.id) // This increments the shares count on the backend
        if (shareResponse && typeof shareResponse.shares === "number") {
          setSharesCount(shareResponse.shares)
        }
      } catch (apiError) {
        console.warn("Failed to increment share count:", apiError)
      }

      // Try native share first
      if (navigator.share) {
        const shareData = {
          title: `${video.title} - @${video.user?.username || "user"}`,
          text: video.description || `Check out this amazing video by @${video.user?.username || "user"} on Clip App!`,
          url: shareableUrl,
        }

        try {
          await navigator.share(shareData)
          return
        } catch (shareError) {
          if (shareError.name !== "AbortError") {
            console.log("Native share failed, showing custom modal")
          }
        }
      }

      // Fallback to custom share modal
      setShowShareModal(true)
    } catch (error) {
      console.error("Failed to share video:", error)
      setShowShareModal(true)
    }
  }

  const handlePlatformShare = async (platform) => {
    const shareableUrl = generateShareableUrl(video.id)
    const title = `${video.title} - @${video.user?.username || "user"}`
    const text = video.description || `Check out this amazing video by @${video.user?.username || "user"} on Clip App!`

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent(title)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareableUrl}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`,
      copy: shareableUrl,
    }

    if (platform === "copy") {
      await handleCopyLink()
    } else {
      window.open(shareUrls[platform], "_blank", "width=600,height=400")
    }

    setShowShareModal(false)
  }

  const handleVideoLoad = () => {
    setIsVideoLoaded(true)
  }

  const handleVideoError = (e) => {
    console.error("Video error event:", e)
    console.error("Video error code:", e.target.error.code)
    console.error("Video error message:", e.target.error.message)
    setIsVideoLoaded(false)
    // Provide user feedback for video errors
    alert(`Video playback error: ${e.target.error.message || "Unknown error"}. Please try again later.`)
  }

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
      {!isVideoLoaded && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

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
        onError={handleVideoError} // Enhanced error logging
      />

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

      <div
        className="position-absolute end-0 bottom-0 p-3 d-flex flex-column align-items-center gap-4"
        style={{ bottom: "120px" }}
      >
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

        <div className="d-flex flex-column align-items-center" style={{ cursor: "pointer" }} onClick={handleShare}>
          <div
            className="rounded-circle d-flex justify-content-center align-items-center"
            style={{ width: "44px", height: "44px", backgroundColor: "#a4ff00" }}
          >
            <i className="bi bi-arrow-up-right" style={{ fontSize: "20px", color: "black" }}></i>
          </div>
          <span className="text-white" style={{ fontSize: "12px", marginTop: "4px" }}>
            Share ({sharesCount}) {/* NEW: Display sharesCount */}
          </span>
        </div>

        <div className="d-flex justify-content-center align-items-center" style={{ width: "44px", height: "44px" }}>
          <i className="bi bi-three-dots text-white" style={{ fontSize: "24px" }}></i>
        </div>
      </div>

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
          <div className="text-white/80 text-xs">
            {viewsCount} views • {new Date(video.createdAt).toLocaleDateString()} {/* NEW: Display viewsCount */}
          </div>
        </div>
      </div>

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
                Share this link anywhere for rich previews with video thumbnail, title, and creator info!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Share Modal */}
      <Modal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        centered
        contentClassName="bg-dark text-white"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>Share Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-4 text-center">
              <div
                className="d-flex flex-column align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => handlePlatformShare("facebook")}
              >
                <div
                  className="rounded-circle d-flex justify-content-center align-items-center mb-2"
                  style={{ width: "50px", height: "50px", backgroundColor: "#1877F2" }}
                >
                  <i className="bi bi-facebook text-white" style={{ fontSize: "24px" }}></i>
                </div>
                <small>Facebook</small>
              </div>
            </div>

            <div className="col-4 text-center">
              <div
                className="d-flex flex-column align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => handlePlatformShare("twitter")}
              >
                <div
                  className="rounded-circle d-flex justify-content-center align-items-center mb-2"
                  style={{ width: "50px", height: "50px", backgroundColor: "#1DA1F2" }}
                >
                  <i className="bi bi-twitter text-white" style={{ fontSize: "24px" }}></i>
                </div>
                <small>Twitter</small>
              </div>
            </div>

            <div className="col-4 text-center">
              <div
                className="d-flex flex-column align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => handlePlatformShare("whatsapp")}
              >
                <div
                  className="rounded-circle d-flex justify-content-center align-items-center mb-2"
                  style={{ width: "50px", height: "50px", backgroundColor: "#25D366" }}
                >
                  <i className="bi bi-whatsapp text-white" style={{ fontSize: "24px" }}></i>
                </div>
                <small>WhatsApp</small>
              </div>
            </div>

            <div className="col-4 text-center">
              <div
                className="d-flex flex-column align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => handlePlatformShare("telegram")}
              >
                <div
                  className="rounded-circle d-flex justify-content-center align-items-center mb-2"
                  style={{ width: "50px", height: "50px", backgroundColor: "#0088CC" }}
                >
                  <i className="bi bi-telegram text-white" style={{ fontSize: "24px" }}></i>
                </div>
                <small>Telegram</small>
              </div>
            </div>

            <div className="col-4 text-center">
              <div
                className="d-flex flex-column align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => handlePlatformShare("linkedin")}
              >
                <div
                  className="rounded-circle d-flex justify-content-center align-items-center mb-2"
                  style={{ width: "50px", height: "50px", backgroundColor: "#0A66C2" }}
                >
                  <i className="bi bi-linkedin text-white" style={{ fontSize: "24px" }}></i>
                </div>
                <small>LinkedIn</small>
              </div>
            </div>

            <div className="col-4 text-center">
              <div
                className="d-flex flex-column align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => handlePlatformShare("copy")}
              >
                <div
                  className="rounded-circle d-flex justify-content-center align-items-center mb-2"
                  style={{ width: "50px", height: "50px", backgroundColor: "#6c757d" }}
                >
                  <i className="bi bi-link-45deg text-white" style={{ fontSize: "24px" }}></i>
                </div>
                <small>Copy Link</small>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

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
