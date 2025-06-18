import { notFound } from "next/navigation"
import { getVideo } from "@/components/clipsorts/api" // Import getVideo to fetch dynamic data
import VideoPageClient from "./VideoPageClient"

// Generate metadata dynamically based on video data
export async function generateMetadata({ params }) {
  console.log(`🔥 GENERATING METADATA FOR: ${params.id}`)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://test.tribez.gg"
  const videoPageUrl = `${siteUrl}/video/${params.id}`
  const playerUrl = `${siteUrl}/video/${params.id}/player` // Dedicated player URL for embeds

  let videoData = null
  try {
    // Attempt to fetch actual video data for rich previews
    // No searchParams needed for metadata generation, as it's just fetching data
    videoData = await getVideo(params.id)
    console.log("Fetched video data for metadata:", videoData)
  } catch (error) {
    console.error(`Error fetching video data for metadata for ID ${params.id}:`, error)
    // Fallback to generic data if API fails, ensuring metadata is always present
    videoData = {
      id: params.id, // Ensure ID is present for fallback URLs
      title: "Amazing Video on Clip App",
      description: "Watch this incredible short video on Clip App - the best platform for sharing amazing content!",
      // Fallback to a generic SVG placeholder if API fails to provide a thumbnail
      thumbnailUrl: `${siteUrl}/placeholder.svg?height=630&width=1200&query=video-thumbnail`,
      // Fallback to the player URL for video content if API fails
      videoUrl: `${siteUrl}/video/${params.id}/player`,
      username: "Clip App User",
    }
  }

  const title = videoData.title || "Amazing Video on Clip App"
  const description =
    videoData.description ||
    `Watch this incredible short video by @${videoData.username || "Clip App User"} on Clip App!`
  // Use the videoData.thumbnailUrl if available, otherwise use the generic SVG placeholder
  const thumbnailUrl =
    videoData.thumbnailUrl || `${siteUrl}/placeholder.svg?height=630&width=1200&query=video-thumbnail`
  // Use the videoData.videoUrl if available, otherwise use the player URL as a fallback
  const videoContentUrl = videoData.videoUrl || `${siteUrl}/video/${params.id}/player`

  // Log the final metadata object for debugging rich previews
  const finalMetadata = {
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
          url: thumbnailUrl, // This will be videoData.thumbnailUrl from API or the SVG fallback
          width: 1200,
          height: 630,
          alt: title,
          type: "image/jpeg", // IMPORTANT: Ensure this matches the actual type of your thumbnails (e.g., image/png, image/webp)
        },
      ],
      // Crucial for video embeds in Open Graph
      videos: [
        {
          url: videoContentUrl, // This will be videoData.videoUrl from API or the player URL fallback
          secureUrl: videoContentUrl,
          type: "video/mp4", // IMPORTANT: Ensure this matches the actual type of your videos (e.g., video/quicktime for .mov)
          width: 720,
          height: 1280,
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
        url: playerUrl,
        width: 720,
        height: 1280,
        stream: videoContentUrl, // This will be videoData.videoUrl from API or the player URL fallback
      },
    },

    // Schema.org structured data (for Google search results)
    alternates: {
      types: {
        "application/json": `${siteUrl}/api/videos/${params.id}/metadata`, // Point to your API metadata endpoint
      },
    },
  }
  console.log(`✅ FINAL METADATA RETURNED:`, finalMetadata)
  return finalMetadata
}

// This page component is now a Server Component
export default async function VideoPage({ params, searchParams }) {
  console.log(`🎬 VIDEO PAGE LOADING: ${params.id}, Search Params:`, searchParams) // NEW: Log searchParams

  let video = null
  let error = null

  try {
    // Pass searchParams to getVideo to handle linkClicks
    video = await getVideo(params.id, searchParams)
    if (!video) {
      notFound() // If video is not found, Next.js will render a 404 page
    }
  } catch (err) {
    console.error("Failed to load video server-side:", err)
    error = "Failed to load video. Please try again later."
    // Fallback to a generic video object if API fails, to render the client component
    video = {
      id: params.id,
      title: "Video Not Available",
      description: "This video could not be loaded.",
      username: "Clip App User",
      videoUrl: "/placeholder-video.mp4", // A generic placeholder video if you have one
      thumbnailUrl: "/placeholder.svg?height=630&width=1200", // A generic placeholder image
      userAvatar: "/placeholder.svg?height=40&width=40",
      likes: [],
      comments: [],
      shares: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      linkClicks: 0, // Ensure linkClicks is initialized even in fallback
    }
  }

  // Pass the fetched video data (or fallback) directly to the client component
  return <VideoPageClient video={video} error={error} />
}
