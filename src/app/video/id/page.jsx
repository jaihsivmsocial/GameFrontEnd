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

// Generate rich metadata for social sharing across all platforms
export async function generateMetadata({ params }) {
  try {
    const video = await getVideoData(params.id)

    if (!video) {
      return {
        title: "Video Not Found - Clip App",
        description: "The requested video could not be found.",
      }
    }

    // Use your actual production domain
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://test.tribez.gg"
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || BASEURL
    const videoUrl = `${siteUrl}/video/${params.id}`
    const playerUrl = `${siteUrl}/video/${params.id}/player`
    const thumbnailUrl = video.thumbnailUrl || `${baseUrl}/api/videos/${params.id}/thumbnail`

    const title = `${video.title} - @${video.username} | Clip App`
    const description = video.description || `Watch this amazing video by @${video.username} on Clip App`

    return {
      title,
      description,

      // Basic meta tags
      keywords: `video, ${video.username}, clip, short video, ${video.tags?.join(", ") || ""}`,
      authors: [{ name: video.username }],
      creator: video.username,
      publisher: "Clip App",

      // Open Graph tags (Facebook, LinkedIn, WhatsApp, etc.)
      openGraph: {
        title: video.title,
        description,
        url: videoUrl,
        siteName: "Clip App",
        type: "video.other",
        locale: "en_US",
        images: [
          {
            url: thumbnailUrl,
            width: 1200,
            height: 630,
            alt: video.title,
            type: "image/jpeg",
          },
          {
            url: thumbnailUrl,
            width: 800,
            height: 600,
            alt: video.title,
            type: "image/jpeg",
          },
        ],
        videos: [
          {
            url: video.videoUrl,
            secureUrl: video.videoUrl,
            type: "video/mp4",
            width: 720,
            height: 1280,
          },
        ],
      },

      // Twitter Card tags
      twitter: {
        card: "player",
        site: "@ClipApp",
        creator: `@${video.username}`,
        title: video.title,
        description,
        images: {
          url: thumbnailUrl,
          alt: video.title,
        },
        players: {
          playerUrl,
          streamUrl: video.videoUrl,
          width: 720,
          height: 1280,
        },
      },

      // Additional meta tags for better compatibility
      other: {
        // Video specific
        "video:duration": video.duration || "30",
        "video:release_date": video.createdAt,
        "video:tag": video.tags?.join(", ") || "",

        // Article/Content specific
        "article:author": video.username,
        "article:published_time": video.createdAt,
        "article:section": "Videos",

        // Schema.org structured data
        "application/ld+json": JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: video.title,
          description: description,
          thumbnailUrl: thumbnailUrl,
          uploadDate: video.createdAt,
          duration: `PT${video.duration || 30}S`,
          contentUrl: video.videoUrl,
          embedUrl: playerUrl,
          author: {
            "@type": "Person",
            name: video.username,
          },
          publisher: {
            "@type": "Organization",
            name: "Clip App",
            url: siteUrl,
          },
          interactionStatistic: [
            {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/WatchAction",
              userInteractionCount: video.views || 0,
            },
            {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/LikeAction",
              userInteractionCount: video.likes?.length || 0,
            },
          ],
        }),

        // Discord specific
        "theme-color": "#0073d5",

        // Additional social platforms
        "pinterest:media": thumbnailUrl,
        "pinterest:description": description,

        // SEO enhancements
        robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        googlebot: "index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1",

        // Mobile specific
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "black-translucent",

        // Canonical URL
        canonical: videoUrl,
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
