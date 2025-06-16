import VideoPageClient from "./VideoPageClient"

// Simplified server-side function with direct API calls
async function getVideoData(id) {
  try {
    console.log(`Fetching video data for ID: ${id}`)

    // Try the API endpoint directly
    const apiUrl = `http://apitest.tribez.gg/api/videos/${id}`
    console.log(`Fetching from: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    })

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      console.log(`API call failed with status: ${response.status}`)
      return null
    }

    const data = await response.json()
    console.log("API response:", data)

    if (data.success && data.video) {
      return data.video
    }

    return null
  } catch (error) {
    console.error("Error fetching video:", error)
    return null
  }
}

// Generate metadata for rich sharing
export async function generateMetadata({ params }) {
  console.log(`Generating metadata for video ID: ${params.id}`)

  const video = await getVideoData(params.id)
  const siteUrl = "https://test.tribez.gg"
  const videoUrl = `${siteUrl}/video/${params.id}`

  if (!video) {
    // Fallback metadata
    return {
      title: "Amazing Video - Clip App",
      description: "Watch this amazing short video on Clip App!",
      openGraph: {
        title: "Amazing Video - Clip App",
        description: "Watch this amazing short video on Clip App!",
        url: videoUrl,
        siteName: "Clip App",
        type: "video.other",
        images: [
          {
            url: `${siteUrl}/placeholder.svg?height=630&width=1200&query=video-thumbnail`,
            width: 1200,
            height: 630,
            alt: "Video Thumbnail",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Amazing Video - Clip App",
        description: "Watch this amazing short video on Clip App!",
        images: [`${siteUrl}/placeholder.svg?height=630&width=1200&query=video-thumbnail`],
      },
    }
  }

  const title = video.title || "Untitled Video"
  const description = video.description || `Watch this amazing video by @${video.username} on Clip App`
  const thumbnailUrl =
    video.thumbnailUrl || `${siteUrl}/placeholder.svg?height=630&width=1200&query=${encodeURIComponent(title)}`

  return {
    title: `${title} - @${video.username} | Clip App`,
    description,
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
      videos: video.videoUrl
        ? [
            {
              url: video.videoUrl,
              type: "video/mp4",
              width: 720,
              height: 1280,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [thumbnailUrl],
    },
  }
}

export default async function VideoPage({ params }) {
  console.log(`Video page loading for ID: ${params.id}`)

  // Always render the client component, let it handle the video loading
  return <VideoPageClient videoId={params.id} />
}
