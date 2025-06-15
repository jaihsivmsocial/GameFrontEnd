import { NextResponse } from "next/server"
import { BASEURL } from "@/utils/apiservice"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")
    const format = searchParams.get("format") || "json"

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Extract video ID from URL
    const videoIdMatch = url.match(/\/video\/([^/?]+)/)
    if (!videoIdMatch) {
      return NextResponse.json({ error: "Invalid video URL" }, { status: 400 })
    }

    const videoId = videoIdMatch[1]

    // Fetch video data
    const response = await fetch(`${BASEURL}/api/videos/${videoId}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const data = await response.json()
    if (!data.success || !data.video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const video = data.video
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://test.tribez.gg"
    const thumbnailUrl = video.thumbnailUrl || `${BASEURL}/api/videos/${videoId}/thumbnail`

    const oembedData = {
      version: "1.0",
      type: "video",
      width: 720,
      height: 1280,
      title: video.title,
      author_name: video.username,
      author_url: `${siteUrl}/user/${video.username}`,
      provider_name: "Clip App",
      provider_url: siteUrl,
      thumbnail_url: thumbnailUrl,
      thumbnail_width: 720,
      thumbnail_height: 1280,
      html: `<iframe src="${siteUrl}/video/${videoId}/player" width="720" height="1280" frameborder="0" allowfullscreen></iframe>`,
      description: video.description || `Video by @${video.username}`,
      upload_date: video.createdAt,
      duration: video.duration || 30,
      view_count: video.views || 0,
      tags: video.tags?.join(", ") || "",
    }

    return NextResponse.json(oembedData, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("oEmbed error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
