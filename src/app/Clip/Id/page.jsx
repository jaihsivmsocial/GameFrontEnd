import VideoPageClient from "./VideoPageClient"
import { BASEURL } from "../../utils/apiservice"


// Server-side function to fetch video data
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

// Generate metadata for rich sharing
export async function generateMetadata({ params }) {
  console.log("🚀 generateMetadata called for video:", params.id)

  try {
    const video = await getVideoData(params.id)

    if (video) {
      return {
        title: `${video.title} - @${video.username} | Clip App`,
        description: video.description || `Watch this video by @${video.username}`,
        openGraph: {
          title: video.title,
          description: video.description || `Video by @${video.username}`,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/video/${params.id}`,
          siteName: "Clip App",
          type: "video.other",
          images: [
            {
              url: video.thumbnailUrl || `${BASEURL}/api/videos/${params.id}/thumbnail`,
              width: 640,
              height: 360,
              alt: video.title,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: video.title,
          description: video.description || `Video by @${video.username}`,
          images: [video.thumbnailUrl || `${BASEURL}/api/videos/${params.id}/thumbnail`],
        },
      }
    }

    return {
      title: "Video Not Found - Clip App",
      description: "The requested video could not be found.",
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Clip App - Share Short Videos",
      description: "Watch amazing short videos on Clip App",
    }
  }
}

// Main video page component
export default async function VideoPage({ params }) {
  return <VideoPageClient params={params} />
}
