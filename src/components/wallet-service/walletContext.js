"use client"

import { createContext, useContext, useState, useEffect, useRef } from "react"
import { walletAPI } from "../../components/wallet-service/api"

const WalletContext = createContext({
    balance: 5000,
    updateBalance: () => {},
    loading: false,
  })
  
  // Provider component
  export const WalletProvider = ({ children }) => {
    // Update the initial state to 0 instead of 5000
    const [balance, setBalance] = useState(5000)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
  
    // Use a ref to track the latest balance for socket handlers
    const balanceRef = useRef(balance)
  
    // Update the ref whenever balance changes
    useEffect(() => {
      balanceRef.current = balance
    }, [balance])
  
    // Expose the context to window for emergency direct updates
    useEffect(() => {
      if (typeof window !== "undefined") {
        window.__walletContext = { updateBalance: forceUpdateBalance }
  
        // Add a direct update function to window
        window.__updateGlobalBalance = (newBalance) => {
          forceUpdateBalance(Number(newBalance))
        }
      }
  
      return () => {
        if (typeof window !== "undefined") {
          delete window.__walletContext
          delete window.__updateGlobalBalance
        }
      }
    }, [])
  
    // Update the useEffect hook to properly handle direct API responses
    useEffect(() => {
      const fetchWalletBalance = async () => {
        try {
          setLoading(true)
          const token = localStorage.getItem("authToken")
  
          if (token) {
            // Try to get balance from API
            try {
              const response = await walletAPI.getBalance()
              if (response.success && response.balance !== undefined) {
                console.log("Initial wallet balance from API:", response.balance)
                setBalance(Number(response.balance))
  
                // Also update in localStorage for persistence
                const userData = JSON.parse(localStorage.getItem("userData") || "{}")
                userData.walletBalance = Number(response.balance)
                localStorage.setItem("userData", JSON.stringify(userData))
              }
            } catch (apiError) {
              console.error("API error fetching wallet balance:", apiError)
  
              // Try to get from localStorage as fallback
              const userData = JSON.parse(localStorage.getItem("userData") || "{}")
              if (userData.walletBalance !== undefined) {
                setBalance(Number(userData.walletBalance))
              }
            }
          } else {
            // Not logged in, try to get from localStorage
            const userData = JSON.parse(localStorage.getItem("userData") || "{}")
            if (userData.walletBalance !== undefined) {
              setBalance(Number(userData.walletBalance))
            }
          }
        } catch (err) {
          console.error("Error fetching wallet balance:", err)
          setError("Failed to load wallet balance")
  
          // Try to get from localStorage as fallback
          try {
            const userData = JSON.parse(localStorage.getItem("userData") || "{}")
            if (userData.walletBalance !== undefined) {
              setBalance(Number(userData.walletBalance))
            }
          } catch (localStorageError) {
            console.error("Error reading from localStorage:", localStorageError)
          }
        } finally {
          setLoading(false)
        }
      }
  
      fetchWalletBalance()
  
      // Set up socket listener for wallet updates
      try {
        const socket = window.io ? window.io() : null
        if (socket) {
          // Listen for wallet_update events
          socket.on("wallet_update", (data) => {
            console.log("Wallet update received in context:", data)
            if (data.newBalance !== undefined) {
              console.log("Setting balance to:", data.newBalance)
              setBalance(Number(data.newBalance))
  
              // Update localStorage
              const userData = JSON.parse(localStorage.getItem("userData") || "{}")
              userData.walletBalance = Number(data.newBalance)
              localStorage.setItem("userData", JSON.stringify(userData))
  
              // Emit a custom event for other components
              if (typeof window !== "undefined") {
                const event = new CustomEvent("wallet_balance_updated", {
                  detail: { newBalance: Number(data.newBalance) },
                })
                window.dispatchEvent(event)
              }
  
              // If the balance is not 5000, schedule a reset
              if (data.newBalance !== 5000) {
                resetBalanceToDefault()
              }
            }
          })
  
          // Listen for bet_response events
          socket.on("bet_response", (data) => {
            console.log("Bet response received in wallet context:", data)
            if (data.success && data.newBalance !== undefined) {
              console.log("Setting balance to:", data.newBalance)
              setBalance(Number(data.newBalance))
  
              // Update localStorage
              const userData = JSON.parse(localStorage.getItem("userData") || "{}")
              userData.walletBalance = Number(data.newBalance)
              localStorage.setItem("userData", JSON.stringify(userData))
  
              // Emit a custom event for other components
              if (typeof window !== "undefined") {
                const event = new CustomEvent("wallet_balance_updated", {
                  detail: { newBalance: Number(data.newBalance) },
                })
                window.dispatchEvent(event)
              }
  
              // If the balance is not 5000, schedule a reset
              if (data.newBalance !== 5000) {
                resetBalanceToDefault()
              }
            }
          })
  
          // Listen for direct_balance_update events
          socket.on("direct_balance_update", (data) => {
            console.log("Direct balance update received in wallet context:", data)
            if (data.newBalance !== undefined) {
              console.log("Setting balance to:", data.newBalance)
              setBalance(Number(data.newBalance))
  
              // Update localStorage
              const userData = JSON.parse(localStorage.getItem("userData") || "{}")
              userData.walletBalance = Number(data.newBalance)
              localStorage.setItem("userData", JSON.stringify(userData))
  
              // Emit a custom event for other components
              if (typeof window !== "undefined") {
                const event = new CustomEvent("wallet_balance_updated", {
                  detail: { newBalance: Number(data.newBalance) },
                })
                window.dispatchEvent(event)
              }
            }
          })
        }
      } catch (error) {
        console.error("Error setting up socket listeners:", error)
      }
  
      // Listen for custom wallet balance update events
      const handleWalletUpdate = (event) => {
        console.log("Custom wallet update event received in context:", event.detail)
        if (event.detail && event.detail.newBalance !== undefined) {
          console.log("Setting balance to:", event.detail.newBalance)
          setBalance(Number(event.detail.newBalance))
  
          // Update localStorage
          const userData = JSON.parse(localStorage.getItem("userData") || "{}")
          userData.walletBalance = Number(event.detail.newBalance)
          localStorage.setItem("userData", JSON.stringify(userData))
        }
      }
  
      window.addEventListener("wallet_balance_updated", handleWalletUpdate)
  
      // Add a direct API response listener
      const handleApiResponse = (event) => {
        if (event.detail && event.detail.type === "API_RESPONSE" && event.detail.endpoint === "/api/bets/place") {
          const responseData = event.detail.data
          console.log("API response intercepted in wallet context:", responseData)
  
          if (responseData.success && responseData.newBalance !== undefined) {
            console.log("Updating balance from API response:", responseData.newBalance)
            setBalance(Number(responseData.newBalance))
  
            // Update localStorage
            const userData = JSON.parse(localStorage.getItem("userData") || "{}")
            userData.walletBalance = Number(responseData.newBalance)
            localStorage.setItem("userData", JSON.stringify(userData))
  
            // Emit a custom event for other components
            const event = new CustomEvent("wallet_balance_updated", {
              detail: { newBalance: Number(responseData.newBalance) },
            })
            window.dispatchEvent(event)
          }
        }
      }
  
      window.addEventListener("api_response", handleApiResponse)
  
      // Listen for emergency force updates
      const handleForceUpdate = (event) => {
        if (event.detail && event.detail.newBalance !== undefined) {
          console.log("EMERGENCY FORCE UPDATE received:", event.detail)
          forceUpdateBalance(Number(event.detail.newBalance))
        }
      }
  
      window.addEventListener("FORCE_WALLET_UPDATE", handleForceUpdate)
  
      return () => {
        if (window.io) {
          const socket = window.io()
          socket.off("wallet_update")
          socket.off("bet_response")
          socket.off("direct_balance_update")
        }
        window.removeEventListener("wallet_balance_updated", handleWalletUpdate)
        window.removeEventListener("api_response", handleApiResponse)
        window.removeEventListener("FORCE_WALLET_UPDATE", handleForceUpdate)
      }
    }, [])
  
    const forceUpdateBalance = (newBalance) => {
      console.log("FORCE UPDATING WALLET BALANCE TO:", newBalance)
  
      // Convert to number to ensure consistency
      const numBalance = Number(newBalance)
  
      // Update state directly
      setBalance(numBalance)
  
      // Update localStorage
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.walletBalance = numBalance
        localStorage.setItem("userData", JSON.stringify(userData))
      } catch (error) {
        console.error("Error updating localStorage in force update:", error)
      }
  
      // Emit a custom event for other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("wallet_balance_updated", {
            detail: {
              newBalance: numBalance,
              source: "force_update",
              timestamp: Date.now(),
            },
          }),
        )
      }
  
      // Try to emit a socket event
      try {
        const socket = window.io ? window.io() : null
        if (socket && socket.connected) {
          socket.emit("direct_balance_update", {
            newBalance: numBalance,
            timestamp: Date.now(),
          })
        }
      } catch (socketError) {
        console.error("Error emitting socket event in force update:", socketError)
      }
    }
  
    // Then modify the updateBalance function to use forceUpdateBalance:
    const updateBalance = (newBalance) => {
      console.log("WalletContext: Updating balance to", newBalance)
  
      // Ensure newBalance is a number
      const balanceValue = Number(newBalance)
  
      // Update state
      setBalance(balanceValue)
  
      // Update localStorage
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.walletBalance = balanceValue
        localStorage.setItem("userData", JSON.stringify(userData))
      } catch (error) {
        console.error("Error updating localStorage in WalletContext:", error)
      }
  
      // Emit a custom event for other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("wallet_balance_updated", {
            detail: {
              newBalance: balanceValue,
              source: "wallet_context",
              timestamp: Date.now(),
            },
          }),
        )
      }
    }
  
    // Add this function to ensure the balance is reset to 5000 after a delay
    const resetBalanceToDefault = () => {
      setTimeout(() => {
        console.log("Resetting balance to 5000")
        setBalance(5000)
  
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.walletBalance = 5000
        localStorage.setItem("userData", JSON.stringify(userData))
  
        // Emit a custom event for other components
        if (typeof window !== "undefined") {
          const event = new CustomEvent("wallet_balance_updated", {
            detail: { newBalance: 5000 },
          })
          window.dispatchEvent(event)
        }
      }, 10000) // Reset after 10 seconds
    }
  
    return <WalletContext.Provider value={{ balance, updateBalance, loading, error }}>{children}</WalletContext.Provider>
  }
  
  // Custom hook to use the wallet context
  export const useWallet = () => {
    return useContext(WalletContext)
  }