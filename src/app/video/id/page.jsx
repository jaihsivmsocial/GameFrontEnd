import { notFound } from "next/navigation"
import { BASEURL } from "@/utils/apiservice"
import VideoPageClient from "./VideoPageClient"

// Server-side function to fetch video data
async function getVideoData(id) {
  try {
    console.log(`Fetching video data for ID: ${id}`)
    const response = await fetch(`${BASEURL}/api/videos/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.log(`Video fetch failed with status: ${response.status}`)
      return null
    }

    const data = await response.json()
    console.log("Video data received:", data)
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

    // Use environment variable or fallback to your domain
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://test.tribez.gg"
    const videoUrl = `${siteUrl}/video/${params.id}`

    // Create a proper thumbnail URL
    const thumbnailUrl =
      video.thumbnailUrl ||
      `${siteUrl}/placeholder.svg?height=630&width=1200&query=${encodeURIComponent(video.title + " by " + video.username)}`

    const title = video.title
    const description = video.description || `Watch this amazing video by @${video.username} on Clip App`

    console.log("Generated metadata:", {
      title,
      description,
      videoUrl,
      thumbnailUrl,
    })

    return {
      title: `${title} - @${video.username}`,
      description,

      // Open Graph for Facebook, WhatsApp, Discord, LinkedIn
      openGraph: {
        title: title,
        description: description,
        url: videoUrl,
        siteName: "Clip App",
        type: "video.other",
        images: [
          {
            url: thumbnailUrl,
            width: 1200,
            height: 630,
            alt: title,
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

      // Twitter Card
      twitter: {
        card: "summary_large_image",
        site: "@ClipApp",
        creator: `@${video.username}`,
        title: title,
        description: description,
        images: [thumbnailUrl],
      },

      // Additional meta tags for better compatibility
      other: {
        // Essential Open Graph tags
        "og:title": title,
        "og:description": description,
        "og:image": thumbnailUrl,
        "og:image:width": "1200",
        "og:image:height": "630",
        "og:url": videoUrl,
        "og:site_name": "Clip App",
        "og:type": "video.other",
        "og:video": video.videoUrl,
        "og:video:type": "video/mp4",
        "og:video:width": "720",
        "og:video:height": "1280",

        // Twitter tags
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": thumbnailUrl,

        // Discord
        "theme-color": "#0073d5",

        // Basic meta tags
        description: description,
        keywords: `video, ${video.username}, clip, short video`,
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

export default async function VideoPage({ params }) {
  console.log(`Video page loading for ID: ${params.id}`)

  const video = await getVideoData(params.id)

  if (!video) {
    console.log("Video not found, showing 404")
    notFound()
  }

  console.log("Rendering video page for:", video.title)
  return <VideoPageClient video={video} videoId={params.id} />
}
