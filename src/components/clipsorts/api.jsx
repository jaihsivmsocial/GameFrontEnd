import { BASEURL } from "../../utils/apiservice"

// API functions to interact with the backend

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

// NEW: Get presigned URL for direct S3 upload
export async function getPresignedUrl(filename, contentType, fileSize) {
  if (!isBrowser) {
    throw new Error("Upload can only be performed in browser environment")
  }

  try {
    const token = localStorage.getItem("authToken")

    console.log("=== FRONTEND REQUEST ===")
    console.log("Filename:", filename)
    console.log("Content Type:", contentType)
    console.log("File Size:", fileSize)
    console.log("Auth Token:", token ? "Present" : "Missing")

    const response = await fetch(`${BASEURL}/api/videos/upload-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        filename,
        contentType,
        fileSize,
      }),
    })

    console.log("=== SERVER RESPONSE ===")
    console.log("Status:", response.status)
    console.log("Status Text:", response.statusText)

    // Get the response text to see the actual error
    const responseText = await response.text()
    console.log("Response Body:", responseText)

    if (!response.ok) {
      // Try to parse as JSON, fallback to text
      let errorMessage = `Failed to get upload URL: ${response.status}`
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorMessage
        console.log("Parsed Error:", errorData)
      } catch (e) {
        console.log("Raw Error Response:", responseText)
        errorMessage = responseText || errorMessage
      }
      throw new Error(errorMessage)
    }

    // Parse the successful response
    const data = JSON.parse(responseText)
    return data
  } catch (error) {
    console.error("=== FRONTEND ERROR ===")
    console.error("Error getting presigned URL:", error)
    throw error
  }
}

// NEW: Upload directly to S3 using presigned POST
export async function uploadToS3(file, presignedData, onProgress) {
  try {
    const xhr = new XMLHttpRequest()

    const uploadPromise = new Promise((resolve, reject) => {
      xhr.timeout = 300000 // 5 minutes

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(event)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true })
        } else {
          console.error("S3 Response:", xhr.responseText)
          console.error("S3 Status:", xhr.status)
          console.error("S3 Headers:", xhr.getAllResponseHeaders())
          reject(new Error(`S3 upload failed with status: ${xhr.status}. ${xhr.responseText}`))
        }
      })

      xhr.addEventListener("error", (event) => {
        console.error("XHR Error Event:", event)
        console.error("XHR Status:", xhr.status)
        console.error("XHR Response:", xhr.responseText)
        reject(new Error("Network error during S3 upload. Please check your internet connection and try again."))
      })

      xhr.addEventListener("timeout", () => {
        reject(new Error("S3 upload timeout. Please try again with a smaller file."))
      })
    })

    // Create FormData for presigned POST
    const formData = new FormData()

    // Add all the fields from presigned POST first (ORDER MATTERS!)
    if (presignedData.fields) {
      Object.entries(presignedData.fields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // Add the file last (this is critical for S3)
    formData.append("file", file)

    // Log for debugging
    console.log("Uploading to S3 URL:", presignedData.url || presignedData.uploadUrl)
    console.log("Presigned fields:", presignedData.fields)
    console.log("File type:", file.type)
    console.log("File size:", file.size)

    // Use POST method with the presigned URL
    xhr.open("POST", presignedData.url || presignedData.uploadUrl)

    // Don't set any headers manually - let the browser handle CORS and Content-Type
    // The browser will automatically set Content-Type with proper boundary for multipart/form-data

    xhr.send(formData)

    return uploadPromise
  } catch (error) {
    console.error("Error uploading to S3:", error)
    throw error
  }
}

// NEW: Save video metadata after S3 upload
export async function saveVideoAfterUpload(videoData) {
  if (!isBrowser) {
    throw new Error("Save operation can only be performed in browser environment")
  }

  try {
    const token = localStorage.getItem("authToken")

    const response = await fetch(`${BASEURL}/api/videos/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(videoData),
    })

    if (!response.ok) {
      throw new Error(`Failed to save video: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving video:", error)
    throw error
  }
}

// NEW: Complete upload process (replaces uploadVideo)
export async function uploadVideoDirectly(file, title, description, onProgress) {
  try {
    console.log("Starting direct S3 upload process...")

    // Step 1: Get presigned URL
    const presignedData = await getPresignedUrl(file.name, file.type, file.size)
    console.log("Got presigned URL:", presignedData)

    // Step 2: Upload directly to S3 using presigned POST data
    await uploadToS3(file, presignedData, onProgress)
    console.log("S3 upload completed")

    // Step 3: Save video metadata to database
    const videoData = {
      title,
      description,
      s3Key: presignedData.key,
      fileSize: file.size,
    }

    const result = await saveVideoAfterUpload(videoData)
    console.log("Video metadata saved:", result)

    return result
  } catch (error) {
    console.error("Direct upload failed:", error)
    throw error
  }
}

// Upload a new video (EXISTING - Keep for backward compatibility)
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
  console.log(`[shareVideo] Attempting to call backend /api/videos/${id}/share`)
  try {
    const response = await fetch(`${BASEURL}/api/videos/${id}/share`, {
      method: "POST",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[shareVideo] Backend response not OK: Status ${response.status}, Body: ${errorText}`)
      throw new Error(`Failed to share video: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[shareVideo] Backend share successful:", data)
    return data // Return data to update frontend state
  } catch (error) {
    console.error(`[shareVideo] Error sharing video ${id}:`, error)
    throw error // Re-throw to be caught by frontend component
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
// Now accepts searchParams to pass to the backend for linkClicks
export async function getVideo(id, searchParams = {}) {
  try {
    const url = new URL(`${BASEURL}/api/videos/${id}`)
    // Append searchParams to the URL
    for (const key in searchParams) {
      if (searchParams.hasOwnProperty(key)) {
        url.searchParams.append(key, searchParams[key])
      }
    }

    console.log(`[api.jsx] Fetching video from: ${url.toString()}`)
    const response = await fetch(url.toString())

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
      linkClicks: video.linkClicks || 0, // Include linkClicks in the returned video object
    }
  } catch (error) {
    console.error(`Error fetching video ${id}:`, error)
    throw error
  }
}

// NEW: Increment video view count
export async function incrementVideoView(id) {
  if (!isBrowser) {
    throw new Error("View increment can only be performed in browser environment")
  }

  try {
    console.log(`[incrementVideoView] Calling backend ${BASEURL}/api/videos/${id}/view`)
    const response = await fetch(`${BASEURL}/api/videos/${id}/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[incrementVideoView] Backend response not OK: Status ${response.status}, Body: ${errorText}`)
      throw new Error(`Failed to increment view: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[incrementVideoView] Backend view increment successful:", data)
    return data // Return data to update frontend state
  } catch (error) {
    console.error(`[incrementVideoView] Error incrementing view for video ${id}:`, error)
    // Do not re-throw, as view increment is a background task and shouldn't block UI
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
  // Get the site URL from environment variables or current location
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  // If in browser and no environment variable, use current origin
  if (!siteUrl && isBrowser) {
    siteUrl = window.location.origin
  }

  // Fallback to your production domain
  if (!siteUrl) {
    siteUrl = "http://api.5mof.gg"
  }

  // Always return the full URL for proper sharing, and add a source parameter
  const shareUrl = `${siteUrl}/video/${id}?source=share`
  console.log("[api.jsx] Generated share URL:", shareUrl)
  return shareUrl
}

export { fetchVideos as getVideos }
