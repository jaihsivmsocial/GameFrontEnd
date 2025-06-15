import { notFound } from "next/navigation"
import { BASEURL } from "@/utils/apiservice"

async function getVideoData(id) {
  try {
    const response = await fetch(`${BASEURL}/api/videos/${id}`, {
      next: { revalidate: 60 },
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

// Embedded player for social media platforms
export default async function VideoPlayerPage({ params }) {
  const video = await getVideoData(params.id)

  if (!video) {
    notFound()
  }

  return (
    <html>
      <head>
        <title>{video.title || "Video"} - Clip App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#000" }}>
        <div
          style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <video
            src={video.videoUrl || video.url}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              maxWidth: "720px",
              maxHeight: "1280px",
            }}
            controls
            autoPlay
            loop
            playsInline
            poster={video.thumbnailUrl || `${BASEURL}/api/videos/${params.id}/thumbnail`}
          />
        </div>
      </body>
    </html>
  )
}
