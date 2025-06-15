"use client"

import { useState, useRef } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import { uploadVideoDirectly } from "@/components/clipsorts/api"
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
      setError("") // Clear any previous errors

      console.log("Starting upload process...")

      // Use direct S3 upload instead of backend upload
      const response = await uploadVideoDirectly(file, title, description, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setProgress(percentCompleted)
      })

      if (response && response.success && response.video) {
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

        onVideoUploaded(processedVideo)
        resetForm()
        onHide() // Close modal on successful upload
      }
    } catch (error) {
      console.error("Upload error:", error)

      // Provide more specific error messages based on error type
      if (error.message.includes("CORS") || error.message.includes("Access to XMLHttpRequest")) {
        setError(
          "Upload failed due to browser security restrictions. Please make sure S3 CORS is configured correctly.",
        )
      } else if (error.message.includes("Network error") || error.message.includes("net::ERR_FAILED")) {
        setError("Network error. Please check your internet connection and try again.")
      } else if (error.message.includes("timeout")) {
        setError("Upload timeout. Please try again with a smaller file or better internet connection.")
      } else if (error.message.includes("400")) {
        setError("Invalid file or upload parameters. Please try a different video file.")
      } else if (error.message.includes("403")) {
        setError("Upload not authorized. Please log in again.")
      } else if (error.message.includes("Failed to get upload URL")) {
        setError("Failed to get upload permission. Please check your authentication and try again.")
      } else if (error.message.includes("Failed to save video")) {
        setError("Video uploaded but failed to save details. Please contact support.")
      } else {
        setError(error.message || "Upload failed. Please try again.")
      }
    } finally {
      setUploading(false)
      setProgress(0)
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
    if (!uploading) {
      resetForm()
      onHide()
    }
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const droppedFile = files[0]

      // Simulate file input change
      const fakeEvent = {
        target: {
          files: [droppedFile],
        },
      }
      handleFileChange(fakeEvent)
    }
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
            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
              </div>
            )}

            <div className="upload-area mb-4">
              {!file ? (
                <div
                  className="d-flex flex-column align-items-center justify-content-center p-5 border border-dashed rounded"
                  style={{
                    borderColor: "#0073d5",
                    minHeight: "200px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-3"></i>
                  <p className="mb-1 fw-bold">Click to select or drag and drop your video</p>
                  <p className="text-muted small">MP4, MOV, AVI, MKV, WEBM (Max 100MB)</p>
                  <p className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    Files upload directly to secure cloud storage
                  </p>
                </div>
              ) : (
                <div className="position-relative">
                  <video
                    src={preview}
                    controls
                    className="w-100 rounded"
                    style={{ maxHeight: "300px" }}
                    onError={() => setError("Unable to preview video. File may be corrupted.")}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-2"
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                      setError("")
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                    disabled={uploading}
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                  <div className="mt-2 small text-muted">
                    <i className="bi bi-file-earmark-play me-1"></i>
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                </div>
              )}
              <Form.Control
                type="file"
                accept="video/*"
                className="d-none"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>

            <Form.Group className="mb-3">
              <Form.Label>
                Title <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter a title for your clip"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                maxLength={100}
                required
              />
              <Form.Text className="text-muted">{title.length}/100 characters</Form.Text>
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
              <Form.Text className="text-muted">{description.length}/500 characters</Form.Text>
            </Form.Group>

            {uploading && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">Uploading: {progress}%</span>
                  <small className="text-muted">
                    <i className="bi bi-cloud-upload me-1"></i>
                    Uploading directly to secure storage
                  </small>
                </div>
                <div className="progress" style={{ height: "12px" }}>
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
                <div className="text-center mt-2">
                  <small className="text-muted">Please don't close this window while uploading...</small>
                </div>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClose} disabled={uploading}>
                {uploading ? "Uploading..." : "Cancel"}
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
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload me-2"></i>
                    Upload
                  </>
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  )
}
