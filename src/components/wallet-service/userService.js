import { BASEURL } from "@/utils/apiservice"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${BASEURL}/api`

// Get user data including wallet balance
export const getUserData = async () => {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      // Get from localStorage if not authenticated
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      return {
        username: userData.username || "Guest",
        walletBalance: userData.walletBalance || 0, // Return 0 instead of 5000
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
        walletBalance: userData.walletBalance || 0, // Return actual balance or 0
        level: userData.level || "1",
        xp: userData.xp || { current: 0, total: 1000 },
      }
    }

    const data = await response.json()

    // Use the actual wallet balance from the server
    const userData = {
      ...data.user,
    }

    // Store in localStorage for persistence
    localStorage.setItem(
      "userData",
      JSON.stringify({
        username: userData.username,
        walletBalance: userData.walletBalance,
        level: userData.level || "1",
        xp: userData.xp || { current: 0, total: 1000 },
      }),
    )

    return userData
  } catch (error) {
    console.error("Error fetching user data:", error)
    // Return default values if there's an error
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    return {
      username: userData.username || localStorage.getItem("username") || "Player",
      walletBalance: userData.walletBalance || 0, // Return actual balance or 0
      level: userData.level || "1",
      xp: userData.xp || { current: 0, total: 1000 },
    }
  }
}



// Update wallet balance - always returns 5000 after a brief delay
export const updateWalletBalance = async (amount) => {
  try {
    const token = localStorage.getItem("authToken")

    // If not authenticated, just update localStorage
    if (!token) {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      userData.walletBalance = amount
      localStorage.setItem("userData", JSON.stringify(userData))

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Dispatch event for UI updates
      window.dispatchEvent(
        new CustomEvent("wallet_balance_updated", {
          detail: { newBalance: amount },
        }),
      )

      return amount
    }

    // Make API request to update balance
    const response = await fetch(`${API_BASE_URL}/bets/wallet/update`, {
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

// Reset wallet balance to 5000
export const resetWalletBalance = async () => {
  try {
    const token = localStorage.getItem("authToken")

    // If not authenticated, just update localStorage
    if (!token) {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      userData.walletBalance = 0 // Reset to 0 instead of 5000
      localStorage.setItem("userData", JSON.stringify(userData))

      // Dispatch event for UI updates
      window.dispatchEvent(
        new CustomEvent("wallet_balance_updated", {
          detail: { newBalance: 0 },
        }),
      )

      return 0
    }

    // Make API request to reset balance
    const response = await fetch(`${API_BASE_URL}/bets/wallet/reset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 0 }), // Reset to 0 instead of 5000
    })

    if (!response.ok) {
      throw new Error("Failed to reset wallet balance")
    }

    const data = await response.json()

    // Update localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    userData.walletBalance = data.newBalance || 0
    localStorage.setItem("userData", JSON.stringify(userData))

    // Dispatch event for UI updates
    window.dispatchEvent(
      new CustomEvent("wallet_balance_updated", {
        detail: { newBalance: data.newBalance || 0 },
      }),
    )

    return data.newBalance || 0
  } catch (error) {
    console.error("Error resetting wallet balance:", error)

    // Even on error, ensure the UI shows 0
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    userData.walletBalance = 0
    localStorage.setItem("userData", JSON.stringify(userData))

    // Dispatch event for UI updates
    window.dispatchEvent(
      new CustomEvent("wallet_balance_updated", {
        detail: { newBalance: 0 },
      }),
    )

    return 0
  }
}

export default {
  getUserData,
  updateWalletBalance,
  getTransactionHistory,
  resetWalletBalance,
}
