import { BASEURL } from "../../utils/apiservice"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Fetch videos with pagination
export async function fetchVideos(page = 1, limit = 10) {
  try {
    console.log(`Fetching videos from: ${BASEURL}/api/videos/get?page=${page}&limit=${limit}`)
    const response = await fetch(`${BASEURL}/api/videos/get?page=${page}&limit=${limit}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.status}`)
    }

    const data = await response.json()
    console.log("Fetched videos data:", data)

    // Check if we have videos in the response
    if (!data.success || !data.videos || data.videos.length === 0) {
      console.log("No videos returned from API")
      return {
        videos: [],
        hasMore: false,
        total: 0,
      }
    }

    // Process videos to ensure they have all required properties
    const processedVideos = data.videos.map((video) => ({
      id: video._id || video.id,
      url: video.videoUrl || video.url,
      thumbnailUrl: video.thumbnailUrl || `${BASEURL}/api/videos/${video._id || video.id}/thumbnail`,
      title: video.title || "Untitled",
      description: video.description || "",
      user: {
        username: video.username || "user",
        avatar: video.userAvatar || "/placeholder.svg?height=40&width=40",
      },
      likesCount: video.likes?.length || 0,
      comments: video.comments || [],
      isLiked: video.isLiked || false,
      shares: video.shares || 0,
      views: video.views || 0,
      downloads: video.downloads || 0,
      createdAt: video.createdAt || new Date().toISOString(),
    }))

    return {
      videos: processedVideos,
      hasMore: data.pagination?.hasNext || false,
      total: data.pagination?.totalVideos || processedVideos.length,
    }
  } catch (error) {
    console.error("Error fetching videos:", error)
    return {
      videos: [],
      hasMore: false,
      total: 0,
    }
  }
}

// Upload a new video
export async function uploadVideo(formData, onProgress) {
  if (!isBrowser) {
    throw new Error("Upload can only be performed in browser environment")
  }

  try {
    const xhr = new XMLHttpRequest()

    // Create a promise to handle the XHR request
    const uploadPromise = new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(event)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            console.log("Upload successful, response:", response)
            resolve(response)
          } catch (error) {
            reject(new Error("Invalid response format"))
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`))
        }
      })

      xhr.addEventListener("error", () => {
        reject(new Error("Network error occurred during upload"))
      })

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload was aborted"))
      })
    })

    // Open and send the request to the correct URL
    const uploadUrl = `${BASEURL}/api/videos/upload`
    xhr.open("POST", uploadUrl)

    // Add auth token if available
    const token = localStorage.getItem("authToken")
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    }

    // Log the form data for debugging
    console.log("Uploading to:", uploadUrl)
    console.log("Form data contains video:", formData.has("video"))
    console.log("Form data contains title:", formData.has("title"))
    console.log("Form data contains description:", formData.has("description"))
    console.log("Authorization header:", token ? "Bearer " + token : "None")

    xhr.send(formData)

    return uploadPromise
  } catch (error) {
    console.error("Error uploading video:", error)
    throw error
  }
}

// Toggle like on a video
export async function likeVideo(id) {
  if (!isBrowser) {
    throw new Error("Like operation can only be performed in browser environment")
  }

  try {
    const token = localStorage.getItem("authToken")

    const response = await fetch(`${BASEURL}/api/videos/${id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to like video: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error liking video ${id}:`, error)
    throw error
  }
}

// Add a comment to a video
export async function addComment(id, commentData) {
  if (!isBrowser) {
    throw new Error("Comment operation can only be performed in browser environment")
  }

  try {
    const token = localStorage.getItem("authToken")

    const response = await fetch(`${BASEURL}/api/videos/${id}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(commentData),
    })

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error adding comment to video ${id}:`, error)
    throw error
  }
}

// Share a video (increment share count)
export async function shareVideo(id) {
  try {
    const response = await fetch(`${BASEURL}/api/videos/${id}/share`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`Failed to share video: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error sharing video ${id}:`, error)
    throw error
  }
}

// Get trending videos
export async function getTrendingVideos() {
  try {
    const response = await fetch(`${BASEURL}/api/videos/trending`)

    if (!response.ok) {
      throw new Error(`Failed to fetch trending videos: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !data.videos) {
      return []
    }

    // Process videos to ensure they have all required properties
    return data.videos.map((video) => ({
      id: video._id || video.id,
      url: video.videoUrl || video.url,
      thumbnailUrl: video.thumbnailUrl || `${BASEURL}/api/videos/${video._id || video.id}/thumbnail`,
      title: video.title || "Untitled",
      description: video.description || "",
      user: {
        username: video.username || "user",
        avatar: video.userAvatar || "/placeholder.svg?height=40&width=40",
      },
      likesCount: video.likes?.length || 0,
      comments: video.comments || [],
      isLiked: video.isLiked || false,
      shares: video.shares || 0,
      views: video.views || 0,
      downloads: video.downloads || 0,
      createdAt: video.createdAt || new Date().toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching trending videos:", error)
    return []
  }
}

// Get a single video by ID
export async function getVideo(id) {
  try {
    const response = await fetch(`${BASEURL}/api/videos/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !data.video) {
      throw new Error("Invalid video data received")
    }

    const video = data.video

    // Process video to ensure it has all required properties
    return {
      id: video._id || video.id,
      url: video.videoUrl || video.url,
      thumbnailUrl: video.thumbnailUrl || `${BASEURL}/api/videos/${video._id || video.id}/thumbnail`,
      title: video.title || "Untitled",
      description: video.description || "",
      user: {
        username: video.username || "user",
        avatar: video.userAvatar || "/placeholder.svg?height=40&width=40",
      },
      likesCount: video.likes?.length || 0,
      comments: video.comments || [],
      isLiked: video.isLiked || false,
      shares: video.shares || 0,
      views: video.views || 0,
      downloads: video.downloads || 0,
      createdAt: video.createdAt || new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error fetching video ${id}:`, error)
    throw error
  }
}

// Get video metadata for sharing
export async function getVideoMetadata(id) {
  try {
    const response = await fetch(`${BASEURL}/api/videos/${id}/metadata`)

    if (!response.ok) {
      throw new Error(`Failed to fetch video metadata: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !data.metadata) {
      throw new Error("Invalid metadata received")
    }

    return data.metadata
  } catch (error) {
    console.error(`Error fetching video metadata ${id}:`, error)
    throw error
  }
}

// Get download URL for a video
export async function getDownloadUrl(id) {
  if (!isBrowser) {
    throw new Error("Download operation can only be performed in browser environment")
  }

  try {
    const token = localStorage.getItem("authToken")

    const response = await fetch(`${BASEURL}/api/videos/${id}/download`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get download URL: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error("Failed to get download URL")
    }

    // Return the direct URL to the video file
    return {
      url: data.downloadUrl || data.video?.videoUrl || data.video?.url,
      downloads: data.downloads,
    }
  } catch (error) {
    console.error(`Error getting download URL for video ${id}:`, error)
    throw error
  }
}

// Delete a video
export async function deleteVideo(id) {
  if (!isBrowser) {
    throw new Error("Delete operation can only be performed in browser environment")
  }

  try {
    const token = localStorage.getItem("authToken")

    if (!token) {
      throw new Error("Authentication required to delete videos")
    }

    const response = await fetch(`${BASEURL}/api/videos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete video: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error deleting video ${id}:`, error)
    throw error
  }
}

// Generate a shareable URL for a video with rich preview support
export function generateShareableUrl(id) {
  // Use the current domain for the share URL
  if (!isBrowser) {
    return `/video/${id}`
  }

  // Get the current origin
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  return `${siteUrl}/video/${id}`
}

export { fetchVideos as getVideos }
