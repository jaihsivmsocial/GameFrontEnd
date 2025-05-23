// "use client"

// import { useState, useEffect } from "react"
// import dynamic from "next/dynamic"

// const PaymentModal = dynamic(() => import("../components/subscribes/PaymentModal"), {
//   ssr: false,
// })


// const GameHeader = () => {
//   const [timeLeft, setTimeLeft] = useState("05:12")
//   const [username, setUsername] = useState("MoJo") // Default username
//   const [userLevel, setUserLevel] = useState("64")
//   const [userXP, setUserXP] = useState({ current: 8450, total: 13500 })
//   const [balanceChanged, setBalanceChanged] = useState(false)
//   const [showPaymentModal, setShowPaymentModal] = useState(false)
//   const [paymentAmount, setPaymentAmount] = useState(100)
//   const [currentBalance, setCurrentBalance] = useState(0)
//   const [walletBalance, setWalletBalance] = useState(0)
//   const [loading, setLoading] = useState(true)

//   // Add a keyframe animation for balance changes
//   useEffect(() => {
//     // Add the keyframe animation to the document if it doesn't exist
//     if (!document.getElementById("balance-animation-style")) {
//       const style = document.createElement("style")
//       style.id = "balance-animation-style"
//       style.innerHTML = `
//       @keyframes pulse {
//         0% { transform: scale(1); }
//         50% { transform: scale(1.1); background-color: #ff3333; }
//         100% { transform: scale(1); }
//       }
//     `
//       document.head.appendChild(style)
//     }

//     return () => {
//       // Clean up the style element when component unmounts
//       const style = document.getElementById("balance-animation-style")
//       if (style) {
//         document.head.removeChild(style)
//       }
//     }
//   }, [])

//   // Function to fetch wallet balance directly
//   const fetchWalletBalance = async () => {
//     try {
//       setLoading(true)

//       // First try to get from localStorage for immediate display
//       try {
//         const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//         if (userData.walletBalance !== undefined) {
//           setWalletBalance(Number(userData.walletBalance))
//           setCurrentBalance(Number(userData.walletBalance))
//         }
//       } catch (e) {
//         console.error("Error reading from localStorage:", e)
//       }

//       // Then try to get from API
//       const balance = await getWalletBalance()
//       console.log("Fetched wallet balance:", balance)

//       setWalletBalance(Number(balance))
//       setCurrentBalance(Number(balance))

//       // Trigger animation if balance changed
//       const prevBalance = localStorage.getItem("prevBalance")
//         ? Number(localStorage.getItem("prevBalance"))
//         : walletBalance
//       if (balance !== prevBalance) {
//         setBalanceChanged(true)
//         setTimeout(() => setBalanceChanged(false), 1000)
//         localStorage.setItem("prevBalance", String(balance))
//       }

//       return balance
//     } catch (error) {
//       console.error("Error fetching wallet balance:", error)

//       // Try to get from localStorage as fallback
//       try {
//         const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//         const localBalance = userData.walletBalance || 0
//         setWalletBalance(Number(localBalance))
//         setCurrentBalance(Number(localBalance))
//         return localBalance
//       } catch (e) {
//         return 0
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Function to update wallet balance
//   const updateWalletBalance = (newBalance) => {
//     console.log("Updating wallet balance to:", newBalance)
//     setWalletBalance(Number(newBalance))
//     setCurrentBalance(Number(newBalance))

//     try {
//       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//       userData.walletBalance = Number(newBalance)
//       localStorage.setItem("userData", JSON.stringify(userData))
//     } catch (error) {
//       console.error("Error updating localStorage:", error)
//     }

//     // Trigger animation
//     setBalanceChanged(true)
//     setTimeout(() => setBalanceChanged(false), 1000)

//     // Store current balance as previous for next comparison
//     localStorage.setItem("prevBalance", String(newBalance))
//   }

//   // Fetch wallet balance on component mount and set up socket listener
//   useEffect(() => {
//     // Immediately fetch the wallet balance
//     fetchWalletBalance()

//     // Get user data from localStorage
//     const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//     if (userData.username) {
//       setUsername(userData.username)
//     } else {
//       const storedUsername = localStorage.getItem("username")
//       if (storedUsername) {
//         setUsername(storedUsername)
//       }
//     }

//     if (userData.level) {
//       setUserLevel(userData.level)
//     }

//     if (userData.xp) {
//       setUserXP(userData.xp)
//     }

//     // Set up socket listener for wallet updates
//     try {
//       const socket = window.io ? window.io() : null
//       if (socket) {
//         socket.on("wallet_update", (data) => {
//           console.log("Wallet update received in header:", data)
//           if (data.newBalance !== undefined) {
//             // Immediately update the UI with the new balance
//             updateWalletBalance(Number(data.newBalance))
//           }
//         })

//         socket.on("bet_response", (data) => {
//           console.log("Bet response received in header:", data)
//           if (data.success && data.newBalance !== undefined) {
//             // Immediately update the UI with the new balance
//             updateWalletBalance(Number(data.newBalance))
//           }
//         })

//         // Listen for direct balance updates
//         socket.on("direct_balance_update", (data) => {
//           console.log("Direct balance update received in header:", data)
//           if (data.newBalance !== undefined) {
//             // Immediately update the UI with the new balance
//             updateWalletBalance(Number(data.newBalance))
//           }
//         })
//       }
//     } catch (error) {
//       console.error("Error setting up socket listeners:", error)
//     }

//     // Listen for custom wallet balance update events
//     const handleWalletUpdate = (event) => {
//       console.log("Custom wallet update event received:", event.detail)
//       // Check for all possible balance properties
//       const newBalanceValue =
//         event.detail.newBalance !== undefined
//           ? event.detail.newBalance
//           : event.detail.wBalance !== undefined
//             ? event.detail.wBalance
//             : null

//       if (newBalanceValue !== null) {
//         // Immediately update the UI with the new balance
//         updateWalletBalance(Number(newBalanceValue))
//       }
//     }

//     window.addEventListener("wallet_balance_updated", handleWalletUpdate)

//     // Listen for API responses
//     const handleApiResponse = (event) => {
//       if (event.detail && event.detail.type === "API_RESPONSE" && event.detail.endpoint === "/api/bets/place") {
//         const responseData = event.detail.data
//         console.log("API response intercepted in header:", responseData)

//         if (responseData.success && responseData.newBalance !== undefined) {
//           console.log("Updating balance from API response:", responseData.newBalance)
//           updateWalletBalance(Number(responseData.newBalance))
//         }
//       }
//     }

//     window.addEventListener("api_response", handleApiResponse)

//     // Listen for payment success events
//     const handlePaymentSuccess = (event) => {
//       if (event.detail && event.detail.newBalance !== undefined) {
//         console.log("Payment success event received:", event.detail)
//         updateWalletBalance(Number(event.detail.newBalance))
//       }
//     }

//     window.addEventListener("payment_success", handlePaymentSuccess)

//     // Listen for open payment modal events from other components
//     const handleOpenPaymentModal = (event) => {
//       if (event.detail && event.detail.amount) {
//         setPaymentAmount(event.detail.amount)
//         setShowPaymentModal(true)
//       } else {
//         setPaymentAmount(100) // Default amount
//         setShowPaymentModal(true)
//       }
//     }

//     window.addEventListener("open_payment_modal", handleOpenPaymentModal)

//     // Set up timer for reward countdown
//     const timer = setInterval(() => {
//       // This is just for UI display, in a real app you'd calculate this from the server
//       const [minutes, seconds] = timeLeft.split(":").map(Number)
//       let newSeconds = seconds - 1
//       let newMinutes = minutes

//       if (newSeconds < 0) {
//         newSeconds = 59
//         newMinutes -= 1
//       }

//       if (newMinutes < 0) {
//         newMinutes = 5
//         newSeconds = 0
//       }

//       setTimeLeft(`${newMinutes.toString().padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`)
//     }, 1000)

//     const handleBetPlacedEvent = (event) => {
//       if (event.detail && event.detail.betData) {
//         handleBetPlaced(event.detail.betData)
//       }
//     }

//     window.addEventListener("bet_placed", handleBetPlacedEvent)

//     return () => {
//       if (window.io) {
//         const socket = window.io()
//         socket.off("wallet_update")
//         socket.off("bet_response")
//         socket.off("direct_balance_update")
//       }
//       window.removeEventListener("wallet_balance_updated", handleWalletUpdate)
//       window.removeEventListener("api_response", handleApiResponse)
//       window.removeEventListener("payment_success", handlePaymentSuccess)
//       window.removeEventListener("open_payment_modal", handleOpenPaymentModal)
//       window.removeEventListener("bet_placed", handleBetPlacedEvent)
//       clearInterval(timer)
//     }
//   }, [timeLeft])

//   // Calculate XP percentage
//   const xpPercentage = (userXP.current / userXP.total) * 100

//   // Update the formatBalance function to ensure proper formatting
//   const formatBalance = (balance) => {
//     // If balance is undefined, null, or loading, show loading indicator
//     if (balance === undefined || balance === null) {
//       return loading ? "..." : "0.00"
//     }

//     // Convert to number if it's a string
//     const numBalance = typeof balance === "string" ? Number.parseFloat(balance) : balance

//     // If NaN, return zero
//     if (isNaN(numBalance)) return "0.00"

//     // Format with commas for thousands
//     return numBalance.toLocaleString()
//   }

//   // Handle payment success
//   const handlePaymentSuccess = (paymentData) => {
//     console.log("Payment successful:", paymentData)

//     // Update wallet balance if provided
//     if (paymentData.newBalance !== undefined) {
//       const newBalance = Number(paymentData.newBalance)
//       console.log("Updating balance to:", newBalance)

//       updateWalletBalance(newBalance)

//       // Emit a custom event for other components to update
//       const event = new CustomEvent("wallet_balance_updated", {
//         detail: {
//           newBalance: newBalance,
//           source: "game_header_payment",
//         },
//       })
//       window.dispatchEvent(event)
//     } else if (paymentData.amount) {
//       // If newBalance is not provided, use amount
//       const newAmount = Number(paymentData.amount)
//       console.log("Using payment amount as balance:", newAmount)

//       updateWalletBalance(newAmount)
//     }

//     // Close the payment modal
//     setShowPaymentModal(false)
//   }

//   // Handle add funds click
//   const handleAddFundsClick = (amount = 100) => {
//     setPaymentAmount(amount)
//     setShowPaymentModal(true)
//   }

//   const handleBetPlaced = (betData) => {
//     console.log("Bet placed event received in game header:", betData)
//     if (betData && betData.newBalance !== undefined) {
//       // Update the wallet balance
//       updateWalletBalance(betData.newBalance)
//     }
//   }

//   // Manual refresh function
//   const handleRefreshBalance = async () => {
//     console.log("Manually refreshing wallet balance")
//     await fetchWalletBalance()
//   }

//   return (
//     <div
//       style={{
//         background: "#0a0f1a",
//         color: "white",
//         padding: "0",
//         display: "flex",
//         alignItems: "center",
//         height: "60px",
//         width: "100%",
//         position: "relative",
//         marginRight: "93px",
//       }}
//     >
//       {/* Settings Icon */}
//       <div style={{ display: "flex", alignItems: "center", marginLeft: "15px" }}>
//         <a
//           href="/setting"
//           className="text-white text-decoration-none"
//           style={{ opacity: 0.75 }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.opacity = 1
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.opacity = 0.75
//           }}
//         >
//           <img src="/assets/img/iconImage/settings 1.png" alt="Settings" width="24" height="24" />
//         </a>
//       </div>

//       {/* Character 1: Dynamic Username */}
//       <div style={{ display: "flex", alignItems: "center", marginLeft: "30px" }}>
//         <div
//           style={{
//             width: "48px",
//             height: "48px",
//             borderRadius: "4px",
//             overflow: "hidden",
//             border: "1px solid #333",
//             marginRight: "10px",
//             backgroundColor: "#222",
//           }}
//         >
//           <img
//             src="/assets/img/userprofile/userpic.png"
//             alt="Character Avatar"
//             style={{
//               width: "100%",
//               height: "100%",
//               objectFit: "cover",
//             }}
//           />
//         </div>
//         <div>
//           <div style={{ display: "flex", alignItems: "center" }}>
//             <div
//               style={{
//                 color: "#00e5ff",
//                 fontSize: "18px",
//                 fontWeight: "bold",
//                 lineHeight: "1",
//                 marginBottom: "1px",
//               }}
//             >
//               {username}
//             </div>
//             {/* Currency Button - Positioned beside the name */}
//             <div
//               style={{
//                 backgroundColor: "#00e5ff",
//                 color: "black",
//                 borderRadius: "4px",
//                 padding: "1px 6px",
//                 marginLeft: "8px",
//                 fontWeight: "bold",
//                 fontSize: "14px",
//                 display: "flex",
//                 alignItems: "center",
//                 height: "20px",
//                 transition: "all 0.3s ease",
//                 animation: balanceChanged ? "pulse 1s" : "none",
//                 cursor: "pointer",
//               }}
//               data-wallet-balance="true"
//               onClick={handleRefreshBalance}
//               title="Click to refresh balance"
//             >
//               <span style={{ marginRight: "2px", fontSize: "14px" }}>$</span>
//               {formatBalance(walletBalance)}
//             </div>
//           </div>
//           <div style={{ color: "#999", fontSize: "12px", lineHeight: "1", marginBottom: "3px" }}>LEVEL {userLevel}</div>
//           <div style={{ width: "120px" }}>
//             <div
//               style={{
//                 height: "4px",
//                 width: "100%",
//                 backgroundColor: "#222",
//                 borderRadius: "2px",
//                 marginBottom: "2px",
//               }}
//             >
//               <div
//                 style={{
//                   height: "100%",
//                   width: `${xpPercentage}%`,
//                   backgroundColor: "#00e5ff",
//                   borderRadius: "2px",
//                 }}
//               ></div>
//             </div>
//             <div style={{ color: "#666", fontSize: "10px", lineHeight: "1" }}>
//               {userXP.current.toLocaleString()}/{userXP.total.toLocaleString()} XP
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Character 2: POM */}
//       <div style={{ display: "flex", alignItems: "center", marginLeft: "30px" }}>
//         <div
//           style={{
//             width: "48px",
//             height: "48px",
//             borderRadius: "4px",
//             overflow: "hidden",
//             border: "1px solid #333",
//             marginRight: "10px",
//             backgroundColor: "#222",
//           }}
//         >
//           <img
//             src="/assets/img/userprofile/asist.png"
//             alt="POM Avatar"
//             style={{
//               width: "100%",
//               height: "100%",
//               objectFit: "cover",
//             }}
//           />
//         </div>
//         <div>
//           <div style={{ color: "#00e5ff", fontSize: "18px", fontWeight: "bold", lineHeight: "1", marginBottom: "1px" }}>
//             POM
//           </div>
//           <div style={{ color: "#999", fontSize: "12px", lineHeight: "1", marginBottom: "3px" }}>COMPANION</div>
//           <div style={{ width: "120px" }}>
//             <div
//               style={{
//                 height: "4px",
//                 width: "100%",
//                 backgroundColor: "#222",
//                 borderRadius: "2px",
//                 marginBottom: "2px",
//               }}
//             >
//               <div
//                 style={{
//                   height: "100%",
//                   width: "100%",
//                   backgroundColor: "#ff3333",
//                   borderRadius: "2px",
//                 }}
//               ></div>
//             </div>
//             <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
//               <div
//                 style={{
//                   color: "white",
//                   fontSize: "12px",
//                   backgroundColor: "#ff3333",
//                   padding: "1px 6px",
//                   borderRadius: "2px",
//                   fontWeight: "bold",
//                   display: "flex",
//                   alignItems: "center",
//                   height: "20px",
//                 }}
//               >
//                 <span style={{ marginRight: "4px" }}>❤️</span>
//                 100
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Next Reward Timer - Positioned at the far right */}
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "flex-end",
//           marginLeft: "auto",
//           marginRight: "15px",
//         }}
//       >
//         <div style={{ color: "#999", fontSize: "11px", marginBottom: "2px", textAlign: "right" }}>Next Reward in</div>
//         <div style={{ color: "#ffcc00", fontSize: "22px", fontWeight: "bold", lineHeight: "1" }}>{timeLeft}</div>
//       </div>

//       {/* Payment Modal */}
//       {showPaymentModal && (
//         <PaymentModal
//           show={showPaymentModal}
//           onHide={() => setShowPaymentModal(false)}
//           amount={paymentAmount}
//           onPaymentSuccess={handlePaymentSuccess}
//           currentBalance={currentBalance} // Pass current balance to PaymentModal
//         />
//       )}
//     </div>
//   )
// }

// export default GameHeader

"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { getWalletBalance } from "../components/wallet-service/api"
import { BASEURL } from "@/utils/apiservice"
const PaymentModal = dynamic(() => import("../components/subscribes/PaymentModal"), {
  ssr: false,
})

const GameHeader = () => {
  const [timeLeft, setTimeLeft] = useState("05:12")
  const [username, setUsername] = useState("MoJo") // Default username
  const [userLevel, setUserLevel] = useState("64")
  const [userXP, setUserXP] = useState({ current: 8450, total: 13500 })
  const [balanceChanged, setBalanceChanged] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(100)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [walletBalance, setWalletBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  // NEW - Add profile picture state
  const [profilePicture, setProfilePicture] = useState("/assets/img/userprofile/userpic.png")
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  const fileInputRef = useRef(null)

  // Add a keyframe animation for balance changes
  useEffect(() => {
    // Add the keyframe animation to the document if it doesn't exist
    if (!document.getElementById("balance-animation-style")) {
      const style = document.createElement("style")
      style.id = "balance-animation-style"
      style.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); background-color: #ff3333; }
        100% { transform: scale(1); }
      }
    `
      document.head.appendChild(style)
    }

    return () => {
      // Clean up the style element when component unmounts
      const style = document.getElementById("balance-animation-style")
      if (style) {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Function to fetch wallet balance directly
  const fetchWalletBalance = async () => {
    try {
      setLoading(true)

      // First try to get from localStorage for immediate display
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        if (userData.walletBalance !== undefined) {
          setWalletBalance(Number(userData.walletBalance))
          setCurrentBalance(Number(userData.walletBalance))
        }

        // NEW - Load profile picture if available
        if (userData.profilePicture) {
          setProfilePicture(userData.profilePicture)
        }
      } catch (e) {
        console.error("Error reading from localStorage:", e)
      }

      // Then try to get from API
      const balance = await getWalletBalance()
      console.log("Fetched wallet balance:", balance)

      setWalletBalance(Number(balance))
      setCurrentBalance(Number(balance))

      // Trigger animation if balance changed
      const prevBalance = localStorage.getItem("prevBalance")
        ? Number(localStorage.getItem("prevBalance"))
        : walletBalance
      if (balance !== prevBalance) {
        setBalanceChanged(true)
        setTimeout(() => setBalanceChanged(false), 1000)
        localStorage.setItem("prevBalance", String(balance))
      }

      return balance
    } catch (error) {
      console.error("Error fetching wallet balance:", error)

      // Try to get from localStorage as fallback
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        const localBalance = userData.walletBalance || 0
        setWalletBalance(Number(localBalance))
        setCurrentBalance(Number(localBalance))
        return localBalance
      } catch (e) {
        return 0
      }
    } finally {
      setLoading(false)
    }
  }

  // Function to update wallet balance
  const updateWalletBalance = (newBalance) => {
    console.log("Updating wallet balance to:", newBalance)
    setWalletBalance(Number(newBalance))
    setCurrentBalance(Number(newBalance))

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      userData.walletBalance = Number(newBalance)
      localStorage.setItem("userData", JSON.stringify(userData))
    } catch (error) {
      console.error("Error updating localStorage:", error)
    }

    // Trigger animation
    setBalanceChanged(true)
    setTimeout(() => setBalanceChanged(false), 1000)

    // Store current balance as previous for next comparison
    localStorage.setItem("prevBalance", String(newBalance))
  }

  // NEW - Handle profile picture click
  const handleProfilePictureClick = () => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      alert("Please login to upload a profile picture")
      return
    }
    fileInputRef.current?.click()
  }

  // NEW - Handle profile picture upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, JPG, PNG, or WEBP)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    setIsUploadingProfile(true)

    try {
      const formData = new FormData()
      formData.append("profilePicture", file)

      const token = localStorage.getItem("authToken")
  const response = await fetch(`${BASEURL}/api/updateProfile`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
})

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Profile picture uploaded successfully:", data)

      const newProfilePicture = data.user.profilePicture
      setProfilePicture(newProfilePicture)

      // Update localStorage with profile picture
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.profilePicture = newProfilePicture
        localStorage.setItem("userData", JSON.stringify(userData))
      } catch (error) {
        console.error("Error updating localStorage:", error)
      }

      // Emit custom event for other components
      const profileUpdateEvent = new CustomEvent("profile_picture_updated", {
        detail: {
          profilePicture: newProfilePicture,
          source: "game_header",
        },
      })
      window.dispatchEvent(profileUpdateEvent)

      alert("Profile picture updated successfully!")
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      alert("Failed to upload profile picture. Please try again.")
    } finally {
      setIsUploadingProfile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Fetch wallet balance on component mount and set up socket listener
  useEffect(() => {
    // Immediately fetch the wallet balance
    fetchWalletBalance()

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    if (userData.username) {
      setUsername(userData.username)
    } else {
      const storedUsername = localStorage.getItem("username")
      if (storedUsername) {
        setUsername(storedUsername)
      }
    }

    if (userData.level) {
      setUserLevel(userData.level)
    }

    if (userData.xp) {
      setUserXP(userData.xp)
    }

    // NEW - Load profile picture from localStorage
    if (userData.profilePicture) {
      setProfilePicture(userData.profilePicture)
    }

    // Set up socket listener for wallet updates
    try {
      const socket = window.io ? window.io() : null
      if (socket) {
        socket.on("wallet_update", (data) => {
          console.log("Wallet update received in header:", data)
          if (data.newBalance !== undefined) {
            // Immediately update the UI with the new balance
            updateWalletBalance(Number(data.newBalance))
          }
        })

        socket.on("bet_response", (data) => {
          console.log("Bet response received in header:", data)
          if (data.success && data.newBalance !== undefined) {
            // Immediately update the UI with the new balance
            updateWalletBalance(Number(data.newBalance))
          }
        })

        // Listen for direct balance updates
        socket.on("direct_balance_update", (data) => {
          console.log("Direct balance update received in header:", data)
          if (data.newBalance !== undefined) {
            // Immediately update the UI with the new balance
            updateWalletBalance(Number(data.newBalance))
          }
        })
      }
    } catch (error) {
      console.error("Error setting up socket listeners:", error)
    }

    // Listen for custom wallet balance update events
    const handleWalletUpdate = (event) => {
      console.log("Custom wallet update event received:", event.detail)
      // Check for all possible balance properties
      const newBalanceValue =
        event.detail.newBalance !== undefined
          ? event.detail.newBalance
          : event.detail.wBalance !== undefined
            ? event.detail.wBalance
            : null

      if (newBalanceValue !== null) {
        // Immediately update the UI with the new balance
        updateWalletBalance(Number(newBalanceValue))
      }
    }

    window.addEventListener("wallet_balance_updated", handleWalletUpdate)

    // Listen for API responses
    const handleApiResponse = (event) => {
      if (event.detail && event.detail.type === "API_RESPONSE" && event.detail.endpoint === "/api/bets/place") {
        const responseData = event.detail.data
        console.log("API response intercepted in header:", responseData)

        if (responseData.success && responseData.newBalance !== undefined) {
          console.log("Updating balance from API response:", responseData.newBalance)
          updateWalletBalance(Number(responseData.newBalance))
        }
      }
    }

    window.addEventListener("api_response", handleApiResponse)

    // Listen for payment success events
    const handlePaymentSuccess = (event) => {
      if (event.detail && event.detail.newBalance !== undefined) {
        console.log("Payment success event received:", event.detail)
        updateWalletBalance(Number(event.detail.newBalance))
      }
    }

    window.addEventListener("payment_success", handlePaymentSuccess)

    // Listen for open payment modal events from other components
    const handleOpenPaymentModal = (event) => {
      if (event.detail && event.detail.amount) {
        setPaymentAmount(event.detail.amount)
        setShowPaymentModal(true)
      } else {
        setPaymentAmount(100) // Default amount
        setShowPaymentModal(true)
      }
    }

    window.addEventListener("open_payment_modal", handleOpenPaymentModal)

    // NEW - Listen for profile picture updates from other components
    const handleProfilePictureUpdate = (event) => {
      if (event.detail && event.detail.profilePicture && event.detail.source !== "game_header") {
        console.log("Profile picture update received:", event.detail)
        setProfilePicture(event.detail.profilePicture)
      }
    }

    window.addEventListener("profile_picture_updated", handleProfilePictureUpdate)

    // Set up timer for reward countdown
    const timer = setInterval(() => {
      // This is just for UI display, in a real app you'd calculate this from the server
      const [minutes, seconds] = timeLeft.split(":").map(Number)
      let newSeconds = seconds - 1
      let newMinutes = minutes

      if (newSeconds < 0) {
        newSeconds = 59
        newMinutes -= 1
      }

      if (newMinutes < 0) {
        newMinutes = 5
        newSeconds = 0
      }

      setTimeLeft(`${newMinutes.toString().padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`)
    }, 1000)

    const handleBetPlacedEvent = (event) => {
      if (event.detail && event.detail.betData) {
        handleBetPlaced(event.detail.betData)
      }
    }

    window.addEventListener("bet_placed", handleBetPlacedEvent)

    return () => {
      if (window.io) {
        const socket = window.io()
        socket.off("wallet_update")
        socket.off("bet_response")
        socket.off("direct_balance_update")
      }
      window.removeEventListener("wallet_balance_updated", handleWalletUpdate)
      window.removeEventListener("api_response", handleApiResponse)
      window.removeEventListener("payment_success", handlePaymentSuccess)
      window.removeEventListener("open_payment_modal", handleOpenPaymentModal)
      window.removeEventListener("profile_picture_updated", handleProfilePictureUpdate) // NEW
      window.removeEventListener("bet_placed", handleBetPlacedEvent)
      clearInterval(timer)
    }
  }, [timeLeft])

  // Calculate XP percentage
  const xpPercentage = (userXP.current / userXP.total) * 100

  // Update the formatBalance function to ensure proper formatting
  const formatBalance = (balance) => {
    // If balance is undefined, null, or loading, show loading indicator
    if (balance === undefined || balance === null) {
      return loading ? "..." : "0.00"
    }

    // Convert to number if it's a string
    const numBalance = typeof balance === "string" ? Number.parseFloat(balance) : balance

    // If NaN, return zero
    if (isNaN(numBalance)) return "0.00"

    // Format with commas for thousands
    return numBalance.toLocaleString()
  }

  // Handle payment success
  const handlePaymentSuccess = (paymentData) => {
    console.log("Payment successful:", paymentData)

    // Update wallet balance if provided
    if (paymentData.newBalance !== undefined) {
      const newBalance = Number(paymentData.newBalance)
      console.log("Updating balance to:", newBalance)

      updateWalletBalance(newBalance)

      // Emit a custom event for other components to update
      const event = new CustomEvent("wallet_balance_updated", {
        detail: {
          newBalance: newBalance,
          source: "game_header_payment",
        },
      })
      window.dispatchEvent(event)
    } else if (paymentData.amount) {
      // If newBalance is not provided, use amount
      const newAmount = Number(paymentData.amount)
      console.log("Using payment amount as balance:", newAmount)

      updateWalletBalance(newAmount)
    }

    // Close the payment modal
    setShowPaymentModal(false)
  }

  // Handle add funds click
  const handleAddFundsClick = (amount = 100) => {
    setPaymentAmount(amount)
    setShowPaymentModal(true)
  }

  const handleBetPlaced = (betData) => {
    console.log("Bet placed event received in game header:", betData)
    if (betData && betData.newBalance !== undefined) {
      // Update the wallet balance
      updateWalletBalance(betData.newBalance)
    }
  }

  // Manual refresh function
  const handleRefreshBalance = async () => {
    console.log("Manually refreshing wallet balance")
    await fetchWalletBalance()
  }

  return (
    <div
      style={{
        background: "#0a0f1a",
        color: "white",
        padding: "0",
        display: "flex",
        alignItems: "center",
        height: "60px",
        width: "100%",
        position: "relative",
        marginRight: "93px",
      }}
    >
      {/* Settings Icon */}
      <div style={{ display: "flex", alignItems: "center", marginLeft: "15px" }}>
        <a
          href="/setting"
          className="text-white text-decoration-none"
          style={{ opacity: 0.75 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = 1
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = 0.75
          }}
        >
          <img src="/assets/img/iconImage/settings 1.png" alt="Settings" width="24" height="24" />
        </a>
      </div>

      {/* Character 1: Dynamic Username */}
      <div style={{ display: "flex", alignItems: "center", marginLeft: "30px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #333",
            marginRight: "10px",
            backgroundColor: "#222",
            cursor: "pointer", // NEW
            position: "relative", // NEW
            transition: "transform 0.2s ease", // NEW
          }}
          onClick={handleProfilePictureClick} // NEW
          onMouseEnter={(e) => {
            // NEW
            e.currentTarget.style.transform = "scale(1.05)"
          }}
          onMouseLeave={(e) => {
            // NEW
            e.currentTarget.style.transform = "scale(1)"
          }}
          title="Click to change profile picture" // NEW
        >
          <img
            src={profilePicture || "/assets/img/userprofile/userpic.png"} // CHANGED to use state
            alt="Character Avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* NEW - Upload loading indicator */}
          {isUploadingProfile && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "10px",
              }}
            >
              Uploading...
            </div>
          )}
          {/* NEW - Camera icon overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "rgba(0, 229, 255, 0.8)",
              color: "white",
              padding: "1px 3px",
              fontSize: "8px",
              borderRadius: "2px",
              opacity: 0.8,
            }}
          >
            📷
          </div>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                color: "#00e5ff",
                fontSize: "18px",
                fontWeight: "bold",
                lineHeight: "1",
                marginBottom: "1px",
              }}
            >
              {username}
            </div>
            {/* Currency Button - Positioned beside the name */}
            <div
              style={{
                backgroundColor: "#00e5ff",
                color: "black",
                borderRadius: "4px",
                padding: "1px 6px",
                marginLeft: "8px",
                fontWeight: "bold",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                height: "20px",
                transition: "all 0.3s ease",
                animation: balanceChanged ? "pulse 1s" : "none",
                cursor: "pointer",
              }}
              data-wallet-balance="true"
              onClick={handleRefreshBalance}
              title="Click to refresh balance"
            >
              <span style={{ marginRight: "2px", fontSize: "14px" }}>$</span>
              {formatBalance(walletBalance)}
            </div>
          </div>
          <div style={{ color: "#999", fontSize: "12px", lineHeight: "1", marginBottom: "3px" }}>LEVEL {userLevel}</div>
          <div style={{ width: "120px" }}>
            <div
              style={{
                height: "4px",
                width: "100%",
                backgroundColor: "#222",
                borderRadius: "2px",
                marginBottom: "2px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${xpPercentage}%`,
                  backgroundColor: "#00e5ff",
                  borderRadius: "2px",
                }}
              ></div>
            </div>
            <div style={{ color: "#666", fontSize: "10px", lineHeight: "1" }}>
              {userXP.current.toLocaleString()}/{userXP.total.toLocaleString()} XP
            </div>
          </div>
        </div>
      </div>

      {/* Character 2: POM */}
      <div style={{ display: "flex", alignItems: "center", marginLeft: "30px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #333",
            marginRight: "10px",
            backgroundColor: "#222",
          }}
        >
          <img
            src="/assets/img/userprofile/asist.png"
            alt="POM Avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div>
          <div style={{ color: "#00e5ff", fontSize: "18px", fontWeight: "bold", lineHeight: "1", marginBottom: "1px" }}>
            POM
          </div>
          <div style={{ color: "#999", fontSize: "12px", lineHeight: "1", marginBottom: "3px" }}>COMPANION</div>
          <div style={{ width: "120px" }}>
            <div
              style={{
                height: "4px",
                width: "100%",
                backgroundColor: "#222",
                borderRadius: "2px",
                marginBottom: "2px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: "#ff3333",
                  borderRadius: "2px",
                }}
              ></div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div
                style={{
                  color: "white",
                  fontSize: "12px",
                  backgroundColor: "#ff3333",
                  padding: "1px 6px",
                  borderRadius: "2px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  height: "20px",
                }}
              >
                <span style={{ marginRight: "4px" }}>❤️</span>
                100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Reward Timer - Positioned at the far right */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          marginLeft: "auto",
          marginRight: "15px",
        }}
      >
        <div style={{ color: "#999", fontSize: "11px", marginBottom: "2px", textAlign: "right" }}>Next Reward in</div>
        <div style={{ color: "#ffcc00", fontSize: "22px", fontWeight: "bold", lineHeight: "1" }}>{timeLeft}</div>
      </div>

      {/* NEW - Hidden file input for profile picture upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleProfilePictureUpload}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: "none" }}
      />

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          show={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
          amount={paymentAmount}
          onPaymentSuccess={handlePaymentSuccess}
          currentBalance={currentBalance} // Pass current balance to PaymentModal
        />
      )}
    </div>
  )
}

export default GameHeader
