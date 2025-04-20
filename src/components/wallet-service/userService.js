// User service for handling user data and wallet operations
import BASEURL from "@/utils/apiservice"

const API_BASE_URL =  process.env.NEXT_PUBLIC_API_URL || `${BASEURL}/api`

// Get user data including wallet balance
export const getUserData = async () => {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      // Get from localStorage if not authenticated
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      return {
        username: userData.username || "Guest",
        walletBalance: userData.walletBalance || 300,
        level: userData.level || "1",
        xp: userData.xp || { current: 0, total: 1000 },
      }
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch user data:", response.statusText)
      // Fallback to localStorage
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      return {
        username: userData.username || localStorage.getItem("username") || "Player",
        walletBalance: userData.walletBalance || 300,
        level: userData.level || "1",
        xp: userData.xp || { current: 0, total: 1000 },
      }
    }

    const data = await response.json()

    // Store in localStorage for persistence
    localStorage.setItem(
      "userData",
      JSON.stringify({
        username: data.user.username,
        walletBalance: data.user.walletBalance,
        level: data.user.level || "1",
        xp: data.user.xp || { current: 0, total: 1000 },
      }),
    )

    return data.user
  } catch (error) {
    console.error("Error fetching user data:", error)
    // Return default values if there's an error
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    return {
      username: userData.username || localStorage.getItem("username") || "Player",
      walletBalance: userData.walletBalance || 300,
      level: userData.level || "1",
      xp: userData.xp || { current: 0, total: 1000 },
    }
  }
}

// Update wallet balance
export const updateWalletBalance = async (amount) => {
  try {
    const token = localStorage.getItem("authToken")

    // If not authenticated, just update localStorage
    if (!token) {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      userData.walletBalance = (userData.walletBalance || 300) + amount
      localStorage.setItem("userData", JSON.stringify(userData))
      return userData.walletBalance
    }

    const response = await fetch(`${API_BASE_URL}/users/wallet/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    })

    if (!response.ok) {
      throw new Error("Failed to update wallet balance")
    }

    const data = await response.json()

    // Update localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    userData.walletBalance = data.newBalance
    localStorage.setItem("userData", JSON.stringify(userData))

    return data.newBalance
  } catch (error) {
    console.error("Error updating wallet balance:", error)
    throw error
  }
}

// Get transaction history
export const getTransactionHistory = async () => {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/users/transactions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch transaction history")
    }

    const data = await response.json()
    return data.transactions
  } catch (error) {
    console.error("Error fetching transaction history:", error)
    throw error
  }
}
