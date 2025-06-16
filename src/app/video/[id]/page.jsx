import VideoPageClient from "./VideoPageClient"
import { getVideo } from "@/components/clipsorts/api" // Import getVideo to fetch dynamic data

// Generate metadata dynamically based on video data
export async function generateMetadata({ params }) {
  console.log(`🔥 GENERATING METADATA FOR: ${params.id}`)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://test.tribez.gg"
  const videoPageUrl = `${siteUrl}/video/${params.id}`
  const playerUrl = `${siteUrl}/video/${params.id}/player` // Dedicated player URL for embeds

  let videoData = null
  try {
    // Attempt to fetch actual video data for rich previews
    videoData = await getVideo(params.id)
    console.log("Fetched video data for metadata:", videoData)
  } catch (error) {
    console.error(`Error fetching video data for metadata for ID ${params.id}:`, error)
    // Fallback to generic data if API fails, ensuring metadata is always present
    videoData = {
      title: "Amazing Video on Clip App",
      description: "Watch this incredible short video on Clip App - the best platform for sharing amazing content!",
      thumbnailUrl: `${siteUrl}/placeholder.svg?height=630&width=1200&query=video-thumbnail`,
      videoUrl: `${siteUrl}/placeholder-video.mp4`, // Fallback video URL
      username: "Clip App User",
    }
  }

  const title = videoData.title || "Amazing Video on Clip App"
  const description =
    videoData.description ||
    `Watch this incredible short video by @${videoData.username || "Clip App User"} on Clip App!`
  const thumbnailUrl =
    videoData.thumbnailUrl || `${siteUrl}/placeholder.svg?height=630&width=1200&query=video-thumbnail`
  const videoContentUrl = videoData.videoUrl || `${siteUrl}/placeholder-video.mp4` // Direct URL to video file

  console.log(`✅ METADATA GENERATED:`, { title, description, videoPageUrl, thumbnailUrl, videoContentUrl, playerUrl })

  return {
    title: `${title} | Clip App`,
    description,

    // Open Graph (Facebook, WhatsApp, Discord, LinkedIn)
    openGraph: {
      title: title,
      description: description,
      url: videoPageUrl,
      siteName: "Clip App",
      type: "video.other",
      locale: "en_US",
      images: [
        {
          url: thumbnailUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/svg+xml", // Use svg+xml for placeholder, adjust if actual image type
        },
      ],
      // Crucial for video embeds in Open Graph
      videos: [
        {
          url: videoContentUrl, // Direct URL to the video file
          secureUrl: videoContentUrl,
          type: "video/mp4", // Assuming MP4, adjust if other formats
          width: 720, // Standard vertical video width
          height: 1280, // Standard vertical video height
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: "player", // Use 'player' card for embedded video player
      site: "@ClipApp", // Replace with your Twitter handle if you have one
      title: title,
      description: description,
      image: thumbnailUrl,
      // Crucial for video embeds in Twitter Card
      player: {
        url: playerUrl, // URL to the dedicated player page
        width: 720,
        height: 1280,
        stream: videoContentUrl, // Direct URL to the video file for streaming
      },
    },

    // Schema.org structured data (for Google search results)
    alternates: {
      types: {
        "application/json": `${siteUrl}/api/videos/${params.id}/metadata`, // Point to your API metadata endpoint
      },
    },
  }
}

// This page component will now be rendered within its own isolated layout.
export default async function VideoPage({ params }) {
  console.log(`🎬 VIDEO PAGE LOADING: ${params.id}`)
  // The VideoPageClient will handle fetching the actual video data
  // and displaying it in the reels format.
  return <VideoPageClient params={params} />
}
