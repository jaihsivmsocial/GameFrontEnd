import VideoPageClient from "./VideoPageClient"

// BULLETPROOF: Always generate metadata without API dependency
export async function generateMetadata({ params }) {
  console.log(`🔥 GENERATING METADATA FOR: ${params.id}`)

  const siteUrl = "https://test.tribez.gg"
  const videoUrl = `${siteUrl}/video/${params.id}`

  // GUARANTEED metadata - no API calls that can fail
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
          type: "image/svg+xml",
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      site: "@ClipApp",
      title: title,
      description: description,
      images: [thumbnail],
    },

    // Additional explicit meta tags
    other: {
      // Open Graph explicit
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

      // Twitter explicit
      "twitter:card": "summary_large_image",
      "twitter:site": "@ClipApp",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": thumbnail,
      "twitter:image:alt": title,

      // Basic meta
      description: description,
      keywords: "video, clip, short video, social media",
      author: "Clip App",

      // Discord specific
      "theme-color": "#0073d5",

      // Additional social platforms
      "article:author": "Clip App",
      "article:publisher": "Clip App",
    },
  }
}

export default async function VideoPage({ params }) {
  console.log(`🎬 VIDEO PAGE LOADING: ${params.id}`)

  return (
    <>
      {/* EXPLICIT META TAGS IN HEAD */}
      <head>
        <title>Amazing Video on Clip App</title>
        <meta
          name="description"
          content="Watch this incredible short video on Clip App - the best platform for sharing amazing content!"
        />

        {/* Open Graph */}
        <meta property="og:title" content="Amazing Video on Clip App" />
        <meta
          property="og:description"
          content="Watch this incredible short video on Clip App - the best platform for sharing amazing content!"
        />
        <meta
          property="og:image"
          content={`https://test.tribez.gg/placeholder.svg?height=630&width=1200&query=video-thumbnail`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={`https://test.tribez.gg/video/${params.id}`} />
        <meta property="og:site_name" content="Clip App" />
        <meta property="og:type" content="video.other" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Amazing Video on Clip App" />
        <meta
          name="twitter:description"
          content="Watch this incredible short video on Clip App - the best platform for sharing amazing content!"
        />
        <meta
          name="twitter:image"
          content={`https://test.tribez.gg/placeholder.svg?height=630&width=1200&query=video-thumbnail`}
        />

        {/* Discord */}
        <meta name="theme-color" content="#0073d5" />
      </head>

      <VideoPageClient params={params} />
    </>
  )
}
