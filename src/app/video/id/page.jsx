import { notFound } from "next/navigation"
import { BASEURL } from "@/utils/apiservice"
import VideoPageClient from "./VideoPageClient"

// Server-side function to fetch video data
async function getVideoData(id) {
  try {
    const response = await fetch(`${BASEURL}/api/videos/${id}`, {
      cache: "no-store", // Ensure fresh data for sharing
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.success ? data.video : null
  } catch (error) {
    console.error("Error fetching video:", error)
    return null
  }
}

// Generate rich metadata for social sharing
export async function generateMetadata({ params }) {
  try {
    const video = await getVideoData(params.id)

    if (!video) {
      return {
        title: "Video Not Found - Clip App",
        description: "The requested video could not be found.",
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const videoUrl = `${siteUrl}/video/${params.id}`
    const thumbnailUrl = video.thumbnailUrl || `${BASEURL}/api/videos/${params.id}/thumbnail`

    return {
      title: `${video.title} - @${video.username} | Clip App`,
      description: video.description || `Watch this amazing video by @${video.username} on Clip App`,

      // Open Graph tags for rich sharing
      openGraph: {
        title: video.title,
        description: video.description || `Video by @${video.username}`,
        url: videoUrl,
        siteName: "Clip App",
        type: "video.other",
        images: [
          {
            url: thumbnailUrl,
            width: 1200,
            height: 630,
            alt: video.title,
          },
        ],
        videos: [
          {
            url: video.videoUrl,
            type: "video/mp4",
            width: 720,
            height: 1280,
          },
        ],
      },

      // Twitter Card tags
      twitter: {
        card: "player",
        title: video.title,
        description: video.description || `Video by @${video.username}`,
        images: [thumbnailUrl],
        players: [
          {
            playerUrl: `${siteUrl}/video/${params.id}/player`,
            streamUrl: video.videoUrl,
            width: 720,
            height: 1280,
          },
        ],
      },

      // Additional meta tags
      other: {
        "video:duration": video.duration || "30",
        "video:release_date": video.createdAt,
        "article:author": video.username,
        "article:published_time": video.createdAt,
      },
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
  const video = await getVideoData(params.id)

  if (!video) {
    notFound()
  }

  return <VideoPageClient video={video} videoId={params.id} />
}
