"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import "bootstrap/dist/css/bootstrap.min.css"
import AuthHeaderButtons from "../components/register/SignupLogin"
import PaymentModal from "../components/subscribes/PaymentModal"
import { bettingAPI } from "../components/wallet-service/api"
import { socketEvents, initializeSocket, getSocket } from "../components/wallet-service/socketService"
import { walletAPI } from "../components/wallet-service/api"

export default function StreamBottomBar() {
  const [donationAmount, setDonationAmount] = useState("")
  const [betAmount, setBetAmount] = useState("100")
  const [giftToPlayer, setGiftToPlayer] = useState(false)
  const [addToPrizepool, setAddToPrizepool] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [initialAuthView, setInitialAuthView] = useState(null)
  const [activeMobileSection, setActiveMobileSection] = useState(null) // 'donate', 'bet', or null
  const [isMobile, setIsMobile] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false) // State for payment modal
  const [paymentAmount, setPaymentAmount] = useState(0) // Amount for payment
  const [paymentForBet, setPaymentForBet] = useState(false) // Flag to indicate if payment is for a bet
  const [pendingBetData, setPendingBetData] = useState(null) // Store pending bet data

  // New states for betting functionality
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [yesPercentage, setYesPercentage] = useState(50)
  const [noPercentage, setNoPercentage] = useState(50)
  const [totalBets, setTotalBets] = useState("$0")
  const [currentQuestionTotalBets, setCurrentQuestionTotalBets] = useState("$0")
  const [biggestWin, setBiggestWin] = useState("$0")
  const [currentQuestionPlayers, setCurrentQuestionPlayers] = useState(0)
  const [biggestWinDebug, setBiggestWinDebug] = useState(null)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [potentialPayout, setPotentialPayout] = useState("$0")
  const [isProcessing, setIsProcessing] = useState(false)
  const [betSuccess, setBetSuccess] = useState(false)
  const [betError, setBetError] = useState(null)
  // Add a new state variable for tracking players for the current question
  const [insufficientFunds, setInsufficientFunds] = useState(false)
  const [amountNeeded, setAmountNeeded] = useState(0)
  const [autoPlaceBetAfterPayment, setAutoPlaceBetAfterPayment] = useState(false) // New state to track if bet should be auto-placed

  // Get wallet balance from context
  const [walletBalance, setWalletBalance] = useState(0)

  // Add this function to update the wallet balance
  const updateWalletBalanceUI = (newBalance) => {
    console.log("Directly updating wallet balance to:", newBalance)
    setWalletBalance(newBalance)

    // Update localStorage for persistence
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    userData.walletBalance = newBalance
    localStorage.setItem("userData", JSON.stringify(userData))

    // Emit a custom event for other components
    if (typeof window !== "undefined") {
      const event = new CustomEvent("wallet_balance_updated", {
        detail: { newBalance: newBalance },
      })
      window.dispatchEvent(event)
    }
  }

  // Initialize wallet balance from localStorage on component mount
  useEffect(() => {
    // Get initial wallet balance from localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    if (userData.walletBalance !== undefined) {
      setWalletBalance(userData.walletBalance)
    }
  }, [])

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      setIsLoggedIn(true)
      // Get initial wallet balance
      fetchWalletBalance()
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Add a function to handle token expiration and automatic logout
  const handleTokenExpiration = () => {
    console.log("Token expired, logging out automatically")
    // Clear auth token
    localStorage.removeItem("authToken")
    // Clear user data
    localStorage.removeItem("userData")
    // Update login state
    setIsLoggedIn(false)
    // Show login modal
    setInitialAuthView("login")
    setShowAuthModal(true)
    // Show message
    setBetError("Your session has expired. Please log in again.")
  }

  // Add token expiration check to fetchWalletBalance function
  // Update the fetchWalletBalance function to ensure it uses the actual balance
  const fetchWalletBalance = async () => {
    try {
      console.log("Fetching wallet balance...")
      const response = await walletAPI.getBalance()
      console.log("Wallet balance response:", response)

      if (response.success && response.balance !== undefined) {
        console.log("Updating wallet balance to:", response.balance)
        // Ensure we're setting a number, not a string
        const balanceValue = Number(response.balance) || 0
        updateWalletBalanceUI(balanceValue)

        // Update localStorage for persistence
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.walletBalance = balanceValue
        localStorage.setItem("userData", JSON.stringify(userData))

        // Emit a custom event for other components
        if (typeof window !== "undefined") {
          const event = new CustomEvent("wallet_balance_updated", {
            detail: { newBalance: balanceValue },
          })
          window.dispatchEvent(event)
        }
      } else if (
        response.error &&
        (response.error.includes("token expired") ||
          response.error.includes("invalid token") ||
          response.error.includes("unauthorized") ||
          response.error.includes("Authentication required"))
      ) {
        // Handle expired token
        handleTokenExpiration()
      } else {
        console.warn("Invalid wallet balance response:", response)
        // Set balance to 0 if no valid balance is returned
        updateWalletBalanceUI(0)

        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.walletBalance = 0
        localStorage.setItem("userData", JSON.stringify(userData))

        // Emit a custom event for other components
        if (typeof window !== "undefined") {
          const event = new CustomEvent("wallet_balance_updated", {
            detail: { newBalance: 0 },
          })
          window.dispatchEvent(event)
        }
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error)

      // Check if the error is due to token expiration
      if (
        error.message &&
        (error.message.includes("token expired") ||
          error.message.includes("invalid token") ||
          error.message.includes("unauthorized") ||
          error.message.includes("Authentication required"))
      ) {
        handleTokenExpiration()
      } else {
        // Set balance to 0 on error
        updateWalletBalanceUI(0)

        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.walletBalance = 0
        localStorage.setItem("userData", JSON.stringify(userData))

        // Emit a custom event for other components
        if (typeof window !== "undefined") {
          const event = new CustomEvent("wallet_balance_updated", {
            detail: { newBalance: 0 },
          })
          window.dispatchEvent(event)
        }
      }
    }
  }

  // Calculate potential payout based on current odds with 5% platform fee
  const calculatePotentialPayout = (amount, choice) => {
    if (!amount || !choice || !currentQuestion) return 0

    // Convert amount to number if it's a string
    const betAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    if (isNaN(betAmount) || betAmount <= 0) return 0

    // Get the current odds based on yes/no percentages
    const yesPercentage = currentQuestion.yesPercentage || 50
    const noPercentage = currentQuestion.noPercentage || 50

    // Calculate odds based on the choice
    const odds = choice === "Yes" ? noPercentage / yesPercentage : yesPercentage / noPercentage

    // Apply platform fee (5%)
    const platformFee = 0.05

    // Calculate potential payout using the formula: bet * 2 * 0.95
    // This doubles the bet amount and then applies a 5% platform fee
    const potentialPayout = betAmount * 2 * (1 - platformFee)

    return potentialPayout
  }

  // Initialize socket connection and fetch active question
  useEffect(() => {
    // Initialize socket
    const socket = initializeSocket()

    // Fetch active question
    fetchActiveQuestion()

    // Fetch betting stats
    fetchBettingStats()

    // Listen for socket events with updated event names
    socketEvents.onNewQuestion((data) => {
      console.log("New question received:", data)
      setCurrentQuestion(data)
      setCountdown(30) // Reset countdown to 36 seconds
      setSelectedChoice(null) // Reset choice
      setBetAmount("100") // Reset bet amount
      setBetError(null) // Clear any error messages
      setBetSuccess(false) // Reset success state
      setCurrentQuestionTotalBets(formatCurrency(data.totalBetAmount || 0))
      setCurrentQuestionPlayers(data.totalPlayers || 0) // Set the player count for the new question
    })

    socketEvents.onBetPlaced((data) => {
      console.log("Bet placed event received:", data)
      if (data.questionId === currentQuestion?.id) {
        setYesPercentage(data.yesPercentage)
        setNoPercentage(data.noPercentage)

        // Update total bets and player count when a bet is placed
        if (data.totalBetAmount !== undefined) {
          setCurrentQuestionTotalBets(formatCurrency(data.totalBetAmount))
        }

        if (data.totalPlayers !== undefined) {
          setCurrentQuestionPlayers(data.totalPlayers)
        } else if (data.newPlayer) {
          // If the backend indicates this is a new player, increment the count
          setCurrentQuestionPlayers((prevCount) => prevCount + 1)
        }

        // Recalculate potential payout if user has selected a choice
        if (selectedChoice && betAmount) {
          const newPayout = calculatePotentialPayout(betAmount, selectedChoice)
          setPotentialPayout(formatCurrency(newPayout))
        }
      }
    })

    socketEvents.onQuestionResolved((data) => {
      console.log("Question resolved event received:", data)
      if (data.questionId === currentQuestion?.id) {
        // Handle question resolution
        // IMPORTANT: Don't wait for fetchActiveQuestion, immediately show a loading state
        setCurrentQuestion((prev) => ({
          ...prev,
          resolved: true,
          outcome: data.outcome,
        }))

        // Show a brief message about the outcome
        setBetError(null)
        setBetSuccess(true)

        // Immediately fetch the new question
        setTimeout(() => {
          fetchActiveQuestion()
        }, 500) // Small delay to ensure the new question is ready on the server
      }
    })

    socketEvents.onBettingStats((data) => {
      console.log("Betting stats event received:", data)
      if (data.totalBetsAmount !== undefined) {
        setTotalBets(formatCurrency(data.totalBetsAmount))
      }

      if (data.biggestWinThisWeek !== undefined) {
        console.log("Setting biggest win to:", data.biggestWinThisWeek, "Type:", typeof data.biggestWinThisWeek)
        // Ensure we're formatting a number, not a string that already has formatting
        const rawValue =
          typeof data.biggestWinThisWeek === "string"
            ? Number.parseFloat(data.biggestWinThisWeek.replace(/[$,]/g, ""))
            : data.biggestWinThisWeek

        setBiggestWin(formatCurrency(rawValue))
        setBiggestWinDebug(rawValue)
      } else {
        // If biggestWinThisWeek is not provided, set to $0
        console.log("No biggest win data, setting to $0")
        setBiggestWin("$0")
        setBiggestWinDebug(0)
      }

      if (data.activePlayers !== undefined) {
        setTotalPlayers(data.activePlayers)
      }
    })

    // Listen for specific updates to total bets
    socketEvents.onTotalBetsUpdate((data) => {
      console.log("Total bets update received:", data)
      if (data.amount !== undefined) {
        setTotalBets(formatCurrency(data.amount))
      }
    })

    // Listen for specific updates to player count
    socketEvents.onPlayerCountUpdate((data) => {
      console.log("Player count update received:", data)
      if (data.count !== undefined) {
        setTotalPlayers(data.count)
      }
    })

    // Listen for wallet updates
    socket.on("wallet_update", (data) => {
      console.log("Wallet update received:", data)
      if (data.newBalance !== undefined) {
        updateWalletBalanceUI(data.newBalance)

        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.walletBalance = data.newBalance
        localStorage.setItem("userData", JSON.stringify(userData))

        // Emit a custom event for other components
        if (typeof window !== "undefined") {
          const event = new CustomEvent("wallet_balance_updated", {
            detail: { newBalance: data.newBalance },
          })
          window.dispatchEvent(event)
        }
      }
    })

    // Listen for bet results
    socket.on("bet_result", (data) => {
      console.log("Bet result received:", data)
      if (data.success && data.newBalance !== undefined) {
        updateWalletBalanceUI(data.newBalance)

        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.walletBalance = data.newBalance
        localStorage.setItem("userData", JSON.stringify(userData))

        // Emit a custom event for other components
        if (typeof window !== "undefined") {
          const event = new CustomEvent("wallet_balance_updated", {
            detail: { newBalance: data.newBalance },
          })
          window.dispatchEvent(event)
        }

        // If this bet created a new biggest win, update the UI
        if (data.biggestWin !== undefined) {
          setBiggestWin(formatCurrency(data.biggestWin))
          setBiggestWinDebug(data.biggestWin)
        }
      }
    })

    // Add a socket event listener for biggest win updates
    socket.on("biggest_win_update", (data) => {
      console.log("Biggest win update received:", data)
      if (data.biggestWinThisWeek !== undefined) {
        console.log("Updating biggest win to:", data.biggestWinThisWeek, "Type:", typeof data.biggestWinThisWeek)
        // Ensure we're formatting a number, not a string that already has formatting
        const rawValue =
          typeof data.biggestWinThisWeek === "string"
            ? Number.parseFloat(data.biggestWinThisWeek.replace(/[$,]/g, ""))
            : data.biggestWinThisWeek

        setBiggestWin(formatCurrency(rawValue))
        setBiggestWinDebug(rawValue)
      }
    })

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) return 0
        return prev - 1
      })
    }, 1000)

    return () => {
      // Clean up socket listeners with updated event names
      socketEvents.removeListener("new_question")
      socketEvents.removeListener("bet_placed")
      socketEvents.removeListener("question_resolved")
      socketEvents.removeListener("betting_stats")
      socketEvents.removeListener("total_bets_update")
      socketEvents.removeListener("player_count_update")
      socket.off("wallet_update")
      socket.off("bet_result")
      socket.off("biggest_win_update")
      clearInterval(timer)
    }
  }, [currentQuestion, selectedChoice, betAmount])

  // Listen for payment success events
  useEffect(() => {
    const handlePaymentSuccess = (event) => {
      console.log("Payment success event received:", event.detail)

      // If payment was for a bet and we have pending bet data, place the bet automatically
      if (event.detail && event.detail.forBet && pendingBetData) {
        console.log("Automatically placing bet after payment:", pendingBetData)

        // Check if we should auto-place the bet
        if (autoPlaceBetAfterPayment) {
          // Place the bet with the stored data
          placeBetAfterPayment(pendingBetData)
          // Reset the auto-place flag
          setAutoPlaceBetAfterPayment(false)
        }
      }

      // Refresh wallet balance
      fetchWalletBalance()
    }

    window.addEventListener("payment_success", handlePaymentSuccess)

    return () => {
      window.removeEventListener("payment_success", handlePaymentSuccess)
    }
  }, [pendingBetData, autoPlaceBetAfterPayment])

  // Function to place a bet after successful payment
  const placeBetAfterPayment = async (betData) => {
    try {
      setIsProcessing(true)

      console.log("Placing bet after payment:", betData)
      const response = await bettingAPI.placeBet(betData)

      console.log("Bet placement response:", response)

      if (response.success) {
        // Update wallet balance with the actual value from the server
        if (response.newBalance !== undefined) {
          updateWalletBalanceUI(response.newBalance)
        }

        // Show success message
        setBetSuccess(true)
        setBetError(null)

        // Update stats
        updateStatsAfterBet(betData.amount)

        // Reset selected choice
        setSelectedChoice(null)

        // Clear pending bet data
        setPendingBetData(null)
      } else if (
        response.error &&
        (response.error.includes("token expired") ||
          response.error.includes("invalid token") ||
          response.error.includes("unauthorized") ||
          response.error.includes("Authentication required"))
      ) {
        // Handle expired token
        handleTokenExpiration()
      } else {
        setBetError(response.message || "Failed to place bet")
      }
    } catch (error) {
      console.error("Error placing bet after payment:", error)

      // Check if it's an authentication error
      if (
        error.message &&
        (error.message.includes("Authentication required") ||
          error.message.includes("session has expired") ||
          error.message.includes("token expired") ||
          error.message.includes("invalid token") ||
          error.message.includes("unauthorized"))
      ) {
        // Handle authentication errors with automatic logout
        handleTokenExpiration()
      } else {
        setBetError(error.message || "Failed to place bet")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Add this useEffect to log when the biggestWin value changes
  useEffect(() => {
    console.log("DEBUG: biggestWin value changed to:", biggestWin, "Raw value:", biggestWinDebug)
  }, [biggestWin, biggestWinDebug])

  // Update potential payout when bet amount or choice changes
  useEffect(() => {
    if (selectedChoice && betAmount) {
      const payout = calculatePotentialPayout(betAmount, selectedChoice)
      setPotentialPayout(formatCurrency(payout))
    } else {
      setPotentialPayout("$0")
    }
  }, [selectedChoice, betAmount, currentQuestion])

  // Add a global API response interceptor to check for token expiration
  useEffect(() => {
    const handleApiResponse = (event) => {
      if (event.detail && event.detail.type === "API_RESPONSE") {
        const responseData = event.detail.data

        // Check if the response indicates token expiration
        if (
          responseData.error &&
          (responseData.error.includes("token expired") ||
            responseData.error.includes("invalid token") ||
            responseData.error.includes("unauthorized") ||
            responseData.error.includes("Authentication required"))
        ) {
          handleTokenExpiration()
        }
      }
    }

    window.addEventListener("api_response", handleApiResponse)

    return () => {
      window.removeEventListener("api_response", handleApiResponse)
    }
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0"

    // If amount is already a string with a $ sign, return it as is
    if (typeof amount === "string" && amount.startsWith("$")) {
      return amount
    }

    // Convert to number if it's a string without $ sign
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount.replace(/[^0-9.-]+/g, "")) : Number(amount)

    if (isNaN(numAmount)) return "$0"

    // Format the number with $ sign and commas
    return `$${numAmount.toLocaleString()}`
  }

  // Format countdown time
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Update the fetchActiveQuestion function to handle the response format correctly
  const fetchActiveQuestion = async () => {
    try {
      console.log("Fetching active question...")
      const response = await bettingAPI.getActiveQuestion()
      console.log("Active question response:", response)

      if (response.success && response.question) {
        setCurrentQuestion({
          id: response.question._id || response.question.id,
          question: response.question.question,
          subject: response.question.subject || "Player",
          condition: response.question.condition || "complete the challenge",
          endTime: new Date(response.question.endTime),
          yesPercentage: response.question.yesPercentage || 50,
          noPercentage: response.question.noPercentage || 50,
          resolved: false,
          outcome: null,
        })

        if (response.question.totalBetAmount !== undefined) {
          setCurrentQuestionTotalBets(formatCurrency(response.question.totalBetAmount || 0))
        } else {
          setCurrentQuestionTotalBets("$0")
        }

        // Set the current question players count
        if (response.question.totalPlayers !== undefined) {
          setCurrentQuestionPlayers(response.question.totalPlayers)
        } else {
          setCurrentQuestionPlayers(0)
        }

        // Calculate countdown
        const now = new Date()
        const endTime = new Date(response.question.endTime)
        const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000))
        setCountdown(timeLeft)

        // Update percentages
        setYesPercentage(response.question.yesPercentage || 50)
        setNoPercentage(response.question.noPercentage || 50)

        // Reset bet state
        setSelectedChoice(null)
        setBetAmount("100")
        setBetError(null)
        setBetSuccess(false)
      } else if (
        response.error &&
        (response.error.includes("token expired") ||
          response.error.includes("invalid token") ||
          response.error.includes("unauthorized") ||
          response.error.includes("Authentication required"))
      ) {
        // Handle expired token
        handleTokenExpiration()
      } else {
        // If no active question is found, request one from the socket server
        console.log("No active question found, requesting one from socket server")
        const socket = getSocket()
        socket.emit("get_active_question")
      }
    } catch (error) {
      console.error("Error fetching active question:", error)

      // Check if the error is due to token expiration
      if (
        error.message &&
        (error.message.includes("token expired") ||
          error.message.includes("invalid token") ||
          error.message.includes("unauthorized") ||
          error.message.includes("Authentication required"))
      ) {
        handleTokenExpiration()
      } else {
        // Try to get a question via socket as a fallback
        const socket = getSocket()
        socket.emit("get_active_question")
      }
    }
  }

  // Fetch betting stats - enhanced to get real data
  const fetchBettingStats = async () => {
    try {
      console.log("Fetching betting stats...")
      const response = await bettingAPI.getBetStats()
      console.log("Betting stats response:", response)

      if (response.success && response.stats) {
        // Update all stats with real data
        setTotalBets(formatCurrency(response.stats.totalBetsAmount || 0))

        console.log(
          "Setting biggest win to:",
          response.stats.biggestWinThisWeek,
          "Type:",
          typeof response.stats.biggestWinThisWeek,
        )
        // Ensure we're formatting a number, not a string that already has formatting
        const rawValue =
          typeof response.stats.biggestWinThisWeek === "string"
            ? Number.parseFloat(response.stats.biggestWinThisWeek.replace(/[$,]/g, ""))
            : response.stats.biggestWinThisWeek

        setBiggestWin(formatCurrency(rawValue || 0))
        setBiggestWinDebug(rawValue || 0)

        console.log("Setting player count to:", response.stats.activePlayers || response.stats.totalPlayers)
        setTotalPlayers(response.stats.activePlayers || response.stats.totalPlayers || 0)
      } else if (
        response.error &&
        (response.error.includes("token expired") ||
          response.error.includes("invalid token") ||
          response.error.includes("unauthorized") ||
          response.error.includes("Authentication required"))
      ) {
        // Handle expired token
        handleTokenExpiration()
      } else {
        console.warn("No stats data in response:", response)
        // Set default values if no real data is available
        setTotalBets("$0")
        setBiggestWin("$0")
        setBiggestWinDebug(0)
        setTotalPlayers(0)
      }
    } catch (error) {
      console.error("Error fetching betting stats:", error)

      // Check if the error is due to token expiration
      if (
        error.message &&
        (error.message.includes("token expired") ||
          error.message.includes("invalid token") ||
          error.message.includes("unauthorized") ||
          error.message.includes("Authentication required"))
      ) {
        handleTokenExpiration()
      } else {
        // Set default values if there's an error
        setTotalBets("$0")
        setBiggestWin("$0")
        setBiggestWinDebug(0)
        setTotalPlayers(0)
      }
    }
  }

  // Add this function to update betting stats after placing a bet
  const updateStatsAfterBet = (betAmount) => {
    console.log("Updating stats after bet with amount:", betAmount)

    // Update question-specific total bets by adding the new bet amount
    const currentQuestionTotalBetsStr = currentQuestionTotalBets.startsWith("$")
      ? currentQuestionTotalBets.substring(1).replace(/,/g, "")
      : "0"
    const currentQuestionTotal = Number.parseFloat(currentQuestionTotalBetsStr) || 0
    const newQuestionTotal = currentQuestionTotal + betAmount

    console.log("Current question total bets:", currentQuestionTotal, "New question total bets:", newQuestionTotal)
    setCurrentQuestionTotalBets(formatCurrency(newQuestionTotal))

    // Increment current question player count
    setCurrentQuestionPlayers((prevCount) => {
      console.log("Incrementing current question player count from", prevCount, "to", prevCount + 1)
      return prevCount + 1
    })
  }

  // Handle payment success
  const handlePaymentSuccess = (paymentData) => {
    console.log("Payment successful:", paymentData)

    // Update wallet balance
    if (paymentData.newBalance !== undefined) {
      updateWalletBalanceUI(paymentData.newBalance)

      // Emit a custom event for other components
      const event = new CustomEvent("wallet_balance_updated", {
        detail: {
          newBalance: paymentData.newBalance,
          source: "payment_success",
        },
      })
      window.dispatchEvent(event)
    }

    // If this payment was for a bet, place the bet now
    if (paymentForBet && pendingBetData) {
      // Emit a payment success event with the forBet flag
      window.dispatchEvent(
        new CustomEvent("payment_success", {
          detail: {
            newBalance: paymentData.newBalance,
            amount: paymentData.amount,
            forBet: true,
          },
        }),
      )

      // Automatically place the bet after payment
      placeBetAfterPayment(pendingBetData)
    }

    // Close the payment modal
    setShowPaymentModal(false)
  }

  // Modify handlePlaceBet to check for token expiration
  const handlePlaceBet = async (fundsAlreadyAdded = false) => {
    // Reset status
    setBetSuccess(false)
    setBetError(null)

    // Check authentication first
    const token = localStorage.getItem("authToken")
    if (!token || !isLoggedIn) {
      setInitialAuthView("login")
      setShowAuthModal(true)
      return
    }

    if (!selectedChoice || !betAmount || countdown <= 0) {
      setBetError("Please select Yes or No and enter a bet amount")
      return
    }

    try {
      setIsProcessing(true)
      const betAmountNumber = Number.parseFloat(betAmount)

      // Get the latest wallet balance
      await fetchWalletBalance()

      // Check if user has enough balance
      if (betAmountNumber > walletBalance && !fundsAlreadyAdded) {
        // Calculate how much more is needed
        const additionalFundsNeeded = betAmountNumber - walletBalance

        console.log("Insufficient funds detected. Opening payment modal with amount:", additionalFundsNeeded)

        // Show error message with exact amount needed
        setBetError(`Insufficient balance. You need $${additionalFundsNeeded.toFixed(2)} more to place this bet.`)
        setBetSuccess(false) // Ensure success message is cleared

        // Prepare bet data for after payment
        const betData = {
          questionId: currentQuestion.id,
          choice: selectedChoice,
          amount: betAmountNumber,
          streamId: getStreamId(),
        }

        // Store the pending bet data
        setPendingBetData(betData)

        // Set flag to auto-place bet after payment
        setAutoPlaceBetAfterPayment(true)

        // Show payment modal with the exact amount needed and pass current balance
        setPaymentAmount(additionalFundsNeeded)
        setPaymentForBet(true)
        setInsufficientFunds(true)
        setAmountNeeded(additionalFundsNeeded)

        // Force the payment modal to open immediately
        setTimeout(() => {
          setShowPaymentModal(true)
          console.log("Payment modal should be visible now:", true)

          // Dispatch a custom event to notify the system that payment is needed
          window.dispatchEvent(
            new CustomEvent("payment_needed", {
              detail: {
                amount: additionalFundsNeeded,
                forBet: true,
                betData: betData,
              },
            }),
          )
        }, 0)

        setIsProcessing(false)
        return
      }

      // Get current stream ID from URL or use a default
      const streamId = getStreamId()

      // Make sure we have a valid question ID
      if (!currentQuestion || !currentQuestion.id) {
        setBetError("No active betting question available")
        setIsProcessing(false)
        return
      }

      // Prepare the bet data
      const betData = {
        questionId: currentQuestion.id,
        choice: selectedChoice,
        amount: betAmountNumber,
        streamId: streamId,
      }

      console.log("Placing bet:", betData)

      // Optimistically update the UI to show the bet amount deducted
      const newBalance = walletBalance - betAmountNumber
      updateWalletBalanceUI(newBalance)

      // Update localStorage for persistence
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      userData.walletBalance = newBalance
      localStorage.setItem("userData", JSON.stringify(userData))

      // Emit a custom event for other components
      if (typeof window !== "undefined") {
        const event = new CustomEvent("wallet_balance_updated", {
          detail: { newBalance: newBalance },
        })
        window.dispatchEvent(event)
      }

      // Only update stats and show success if we have sufficient funds
      if (betAmountNumber <= walletBalance) {
        // IMPORTANT: Update stats immediately for better UX
        updateStatsAfterBet(betAmountNumber)

        // Show success message immediately
        setBetSuccess(true)
        setBetError(null)

        // Indicate that we're waiting for a new question
        setCurrentQuestion((prev) => ({
          ...prev,
          resolved: true,
          outcome: selectedChoice, // Optimistically show the user's choice as the outcome
        }))
      }

      const response = await bettingAPI.placeBet(betData)

      console.log("Bet placement response:", response)

      if (response.success) {
        // Update wallet balance with the actual value from the server
        if (response.newBalance !== undefined) {
          console.log("Updating wallet balance to:", response.newBalance)
          updateWalletBalanceUI(response.newBalance)

          // Update localStorage for persistence
          const userData = JSON.parse(localStorage.getItem("userData") || "{}")
          userData.walletBalance = response.newBalance
          localStorage.setItem("userData", JSON.stringify(userData))

          // Emit a custom event for other components
          if (typeof window !== "undefined") {
            const event = new CustomEvent("wallet_balance_updated", {
              detail: {
                newBalance: response.newBalance,
                source: "bet_response",
              },
            })
            window.dispatchEvent(event)

            // Also emit a specific bet_placed event
            window.dispatchEvent(
              new CustomEvent("bet_placed", {
                detail: {
                  betData: response,
                  timestamp: Date.now(),
                },
              }),
            )
          }
        } else {
          console.warn("No newBalance in response:", response)
        }

        // Update potential payout with the actual value from the server
        if (response.bet && response.bet.potentialPayout) {
          setPotentialPayout(formatCurrency(response.bet.potentialPayout))
        }

        // Refresh betting stats to get updated values
        fetchBettingStats()
      } else if (
        response.error &&
        (response.error.includes("token expired") ||
          response.error.includes("invalid token") ||
          response.error.includes("unauthorized") ||
          response.error.includes("Authentication required"))
      ) {
        // Handle expired token
        handleTokenExpiration()
      } else if (response.insufficientFunds) {
        // Handle insufficient funds error
        setBetError(`Insufficient balance. You need $${response.amountNeeded.toFixed(2)} more to place this bet.`)
        setBetSuccess(false) 

        console.log("Insufficient funds from API response. Opening payment modal with amount:", response.amountNeeded)

        // Prepare bet data for after payment
        const betData = {
          questionId: currentQuestion.id,
          choice: selectedChoice,
          amount: betAmountNumber,
          streamId: getStreamId(),
        }

        // Store the pending bet data
        setPendingBetData(betData)

        // Set flag to auto-place bet after payment
        setAutoPlaceBetAfterPayment(true)

        // Show payment modal with the exact amount needed and pass current balance
        setPaymentAmount(response.amountNeeded)
        setPaymentForBet(true)
        setInsufficientFunds(true)
        setAmountNeeded(response.amountNeeded)

        // Force the payment modal to open
        setShowPaymentModal(true)
        console.log("Payment modal should be visible now (from API response):", true)

        // Revert the optimistic update
        fetchWalletBalance()
      }
    } catch (error) {
      console.error("Error placing bet:", error)

      // Revert the optimistic update if there was an error
      fetchWalletBalance()

      // Check if it's an authentication error
      if (
        error.message &&
        (error.message.includes("Authentication required") ||
          error.message.includes("session has expired") ||
          error.message.includes("token expired") ||
          error.message.includes("invalid token") ||
          error.message.includes("unauthorized"))
      ) {
        // Handle authentication errors with automatic logout
        handleTokenExpiration()
      } else if (error.response && error.response.data && error.response.data.insufficientFunds) {
        // Handle insufficient funds error from API
        setBetError(
          `Insufficient balance. You need $${error.response.data.amountNeeded.toFixed(2)} more to place this bet.`,
        )

        // Prepare bet data for after payment
        const betData = {
          questionId: currentQuestion.id,
          choice: selectedChoice,
          amount: betAmountNumber,
          streamId: getStreamId(),
        }

        // Store the pending bet data
        setPendingBetData(betData)

        // Set flag to auto-place bet after payment
        setAutoPlaceBetAfterPayment(true)

        // Show payment modal with the exact amount needed and pass current balance
        setPaymentAmount(error.response.data.amountNeeded)
        setPaymentForBet(true)
        setInsufficientFunds(true)
        setAmountNeeded(error.response.data.amountNeeded)
        setShowPaymentModal(true)
      } else {
        setBetError(error.message || "Failed to place bet")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Function to get the stream ID from the URL
  const getStreamId = () => {
    const currentUrl = window.location.pathname
    return currentUrl.includes("/stream/") ? currentUrl.split("/stream/")[1].split("/")[0] : "default-stream"
  }

  // Handle auth state changes from the AuthHeaderButtons component
  const handleAuthStateChange = (loggedIn, userData) => {
    setIsLoggedIn(loggedIn)
    if (loggedIn && userData) {
      updateWalletBalanceUI(userData.walletBalance)

      // Store user data in localStorage for persistence
      localStorage.setItem("userData", JSON.stringify(userData))
    }
    if (showAuthModal) {
      setShowAuthModal(false)
    }
  }

  // Handle signup button click
  const handleSignupClick = () => {
    setInitialAuthView("signup")
    setShowAuthModal(true)
  }

  // Handle subscribe button click
  const handleSubscribeClick = () => {
    setPaymentAmount(10) // Default subscription amount
    setPaymentForBet(false)
    setShowPaymentModal(true)
  }

  // Handle add funds click
  const handleAddFundsClick = (amount = 10) => {
    setPaymentAmount(amount)
    setPaymentForBet(false)
    setShowPaymentModal(true)
  }

  // Mobile Bottom Bar
  const renderMobileBottomBar = () => {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#071323",
          padding: "10px",
          display: "flex",
          justifyContent: "space-around",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setActiveMobileSection("donate")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "white",
            padding: "5px 0",
            width: "20%",
          }}
        >
          <img src="/assets/img/mobile/donate.png" alt="donate" width={24} height={24} />
          <span style={{ fontSize: "12px", marginTop: "2px" }}>Donate</span>
        </button>

        <button
          onClick={() => setActiveMobileSection("bet")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "white",
            padding: "5px 0",
            width: "20%",
          }}
        >
          <img src="/assets/img/mobile/bet.png" alt="Bet" width={24} height={24} />
          <span style={{ fontSize: "12px", marginTop: "2px" }}>Bet</span>
        </button>

        <button
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "white",
            padding: "5px 0",
            width: "20%",
          }}
        >
          <img src="/assets/img/mobile/shop.png" alt="Shop" width={24} height={24} />
          <span style={{ fontSize: "12px", marginTop: "2px" }}>Shop</span>
        </button>

        <button
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "white",
            padding: "5px 0",
            width: "20%",
          }}
        >
          <img src="/assets/img/mobile/video-play.png" alt="Clips" width={24} height={24} />
          <span style={{ fontSize: "12px", marginTop: "2px" }}>Clips</span>
        </button>

        <button
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "white",
            padding: "5px 0",
            width: "20%",
          }}
        >
          <img
            src="/assets/img/mobile/iconImage/settings 1.png"
            alt="Settings"
            style={{ width: "24px", height: "24px" }}
          />
          <span style={{ fontSize: "12px", marginTop: "2px" }}>Settings</span>
        </button>
      </div>
    )
  }

  // Donation Section
  const renderDonationSection = () => {
    return (
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          padding: "15px",
          borderRadius: "16px 16px 0 0",
          position: "fixed",
          bottom: "60px",
          left: 0,
          right: 0,
          zIndex: 50,
          boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.5)",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ color: "#06b6d4", fontWeight: "bold", fontSize: "16px" }}>Donate</span>
          <button
            onClick={() => setActiveMobileSection(null)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <span style={{ fontSize: "14px", color: "#06b6d4", fontWeight: "bold" }}>Want to donate?</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1e293b",
              borderRadius: "4px",
              marginRight: "5px",
              position: "relative",
              height: "40px",
              flex: 1,
            }}
          >
            <span style={{ color: "#06b6d4", marginLeft: "8px", marginRight: "5px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <img src="/assets/img/paymenticon/ruppe.png" width="16" height="16" alt="help icon" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Enter amount here..."
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                padding: "0",
                width: "calc(100% - 60px)",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "8px",
                color: "#9ca3af",
                fontSize: "10px",
                cursor: "pointer",
              }}
              onClick={() => setDonationAmount("")}
            >
              CLEAR
            </span>
          </div>

          <button
            style={{
              backgroundColor: "#06b6d4",
              border: "none",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 5L19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <button
            style={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "4px",
              color: "#06b6d4",
              padding: "8px 12px",
              fontSize: "14px",
              flex: 1,
            }}
            onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
          >
            +1.00
          </button>

          <button
            style={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "4px",
              color: "#06b6d4",
              padding: "8px 12px",
              fontSize: "14px",
              flex: 1,
            }}
            onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
          >
            +5.00
          </button>

          <button
            style={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "4px",
              color: "#06b6d4",
              padding: "8px 12px",
              fontSize: "14px",
              flex: 1,
            }}
            onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 10 + "")}
          >
            +10.00
          </button>
        </div>

        <div style={{ display: "flex", marginBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
            <input
              type="checkbox"
              id="giftToPlayerMobile"
              checked={giftToPlayer}
              onChange={() => setGiftToPlayer(!giftToPlayer)}
              style={{ marginRight: "5px", width: "16px", height: "16px" }}
            />
            <label htmlFor="giftToPlayerMobile" style={{ fontSize: "14px", margin: 0, color: "white" }}>
              Gift to Player
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              id="addToPrizepoolMobile"
              checked={addToPrizepool}
              onChange={() => setAddToPrizepool(!addToPrizepool)}
              style={{ marginRight: "5px", width: "16px", height: "16px" }}
            />
            <label htmlFor="addToPrizepoolMobile" style={{ fontSize: "14px", margin: 0, color: "white" }}>
              Add to Prizepool
            </label>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px dashed #475569",
            borderBottom: "1px dashed #475569",
            paddingTop: "8px",
            paddingBottom: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <span style={{ color: "#06b6d4", fontSize: "14px" }}>$5 shows up on stream</span>
          <span style={{ color: "#9ca3af", fontSize: "14px" }}>$50 fireworks</span>
        </div>
      </div>
    )
  }

  // Replace the existing betting section with the new design while keeping the betting functionality
  const renderBettingSection = () => {
    return (
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          padding: "15px",
          borderRadius: "16px 16px 0 0",
          position: "fixed",
          bottom: "60px",
          left: 0,
          right: 0,
          zIndex: 50,
          boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.5)",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ color: "#06b6d4", fontWeight: "bold", fontSize: "16px" }}>Place a Bet</span>
          <button
            onClick={() => setActiveMobileSection(null)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "15px",
            position: "relative",
          }}
        >
          <div>
            <span style={{ fontSize: "16px", color: "white" }}>Will </span>
            <span style={{ color: "#06b6d4", fontSize: "16px" }}>{currentQuestion?.subject || "James5423"}</span>
            <span style={{ fontSize: "16px", color: "white" }}>
              {" "}
              {currentQuestion?.condition || "survive the full 5 minutes"}?
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              right: "0",
              backgroundColor: "#7f1d1d",
              border: "1px solid #b91c1c",
              borderRadius: "4px",
              color: "white",
              padding: "2px 8px",
              fontSize: "14px",
            }}
          >
            {formatCountdown(countdown)}
          </div>
        </div>

        {/* Yes/No buttons with percentages */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
          {/* YES button with centered percentage */}
          <div style={{ position: "relative", width: "48%", height: "40px" }}>
            <button
              onClick={() => setSelectedChoice("Yes")}
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: selectedChoice === "Yes" ? "#15803d" : "#0e4429",
                border: "1px solid #15803d",
                borderRadius: "4px",
                color: "#22c55e",
                padding: "8px 15px",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                cursor: countdown > 0 ? "pointer" : "not-allowed",
                opacity: countdown > 0 ? 1 : 0.7,
              }}
              disabled={countdown <= 0}
            >
              YES
            </button>
            <div
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                bottom: "0",
                backgroundColor: "#166534",
                borderTopRightRadius: "4px",
                borderBottomRightRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                color: "white",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {yesPercentage}%
            </div>
          </div>

          {/* NO button with centered percentage */}
          <div style={{ position: "relative", width: "48%", height: "40px" }}>
            <button
              onClick={() => setSelectedChoice("No")}
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: selectedChoice === "No" ? "#b91c1c" : "#7f1d1d",
                border: "1px solid #b91c1c",
                borderRadius: "4px",
                color: "#ef4444",
                padding: "8px 15px",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                cursor: countdown > 0 ? "pointer" : "not-allowed",
                opacity: countdown > 0 ? 1 : 0.7,
              }}
              disabled={countdown <= 0}
            >
              NO
            </button>
            <div
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                bottom: "0",
                backgroundColor: "#b91c1c",
                borderTopRightRadius: "4px",
                borderBottomRightRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                color: "white",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {noPercentage}%
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1e293b",
              borderRadius: "8px",
              position: "relative",
              height: "50px",
              width: "100%",
              marginBottom: "10px",
            }}
          >
            <span style={{ color: "#06b6d4", marginLeft: "15px", marginRight: "10px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <img src="/assets/img/paymenticon/ruppe.png" width="16" height="16" alt="help icon" />
              </svg>
            </span>
            <span style={{ color: "#06b6d4", fontSize: "18px", fontWeight: "bold" }}>{betAmount}</span>
            <span
              style={{
                position: "absolute",
                right: "15px",
                color: "#9ca3af",
                fontSize: "12px",
                cursor: "pointer",
              }}
              onClick={() => setBetAmount("")}
            >
              CLEAR
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#06b6d4",
                padding: "10px",
                fontSize: "14px",
                flex: 1,
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
            >
              +1.00
            </button>

            <button
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#06b6d4",
                padding: "10px",
                fontSize: "14px",
                flex: 1,
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
            >
              +5.00
            </button>

            <button
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#06b6d4",
                padding: "10px",
                fontSize: "14px",
                flex: 1,
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 10 + "")}
            >
              +10.00
            </button>
          </div>
        </div>

        {/* Error and success messages */}
        {betError && (
          <div style={{ color: "#ef4444", fontSize: "14px", marginBottom: "10px", textAlign: "center" }}>
            {betError}
          </div>
        )}

        {betSuccess && (
          <div style={{ color: "#22c55e", fontSize: "14px", marginBottom: "10px", textAlign: "center" }}>
            Bet placed successfully!
          </div>
        )}

        <button
          onClick={handlePlaceBet}
          disabled={!selectedChoice || isProcessing || countdown <= 0}
          style={{
            backgroundColor: "#06b6d4",
            border: "none",
            borderRadius: "8px",
            color: "white",
            padding: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            width: "100%",
            marginBottom: "10px",
            opacity: !selectedChoice || isProcessing || countdown <= 0 ? 0.7 : 1,
          }}
        >
          {isProcessing ? "PROCESSING..." : "PLACE BET"}
        </button>

        {/* Stats row with dynamic values */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "12px",
            color: "#9ca3af",
            marginTop: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <span>Total Bets:</span>
              <span style={{ color: "#06b6d4" }}> {currentQuestionTotalBets}</span>
            </div>
            <div>
              <span>Biggest Win:</span>
              <span style={{ color: "#06b6d4" }}> {biggestWin}</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ color: "white", fontWeight: "bold" }}>{currentQuestionPlayers} Players</span> Have Already
            Bet
          </div>
          <div style={{ textAlign: "right" }}>
            <span>Potential Payout:</span>
            <span style={{ color: "#06b6d4" }}> {potentialPayout}</span>
          </div>
        </div>
      </div>
    )
  }

  // In the useEffect hook that checks for insufficient funds:
  useEffect(() => {
    // Get the current wallet balance
    const fetchWalletBalance = async () => {
      try {
        const response = await walletAPI.getBalance()
        if (response.success && response.balance !== undefined) {
          setWalletBalance(response.balance || 0)
        } else {
          // If response is not successful, set balance to 0
          setWalletBalance(0)
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error)
        // On error, set balance to 0
        setWalletBalance(0)
      }
    }

    fetchWalletBalance()

    // Check if the bet amount is greater than the wallet balance
    if (Number.parseFloat(betAmount) > walletBalance) {
      setInsufficientFunds(true)
      setAmountNeeded(Number.parseFloat(betAmount) - walletBalance)
    } else {
      setInsufficientFunds(false)
      setAmountNeeded(0)
    }
  }, [betAmount, walletBalance])

  return (
    <>
      {/* Desktop version */}
      {!isMobile && (
        <div
          style={{
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to bottom, #071323, #071226)",
            color: "white",
            padding: "10px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 9999,
            borderTop: "1px solid #1e293b",
            height: "100%",
            position: "relative",
          }}
        >
          {/* Left Section - Donation */}
          <div style={{ width: "30%", padding: "0 20px", borderRight: "1px solid #1e293b" }}>
            <div style={{ marginBottom: "10px" }}>
              <span style={{ fontSize: "16px", color: "#00d9ff", fontWeight: "bold" }}>Want to donate?</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#1e293b",
                  borderRadius: "4px",
                  marginRight: "5px",
                  position: "relative",
                  height: "36px",
                  flex: "1",
                }}
              >
                <span style={{ color: "#06b6d4", marginLeft: "10px", marginRight: "5px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
                      fill="#06b6d4"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Enter amount here"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "white",
                    padding: "0",
                    width: "calc(100% - 80px)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "10px",
                    color: "#9ca3af",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => setDonationAmount("")}
                >
                  CLEAR
                </span>
              </div>

              <button
                style={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "4px",
                  color: "#06b6d4",
                  padding: "8px 10px",
                  marginRight: "5px",
                  fontSize: "14px",
                  height: "36px",
                  minWidth: "60px",
                }}
                onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
              >
                +1.00
              </button>

              <button
                style={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "4px",
                  color: "#06b6d4",
                  padding: "8px 10px",
                  marginRight: "5px",
                  fontSize: "14px",
                  height: "36px",
                  minWidth: "60px",
                }}
                onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
              >
                +5.00
              </button>

              <button
                style={{
                  backgroundColor: "#06b6d4",
                  border: "none",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                }}
              >
                <Check size={20} color="white" />
              </button>
            </div>

            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
                <input
                  type="checkbox"
                  id="giftToPlayer"
                  checked={giftToPlayer}
                  onChange={() => setGiftToPlayer(!giftToPlayer)}
                  style={{ marginRight: "8px", width: "14px", height: "14px" }}
                />
                <label htmlFor="giftToPlayer" style={{ fontSize: "13px", margin: 0, color: "#fff" }}>
                  Gift to Player
                </label>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  id="addToPrizepool"
                  checked={addToPrizepool}
                  onChange={() => setAddToPrizepool(!addToPrizepool)}
                  style={{ marginRight: "8px", width: "14px", height: "14px" }}
                />
                <label htmlFor="addToPrizepool" style={{ fontSize: "13px", margin: 0, color: "#fff" }}>
                  Add to Prizepool
                </label>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px dashed #475569",
                borderBottom: "1px dashed #475569",
                paddingTop: "8px",
                paddingBottom: "8px",
                display: "flex",
              }}
            >
              <span style={{ color: "#06b6d4", fontSize: "13px", marginRight: "20px" }}>$5 shows up on stream</span>
              <span style={{ color: "#9ca3af", fontSize: "13px" }}>$50 fireworks</span>
            </div>
          </div>

          {/* Center Section - Betting */}
          <div style={{ width: "45%", padding: "0 20px", borderRight: "1px solid #1e293b" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                  position: "relative",
                }}
              >
                <div style={{ fontSize: "16px" }}>
                  <span style={{ color: "white" }}>Will </span>
                  <span style={{ color: "#06b6d4" }}>{currentQuestion?.subject || "James5423"}</span>
                  <span style={{ color: "white" }}> {currentQuestion?.condition || "survive the full 5 minutes"}?</span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: "0",
                    backgroundColor: "#7f1d1d",
                    border: "1px solid #b91c1c",
                    borderRadius: "4px",
                    color: "white",
                    padding: "2px 8px",
                    fontSize: "14px",
                  }}
                >
                  {formatCountdown(countdown)}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <button
                  onClick={() => setSelectedChoice("Yes")}
                  style={{
                    backgroundColor: selectedChoice === "Yes" ? "#15803d" : "#166534",
                    border: "1px solid #15803d",
                    borderRadius: "4px",
                    color: "#22c55e",
                    padding: "8px 15px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    position: "relative",
                    height: "40px",
                    width: "100px",
                    cursor: countdown > 0 ? "pointer" : "not-allowed",
                    opacity: countdown > 0 ? 1 : 0.7,
                  }}
                  disabled={countdown <= 0}
                >
                  YES
                  <span
                    style={{
                      position: "absolute",
                      right: "0",
                      top: "0",
                      backgroundColor: "#15803d",
                      borderRadius: "0 4px 0 4px",
                      padding: "2px 6px",
                      fontSize: "12px",
                      color: "white",
                    }}
                  >
                    {yesPercentage}%
                  </span>
                </button>

                <button
                  onClick={() => setSelectedChoice("No")}
                  style={{
                    backgroundColor: selectedChoice === "No" ? "#b91c1c" : "#7f1d1d",
                    border: "1px solid #b91c1c",
                    borderRadius: "4px",
                    color: "#ef4444",
                    padding: "8px 15px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    position: "relative",
                    height: "40px",
                    width: "100px",
                    cursor: countdown > 0 ? "pointer" : "not-allowed",
                    opacity: countdown > 0 ? 1 : 0.7,
                  }}
                  disabled={countdown <= 0}
                >
                  NO
                  <span
                    style={{
                      position: "absolute",
                      right: "0",
                      top: "0",
                      backgroundColor: "#b91c1c",
                      borderRadius: "0 4px 0 4px",
                      padding: "2px 6px",
                      fontSize: "12px",
                      color: "white",
                    }}
                  >
                    {noPercentage}%
                  </span>
                </button>

                {/* Improved bet amount input with buttons in a single row */}
                <div style={{ display: "flex", flexDirection: "column", width: "280px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#1e293b",
                      borderRadius: "4px",
                      height: "40px",
                      width: "100%",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "#06b6d4", marginLeft: "10px", marginRight: "5px" }}>
                      <img src="/assets/img/paymenticon/ruppe.png" width="16" height="16" alt="help icon" />
                    </span>
                    <span style={{ color: "#06b6d4", fontSize: "16px", fontWeight: "bold" }}>{betAmount}</span>
                    <div style={{ marginLeft: "auto", display: "flex" }}>
                      <span
                        style={{
                          color: "#9ca3af",
                          fontSize: "12px",
                          cursor: "pointer",
                          padding: "12px 10px",
                          display: "block",
                          textAlign: "center",
                        }}
                        onClick={() => setBetAmount("")}
                      >
                        CLEAR
                      </span>
                      <button
                        style={{
                          backgroundColor: "#1e293b",
                          border: "none",
                          borderLeft: "1px solid #334155",
                          color: "#06b6d4",
                          padding: "0 10px",
                          fontSize: "14px",
                          height: "40px",
                        }}
                        onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
                      >
                        +1.00
                      </button>
                      <button
                        style={{
                          backgroundColor: "#1e293b",
                          border: "none",
                          borderLeft: "1px solid #334155",
                          color: "#06b6d4",
                          padding: "0 10px",
                          fontSize: "14px",
                          height: "40px",
                          borderTopRightRadius: "4px",
                          borderBottomRightRadius: "4px",
                        }}
                        onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
                      >
                        +5.00
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: "6px" }}
                    >
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 2 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 6V12L16 14"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span style={{ color: "#9ca3af", fontSize: "13px" }}>Potential Payout:</span>
                    <span style={{ color: "#06b6d4", fontSize: "13px", marginLeft: "4px" }}>{potentialPayout}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceBet}
                  disabled={!selectedChoice || isProcessing || countdown <= 0}
                  style={{
                    backgroundColor: "#06b6d4",
                    border: "none",
                    borderRadius: "4px",
                    color: "black",
                    padding: "8px 15px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    height: "40px",
                    width: "120px",
                    cursor: !selectedChoice || isProcessing || countdown <= 0 ? "not-allowed" : "pointer",
                    opacity: !selectedChoice || isProcessing || countdown <= 0 ? 0.7 : 1,
                  }}
                >
                  {isProcessing ? "PROCESSING..." : "PLACE BET"}
                </button>
              </div>
              {betSuccess && (
                <div style={{ color: "#22c55e", fontSize: "14px", marginBottom: "10px", textAlign: "center" }}>
                  Bet placed successfully!
                </div>
              )}
              {/* Error and success messages */}
              {betError && (
                <div style={{ color: "#ef4444", fontSize: "14px", marginBottom: "10px", textAlign: "center" }}>
                  {betError}
                </div>
              )}

              {/* Stats row with dynamic values */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "14px",
                  color: "#9ca3af",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div>
                    Total Bets: <span style={{ color: "#06b6d4" }}>{currentQuestionTotalBets}</span>
                  </div>
                  <div>
                    Biggest Win this week: <span style={{ color: "#06b6d4" }}>{biggestWin}</span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "white", fontWeight: "bold" }}>{currentQuestionPlayers} Players</span> Have
                  Already Bet
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div
            style={{
              width: "18%",
              padding: "0 15px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "15px",
                marginBottom: "8px",
                width: "100%",
              }}
            ></div>

            {/* Conditional rendering based on login state */}
            {!isLoggedIn ? (
              <>
                <div
                  style={{
                    fontSize: "11px",
                    color: "white",
                    marginBottom: "6px",
                    textAlign: "center",
                  }}
                >
                  Join +2 million players from <span style={{ marginLeft: "4px" }}>🇮🇳</span>
                </div>

                <button
                  onClick={handleSignupClick}
                  style={{
                    backgroundColor: "#06b6d4",
                    border: "none",
                    borderRadius: "4px",
                    color: "white",
                    padding: "6px 12px",
                    width: "200px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    textAlign: "center",
                    height: "32px",
                  }}
                >
                  Sign Up Now (It's Free)
                </button>
              </>
            ) : (
              <>
                {/* Subscribe section - shown after login */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ fontSize: "11px", color: "white", marginRight: "5px" }}>Subscriber</div>
                    <div
                      style={{
                        backgroundColor: "#06b6d4",
                        color: "white",
                        fontSize: "10px",
                        padding: "1px 5px",
                        borderRadius: "2px",
                        fontWeight: "bold",
                      }}
                    >
                      Exclusive
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "white",
                        marginRight: "5px",
                        textDecoration: "line-through",
                      }}
                    >
                      $9.99
                    </div>
                    <div
                      style={{
                        color: "#06b6d4",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      $4.99
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "white",
                        marginLeft: "3px",
                        alignSelf: "flex-end",
                        marginBottom: "2px",
                      }}
                    >
                      PER MONTH
                    </div>
                  </div>

                  <button
                    onClick={handleSubscribeClick}
                    style={{
                      backgroundColor: "#06b6d4",
                      border: "none",
                      borderRadius: "4px",
                      color: "white",
                      padding: "6px 12px",
                      width: "200px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      textAlign: "center",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: "6px" }}
                    >
                      <path
                        d="M20 12V22H4V12"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 7H2V12H22V7Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path
                        d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    SUBSCRIBE
                  </button>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                      marginTop: "4px",
                      textAlign: "center",
                    }}
                  >
                    Only 6,842 remaining
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Auth Modal */}
          {showAuthModal && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(2px)",
                zIndex: 1050,
              }}
            >
              <AuthHeaderButtons
                initialView={initialAuthView}
                onAuthStateChange={handleAuthStateChange}
                isModal={true}
                onClose={() => setShowAuthModal(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile version */}
      {isMobile && (
        <>
          {renderMobileBottomBar()}
          {activeMobileSection === "donate" && renderDonationSection()}
          {activeMobileSection === "bet" && renderBettingSection()}
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          show={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          requiredForBet={paymentForBet}
          title={paymentForBet ? "Additional Funds Needed" : "Add Funds"}
          description={paymentForBet ? "Add funds to place your bet" : "Choose how you want to proceed with payment"}
          currentBalance={walletBalance}
          amountNeeded={amountNeeded}
        />
      )}
    </>
  )
}
