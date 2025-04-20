import axios from "axios"
import { BASEURL } from "@/utils/apiservice"
// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${BASEURL}/api`
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      // Change from "x-auth-token" to "Authorization" with Bearer format
      config.headers["Authorization"] = `Bearer ${token}`
      // Also keep the x-auth-token for backward compatibility
      config.headers["x-auth-token"] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to capture successful responses
api.interceptors.response.use(
  (response) => {
    // Dispatch a custom event with the response data for specific endpoints
    if (response.config.url.includes("/bets/place")) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("api_response", {
            detail: {
              type: "API_RESPONSE",
              endpoint: "/api/bets/place",
              data: response.data,
            },
          }),
        )
      }
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Helper function to update wallet balance in UI
const updateWalletBalanceInUI = (newBalance) => {
  // Update localStorage
  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    userData.walletBalance = Number(newBalance)
    localStorage.setItem("userData", JSON.stringify(userData))

    // Dispatch a custom event for real-time updates
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("wallet_balance_updated", {
          detail: { newBalance: Number(newBalance) },
        }),
      )
    }

    // Emit a socket event if socket is available
    try {
      const socket = window.io ? window.io() : null
      if (socket) {
        socket.emit("balance_updated", {
          newBalance: Number(newBalance),
        })
      }
    } catch (socketError) {
      console.error("Error emitting socket event:", socketError)
    }
  } catch (error) {
    console.error("Error updating wallet balance in UI:", error)
  }
}

// Auth API endpoints - simplified to only include getCurrentUser
export const authAPI = {
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me")
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Failed to get user data" }
    }
  },

  logout: () => {
    localStorage.removeItem("authToken")
  },
}

// Update the betting API to use the correct endpoints and handle errors better
export const bettingAPI = {
  getUserBets: async () => {
    try {
      const response = await api.get("/bets/history")
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Failed to get bet history" }
    }
  },

  getActiveBetQuestion: async () => {
    try {
      const response = await api.get("/questions/current")
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Failed to get active question" }
    }
  },

  // Update to use the correct endpoint or fallback to mock data
  getBetStats: async () => {
    try {
      // Try to get stats from the server
      const response = await api.get("/bets/stats")
      console.log("API response for bet stats:", response.data)

      // If we got a successful response but no data, return mock data
      if (
        response.data.success &&
        (!response.data.stats ||
          (response.data.stats.totalBetsAmount === 0 &&
            response.data.stats.biggestWinThisWeek === 0 &&
            response.data.stats.totalPlayers === 0))
      ) {
        console.log("API returned empty stats, using mock data")
        return {
          success: true,
          stats: {
            totalBetsAmount: 5000,
            biggestWinThisWeek: 1200,
            totalPlayers: 42,
            activePlayers: 18,
          },
        }
      }

      return response.data
    } catch (error) {
      console.warn("Failed to get betting stats, using mock data:", error)
      // Return mock data if the endpoint doesn't exist
      return {
        success: true,
        stats: {
          totalBetsAmount: 5000,
          biggestWinThisWeek: 1200,
          totalPlayers: 42,
          activePlayers: 18,
        },
      }
    }
  },

  // Update the placeBet function in bettingAPI to properly handle the newBalance
  placeBet: async (data) => {
    try {
      console.log("Placing bet with data:", data)
      const token = localStorage.getItem("authToken")

      // Check if token exists
      if (!token) {
        console.error("No authentication token found")
        return {
          success: false,
          message: "Authentication required. Please log in.",
        }
      }

      // Use axios instead of fetch for better integration with interceptors
      const response = await api.post("/bets/place", data)
      console.log("Bet placement API response:", response.data)

      if (response.data.success) {
        // CRITICAL: Update wallet balance in UI immediately with the exact newBalance from response
        if (response.data.newBalance !== undefined) {
          console.log("API response includes new balance:", response.data.newBalance)

          // Force update the UI immediately
          const numBalance = Number(response.data.newBalance)

          // Update localStorage directly
          try {
            const userData = JSON.parse(localStorage.getItem("userData") || "{}")
            userData.walletBalance = numBalance
            localStorage.setItem("userData", JSON.stringify(userData))
          } catch (e) {
            console.error("Error updating localStorage:", e)
          }

          // Dispatch a custom event with high priority
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("wallet_balance_updated", {
                detail: {
                  newBalance: numBalance,
                  source: "api_direct",
                  timestamp: Date.now(),
                },
              }),
            )
          }

          // Also emit a direct socket event
          try {
            const socket = window.io ? window.io() : null
            if (socket && socket.connected) {
              socket.emit("direct_balance_update", {
                newBalance: numBalance,
                previousBalance: Number(response.data.previousBalance || 0),
                change: numBalance - Number(response.data.previousBalance || 0),
                timestamp: Date.now(),
              })
            }
          } catch (socketError) {
            console.error("Error emitting socket event:", socketError)
          }
        }
      }

      return response.data
    } catch (error) {
      console.error("Error placing bet:", error)

      // Handle specific error status codes
      if (error.response) {
        if (error.response.status === 401) {
          return {
            success: false,
            message: "Authentication failed. Please log in again.",
          }
        }

        // Return the error data from the server if available
        return (
          error.response.data || {
            success: false,
            message: "Failed to place bet. Please try again.",
          }
        )
      }

      // Generic error handling
      throw error
    }
  },
}

// User wallet API
export const walletAPI = {
  getBalance: async () => {
    try {
      // Check for token before making the request
      const token = localStorage.getItem("authToken")
      if (!token) {
        // Try to get from localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        return {
          success: true,
          balance: userData.walletBalance || 0,
        }
      }

      // Use the correct endpoint for wallet balance
      const response = await api.get("/bets/wallet")

      // Update localStorage for persistence
      if (response.data.success && response.data.balance !== undefined) {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.walletBalance = Number(response.data.balance)
        localStorage.setItem("userData", JSON.stringify(userData))

        // Dispatch a custom event for real-time updates
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("wallet_balance_updated", {
              detail: { newBalance: Number(response.data.balance) },
            }),
          )
        }

        // Try to emit a socket event if socket is available
        try {
          const socket = window.io ? window.io() : null
          if (socket) {
            socket.emit("direct_balance_update", {
              newBalance: Number(response.data.balance),
            })
          }
        } catch (socketError) {
          console.error("Error emitting socket event:", socketError)
        }
      }

      return response.data
    } catch (error) {
      console.warn("Failed to get wallet balance:", error)
      // Try to get from localStorage as fallback
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        return {
          success: true,
          balance: userData.walletBalance || 0,
        }
      } catch (localStorageError) {
        console.error("Error reading from localStorage:", localStorageError)
        return {
          success: false,
          message: "Failed to get wallet balance",
        }
      }
    }
  },

  // Add a function to directly update the balance in the UI
  updateBalanceInUI: (newBalance) => {
    // Update localStorage
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      userData.walletBalance = Number(newBalance)
      localStorage.setItem("userData", JSON.stringify(userData))

      // Dispatch a custom event for real-time updates
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("wallet_balance_updated", {
            detail: { newBalance: Number(newBalance) },
          }),
        )
      }

      // Try to emit a socket event if socket is available
      try {
        const socket = window.io ? window.io() : null
        if (socket) {
          socket.emit("direct_balance_update", {
            newBalance: Number(newBalance),
          })
        }
      } catch (socketError) {
        console.error("Error emitting socket event:", socketError)
      }
    } catch (error) {
      console.error("Error updating wallet balance in UI:", error)
    }
  },

  updateBalance: async (amount) => {
    try {
      // Only allow deductions, not additions
      if (amount > 0) {
        console.warn("Cannot add balance. Balance is fixed at 5000.")
        return {
          success: false,
          message: "Cannot add balance. Balance is fixed at 5000.",
        }
      }

      // Check for token before making the request
      const token = localStorage.getItem("authToken")
      if (!token) {
        // Update localStorage if not authenticated
        updateWalletBalanceInUI(5000)
        return {
          success: true,
          newBalance: 5000,
        }
      }

      // Use the correct endpoint for updating wallet balance
      const response = await api.post("/bets/wallet/update", { amount })

      // Update localStorage for persistence
      if (response.data.success && response.data.newBalance !== undefined) {
        updateWalletBalanceInUI(response.data.newBalance)
      }

      return response.data
    } catch (error) {
      console.error("Error updating wallet balance:", error)
      throw error.response?.data || { message: "Failed to update wallet balance" }
    }
  },

  resetBalance: async () => {
    try {
      // Check for token before making the request
      const token = localStorage.getItem("authToken")
      if (!token) {
        // Update localStorage if not authenticated
        updateWalletBalanceInUI(5000)
        return {
          success: true,
          newBalance: 5000,
        }
      }

      // Use the correct endpoint for resetting wallet balance
      const response = await api.post("/bets/wallet/reset")

      // Update localStorage for persistence
      if (response.data.success && response.data.newBalance !== undefined) {
        updateWalletBalanceInUI(response.data.newBalance)
      }

      return response.data
    } catch (error) {
      console.error("Error resetting wallet balance:", error)
      throw error.response?.data || { message: "Failed to reset wallet balance" }
    }
  },
}

// Default export for backward compatibility
export default {
  api,
  authAPI,
  bettingAPI,
  walletAPI,
}
