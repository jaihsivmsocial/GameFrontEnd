"use client"

import { useEffect } from "react"

// Use the same baseUrl as in api.js
const baseUrl = "http://localhost:5000"

export default function ApiCheck() {
  useEffect(() => {
    // Just log to console instead of showing warnings
    const checkApiEndpoints = async () => {
      try {
        console.log("Checking API connectivity to:", baseUrl)
        const getResponse = await fetch(`${baseUrl}/api/videos/get`)
        console.log("API connectivity status:", getResponse.ok ? "Connected" : "Issue detected")
      } catch (error) {
        console.error("API connectivity check failed:", error)
      }
    }

    checkApiEndpoints()
  }, [])

  // Don't render anything
  return null
}
