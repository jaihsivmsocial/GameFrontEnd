/**
 * API Service for interacting with the backend
 */
const apiService = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  
    /**
     * Helper method to get authentication token
     */
    getToken() {
      if (typeof window !== "undefined") {
        return localStorage.getItem("token")
      }
      return null
    },
  
    /**
     * Helper method for making API requests
     */
    async fetchApi(endpoint, options = {}) {
      const url = `${this.baseUrl}${endpoint}`
  
      // Set default headers
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      }
  
      // Add auth token if available
      const token = this.getToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
  
      // Add a unique client identifier
      const clientId = this.getClientId()
      if (clientId) {
        headers["X-Client-ID"] = clientId
      }
  
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        })
  
        // Parse JSON response
        const data = await response.json()
  
        // Handle API errors
        if (!response.ok) {
          throw new Error(data.error || "API request failed")
        }
  
        return data
      } catch (error) {
        console.error("API request error:", error)
        throw error
      }
    },
  
    /**
     * Generate or retrieve a unique client ID
     */
    getClientId() {
      if (typeof window === "undefined") return null
  
      let clientId = localStorage.getItem("clientId")
      if (!clientId) {
        clientId = `client-${Math.random().toString(36).substring(2, 15)}`
        localStorage.setItem("clientId", clientId)
      }
      return clientId
    },
  
    // Stream-related API methods
    async getActiveStreams() {
      return this.fetchApi("/streams")
    },
  
    async getStream(streamId) {
      return this.fetchApi(`/streams/${streamId}`)
    },
  
    async getViewerCount(streamId) {
      try {
        return this.fetchApi(`/streams/${streamId}/viewers`)
      } catch (error) {
        console.error(`Error fetching viewer count for stream ${streamId}:`, error)
        return { success: true, streamId, viewerCount: 0 }
      }
    },
  
    // New methods for manually incrementing/decrementing viewer counts
    async incrementViewerCount(streamId) {
      try {
        return this.fetchApi(`/streams/${streamId}/viewers/increment`, {
          method: "POST",
        })
      } catch (error) {
        console.error(`Error incrementing viewer count for stream ${streamId}:`, error)
        return { success: false }
      }
    },
  
    async decrementViewerCount(streamId) {
      try {
        return this.fetchApi(`/streams/${streamId}/viewers/decrement`, {
          method: "POST",
        })
      } catch (error) {
        console.error(`Error decrementing viewer count for stream ${streamId}:`, error)
        return { success: false }
      }
    },
  
    // WebRTC signaling API methods
    async sendOffer(streamId, offer, isViewer = false) {
      return this.fetchApi("/webrtc/offer", {
        method: "POST",
        body: JSON.stringify({ streamId, offer, isViewer }),
      })
    },
  
    async sendAnswer(streamId, answer) {
      return this.fetchApi("/webrtc/answer", {
        method: "POST",
        body: JSON.stringify({ streamId, answer }),
      })
    },
  
    async sendIceCandidate(streamId, candidate, isViewer = false) {
      return this.fetchApi("/webrtc/ice-candidate", {
        method: "POST",
        body: JSON.stringify({ streamId, candidate, isViewer }),
      })
    },
  }
  
  export default apiService
  
  