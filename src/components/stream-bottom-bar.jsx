"use client"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Check, X, ChevronDown } from "lucide-react"
import "bootstrap/dist/css/bootstrap.min.css"
import AuthHeaderButtons from "../components/register/SignupLogin"
import PaymentModal from "../components/subscribes/PaymentModal"
import { bettingAPI, walletAPI } from "../components/wallet-service/api"
import {
  socketEvents,
  initializeSocket,
  getCurrentCameraHolder,
  getStreamId,
} from "../components/wallet-service/socketService"
import { useSocket } from "../components/contexts/SocketContext" // Import useSocket hook

export default function StreamBottomBar() {
  const [betAmount, setBetAmount] = useState("") // Changed default to empty string
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
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [potentialPayout, setPotentialPayout] = useState("$0")
  const [isProcessing, setIsProcessing] = useState(false) // This state will now be set later
  const [betSuccess, setBetSuccess] = useState(false)
  const [betError, setBetError] = useState(null)
  // Add a new state variable for tracking players for the current question
  const [insufficientFunds, setInsufficientFunds] = useState(false)
  const [amountNeeded, setAmountNeeded] = useState(0)
  const [autoPlaceBetAfterPayment, setAutoPlaceBetAfterPayment] = useState(false) // New state to track if bet should be auto-placed
  // Add state for camera holder
  const [cameraHolder, setCameraHolder] = useState(null)
  // Use isConnected from SocketContext
  const { socket, isConnected } = useSocket() // Use isConnected from context
  // Add this state to track the last update time
  const [lastCameraHolderUpdate, setLastCameraHolderUpdate] = useState(0)
  // Add state to track if timer is visible - always true now
  const [timerVisible, setTimerVisible] = useState(true)
  // Add refs to track timer and question state
  const timerRef = useRef(null)
  const questionProcessedRef = useRef({})
  const questionRefreshTimerRef = useRef(null)
  const cameraHolderCheckRef = useRef(null)
  // Create a lastCameraHolderCheck ref to track when we last checked
  const lastCameraHolderCheckRef = useRef(Date.now())
  // Create a ref to track the last camera holder name
  const lastCameraHolderNameRef = useRef(null)
  // Get wallet balance from context
  const [walletBalance, setWalletBalance] = useState(0)

  // Add this function to update the wallet balance
  const updateWalletBalanceUI = (newBalance) => {
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
      const response = await walletAPI.getBalance()
      if (response.success && response.balance !== undefined) {
        // Ensure we're setting a number, not a string
        const balanceValue = Number.parseFloat(response.balance) || 0
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
    // Calculate potential payout using the formula: bet * 2 * (1 - platformFee)
    // This doubles the bet amount and then applies a 5% platform fee
    const potentialPayout = betAmount * 2 * (1 - platformFee)
    return potentialPayout
  }

  // Modify the handleNewQuestion function to ensure timer appears immediately
  const handleNewQuestion = (data) => {
    // Skip if data is empty or if camera holder is None (to prevent stale questions from appearing)
    if (!data || !cameraHolder || cameraHolder.CameraHolderName === "None") {
      console.log("Skipping new question processing: data empty or no camera holder.", data, cameraHolder)
      // Ensure question is cleared if it somehow got set
      setCurrentQuestion(null)
      setCountdown(0)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }
    console.log("Processing new question:", data)
    // Add debug logging to track the exact question text from backend
    console.log("EXACT BACKEND QUESTION TEXT:", data.question)
    // Mark this question as processed
    if (data.id) {
      questionProcessedRef.current[data.id] = true
    }
    // Use the question data directly from the backend without any modification
    const normalizedQuestion = {
      id: data.id || data._id,
      question: data.question, // Use the exact question text from backend
      subject: data.subject,
      condition: data.condition,
      endTime: new Date(data.endTime || Date.now() + 36000),
      yesPercentage: data.yesPercentage || 50,
      noPercentage: data.noPercentage || 50,
      totalBetAmount: data.totalBetAmount || 0,
      totalPlayers: data.totalPlayers || 0,
      yesTotalBetAmount: data.yesTotalBetAmount || 0, // Added for new design
      noTotalBetAmount: data.noTotalBetAmount || 0, // Added for new design
      resolved: false,
      outcome: null,
    }
    // Update the current question immediately
    setCurrentQuestion(normalizedQuestion)
    // Use the countdown value from the server if available, otherwise calculate it
    let timeLeft
    if (data.countdown !== undefined) {
      // Use the countdown value provided by the server
      timeLeft = data.countdown
    } else {
      // Calculate the countdown from endTime
      const now = new Date()
      const endTime = new Date(normalizedQuestion.endTime)
      timeLeft = Math.max(0, Math.floor((endTime - now) / 1000))
    }
    // Removed the problematic line: if (timeLeft < 5) { timeLeft = 36 }
    // This ensures the timer counts down to 0 naturally.

    // Set the countdown immediately
    setCountdown(timeLeft)
    // Always ensure timer is visible
    setTimerVisible(true)
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    // Start the timer immediately
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          // Don't clear the question when the timer ends
          // Just return 0 to show the timer is done
          return 0
        }
        return prev - 1
      })
    }, 1000)
    // Reset betting state
    setSelectedChoice(null)
    setBetError(null)
    setBetSuccess(false)
    // Update percentages
    setYesPercentage(normalizedQuestion.yesPercentage)
    setNoPercentage(normalizedQuestion.noPercentage)
    // Update total bets for this question
    setCurrentQuestionTotalBets(formatCurrency(normalizedQuestion.totalBetAmount))
    setCurrentQuestionPlayers(normalizedQuestion.totalPlayers)
  }

  // New handler functions for question events
  const handleNewQuestionReceived = (event) => {
    if (event.detail && event.detail.question) {
      console.log("New question event received:", event.detail.question)
      handleNewQuestion(event.detail.question)
    }
  }

  const handleCurrentQuestionReceived = (event) => {
    if (event.detail && event.detail.question) {
      console.log("Current question event received:", event.detail.question)
      handleNewQuestion(event.detail.question)
    }
  }

  // Watch for camera holder changes to reset timer and fetch new question
  useEffect(() => {
    if (cameraHolder) {
      if (cameraHolder.CameraHolderName && cameraHolder.CameraHolderName !== "None") {
        // Existing logic for when cameraHolderName changes and is NOT None
        if (lastCameraHolderNameRef.current !== cameraHolder.CameraHolderName) {
          console.log(
            "Camera holder changed from",
            lastCameraHolderNameRef.current,
            "to",
            cameraHolder.CameraHolderName,
          )
          lastCameraHolderNameRef.current = cameraHolder.CameraHolderName
          console.log("New camera holder detected, fetching fresh question with new timer")
          // Use the socket from context
          if (socket && isConnected) {
            socket.emit("create_bet_question", { streamId: getStreamId() })
          }
          fetchActiveQuestion(0, true)
        }
      } else if (cameraHolder.CameraHolderName === "None") {
        // NEW LOGIC: Camera holder is None, clear the question immediately
        console.log("Camera holder is None, clearing current question.")
        setCurrentQuestion(null)
        setCountdown(0)
        // Also clear the timer interval if it's running
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        // Reset lastCameraHolderNameRef to ensure a new question is fetched if a camera holder reappears
        lastCameraHolderNameRef.current = null
      }
    }
  }, [cameraHolder, socket, isConnected]) // Dependency array includes cameraHolder, socket, isConnected

  // Initialize socket connection and fetch active question
  useEffect(() => {
    // Initialize socket (ensures singleton is active)
    initializeSocket()

    // Initial fetch of camera holder status
    const initialCameraHolder = getCurrentCameraHolder()
    if (initialCameraHolder) {
      setCameraHolder(initialCameraHolder)
      lastCameraHolderNameRef.current = initialCameraHolder.CameraHolderName
      // If there's an initial camera holder, try to fetch question
      if (initialCameraHolder.CameraHolderName && initialCameraHolder.CameraHolderName !== "None") {
        fetchActiveQuestion(0, true)
      } else {
        // If initial camera holder is None, ensure question is cleared
        setCurrentQuestion(null)
        setCountdown(0)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
    } else {
      // If no initial camera holder, request it from the server
      if (socket && isConnected) {
        socket.emit("get_camera_holder")
      }
    }

    // Listen for camera holder updates
    const handleCameraHolderUpdate = (event) => {
      if (event.detail && event.detail.cameraHolder) {
        const now = Date.now()
        // Only update if it's been at least 2 seconds since the last update
        if (now - lastCameraHolderUpdate > 2000) {
          setLastCameraHolderUpdate(now)
          setCameraHolder(event.detail.cameraHolder)
        }
      }
    }

    // Add listener for active_question_loaded events from the API
    const handleActiveQuestionLoaded = (event) => {
      if (event.detail && event.detail.question) {
        console.log("Active question loaded:", event.detail.question)
        handleNewQuestion(event.detail.question)
      }
    }

    // Add listener for question_refreshed events
    const handleQuestionRefreshed = (event) => {
      if (event.detail && event.detail.question) {
        console.log("Question refreshed:", event.detail.question)
        handleNewQuestion(event.detail.question)
      }
    }

    // Add listener for wallet balance updates (dispatched by socketService)
    const handleWalletBalanceUpdated = (event) => {
      if (event.detail && event.detail.newBalance !== undefined) {
        updateWalletBalanceUI(event.detail.newBalance)
      }
    }

    // Add listener for biggest win updates (dispatched by socketService)
    const handleBiggestWinUpdated = (event) => {
      if (event.detail && event.detail.biggestWinThisWeek !== undefined) {
        const rawValue =
          typeof event.detail.biggestWinThisWeek === "string"
            ? Number.parseFloat(event.detail.biggestWinThisWeek.replace(/[$,]/g, ""))
            : event.detail.biggestWinThisWeek
        setBiggestWin(formatCurrency(rawValue))
      }
    }

    // NEW: Listener for explicit clear question event
    const handleClearQuestionRequested = (event) => {
      console.log("Clear question requested:", event.detail.reason)
      setCurrentQuestion(null)
      setCountdown(0)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    window.addEventListener("camera_holder_updated", handleCameraHolderUpdate)
    window.addEventListener("new_question_received", handleNewQuestionReceived)
    window.addEventListener("current_question_received", handleCurrentQuestionReceived)
    window.addEventListener("question_updated", handleNewQuestionReceived) // Use same handler for updates
    window.addEventListener("question_created", handleNewQuestionReceived) // Use same handler for created
    window.addEventListener("active_question_loaded", handleActiveQuestionLoaded)
    window.addEventListener("question_refreshed", handleQuestionRefreshed)
    window.addEventListener("wallet_balance_updated", handleWalletBalanceUpdated)
    window.addEventListener("biggest_win_updated", handleBiggestWinUpdated)
    window.addEventListener("clear_question_requested", handleClearQuestionRequested) // Add new listener

    // Fetch betting stats (always fetch regardless of camera holder)
    fetchBettingStats()

    // Listen for socket events with updated event names (these are still specific to betting logic)
    socketEvents.onNewQuestion((data) => {
      console.log("New question from socket:", data)
      handleNewQuestion(data)
    })
    socketEvents.onBetPlaced((data) => {
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
        // Add updates for yesTotalBetAmount and noTotalBetAmount
        setCurrentQuestion((prev) => ({
          ...prev,
          yesTotalBetAmount: data.yesTotalBetAmount !== undefined ? data.yesTotalBetAmount : prev?.yesTotalBetAmount,
          noTotalBetAmount: data.noTotalBetAmount !== undefined ? data.noTotalBetAmount : prev?.noTotalBetAmount,
        }))
        // Recalculate potential payout if user has selected a choice
        if (selectedChoice && betAmount) {
          const newPayout = calculatePotentialPayout(betAmount, selectedChoice)
          setPotentialPayout(formatCurrency(newPayout))
        }
      }
    })
    socketEvents.onQuestionResolved((data) => {
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
          fetchActiveQuestion(0, true)
        }, 500) // Small delay to ensure the new question is ready on the server
      }
    })
    socketEvents.onBettingStats((data) => {
      if (data.totalBetsAmount !== undefined) {
        setTotalBets(formatCurrency(data.totalBetsAmount))
      }
      if (data.biggestWinThisWeek !== undefined) {
        const rawValue =
          typeof data.biggestWinThisWeek === "string"
            ? Number.parseFloat(data.biggestWinThisWeek.replace(/[$,]/g, ""))
            : data.biggestWinThisWeek
        setBiggestWin(formatCurrency(rawValue))
      } else {
        // If biggestWinThisWeek is not provided, set to $0
        setBiggestWin("$0")
      }
      if (data.activePlayers !== undefined) {
        setTotalPlayers(data.activePlayers)
      }
    })
    // Listen for specific updates to total bets
    socketEvents.onTotalBetsUpdate((data) => {
      if (data.amount !== undefined) {
        setTotalBets(formatCurrency(data.amount))
      }
    })
    // Listen for specific updates to player count
    socketEvents.onPlayerCountUpdate((data) => {
      if (data.count !== undefined) {
        setTotalPlayers(data.count)
      }
    })

    // Set up more frequent camera holder checks to ensure we always have a question
    cameraHolderCheckRef.current = setInterval(() => {
      const now = Date.now()
      // Only check for camera holder every 2 seconds to prevent flickering
      if (now - lastCameraHolderCheckRef.current > 2000) {
        lastCameraHolderCheckRef.current = now
        if (cameraHolder && cameraHolder.CameraHolderName && cameraHolder.CameraHolderName !== "None") {
          // If we have a camera holder but no question, fetch one
          if (!currentQuestion) {
            console.log("No question with camera holder, fetching one")
            fetchActiveQuestion(0, true)
            // Also force create a new question, but only if we don't have one
            // Use the socket from context
            if (socket && isConnected) {
              socket.emit("create_bet_question", { streamId: getStreamId() })
            }
          }
        } else {
          // Try to get the camera holder, but less frequently
          // Use the socket from context
          if (socket && isConnected) {
            socket.emit("get_camera_holder")
          }
        }
      }
    }, 1000) // Check every second instead of 500ms

    // Set up automatic question refresh every 30 seconds
    questionRefreshTimerRef.current = setInterval(() => {
      if (cameraHolder && cameraHolder.CameraHolderName && cameraHolder.CameraHolderName !== "None") {
        // Only refresh if we don't already have a question
        if (!currentQuestion) {
          console.log("Periodic question refresh - no current question")
          fetchActiveQuestion(0, true)
        }
      }
    }, 30000)

    // Remove any debug buttons that might have been added
    if (typeof document !== "undefined") {
      const debugButton = document.getElementById("socket-debug-button")
      if (debugButton) {
        debugButton.remove()
      }
    }

    return () => {
      // Clean up window event listeners
      window.removeEventListener("camera_holder_updated", handleCameraHolderUpdate)
      window.removeEventListener("new_question_received", handleNewQuestionReceived)
      window.removeEventListener("current_question_received", handleCurrentQuestionReceived)
      window.removeEventListener("question_updated", handleNewQuestionReceived)
      window.removeEventListener("question_created", handleNewQuestionReceived)
      window.removeEventListener("active_question_loaded", handleActiveQuestionLoaded)
      window.removeEventListener("question_refreshed", handleQuestionRefreshed)
      window.removeEventListener("wallet_balance_updated", handleWalletBalanceUpdated)
      window.removeEventListener("biggest_win_updated", handleBiggestWinUpdated)
      window.removeEventListener("clear_question_requested", handleClearQuestionRequested) // Remove new listener

      // Clean up socketEvents listeners (these use getSocket().off internally)
      socketEvents.removeListener("new_question")
      socketEvents.removeListener("bet_placed")
      socketEvents.removeListener("question_resolved")
      socketEvents.removeListener("betting_stats")
      socketEvents.removeListener("total_bets_update")
      socketEvents.removeListener("player_count_update")

      // Clear any active timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      // Clear question refresh timer
      if (questionRefreshTimerRef.current) {
        clearInterval(questionRefreshTimerRef.current)
      }
      // Clear camera holder check timer
      if (cameraHolderCheckRef.current) {
        clearInterval(cameraHolderCheckRef.current)
      }
    }
  }, [cameraHolder, currentQuestion, isConnected, socket]) // Added isConnected and socket to dependencies

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

  // Listen for payment success events
  useEffect(() => {
    const handlePaymentSuccessEvent = (event) => {
      // If payment was for a bet and we have pending bet data, place the bet automatically
      if (event.detail && event.detail.forBet && pendingBetData) {
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
    window.addEventListener("payment_success", handlePaymentSuccessEvent)
    return () => {
      window.removeEventListener("payment_success", handlePaymentSuccessEvent)
    }
  }, [pendingBetData, autoPlaceBetAfterPayment])

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

  // Now modify the fetchActiveQuestion function to remove the fallback question creation
  const fetchActiveQuestion = async (retryCount = 0, forceRefresh = false) => {
    try {
      // Check if there's a valid camera holder before fetching a question
      if (!cameraHolder || !cameraHolder.CameraHolderName || cameraHolder.CameraHolderName === "None") {
        // Immediately clear the question and countdown if no valid camera holder
        if (currentQuestion !== null || countdown !== 0) {
          console.log("No active camera holder, clearing current question and countdown.")
          setCurrentQuestion(null)
          setCountdown(0)
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
        }
        return // Stop further execution of this function
      }
      console.log("Fetching active question, retry:", retryCount, "force:", forceRefresh)
      const response = await bettingAPI.getActiveQuestion()
      if (response.success && response.question) {
        console.log("Got active question from API:", response.question)
        // Add debug logging to track the exact question text from API
        console.log("EXACT API QUESTION TEXT:", response.question.question)
        // Process the question data with the countdown value from the server
        handleNewQuestion(response.question)
        // Reset any error state
        setBetError(null)
      } else {
        console.log("No active question found or error:", response)
        // If no active question is found, request one from the socket server
        // Use the socket from context
        if (socket && isConnected) {
          console.log("Requesting question from socket")
          socket.emit("get_active_question")
          // Also request to create a new question if we have a valid camera holder
          if (cameraHolder && cameraHolder.CameraHolderName && cameraHolder.CameraHolderName !== "None") {
            console.log("Requesting to create a new question")
            socket.emit("create_bet_question", { streamId: getStreamId() })
          }
        }
        // If this is not the last retry attempt, retry after a short delay
        if (retryCount < 5) {
          setTimeout(
            () => {
              fetchActiveQuestion(retryCount + 1, forceRefresh)
            },
            100, // Even shorter delay between retries - 100ms
          )
        } else if (forceRefresh) {
          // If we're forcing a refresh and still don't have a question, try to create one
          try {
            console.log("Forcing question refresh")
            const refreshResponse = await bettingAPI.forceRefreshQuestion()
            if (refreshResponse.success && refreshResponse.question) {
              console.log("Got question from force refresh:", refreshResponse.question)
              // Add debug logging to track the exact question text from force refresh
              console.log("EXACT FORCE REFRESH QUESTION TEXT:", refreshResponse.question.question)
              handleNewQuestion(refreshResponse.question)
            }
          } catch (refreshError) {
            console.error("Error forcing question refresh:", refreshError)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching active question:", error)
      // Try to get a question via socket as a fallback
      // Use the socket from context
      if (socket && isConnected) {
        socket.emit("get_active_question")
        // Also request to create a new question if we have a valid camera holder
        if (cameraHolder && cameraHolder.CameraHolderName && cameraHolder.CameraHolderName !== "None") {
          socket.emit("create_bet_question", { streamId: getStreamId() })
        }
      }
      // If this is not the last retry attempt, retry after a short delay
      if (retryCount < 5) {
        setTimeout(
          () => {
            fetchActiveQuestion(retryCount + 1, forceRefresh)
          },
          100, // Even shorter delay between retries - 100ms
        )
      }
    }
  }

  // Fetch betting stats - enhanced to get real data
  const fetchBettingStats = async () => {
    try {
      const response = await bettingAPI.getBetStats()
      if (response.success && response.stats) {
        // Update all stats with real data
        setTotalBets(formatCurrency(response.stats.totalBetsAmount || 0))
        // Ensure we're formatting a number, not a string that already has formatting
        const rawValue =
          typeof response.stats.biggestWinThisWeek === "string"
            ? Number.parseFloat(response.stats.biggestWinThisWeek.replace(/[$,]/g, ""))
            : response.stats.biggestWinThisWeek
        setBiggestWin(formatCurrency(rawValue || 0))
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
        // Set default values if no real data is available
        setTotalBets("$0")
        setBiggestWin("$0")
        setTotalPlayers(0)
      }
    } catch (error) {
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
        setTotalPlayers(0)
      }
    }
  }

  // Function to place a bet after successful payment
  const placeBetAfterPayment = async (betData) => {
    try {
      setIsProcessing(true) // Set processing state when placing bet after payment
      const response = await bettingAPI.placeBet(betData)
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
      setIsProcessing(false) // Reset processing state
    }
  }

  // Add this function to update betting stats after placing a bet
  const updateStatsAfterBet = (betAmount) => {
    // Update question-specific total bets by adding the new bet amount
    const currentQuestionTotalBetsStr = currentQuestionTotalBets.startsWith("$")
      ? currentQuestionTotalBets.substring(1).replace(/,/g, "")
      : "0"
    const currentQuestionTotal = Number.parseFloat(currentQuestionTotalBetsStr) || 0
    const newQuestionTotal = currentQuestionTotal + betAmount
    setCurrentQuestionTotalBets(formatCurrency(newQuestionTotal))
    // Increment current question player count
    setCurrentQuestionPlayers((prevCount) => prevCount + 1)
  }

  // Handle payment success
  const handlePaymentSuccess = (paymentData) => {
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

  // Modified handlePlaceBet to accept choice as an argument
  const handlePlaceBet = async (choice, fundsAlreadyAdded = false) => {
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

    // Check if there's a valid camera holder
    if (!cameraHolder || !cameraHolder.CameraHolderName || cameraHolder.CameraHolderName === "None") {
      // Don't show error message here
      return
    }

    // Use the passed 'choice' argument for validation
    if (!choice || !betAmount || countdown <= 0) {
      setBetError("Please select Yes or No and enter a bet amount")
      return
    }

    const betAmountNumber = Number.parseFloat(betAmount)
    if (isNaN(betAmountNumber) || betAmountNumber <= 0) {
      setBetError("Please enter a valid bet amount.")
      return
    }

    // Set processing state *after* initial synchronous checks
    setIsProcessing(true) // This is the key for instant feedback

    try {
      // Use the current walletBalance state for the check, avoid fetching here
      if (betAmountNumber > walletBalance && !fundsAlreadyAdded) {
        // Calculate how much more is needed
        const additionalFundsNeeded = betAmountNumber - walletBalance
        // Show error message with exact amount needed
        setBetError(`Insufficient balance. You need $${additionalFundsNeeded.toFixed(2)} more to place this bet.`)
        setBetSuccess(false) // Ensure success message is cleared

        // Prepare bet data for after payment
        const betData = {
          questionId: currentQuestion.id,
          choice: choice, // Use the passed 'choice'
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
        return // Exit after showing payment modal, finally block will reset isProcessing
      }

      // Get current stream ID from URL or use a default
      const streamId = getStreamId()
      // Make sure we have a valid question ID
      if (!currentQuestion || !currentQuestion.id) {
        setBetError("No active betting question available")
        return // Exit, finally block will reset isProcessing
      }

      // Prepare the bet data
      const betData = {
        questionId: currentQuestion.id,
        choice: choice, // Use the passed 'choice'
        amount: betAmountNumber,
        streamId: streamId,
      }

      const response = await bettingAPI.placeBet(betData)

      if (response.success) {
        // Update wallet balance with the actual value from the server
        if (response.newBalance !== undefined) {
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
        }
        // Update potential payout with the actual value from the server
        if (response.bet && response.bet.potentialPayout) {
          setPotentialPayout(formatCurrency(response.bet.potentialPayout))
        }
        // Refresh betting stats to get updated values
        fetchBettingStats()
        // Show success message
        setBetSuccess(true)
        setBetError(null)
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
        // Prepare bet data for after payment
        const betDataForPayment = {
          // Re-create betData for payment flow
          questionId: currentQuestion.id,
          choice: choice, // Use the passed 'choice'
          amount: betAmountNumber,
          streamId: getStreamId(),
        }
        // Store the pending bet data
        setPendingBetData(betDataForPayment)
        // Set flag to auto-place bet after payment
        setAutoPlaceBetAfterPayment(true)
        // Show payment modal with the exact amount needed and pass current balance
        setPaymentAmount(response.amountNeeded)
        setPaymentForBet(true)
        setInsufficientFunds(true)
        setAmountNeeded(response.amountNeeded)
        // Force the payment modal to open
        setShowPaymentModal(true)
        // Revert the optimistic update (or just refresh to be safe)
        fetchWalletBalance()
      } else {
        setBetError(response.message || "Failed to place bet")
      }
    } catch (error) {
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
        const betDataForPayment = {
          // Re-create betData for payment flow
          questionId: currentQuestion.id,
          choice: choice, // Use the passed 'choice'
          amount: betAmountNumber,
          streamId: getStreamId(),
        }
        // Store the pending bet data
        setPendingBetData(betDataForPayment)
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
      setIsProcessing(false) // Always reset processing state
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

  // Mobile Donation Section
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
        <p style={{ color: "white" }}>Donation section content goes here.</p>
      </div>
    )
  }

  // Replace the existing betting section with the new design while keeping the betting functionality
  const renderBettingSection = () => {
    return (
      <div
        style={{
          background: "linear-gradient(180deg, #022A57 0%, #08192C 100%)", // Solid dark background from screenshot
          color: "white",
          padding: "15px", // Adjusted padding to match screenshot
          borderRadius: isMobile ? "16px 16px 0 0" : "16px", // Rounded top corners for mobile, all corners for desktop
          position: isMobile ? "fixed" : "relative", // Use relative for desktop, fixed for mobile
          bottom: isMobile ? "60px" : "auto", // Only apply bottom for mobile
          left: isMobile ? 0 : "auto",
          right: isMobile ? 0 : "auto",
          zIndex: isMobile ? 50 : "auto",
          boxShadow: isMobile ? "0px -4px 20px rgba(0, 0, 0, 0.5)" : "none",
          maxHeight: isMobile ? "60vh" : "100%", // Max height for mobile, full height for desktop
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%", // Ensure it takes full width of its parent container
          height: "100%", // Ensure it takes full height of its parent container
        }}
      >
        {/* Back Arrow and Question (only for mobile) */}
        {isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              marginBottom: "15px",
              justifyContent: "flex-start", // Align to start for back arrow
            }}
          >
            <ArrowLeft
              size={24}
              style={{ color: "white", cursor: "pointer", marginRight: "10px" }}
              onClick={() => setActiveMobileSection(null)}
            />
            <div style={{ flex: 1, textAlign: "center", fontSize: "20px", fontWeight: "bold", color: "#0ea5e9" }}>
              {currentQuestion?.question || "No active question"}
            </div>
            <div style={{ width: "24px", marginLeft: "10px" }}></div> {/* Spacer for alignment */}
          </div>
        )}
        {/* Bets closing in timer */}
        <div style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "25px", textAlign: "center" }}>
          Bets closing in <span style={{ color: "#ef4444", fontWeight: "bold" }}>{formatCountdown(countdown)}</span>
        </div>
        {/* Current Cash Amount Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#0e1a2b",
            border: "1px solid #1a2b3c", // Added border
            borderRadius: "6px",
            position: "relative",
            height: "45px",
            width: "100%",
            marginBottom: "15px",
          }}
        >
          <span style={{ color: "#06b6d4", marginLeft: "15px", marginRight: "10px" }}>
            <img src="/assets/img/paymenticon/ruppe.png" width="16" height="16" alt="currency icon" />
          </span>
          <input
            type="text"
            placeholder="Enter Bet Amount"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              color: "white",
              fontSize: "14px",
              outline: "none",
              paddingRight: "5px", // Add padding to prevent text overlapping CLEAR
            }}
          />
          <span
            style={{
              marginRight: "12px",
              color: "#9ca3af",
              fontSize: "12px",
              cursor: "pointer",
            }}
            onClick={() => setBetAmount("")}
          >
            CLEAR
          </span>
        </div>
        {/* Quick Bet Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap", // Ensure no wrapping
            gap: "6px", // Adjusted gap
            width: "100%",
            marginBottom: "20px",
            // Removed overflowX: "auto" and paddingBottom as buttons should now fit
          }}
        >
          <button
            style={{
              flex: "0 0 calc((100% - 36px) / 7)", // Distribute space evenly for 7 buttons with 6px gaps
              backgroundColor: "#0e1a2b",
              border: "1px solid #1a2b3c",
              borderRadius: "6px",
              color: "#06b6d4",
              padding: "8px 0", // Consistent vertical padding, no horizontal padding
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap", // Prevent text wrapping inside button
            }}
            onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 0.1 + "")}
          >
            +0.1
          </button>
          <button
            style={{
              flex: "0 0 calc((100% - 36px) / 7)",
              backgroundColor: "#0e1a2b",
              border: "1px solid #1a2b3c",
              borderRadius: "6px",
              color: "#06b6d4",
              padding: "8px 0",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
          >
            +1
          </button>
          <button
            style={{
              flex: "0 0 calc((100% - 36px) / 7)",
              backgroundColor: "#0e1a2b",
              border: "1px solid #1a2b3c",
              borderRadius: "6px",
              color: "#06b6d4",
              padding: "8px 0",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 10 + "")}
          >
            +10
          </button>
          <button
            style={{
              flex: "0 0 calc((100% - 36px) / 7)",
              backgroundColor: "#0e1a2b",
              border: "1px solid #1a2b3c",
              borderRadius: "6px",
              color: "#06b6d4",
              padding: "8px 0",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 100 + "")}
          >
            +100
          </button>
          <button
            style={{
              flex: "0 0 calc((100% - 36px) / 7)", // Now part of the same flex row
              backgroundColor: "#0e1a2b",
              border: "1px solid #1a2b3c",
              borderRadius: "6px",
              color: "#06b6d4",
              padding: "8px 0",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) / 2).toFixed(2))}
          >
            1/2
          </button>
          <button
            style={{
              flex: "0 0 calc((100% - 36px) / 7)", // Now part of the same flex row
              backgroundColor: "#0e1a2b",
              border: "1px solid #1a2b3c",
              borderRadius: "6px",
              color: "#06b6d4",
              padding: "8px 0",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) * 2).toFixed(2))}
          >
            X2
          </button>
          <button
            style={{
              flex: "0 0 calc((100% - 36px) / 7)", // Now part of the same flex row
              backgroundColor: "#0ea5e9", // Blue color from screenshot
              border: "none",
              borderRadius: "6px",
              color: "white",
              padding: "8px 0", // Consistent padding
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => setBetAmount(walletBalance.toFixed(2))}
          >
            MAX
          </button>
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
        {/* YES/NO Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "row", // Changed to row for side-by-side
            gap: "15px",
            width: "100%",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => {
              setSelectedChoice("Yes") // Keep for UI/potential payout calculation
              handlePlaceBet("Yes") // Pass choice directly to handlePlaceBet
            }}
            disabled={isProcessing || countdown <= 0} // Disable if processing or timer up
            style={{
              backgroundColor: "#22c55e", // Green color from screenshot
              border: "none", // No border
              borderRadius: "6px",
              color: "white",
              padding: "12px",
              fontSize: "18px",
              fontWeight: "bold",
              flex: 1, // Take equal width
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: !isProcessing && countdown > 0 ? "pointer" : "not-allowed",
              opacity: !isProcessing && countdown > 0 ? 1 : 0.7,
            }}
          >
            YES
            <span style={{ fontSize: "10px", fontWeight: "normal", marginTop: "2px" }}>PLACE BET WIN 2X</span>
          </button>
          <button
            onClick={() => {
              setSelectedChoice("No") // Keep for UI/potential payout calculation
              handlePlaceBet("No") // Pass choice directly to handlePlaceBet
            }}
            disabled={isProcessing || countdown <= 0} // Disable if processing or timer up
            style={{
              backgroundColor: "#ef4444", // Red color from screenshot
              border: "none", // No border
              borderRadius: "6px",
              color: "white",
              padding: "12px",
              fontSize: "18px",
              fontWeight: "bold",
              flex: 1, // Take equal width
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: !isProcessing && countdown > 0 ? "pointer" : "not-allowed",
              opacity: !isProcessing && countdown > 0 ? 1 : 0.7,
            }}
          >
            NO
            <span style={{ fontSize: "10px", fontWeight: "normal", marginTop: "2px" }}>PLACE BET WIN 2X</span>
          </button>
        </div>
        {/* Current Bet Status */}
        <div
          style={{
            width: "100%",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", color: "white", fontSize: "14px" }}>
              <Check size={16} style={{ color: "#22c55e", marginRight: "5px" }} /> Yes
            </div>
            <div style={{ color: "white", fontSize: "14px" }}>
              {formatCurrency(currentQuestion?.yesTotalBetAmount || 0)}
              <ChevronDown size={16} style={{ marginLeft: "5px" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", color: "white", fontSize: "14px" }}>
              <X size={16} style={{ color: "#ef4444", marginRight: "5px" }} /> No
            </div>
            <div style={{ color: "white", fontSize: "14px" }}>
              {formatCurrency(currentQuestion?.noTotalBetAmount || 0)}
              <ChevronDown size={16} style={{ marginLeft: "5px" }} />
            </div>
          </div>
        </div>
        {/* Your Balance and Add Balance Button */}
        <div
          style={{
            width: "100%",
            marginTop: "auto", // Push to bottom
            paddingTop: "15px",
            borderTop: "1px solid #1e293b",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "14px", color: "white", marginBottom: "10px" }}>
            Your Balance: <span style={{ color: "#06b6d4", fontWeight: "bold" }}>{formatCurrency(walletBalance)}</span>
          </div>
          <button
            onClick={() => handleAddFundsClick(10)} // Default to $10 or adjust as needed
            style={{
              backgroundColor: "#0ea5e9", // Blue color from screenshot
              border: "none",
              borderRadius: "6px",
              color: "white",
              padding: "10px",
              fontSize: "14px",
              fontWeight: "bold",
              width: "100%",
              cursor: "pointer",
            }}
          >
            ADD BALANCE
          </button>
        </div>
        {/* Socket Connection Indicator (kept for debugging/info) */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            color: isConnected ? "#22c55e" : "#ef4444",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isConnected ? "#22c55e" : "#ef4444",
            }}
          ></div>
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop version */}
      {!isMobile && (
        <div
          style={{
            background: "linear-gradient(180deg, #022A57 0%, #08192C 100%)", // Solid dark background from screenshot
            color: "white",
            padding: "15px", // Adjusted padding to match screenshot
            display: "flex",
            flexDirection: "column", // Changed to column for vertical layout
            alignItems: "center", // Center content horizontally
            zIndex: 9999,
            borderTop: "1px solid #1e293b",
            height: "100%", // Take full height of parent (20% column)
            position: "relative",
            overflowY: "auto", // Allow scrolling if content overflows
          }}
        >
          {/* Back Arrow and Question */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              marginBottom: "15px",
              justifyContent: "flex-start", // Align to start for back arrow
            }}
          >
            <ArrowLeft size={24} style={{ color: "white", cursor: "pointer", marginRight: "10px" }} />
            <div style={{ flex: 1, textAlign: "center", fontSize: "20px", fontWeight: "bold", color: "#0ea5e9" }}>
              {currentQuestion?.question || "No active question"}
            </div>
            <div style={{ width: "24px", marginLeft: "10px" }}></div> {/* Spacer for alignment */}
          </div>
          {/* Bets closing in timer */}
          <div style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "25px", textAlign: "center" }}>
            Bets closing in <span style={{ color: "#ef4444", fontWeight: "bold" }}>{formatCountdown(countdown)}</span>
          </div>
          {/* Current Cash Amount Input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#0e1a2b",
              border: "1px solid #1a2b3c", // Added border
              borderRadius: "6px",
              position: "relative",
              height: "45px",
              width: "100%",
              marginBottom: "15px",
            }}
          >
            <span style={{ color: "#06b6d4", marginLeft: "15px", marginRight: "10px" }}>
              <img src="/assets/img/paymenticon/ruppe.png" width="16" height="16" alt="currency icon" />
            </span>
            <input
              type="text"
              placeholder="Enter Bet Amount"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                fontSize: "14px",
                outline: "none",
                paddingRight: "5px", // Add padding to prevent text overlapping CLEAR
              }}
            />
            <span
              style={{
                marginRight: "12px",
                color: "#9ca3af",
                fontSize: "12px",
                cursor: "pointer",
              }}
              onClick={() => setBetAmount("")}
            >
              CLEAR
            </span>
          </div>
          {/* Quick Bet Buttons */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <button
              style={{
                flex: 1,
                backgroundColor: "#0e1a2b",
                border: "1px solid #1a2b3c", // Added border
                borderRadius: "6px",
                color: "#06b6d4",
                padding: "8px 0",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) / 2).toFixed(2))}
            >
              1/2
            </button>
            <button
              style={{
                flex: 1,
                backgroundColor: "#0e1a2b",
                border: "1px solid #1a2b3c", // Added border
                borderRadius: "6px",
                color: "#06b6d4",
                padding: "8px 0",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 0.1 + "")}
            >
              +0.1
            </button>
            <button
              style={{
                flex: 1,
                backgroundColor: "#0e1a2b",
                border: "1px solid #1a2b3c", // Added border
                borderRadius: "6px",
                color: "#06b6d4",
                padding: "8px 0",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
            >
              +1
            </button>
            <button
              style={{
                flex: 1,
                backgroundColor: "#0e1a2b",
                border: "1px solid #1a2b3c", // Added border
                borderRadius: "6px",
                color: "#06b6d4",
                padding: "8px 0",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 10 + "")}
            >
              +10
            </button>
            <button
              style={{
                flex: 1,
                backgroundColor: "#0e1a2b",
                border: "1px solid #1a2b3c", // Added border
                borderRadius: "6px",
                color: "#06b6d4",
                padding: "8px 0",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 100 + "")}
            >
              +100
            </button>
            <button
              style={{
                flex: 1,
                backgroundColor: "#0e1a2b",
                border: "1px solid #1a2b3c", // Added border
                borderRadius: "6px",
                color: "#06b6d4",
                padding: "8px 0",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) * 2).toFixed(2))}
            >
              X2
            </button>
          </div>
          {/* MAX Button */}
          <button
            style={{
              backgroundColor: "#0ea5e9", // Blue color from screenshot
              border: "none",
              borderRadius: "6px",
              color: "white",
              padding: "10px",
              fontSize: "14px",
              fontWeight: "bold",
              width: "100%",
              marginBottom: "20px",
              cursor: "pointer",
            }}
            onClick={() => setBetAmount(walletBalance.toFixed(2))}
          >
            MAX
          </button>
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
          {/* YES/NO Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={() => {
                setSelectedChoice("Yes") // Keep for UI/potential payout calculation
                handlePlaceBet("Yes") // Pass choice directly to handlePlaceBet
              }}
              disabled={isProcessing || countdown <= 0} // Disable if processing or timer up
              style={{
                backgroundColor: "#22c55e", // Green color from screenshot
                border: "none", // No border
                borderRadius: "6px",
                color: "white",
                padding: "12px",
                fontSize: "18px",
                fontWeight: "bold",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: !isProcessing && countdown > 0 ? "pointer" : "not-allowed",
                opacity: !isProcessing && countdown > 0 ? 1 : 0.7,
              }}
            >
              YES
              <span style={{ fontSize: "10px", fontWeight: "normal", marginTop: "2px" }}>PLACE BET WIN 2X</span>
            </button>
            <button
              onClick={() => {
                setSelectedChoice("No") // Keep for UI/potential payout calculation
                handlePlaceBet("No") // Pass choice directly to handlePlaceBet
              }}
              disabled={isProcessing || countdown <= 0} // Disable if processing or timer up
              style={{
                backgroundColor: "#ef4444", // Red color from screenshot
                border: "none", // No border
                borderRadius: "6px",
                color: "white",
                padding: "12px",
                fontSize: "18px",
                fontWeight: "bold",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: !isProcessing && countdown > 0 ? "pointer" : "not-allowed",
                opacity: !isProcessing && countdown > 0 ? 1 : 0.7,
              }}
            >
              NO
              <span style={{ fontSize: "10px", fontWeight: "normal", marginTop: "2px" }}>PLACE BET WIN 2X</span>
            </button>
          </div>
          {/* Current Bet Status */}
          <div
            style={{
              width: "100%",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", color: "white", fontSize: "14px" }}>
                <Check size={16} style={{ color: "#22c55e", marginRight: "5px" }} /> Yes
              </div>
              <div style={{ color: "white", fontSize: "14px" }}>
                {formatCurrency(currentQuestion?.yesTotalBetAmount || 0)}
                <ChevronDown size={16} style={{ marginLeft: "5px" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", color: "white", fontSize: "14px" }}>
                <X size={16} style={{ color: "#ef4444", marginRight: "5px" }} /> No
              </div>
              <div style={{ color: "white", fontSize: "14px" }}>
                {formatCurrency(currentQuestion?.noTotalBetAmount || 0)}
                <ChevronDown size={16} style={{ marginLeft: "5px" }} />
              </div>
            </div>
          </div>
          {/* Your Balance and Add Balance Button */}
          <div
            style={{
              width: "100%",
              marginTop: "auto", // Push to bottom
              paddingTop: "15px",
              borderTop: "1px solid #1e293b",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "14px", color: "white", marginBottom: "10px" }}>
              Your Balance:{" "}
              <span style={{ color: "#06b6d4", fontWeight: "bold" }}>{formatCurrency(walletBalance)}</span>
            </div>
            <button
              onClick={() => handleAddFundsClick(10)} // Default to $10 or adjust as needed
              style={{
                backgroundColor: "#0ea5e9", // Blue color from screenshot
                border: "none",
                borderRadius: "6px",
                color: "white",
                padding: "10px",
                fontSize: "14px",
                fontWeight: "bold",
                width: "100%",
                cursor: "pointer",
              }}
            >
              ADD BALANCE
            </button>
          </div>
          {/* Socket Connection Indicator (kept for debugging/info) */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              color: isConnected ? "#22c55e" : "#ef4444",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: isConnected ? "#22c55e" : "#ef4444",
              }}
            ></div>
            {isConnected ? "Connected" : "Disconnected"}
          </div>
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
      {/* Auth Modal (rendered at the top level for overlay) */}
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
            onAuthStateChange={(loggedIn, userData) => {
              // Only close the modal if login was successful
              if (loggedIn) {
                setIsLoggedIn(loggedIn)
                if (userData) {
                  updateWalletBalanceUI(userData.walletBalance)
                  // Store user data in localStorage for persistence
                  localStorage.setItem("userData", JSON.stringify(userData))
                }
                setShowAuthModal(false)
              }
            }}
            isModal={true}
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      )}
      {/* Payment Modal (rendered at the top level for overlay) */}
      {showPaymentModal && (
        <PaymentModal
          show={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          requiredForBet={paymentForBet}
          title={paymentForBet ? "Additional Funds Needed" : "Add Funds"}
          description={paymentForBet ? "Add funds to place your bet" : "Choose how you want to proceed with payment"}
          currentBalance={walletBalance}
          amountNeeded={betAmount ? betAmount : amountNeeded}
        />
      )}
    </>
  )
}
