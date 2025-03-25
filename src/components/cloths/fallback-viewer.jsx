"use client"

import React, { Component } from "react"

// Default placeholder image
const DEFAULT_IMAGE = "/placeholder.svg?height=200&width=200"

class FallbackViewer extends Component {
  constructor(props) {
    super(props)
    this.canvasRef = React.createRef()
    this.animationId = null
    this.rotation = 0
    this.state = {
      imageLoaded: false,
      error: false,
    }
  }

  componentDidMount() {
    this.initCanvas()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.modelPath !== this.props.modelPath) {
      this.initCanvas()
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.animationId)
  }

  initCanvas = () => {
    // Reset state
    this.setState({ imageLoaded: false, error: false })

    // For FBX models, we'll use a placeholder image
    const imageUrl = DEFAULT_IMAGE

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      this.img = img
      this.setState({ imageLoaded: true }, () => {
        this.drawImage()
        this.animate()
      })
    }

    img.onerror = (error) => {
      console.error("Failed to load image:", imageUrl, error)
      this.setState({ error: true })
    }

    img.src = imageUrl
  }

  drawImage = () => {
    if (!this.img || !this.canvasRef.current) return

    const canvas = this.canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context state
    ctx.save()

    // Move to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2)

    // Rotate
    ctx.rotate(this.rotation)

    // Scale image to fit
    const scale = Math.min((canvas.width / this.img.width) * 0.8, (canvas.height / this.img.height) * 0.8)

    // Draw image centered
    ctx.drawImage(
      this.img,
      (-this.img.width * scale) / 2,
      (-this.img.height * scale) / 2,
      this.img.width * scale,
      this.img.height * scale,
    )

    // Draw text indicating this is a fallback
    ctx.restore()
    ctx.fillStyle = "white"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText("3D Model Fallback", canvas.width / 2, canvas.height - 10)

    // Restore context state
    ctx.restore()
  }

  animate = () => {
    this.rotation += 0.01
    this.drawImage()
    this.animationId = requestAnimationFrame(this.animate)
  }

  render() {
    const { imageLoaded, error } = this.state
    const { width = 200, height = 200 } = this.props

    if (error) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-danger">
          <p>Model not available</p>
        </div>
      )
    }

    return (
      <div className="d-flex flex-column align-items-center justify-content-center h-100">
        <canvas ref={this.canvasRef} width={width} height={height} className="border border-secondary rounded" />
        {!imageLoaded && (
          <div className="position-absolute">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default FallbackViewer

