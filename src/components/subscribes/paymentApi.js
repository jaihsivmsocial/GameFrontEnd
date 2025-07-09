import axios from "axios"
import { BASEURL } from "@/utils/apiservice"

const API_URL = `${BASEURL}/api`

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

const getAuthToken = () => {
  try {
    const authToken = localStorage.getItem("authToken")
    if (authToken) {
      return authToken
    }
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    if (userData.token) {
      return userData.token
    }
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

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export const paymentApi = {
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

  confirmPayment: async (paymentId, confirmData) => {
    try {
      const response = await api.post(`/payments/confirm/${paymentId}`, confirmData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error confirming payment" }
    }
  },

  getPaymentMethods: async () => {
    try {
      console.log("Fetching payment methods from API")
      const response = await api.get("/payments/methods")
      console.log("API response:", response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      return { paymentMethods: [] }
    }
  },

  addPaymentMethod: async (paymentMethodData) => {
    try {
      const response = await api.post("/payments/methods", paymentMethodData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error adding payment method" }
    }
  },

  deletePaymentMethod: async (methodId) => {
    try {
      const response = await api.delete(`/payments/methods/${methodId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error deleting payment method" }
    }
  },

  getPaymentHistory: async (params = {}) => {
    try {
      const response = await api.get("/payments/history", { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error getting payment history" }
    }
  },

  getPaymentById: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error getting payment" }
    }
  },

  createSetupIntent: async () => {
    try {
      const response = await api.post("/payments/setup-intent")
      return response.data
    } catch (error) {
      throw error.response?.data || { message: "Error creating setup intent" }
    }
  },

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

  getWalletBalance: async () => {
    console.log("paymentApi: Fetching wallet balance (mock)...")
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { walletBalance: 1500.0 }
  },
}

export default paymentApi
