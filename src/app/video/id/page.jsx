import { notFound } from "next/navigation"
import { BASEURL } from "@/utils/apiservice"
import VideoPageClient from "./VideoPageClient"

// Server-side function to fetch video data
async function getVideoData(id) {
  try {
    console.log(`Fetching video data for ID: ${id}`)
    console.log(`Using BASEURL: ${BASEURL}`)

    const response = await fetch(`${BASEURL}/api/videos/${id}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      console.log(`Video fetch failed with status: ${response.status}`)
      return null
    }

    const data = await response.json()
    console.log("Video data received:", JSON.stringify(data, null, 2))

    if (data.success && data.video) {
      return data.video
    }

    console.log("No video data in response")
    return null
  } catch (error) {
    console.error("Error fetching video:", error)
    return null
  }
}

// Generate rich metadata for social sharing
export async function generateMetadata({ params }) {
  try {
    console.log(`Generating metadata for video ID: ${params.id}`)

    const video = await getVideoData(params.id)

    if (!video) {
      console.log("No video found for metadata generation")
      return {
        title: "Video Not Found - Clip App",
        description: "The requested video could not be found.",
      }
    }

    // Use environment variable or fallback to your domain
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://test.tribez.gg"
    const videoUrl = `${siteUrl}/video/${params.id}`

    // Create a proper thumbnail URL - use video thumbnail or generate one
    const thumbnailUrl =
      video.thumbnailUrl ||
      `https://test.tribez.gg/placeholder.svg?height=630&width=1200&query=${encodeURIComponent(video.title + " by " + video.username)}`

    const title = video.title || "Untitled Video"
    const description = video.description || `Watch this amazing video by @${video.username} on Clip App`
    const username = video.username || "user"

    console.log("Generated metadata:", {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      username,
    })

    return {
      title: `${title} - @${username} | Clip App`,
      description,

      // Open Graph for Facebook, WhatsApp, Discord, LinkedIn
      openGraph: {
        title: title,
        description: description,
        url: videoUrl,
        siteName: "Clip App",
        type: "video.other",
        locale: "en_US",
        images: [
          {
            url: thumbnailUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: "image/svg+xml",
          },
        ],
        videos: [
          {
            url: video.videoUrl || video.url,
            secureUrl: video.videoUrl || video.url,
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
        creator: `@${username}`,
        title: title,
        description: description,
        images: [thumbnailUrl],
      },

      // Additional meta tags for better compatibility
      other: {
        // Essential Open Graph tags (explicit)
        "og:title": title,
        "og:description": description,
        "og:image": thumbnailUrl,
        "og:image:width": "1200",
        "og:image:height": "630",
        "og:image:alt": title,
        "og:url": videoUrl,
        "og:site_name": "Clip App",
        "og:type": "video.other",
        "og:locale": "en_US",
        "og:video": video.videoUrl || video.url,
        "og:video:secure_url": video.videoUrl || video.url,
        "og:video:type": "video/mp4",
        "og:video:width": "720",
        "og:video:height": "1280",

        // Twitter tags (explicit)
        "twitter:card": "summary_large_image",
        "twitter:site": "@ClipApp",
        "twitter:creator": `@${username}`,
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": thumbnailUrl,
        "twitter:image:alt": title,

        // Discord specific
        "theme-color": "#0073d5",

        // Basic meta tags
        description: description,
        keywords: `video, ${username}, clip, short video, ${video.tags?.join(", ") || ""}`,
        author: username,

        // Additional social platform tags
        "article:author": username,
        "article:published_time": video.createdAt,

        // Schema.org structured data
        "application/ld+json": JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: title,
          description: description,
          thumbnailUrl: thumbnailUrl,
          uploadDate: video.createdAt,
          duration: `PT${video.duration || 30}S`,
          contentUrl: video.videoUrl || video.url,
          author: {
            "@type": "Person",
            name: username,
          },
          publisher: {
            "@type": "Organization",
            name: "Clip App",
            url: siteUrl,
          },
        }),
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

  // Add explicit meta tags in the HTML head
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://test.tribez.gg"
  const videoUrl = `${siteUrl}/video/${params.id}`
  const thumbnailUrl =
    video.thumbnailUrl ||
    `https://test.tribez.gg/placeholder.svg?height=630&width=1200&query=${encodeURIComponent(video.title + " by " + video.username)}`
  const title = video.title || "Untitled Video"
  const description = video.description || `Watch this amazing video by @${video.username} on Clip App`

  return (
    <>
      {/* Explicit meta tags for better social media compatibility */}
      <head>
        <title>
          {title} - @{video.username} | Clip App
        </title>
        <meta name="description" content={description} />

        {/* Open Graph meta tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />
        <meta property="og:url" content={videoUrl} />
        <meta property="og:site_name" content="Clip App" />
        <meta property="og:type" content="video.other" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:video" content={video.videoUrl || video.url} />
        <meta property="og:video:secure_url" content={video.videoUrl || video.url} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="720" />
        <meta property="og:video:height" content="1280" />

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ClipApp" />
        <meta name="twitter:creator" content={`@${video.username}`} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={thumbnailUrl} />
        <meta name="twitter:image:alt" content={title} />

        {/* Discord specific */}
        <meta name="theme-color" content="#0073d5" />

        {/* Additional meta tags */}
        <meta name="author" content={video.username} />
        <meta name="keywords" content={`video, ${video.username}, clip, short video`} />

        {/* Canonical URL */}
        <link rel="canonical" href={videoUrl} />
      </head>

      <VideoPageClient video={video} videoId={params.id} />
    </>
  )
}
