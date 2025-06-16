"use client"

import { useState, useEffect } from "react"
import { getVideo } from "@/components/clipsorts/api"

export default function VideoPageClient({ params }) {
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const videoData = await getVideo(params.id)
        setVideo(videoData)
      } catch (error) {
        console.error("Failed to load video:", error)
        // Set fallback video data
        setVideo({
          id: params.id,
          title: "Amazing Video",
          description: "Watch this amazing video on Clip App!",
          username: "user",
          videoUrl: "/placeholder-video.mp4",
          userAvatar: "/placeholder.svg?height=40&width=40",
          likes: [],
          comments: [],
          shares: 0,
          views: 0,
          createdAt: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading video...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile reels container */}
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative w-full max-w-sm mx-auto">
          {/* Video container - 9:16 aspect ratio */}
          <div className="relative aspect-[9/16] w-full bg-black overflow-hidden rounded-lg">
            {/* Video */}
            <video
              src={video.videoUrl || video.url}
              className="w-full h-full object-cover"
              controls
              autoPlay
              loop
              playsInline
              poster={video.thumbnailUrl}
            />

            {/* Overlay */}
            <div className="absolute inset-0">
              {/* Top gradient */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />

              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

              {/* Back button */}
              <button
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white"
                onClick={() => (window.location.href = "/clip")}
              >
                ←
              </button>

              {/* Share button */}
              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white"
                onClick={() => {
                  const shareUrl = `https://test.tribez.gg/video/${params.id}`
                  navigator.clipboard.writeText(shareUrl)
                  alert("Link copied! 🔗")
                }}
              >
                📤
              </button>

              {/* User info */}
              <div className="absolute bottom-4 left-4 right-16">
                <div className="flex items-center mb-2">
                  <img
                    src={video.userAvatar || "/placeholder.svg?height=40&width=40"}
                    alt={video.username}
                    className="w-10 h-10 rounded-full border-2 border-white mr-3"
                  />
                  <div>
                    <div className="text-white font-semibold">@{video.username}</div>
                    <div className="text-white/80 text-xs">{video.views || 0} views</div>
                  </div>
                </div>
                <div className="text-white font-medium">{video.title}</div>
                {video.description && <div className="text-white/90 text-sm mt-1">{video.description}</div>}
              </div>

              {/* Action buttons */}
              <div className="absolute bottom-4 right-4 flex flex-col space-y-4">
                <button className="flex flex-col items-center text-white">
                  <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">❤️</div>
                  <span className="text-xs mt-1">{video.likes?.length || 0}</span>
                </button>

                <button className="flex flex-col items-center text-white">
                  <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">💬</div>
                  <span className="text-xs mt-1">{video.comments?.length || 0}</span>
                </button>

                <button
                  className="flex flex-col items-center text-white"
                  onClick={() => {
                    const shareUrl = `https://test.tribez.gg/video/${params.id}`
                    navigator.clipboard.writeText(shareUrl)
                    alert("Link copied! Share it anywhere for rich previews! 🚀")
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">🔗</div>
                  <span className="text-xs mt-1">Copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
