"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import VideoCard from "@/components/clipsorts/VideoCard"
import { getVideo } from "@/components/clipsorts/api"

export default function VideoPageClient({ videoId }) {
  const router = useRouter()
  const [video, setVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch video data on client side
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        console.log(`Fetching video client-side for ID: ${videoId}`)
        setIsLoading(true)
        setError(null)

        const videoData = await getVideo(videoId)
        console.log("Video data received:", videoData)

        setVideo(videoData)
      } catch (err) {
        console.error("Failed to fetch video:", err)
        setError("Failed to load video")
      } finally {
        setIsLoading(false)
      }
    }

    if (videoId) {
      fetchVideo()
    }
  }, [videoId])

  const handleBackToFeed = () => {
    router.push("/clip")
  }

  const handleShare = () => {
    const shareUrl = `https://test.tribez.gg/video/${videoId}`
    if (navigator.share) {
      navigator.share({
        title: video?.title || "Amazing Video",
        text: `Check out this video by @${video?.user?.username || video?.username || "user"}`,
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert("Link copied to clipboard!")
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !video) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
          <p className="text-gray-400 mb-4">{error || "The video you're looking for doesn't exist."}</p>
          <button
            onClick={handleBackToFeed}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white transition-colors"
          >
            Back to Feed
          </button>
        </div>
      </div>
    )
  }

  // Video loaded successfully
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800 sticky top-0 bg-black z-10">
        <div className="flex items-center">
          <button onClick={handleBackToFeed} className="text-white mr-4 hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">CLIP</h1>
        </div>

        {/* Share button */}
        <button onClick={handleShare} className="text-white hover:text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
        </button>
      </div>

      {/* Video Container */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="relative bg-black" style={{ height: "calc(100vh - 80px)" }}>
            <VideoCard
              video={{
                id: video._id || video.id,
                url: video.videoUrl || video.url,
                title: video.title,
                description: video.description,
                user: {
                  username: video.username || video.user?.username,
                  avatar: video.userAvatar || video.user?.avatar || "/placeholder.svg?height=40&width=40",
                },
                likesCount: video.likes?.length || 0,
                comments: video.comments || [],
                isLiked: false,
                shares: video.shares || 0,
                views: video.views || 0,
                downloads: video.downloads || 0,
                createdAt: video.createdAt,
              }}
              isActive={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
