"use client"

import { useState, useRef } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import { uploadVideo } from "@/components/clipsorts/api"
import { useAuth } from "@/components/clipsorts/context/AuthContext"

export default function UploadModal({ show, onHide, onVideoUploaded }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const { isAuthenticated, openLoginModal } = useAuth()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]

    if (!selectedFile) return

    // Check file type
    if (!selectedFile.type.startsWith("video/")) {
      setError("Please select a video file")
      return
    }

    // Check file size (100MB limit)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("File size exceeds 100MB limit")
      return
    }

    setFile(selectedFile)
    setError("")

    // Create video preview
    const url = URL.createObjectURL(selectedFile)
    setPreview(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      openLoginModal()
      return
    }

    if (!file) {
      setError("Please select a video file")
      return
    }

    if (!title.trim()) {
      setError("Please enter a title")
      return
    }

    try {
      setUploading(true)
      setProgress(0)

      const formData = new FormData()
      formData.append("video", file)
      formData.append("title", title)
      formData.append("description", description)

      // Add detailed logging
      console.log("Starting video upload...")
      console.log("Form data:", {
        videoName: file.name,
        videoSize: file.size,
        videoType: file.type,
        title,
        description: description || "(empty)",
      })

      const response = await uploadVideo(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setProgress(percentCompleted)
        console.log(`Upload progress: ${percentCompleted}%`)
      })

      console.log("Upload completed successfully, response:", response)

      // Make sure we have a valid video object before calling onVideoUploaded
      if (response && response.success && response.video) {
        // Process the video data to match our expected format
        const processedVideo = {
          id: response.video.id || response.video._id,
          url: response.video.videoUrl || response.video.url,
          title: response.video.title || title,
          description: response.video.description || description,
          user: {
            username: response.video.username || localStorage.getItem("username") || "user",
            avatar: response.video.userAvatar || "/placeholder.svg?height=40&width=40",
          },
          likesCount: 0,
          comments: [],
          createdAt: response.video.createdAt || new Date().toISOString(),
        }

        console.log("Processed video for UI:", processedVideo)
        onVideoUploaded(processedVideo)
      } else {
        console.error("Invalid video data received from server:", response)
        setError("Upload succeeded but received invalid data. Please refresh the page.")
      }

      resetForm()
    } catch (error) {
      console.error("Upload failed:", error)
      setError(error.message || "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreview(null)
    setTitle("")
    setDescription("")
    setError("")
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    resetForm()
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" contentClassName="bg-dark text-white">
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title>Upload New Clip</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!isAuthenticated ? (
          <div className="text-center py-4">
            <p>Please log in to upload videos</p>
            <Button
              variant="primary"
              onClick={openLoginModal}
              style={{
                background: "linear-gradient(90deg, #00a0e9 0%, #0073d5 50%, #0046c0 100%)",
                border: "none",
              }}
            >
              Log In
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="upload-area mb-4">
              {!file ? (
                <div
                  className="d-flex flex-column align-items-center justify-content-center p-5 border border-dashed rounded"
                  style={{ borderColor: "#0073d5", minHeight: "200px", cursor: "pointer" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-3"></i>
                  <p className="mb-1">Click to select or drag and drop your video</p>
                  <p className="text-muted small">MP4, MOV, AVI, MKV, WEBM (Max 100MB)</p>
                </div>
              ) : (
                <div className="position-relative">
                  <video src={preview} controls className="w-100 rounded" style={{ maxHeight: "300px" }} />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-2"
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                </div>
              )}
              <Form.Control
                type="file"
                accept="video/*"
                className="d-none"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter a title for your clip"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                maxLength={100}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add a description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                maxLength={500}
              />
            </Form.Group>

            {uploading && (
              <div className="mb-3">
                <p className="mb-1">Uploading: {progress}%</p>
                <div className="progress" style={{ height: "10px" }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #00a0e9 0%, #0073d5 50%, #0046c0 100%)",
                    }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClose} disabled={uploading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={uploading || !file || !title.trim()}
                style={{
                  background: "linear-gradient(90deg, #00a0e9 0%, #0073d5 50%, #0046c0 100%)",
                  border: "none",
                }}
              >
                {uploading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  )
}
