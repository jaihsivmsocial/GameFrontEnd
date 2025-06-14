"use client"

import { useState, useEffect, useRef } from "react"
import VideoCard from "@/components/clipsorts/VideoCard"

export default function VideoFeed({ videos, onLoadMore, hasMore, loading }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const observerRef = useRef(null)
  const loadMoreRef = useRef(null)
  const scrollContainerRef = useRef(null)

  // Set up intersection observer for videos
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.8,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number.parseInt(entry.target.dataset.index)
          setCurrentIndex(index)
        }
      })
    }, options)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Set up intersection observer for loading more videos
  useEffect(() => {
    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loading) {
          onLoadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (loadMoreRef.current) {
      loadMoreObserver.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        loadMoreObserver.unobserve(loadMoreRef.current)
      }
    }
  }, [hasMore, loading, onLoadMore])

  // Observe video elements
  useEffect(() => {
    const videoElements = document.querySelectorAll(".video-card")
    if (observerRef.current) {
      videoElements.forEach((el) => {
        observerRef.current.observe(el)
      })
    }

    return () => {
      if (observerRef.current) {
        videoElements.forEach((el) => {
          observerRef.current.unobserve(el)
        })
      }
    }
  }, [videos])

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div
        ref={scrollContainerRef}
        className="video-feed"
        style={{
          overflow: "auto",
          height: "calc(100vh - 60px)",
          scrollSnapType: "y mandatory",
          width: "100%",
          maxWidth: "480px", // Standard mobile width
          backgroundColor: "#000",
        }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="video-card"
            data-index={index}
            style={{
              height: "calc(100vh - 60px)",
              position: "relative",
              scrollSnapAlign: "start",
            }}
          >
            <VideoCard video={video} isActive={currentIndex === index} />
          </div>
        ))}

        {hasMore && (
          <div ref={loadMoreRef} className="d-flex justify-content-center py-4" style={{ height: "100px" }}>
            {loading && (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </div>
        )}

        {!hasMore && videos.length > 0 && <div className="text-center text-muted py-4">No more videos</div>}
      </div>
    </div>
  )
}
