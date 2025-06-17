"use client"

import { useEffect, useRef, useState } from "react"

// VideoPageClient now receives video data as a prop
export default function VideoPageClient({ video, error }) {
  const [isPlaying, setIsPlaying] = useState(false) // Track play state
  const videoRef = useRef(null)

  useEffect(() => {
    // Attempt to autoplay when video element is available and video data is loaded
    if (videoRef.current && video && video.videoUrl) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((err) => {
          console.warn("Autoplay failed (likely due to browser policy, user interaction needed):", err)
          setIsPlaying(false)
        })
    }
  }, [video]) // Re-run effect when video prop changes

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error("Play failed:", err))
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  const handleShare = () => {
    const shareUrl = `https://test.tribez.gg/video/${video.id}`
    if (navigator.share) {
      navigator
        .share({
          title: video?.title || "Amazing Video",
          text: `Check out this video by @${video?.username || "user"}`,
          url: shareUrl,
        })
        .catch((shareError) => {
          if (shareError.name !== "AbortError") {
            console.error("Error sharing:", shareError)
            // Fallback to clipboard if native share fails for other reasons
            navigator.clipboard.writeText(shareUrl)
            alert("Link copied! Share it anywhere for rich previews! 🚀")
          }
        })
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert("Link copied! Share it anywhere for rich previews! 🚀")
    }
  }

  if (error || !video) {
    return (
      <div className="w-screen h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
          <p className="text-gray-400 mb-4">{error || "The video you're looking for doesn't exist."}</p>
          <button
            onClick={() => (window.location.href = "/clip")}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white transition-colors"
          >
            Back to Feed
          </button>
        </div>
      </div>
    )
  }

  return (
    // This container now uses fixed positioning to overlay everything else
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      {/* Reels container - centered and mobile-sized */}
      {/* This div now takes full screen height and width, and centers the video within it */}
      <div className="relative w-full h-full max-w-sm aspect-[9/16] bg-black overflow-hidden rounded-lg">
        {/* Video element with 9:16 aspect ratio */}
        <video
          ref={videoRef}
          src={video.videoUrl || video.url}
          className="w-full h-full object-cover"
          controls={false} // Ensure no native controls
          autoPlay // Attempt autoplay
          loop
          playsInline
          muted // Crucial for autoplay in most browsers
          poster={video.thumbnailUrl}
          onClick={togglePlayPause} // Click anywhere on video to toggle play/pause
        />

        {/* Play/Pause Overlay - only show if paused */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-auto"
            onClick={togglePlayPause}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Overlay controls (TikTok style) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Back button - top left */}
          <button
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white pointer-events-auto"
            onClick={() => (window.location.href = "/clip")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Share button - top right */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white pointer-events-auto"
            onClick={handleShare}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>

          {/* User info - bottom left */}
          <div className="absolute bottom-4 left-4 right-16 pointer-events-auto">
            <div className="flex items-center mb-2">
              <img
                src={video.userAvatar || "/placeholder.svg?height=40&width=40"}
                alt={video.username}
                className="w-10 h-10 rounded-full border-2 border-white mr-3"
              />
              <div>
                <div className="text-white font-semibold text-sm">@{video.username}</div>
                <div className="text-white/80 text-xs">
                  {video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-white text-sm mb-1 font-medium">{video.title}</div>
            {video.description && <div className="text-white/90 text-xs line-clamp-2">{video.description}</div>}
          </div>

          {/* Action buttons - bottom right */}
          <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-4 pointer-events-auto">
            {/* Like button */}
            <button className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span className="text-white text-xs mt-1">{video.likes?.length || 0}</span>
            </button>

            {/* Comment button */}
            <button className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <span className="text-white text-xs mt-1">{video.comments?.length || 0}</span>
            </button>

            {/* Share button */}
            <button className="flex flex-col items-center" onClick={handleShare}>
              <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <span className="text-white text-xs mt-1">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
