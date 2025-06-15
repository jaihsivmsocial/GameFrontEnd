"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import VideoCard from "@/components/clipsorts/VideoCard"
import { BASEURL } from "@/utils/apiservice"

export default function VideoPageClient({ video, videoId }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Track video view
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch(`${BASEURL}/api/videos/${videoId}`, {
          method: "GET",
        })
      } catch (error) {
        console.error("Failed to track view:", error)
      }
    }

    trackView()
  }, [videoId])

  const handleBackToFeed = () => {
    setIsLoading(true)
    router.push("/clip")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800 sticky top-0 bg-black z-10">
        <div className="flex items-center">
          <button
            onClick={handleBackToFeed}
            disabled={isLoading}
            className="text-white mr-4 hover:text-gray-300 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
          <h1 className="text-xl font-bold">CLIP</h1>
        </div>

        {/* Share button in header */}
        <button
          onClick={() => {
            const shareUrl = `${window.location.origin}/video/${videoId}`
            if (navigator.share) {
              navigator.share({
                title: video.title,
                text: `Check out this video by @${video.username}`,
                url: shareUrl,
              })
            } else {
              navigator.clipboard.writeText(shareUrl)
              alert("Link copied to clipboard!")
            }
          }}
          className="text-white hover:text-gray-300"
        >
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

      {/* Video Container - Full screen mobile-first design */}
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
                  username: video.username,
                  avatar: video.userAvatar || "/placeholder.svg?height=40&width=40",
                },
                likesCount: video.likes?.length || 0,
                comments: video.comments || [],
                isLiked: false, // Will be determined by auth state
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

      {/* SEO and sharing meta tags are handled by the parent page component */}
    </div>
  )
}
