"use client"

import { useState, useEffect } from "react"
import betService from "../../components/subscribes/bet-service"
import { walletAPI, updateWalletBalanceUI } from "../../components/wallet-service/api"
export const useBetHandler = () => {
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [amountNeeded, setAmountNeeded] = useState(0)
    const [currentBalance, setCurrentBalance] = useState(0)
    const [pendingBetData, setPendingBetData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [betSuccess, setBetSuccess] = useState(false)
  
    // Fetch wallet balance on mount
    useEffect(() => {
      fetchWalletBalance()
    }, [])
  
    // Listen for wallet balance updates
    useEffect(() => {
      const handleWalletUpdate = (event) => {
        if (event.detail && event.detail.newBalance !== undefined) {
          setCurrentBalance(event.detail.newBalance)
        }
      }
  
      window.addEventListener("wallet_balance_updated", handleWalletUpdate)
      return () => {
        window.removeEventListener("wallet_balance_updated", handleWalletUpdate)
      }
    }, [])
  
    const fetchWalletBalance = async () => {
      try {
        const response = await walletAPI.getBalance()
        if (response.success && response.balance !== undefined) {
          setCurrentBalance(response.balance)
        }
      } catch (err) {
        console.error("Error fetching wallet balance:", err)
      }
    }
  
    const placeBet = async (betData) => {
      setLoading(true)
      setError(null)
      setBetSuccess(false)
  
      try {
        const response = await betService.placeBet(betData)
  
        // Check if the bet was successful
        if (response.success === true) {
          // Bet placed successfully
          setBetSuccess(true)
  
          // Update wallet balance if provided
          if (response.newBalance !== undefined) {
            updateWalletBalanceUI(response.newBalance)
            setCurrentBalance(response.newBalance)
          }
  
          setLoading(false)
          return { success: true, data: response }
        }
        // Check if there are insufficient funds
        else if (response.insufficientFunds === true) {
          console.log("Insufficient funds detected from API:", response)
          // Store the exact amount needed and bet data
          const exactAmountNeeded = response.amountNeeded || 0
          console.log("Setting exact amount needed:", exactAmountNeeded)
          setAmountNeeded(exactAmountNeeded)
          setCurrentBalance(response.currentBalance || 0)
          setPendingBetData(betData)
          // Show the payment modal
          setShowPaymentModal(true)
          setLoading(false)
          return { success: false, insufficientFunds: true, data: response }
        }
        // Other error
        else {
          setError(response.message || "Failed to place bet")
          setLoading(false)
          return { success: false, data: response }
        }
      } catch (err) {
        console.error("Error placing bet:", err)
        setError(err.message || "An error occurred while placing your bet")
        setLoading(false)
        return { success: false, error: err }
      }
    }
  
    const handlePaymentSuccess = async (paymentData) => {
      // After successful payment, try to place the bet again
      if (pendingBetData) {
        setLoading(true)
        try {
          const response = await betService.placeBet(pendingBetData)
          if (response.success) {
            // Bet placed successfully after payment
            setBetSuccess(true)
            setPendingBetData(null)
            setAmountNeeded(0)
  
            // Update wallet balance if provided
            if (response.newBalance !== undefined) {
              updateWalletBalanceUI(response.newBalance)
              setCurrentBalance(response.newBalance)
            }
  
            setLoading(false)
            return { success: true, data: response }
          } else {
            setError(response.message || "Failed to place bet after payment")
            setLoading(false)
            return { success: false, data: response }
          }
        } catch (err) {
          console.error("Error placing bet after payment:", err)
          setError(err.message || "An error occurred while placing your bet after payment")
          setLoading(false)
          return { success: false, error: err }
        }
      }
    }
  
    const handlePaymentError = (error) => {
      console.error("Payment error:", error)
      setError("Payment failed: " + (error.message || "Unknown error"))
    }
  
    const closePaymentModal = () => {
      setShowPaymentModal(false)
      // Don't clear pendingBetData here in case user wants to try again
    }
  
    // Update the openPaymentModal function to ensure it always sets a valid amount
    const openPaymentModal = (customAmount) => {
      // Always set a valid amount - never default to 0
      if (customAmount && customAmount > 0) {
        console.log("Opening payment modal with custom amount:", customAmount)
        setAmountNeeded(customAmount)
      } else if (amountNeeded <= 0) {
        console.log("No amount needed specified, waiting for API response")
        // Don't set any default amount here
      }
  
      setShowPaymentModal(true)
    }
  
    return {
      placeBet,
      loading,
      error,
      betSuccess,
      showPaymentModal,
      amountNeeded,
      currentBalance,
      pendingBetData,
      handlePaymentSuccess,
      handlePaymentError,
      closePaymentModal,
      openPaymentModal,
    }
  }
  
  
