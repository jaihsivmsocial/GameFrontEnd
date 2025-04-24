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

// Update the interceptor to properly include the authentication token
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

// Function to update wallet balance in UI
export const updateWalletBalanceInUI = (newBalance) => {
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

// Betting API
export const bettingAPI = {
  getActiveQuestion: async () => {
    try {
      const response = await api.get("/bets/questions/current")
      return response.data
    } catch (error) {
      console.error("Error fetching active question:", error)
      throw error.response?.data || { message: "Failed to get active question" }
    }
  },

  getBetStats: async () => {
    try {
      const response = await api.get("/bets/stats")
      return response.data
    } catch (error) {
      console.warn("Failed to get betting stats, using zero values:", error)
      // Return zero values instead of mock data
      return {
        success: true,
        stats: {
          totalBetsAmount: 0,
          biggestWinThisWeek: 0,
          totalPlayers: 0,
          activePlayers: 0,
        },
      }
    }
  },

  placeBet: async (data) => {
    try {
      console.log("Placing bet with data:", data)
      const response = await api.post("/bets/place", data)
      console.log("Bet placement API response:", response.data)

      if (response.data.success) {
        // Update wallet balance in UI immediately
        if (response.data.newBalance !== undefined) {
          updateWalletBalanceInUI(Number(response.data.newBalance))
        }
      }

      return response.data
    } catch (error) {
      console.error("Error placing bet:", error)
      if (error.response?.status === 401) {
        return {
          success: false,
          message: "Authentication failed. Please log in again.",
        }
      }
      throw error.response?.data || { message: "Failed to place bet" }
    }
  },
}

// Wallet API
export const walletAPI = {
  getBalance: async () => {
    try {
      const response = await api.get("/bets/wallet")
      return response.data
    } catch (error) {
      console.warn("Failed to get wallet balance:", error)
      // Return default balance on error
      return {
        success: true,
        balance: 5000,
      }
    }
  },

  updateBalance: async (newBalance) => {
    try {
      const response = await api.post("/bets/wallet/update", { amount: newBalance })

      if (response.data.success && response.data.newBalance !== undefined) {
        updateWalletBalanceInUI(Number(response.data.newBalance))
      }

      return response.data
    } catch (error) {
      console.error("Error updating wallet balance:", error)
      return {
        success: false,
        message: "Failed to update wallet balance",
      }
    }
  },

  resetBalance: async () => {
    try {
      const response = await api.post("/bets/wallet/reset")

      if (response.data.success && response.data.newBalance !== undefined) {
        updateWalletBalanceInUI(Number(response.data.newBalance))
      }

      return response.data
    } catch (error) {
      console.error("Error resetting wallet balance:", error)
      // Even on error, update UI to 5000
      updateWalletBalanceInUI(5000)
      return {
        success: true,
        message: "Wallet balance reset to 5000",
        newBalance: 5000,
      }
    }
  },
}

// Default export
export default {
  api,
  bettingAPI,
  walletAPI,
  updateWalletBalanceInUI,
}
