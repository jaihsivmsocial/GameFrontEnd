import axios from "axios"
import { BASEURL } from "@/utils/apiservice"
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const API_URL = `${BASEURL}/api`;
// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Function to get auth token from storage
const getAuthToken = () => {
  try {
    // First try to get the token directly from localStorage
    const authToken = localStorage.getItem("authToken")
    if (authToken) {
      return authToken
    }

    // If not found, try from userData
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    if (userData.token) {
      return userData.token
    }

    // Finally try from authData
    const authData = JSON.parse(localStorage.getItem("authData") || "{}")
    if (authData.token) {
      return authData.token
    }

    return null
  } catch (e) {
    console.error("Error accessing localStorage:", e)
    return null
  }
}

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()

    if (token) {
      // Set Authorization header with Bearer format
      config.headers["Authorization"] = `Bearer ${token}`
      // Also set x-auth-token for backward compatibility
      config.headers["x-auth-token"] = token

      console.log(`Request to ${config.url}: Using token ${token.substring(0, 10)}...`)
    } else {
      console.warn(`Request to ${config.url}: No auth token available`)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Payment API functions
export const paymentApi = {
  // Check bet placement and get required amount if insufficient funds
  checkBetPlacement: async (betData) => {
    try {
      console.log("Checking bet placement with data:", betData)
      const response = await api.post("/bets/place", betData)
      return response.data
    } catch (error) {
      console.error("Error checking bet placement:", error)
      return error.response?.data || { message: "Error checking bet placement" }
    }
  },

  // Create a payment intent
  createPaymentIntent: async (paymentData) => {
    try {
      console.log("Creating payment intent with data:", paymentData)
      const response = await api.post("/payments/create-intent", paymentData)
      return response.data
    } catch (error) {
      console.error("Error creating payment intent:", error)
      throw error.response?.data || { message: "Error creating payment intent" }
    }
  },

  // Confirm a payment
  confirmPayment: async (paymentId, confirmData) => {
    try {
      const response = await api.post(`/payments/confirm/${paymentId}`, confirmData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error confirming payment" }
    }
  },

  // Get saved payment methods
  getPaymentMethods: async () => {
    try {
      console.log("Fetching payment methods from API")
      const response = await api.get("/payments/methods")
      console.log("API response:", response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      // Return empty array instead of throwing to prevent UI errors
      return { paymentMethods: [] }
    }
  },

  // Add a new payment method
  addPaymentMethod: async (paymentMethodData) => {
    try {
      const response = await api.post("/payments/methods", paymentMethodData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error adding payment method" }
    }
  },

  // Delete a payment method
  deletePaymentMethod: async (methodId) => {
    try {
      const response = await api.delete(`/payments/methods/${methodId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error deleting payment method" }
    }
  },

  // Get payment history
  getPaymentHistory: async (params = {}) => {
    try {
      const response = await api.get("/payments/history", { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error getting payment history" }
    }
  },

  // Get a single payment by ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error getting payment" }
    }
  },

  // Create a setup intent for saving a card
  createSetupIntent: async () => {
    try {
      const response = await api.post("/payments/setup-intent")
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error creating setup intent" }
    }
  },

  // Debug authentication state
  debugAuth: () => {
    const token = getAuthToken()
    console.log("Current auth token:", token ? token.substring(0, 10) + "..." : "none")

    console.log("localStorage contents:")
    console.log("- authToken:", localStorage.getItem("authToken") ? "exists" : "not found")

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      console.log("- userData.token:", userData.token ? "exists" : "not found")
    } catch (e) {
      console.log("- userData: invalid JSON")
    }

    try {
      const authData = JSON.parse(localStorage.getItem("authData") || "{}")
      console.log("- authData.token:", authData.token ? "exists" : "not found")
    } catch (e) {
      console.log("- authData: invalid JSON")
    }

    return {
      token,
      localStorage: {
        authToken: localStorage.getItem("authToken"),
        userData: localStorage.getItem("userData"),
        authData: localStorage.getItem("authData"),
      },
    }
  },
}

export default paymentApi
