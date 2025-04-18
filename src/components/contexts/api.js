// Frontend API utility functions for betting system

// Add a constant for the base URL
export const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Update the API_URL to use the BASEURL constant
const API_URL = `${BASEURL}/api`

// Get auth token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

// API request helper
const apiRequest = async (endpoint, method = "GET", data = null) => {
  const token = getToken()

  const headers = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const config = {
    method,
    headers,
    credentials: "include",
  }

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Something went wrong")
    }

    return result
  } catch (error) {
    console.error("API request error:", error)
    throw error
  }
}

// Betting API functions
export const bettingApi = {
  // Get active bet for a stream
  getActiveBet: (streamId) => {
    return apiRequest(`/bets/active/${streamId}`)
  },

  // Place a bet
  placeBet: (betId, amount, choice) => {
    return apiRequest("/bets/place", "POST", { betId, amount, choice })
  },

  // Get bet statistics
  getBetStatistics: (betId) => {
    return apiRequest(`/bets/statistics/${betId}`)
  },

  // Get user bet history
  getUserBetHistory: (page = 1, limit = 10) => {
    return apiRequest(`/bets/history?page=${page}&limit=${limit}`)
  },
}

// User API functions
export const userApi = {
  // Get user profile
  getUserProfile: () => {
    return apiRequest("/users/profile")
  },

  // Get user balance
  getUserBalance: () => {
    return apiRequest("/users/balance")
  },

  // Get user transaction history
  getUserTransactions: (page = 1, limit = 10, type = null) => {
    let endpoint = `/users/transactions?page=${page}&limit=${limit}`
    if (type) {
      endpoint += `&type=${type}`
    }
    return apiRequest(endpoint)
  },

  // Update user profile
  updateUserProfile: (data) => {
    return apiRequest("/users/profile", "PUT", data)
  },
}

export default {
  betting: bettingApi,
  user: userApi,
}
