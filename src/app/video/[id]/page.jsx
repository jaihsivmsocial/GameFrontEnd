import VideoPageClient from "./VideoPageClient"

// This metadata will be generated server-side and should be picked up by crawlers.
// It's designed to be robust even if the video data fetch fails.
export async function generateMetadata({ params }) {
  console.log(`🔥 GENERATING METADATA FOR: ${params.id}`)

  const siteUrl = "https://test.tribez.gg"
  const videoUrl = `${siteUrl}/video/${params.id}`

  // GUARANTEED metadata - no API calls that can fail during build/SSR for basic info
  const title = "Amazing Video on Clip App"
  const description = "Watch this incredible short video on Clip App - the best platform for sharing amazing content!"
  const thumbnail = `${siteUrl}/placeholder.svg?height=630&width=1200&query=video-thumbnail`

  console.log(`✅ METADATA GENERATED:`, { title, description, videoUrl, thumbnail })

  return {
    title: `${title} | Clip App`,
    description,

    // Open Graph (Facebook, WhatsApp, Discord, LinkedIn)
    openGraph: {
      title: title,
      description: description,
      url: videoUrl,
      siteName: "Clip App",
      type: "video.other",
      locale: "en_US",
      images: [
        {
          url: thumbnail,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/svg+xml", // Use svg+xml as placeholder is SVG
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      site: "@ClipApp", // Replace with your Twitter handle if you have one
      title: title,
      description: description,
      images: [thumbnail],
    },

    // Additional explicit meta tags for maximum compatibility
    other: {
      "og:title": title,
      "og:description": description,
      "og:image": thumbnail,
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:alt": title,
      "og:url": videoUrl,
      "og:site_name": "Clip App",
      "og:type": "video.other",
      "og:locale": "en_US",

      "twitter:card": "summary_large_image",
      "twitter:site": "@ClipApp",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": thumbnail,
      "twitter:image:alt": title,

      description: description,
      keywords: "video, clip, short video, social media",
      author: "Clip App",
      "theme-color": "#0073d5",
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
