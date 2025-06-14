"use client"

import { useState, useEffect } from "react"
import { BASEURL } from "../../utils/apiservice"


async function getVideoData(id) {
  console.log(`🎬 Fetching video data for ID: ${id}`)
  try {
    const url = `${BASEURL}/api/videos/${id}`
    console.log(`📡 API URL: ${url}`)

    const response = await fetch(url, {
      cache: "no-store", // Disable caching for debugging
    })

    console.log(`📊 API Response status: ${response.status}`)

    if (!response.ok) {
      console.log(`❌ API request failed: ${response.status}`)
      return null
    }

    const data = await response.json()
    console.log(`📦 API Response data:`, data)

    if (data.success && data.video) {
      console.log(`✅ Video found: ${data.video.title}`)
      return data.video
    } else {
      console.log(`❌ No video in response or success=false`)
      return null
    }
  } catch (error) {
    console.error("❌ Error fetching video:", error)
    return null
  }
}

export default function VideoPageClient({ params }) {
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideo = async () => {
      console.log(`🎯 VideoPage component called with params:`, params)
      console.log(`🔗 Video ID from URL: ${params.id}`)

      const videoData = await getVideoData(params.id)

      if (!videoData) {
        console.log(`❌ No video found`)
        // notFound() // Can't use notFound in client component
        setLoading(false)
        return
      }

      console.log(`✅ Rendering video page for: ${videoData.title}`)
      setVideo(videoData)
      setLoading(false)
    }

    fetchVideo()
  }, [params.id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!video) {
    return <div>Video not found</div>
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center">
          <a href="/" className="text-white mr-4 hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 className="text-xl font-bold">CLIP</h1>
        </div>
        <div className="text-sm text-gray-400">Video ID: {params.id}</div>
      </div>

      {/* Video Container */}
      <div className="flex justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            {/* Video */}
            <video
              src={video.videoUrl}
              className="w-full aspect-[9/16] object-cover"
              controls
              autoPlay
              loop
              playsInline
              poster={video.thumbnailUrl}
              onError={(e) => {
                console.error("❌ Video playback error:", e)
              }}
              onLoadStart={() => {
                console.log("📹 Video loading started")
              }}
              onLoadedData={() => {
                console.log("✅ Video loaded successfully")
              }}
            />

            {/* Video Info */}
            <div className="p-4">
              <div className="flex items-center mb-3">
                <img
                  src={video.userAvatar || "/placeholder.svg?height=40&width=40"}
                  alt={video.username}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-white"
                />
                <div className="text-white">
                  <div className="font-bold">@{video.username}</div>
                  <div className="text-sm opacity-75">{video.views || 0} views</div>
                </div>
              </div>

              <h2 className="text-white text-lg font-semibold mb-2">{video.title}</h2>

              {video.description && <p className="text-white/80 text-sm mb-4">{video.description}</p>}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-white">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {video.likes?.length || 0}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {video.comments?.length || 0}
                  </span>
                </div>

                <div className="text-white/60 text-sm">{new Date(video.createdAt).toLocaleDateString()}</div>
              </div>

              {/* Share Button */}
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}/video/${params.id}`
                  console.log("🔗 Sharing URL:", shareUrl)
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
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
              >
                Share Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
