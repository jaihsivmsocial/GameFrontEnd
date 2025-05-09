// import { BASEURL } from "@/utils/apiservice"

// // Add a fallback mechanism for the BASEURL import at the top of the file
// // Add this right after the import statement
// // This ensures we have a fallback if the import fails
// if (typeof BASEURL === "undefined") {
//   console.warn("BASEURL is undefined, using fallback API URL")
// }

// // Fix the API_BASE_URL construction to handle undefined BASEURL
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof BASEURL !== "undefined" ? `${BASEURL}/api` : "/api")

// // Helper function to get auth token
// const getAuthToken = () => {
//   return (
//     localStorage.getItem("authToken") ||
//     (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")).token) ||
//     (localStorage.getItem("authData") && JSON.parse(localStorage.getItem("authData")).token)
//   )
// }

// // Helper function to handle API responses
// const handleResponse = async (response) => {
//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}))
//     throw new Error(errorData.message || `API error: ${response.status}`)
//   }
//   return response.json()
// }

// // Wallet API functions
// export const walletAPI = {
//   // Get wallet balance
//   getBalance: async () => {
//     try {
//       const token = getAuthToken()
//       if (!token) {
//         // Return balance from localStorage if not authenticated
//         const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//         return {
//           success: true,
//           balance: userData.walletBalance || 0,
//           customerId: userData.stripeCustomerId || null,
//         }
//       }

//       // Try to get balance from wallet endpoint
//       try {
//         const response = await fetch(`${API_BASE_URL}/payments/wallet`, {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         })

//         const data = await handleResponse(response)

//         // Update localStorage with customer ID if available
//         if (data.customerId) {
//           const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//           userData.stripeCustomerId = data.customerId
//           localStorage.setItem("userData", JSON.stringify(userData))
//         }

//         // Store the wallet balance in localStorage
//         if (data.walletBalance !== undefined) {
//           const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//           userData.walletBalance = data.walletBalance
//           localStorage.setItem("userData", JSON.stringify(userData))
//         }

//         return {
//           success: true,
//           balance: data.walletBalance || 0,
//           accountBalance: data.accountBalance || 0,
//           customerId: data.customerId || null,
//         }
//       } catch (walletError) {
//         console.warn("Error fetching from wallet endpoint:", walletError)

//         // Fallback: Try to get the latest payment data
//         try {
//           const response = await fetch(`${API_BASE_URL}/payments/history?limit=1`, {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           })

//           const data = await handleResponse(response)

//           if (data.success && data.payments && data.payments.length > 0) {
//             const latestPayment = data.payments[0]

//             // Get the amount from the latest payment
//             const paymentAmount = latestPayment.amount || 0

//             // Update localStorage with the payment amount
//             const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//             userData.walletBalance = paymentAmount
//             localStorage.setItem("userData", JSON.stringify(userData))

//             return {
//               success: true,
//               balance: paymentAmount,
//               customerId: latestPayment.stripeCustomerId || null,
//             }
//           }
//         } catch (paymentError) {
//           console.warn("Error fetching from payment history:", paymentError)
//         }

//         // If all else fails, return balance from localStorage
//         const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//         return {
//           success: true,
//           balance: userData.walletBalance || 0,
//           customerId: userData.stripeCustomerId || null,
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching wallet balance:", error)
//       return { success: false, error: error.message }
//     }
//   },

//   // Update wallet balance
//   updateBalance: async (amount) => {
//     try {
//       const token = getAuthToken()
//       if (!token) {
//         throw new Error("Authentication required")
//       }

//       const response = await fetch(`${API_BASE_URL}/payments/wallet/update`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ amount }),
//       })

//       const data = await handleResponse(response)

//       // Update localStorage with the new balance
//       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//       userData.walletBalance = amount
//       localStorage.setItem("userData", JSON.stringify(userData))

//       // Emit a custom event for other components to update
//       const event = new CustomEvent("wallet_balance_updated", {
//         detail: {
//           newBalance: amount,
//           source: "api_update_balance",
//         },
//       })
//       window.dispatchEvent(event)

//       return data
//     } catch (error) {
//       console.error("Error updating wallet balance:", error)
//       return { success: false, error: error.message }
//     }
//   },

//   // Refresh wallet balance from payment history
//   refreshBalance: async () => {
//     try {
//       const token = getAuthToken()
//       if (!token) {
//         throw new Error("Authentication required")
//       }

//       const response = await fetch(`${API_BASE_URL}/payments/wallet/refresh`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       const data = await handleResponse(response)

//       // Update localStorage with the new balance
//       if (data.success && data.newBalance !== undefined) {
//         const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//         userData.walletBalance = data.newBalance
//         localStorage.setItem("userData", JSON.stringify(userData))

//         // Emit a custom event for other components to update
//         const event = new CustomEvent("wallet_balance_updated", {
//           detail: {
//             newBalance: data.newBalance,
//             source: "api_refresh_balance",
//           },
//         })
//         window.dispatchEvent(event)
//       }

//       return data
//     } catch (error) {
//       console.error("Error refreshing wallet balance:", error)
//       return { success: false, error: error.message }
//     }
//   },

//   // Get or create Stripe customer
//   getOrCreateCustomer: async () => {
//     try {
//       const token = getAuthToken()
//       if (!token) {
//         throw new Error("Authentication required")
//       }

//       // Check if we already have a customer ID in localStorage
//       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//       if (userData.stripeCustomerId) {
//         return { success: true, customerId: userData.stripeCustomerId }
//       }

//       const response = await fetch(`${API_BASE_URL}/payments/customer`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       const data = await handleResponse(response)

//       // Update localStorage with customer ID
//       if (data.customerId) {
//         userData.stripeCustomerId = data.customerId
//         localStorage.setItem("userData", JSON.stringify(userData))
//       }

//       return data
//     } catch (error) {
//       console.error("Error getting or creating Stripe customer:", error)
//       return { success: false, error: error.message }
//     }
//   },

//   // Get payment history
//   getPaymentHistory: async () => {
//     try {
//       const token = getAuthToken()
//       if (!token) {
//         return { success: false, error: "Authentication required" }
//       }

//       const response = await fetch(`${API_BASE_URL}/payments/history?limit=10`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       return await handleResponse(response)
//     } catch (error) {
//       console.error("Error fetching payment history:", error)
//       return { success: false, error: error.message }
//     }
//   },

//   // Set auth token (used by wallet context)
//   setAuthToken: (token) => {
//     if (token) {
//       localStorage.setItem("authToken", token)
//     }
//   },
// }

// /**
//  * Get the current wallet balance
//  * @returns {Promise<number>} The wallet balance
//  */
// export const getWalletBalance = async () => {
//   try {
//     // First try to get from localStorage for immediate display
//     let localBalance = 0
//     try {
//       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//       localBalance = userData.walletBalance || 0
//     } catch (e) {
//       console.error("Error reading from localStorage:", e)
//     }

//     // Then try to get from API
//     const response = await fetch(`${API_BASE_URL}/payments/wallet`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "x-auth-token": localStorage.getItem("token"),
//         Authorization: `Bearer ${getAuthToken()}`,
//       },
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}))
//       console.warn("API error:", errorData)
//       return localBalance // Return localStorage balance if API fails
//     }

//     const data = await response.json()
//     console.log("API wallet response:", data)

//     // Update localStorage with the wallet balance
//     if (data.success && data.walletBalance !== undefined) {
//       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//       userData.walletBalance = data.walletBalance
//       localStorage.setItem("userData", JSON.stringify(userData))
//       return data.walletBalance
//     } else if (data.balance !== undefined) {
//       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//       userData.walletBalance = data.balance
//       localStorage.setItem("userData", JSON.stringify(userData))
//       return data.balance
//     } else if (data.newBalance !== undefined) {
//       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//       userData.walletBalance = data.newBalance
//       localStorage.setItem("userData", JSON.stringify(userData))
//       return data.newBalance
//     }

//     return localBalance
//   } catch (error) {
//     console.error("Error getting wallet balance:", error)

//     // Try to get from localStorage as fallback
//     try {
//       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//       return userData.walletBalance || 0
//     } catch (e) {
//       return 0
//     }
//   }
// }

// /**
//  * Update the wallet balance
//  * @param {number} amount - The new wallet balance amount
//  * @returns {Promise<Object>} The updated wallet data
//  */
// export const updateWalletBalance = async (amount) => {
//   try {
//     // Update localStorage immediately for responsive UI
//     try {
//       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//       userData.walletBalance = amount
//       localStorage.setItem("userData", JSON.stringify(userData))
//     } catch (error) {
//       console.error("Error updating localStorage:", error)
//     }

//     // Emit a custom event for other components to update
//     if (typeof window !== "undefined") {
//       window.dispatchEvent(
//         new CustomEvent("wallet_balance_updated", {
//           detail: {
//             newBalance: amount,
//             source: "direct_update",
//           },
//         }),
//       )
//     }

//     const response = await fetch(`${API_BASE_URL}/payments/wallet/update`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-auth-token": localStorage.getItem("token"),
//         Authorization: `Bearer ${getAuthToken()}`,
//       },
//       body: JSON.stringify({ amount }),
//     })

//     if (!response.ok) {
//       const errorData = await response.json()
//       throw new Error(errorData.message || "Failed to update wallet balance")
//     }

//     const data = await response.json()
//     return data
//   } catch (error) {
//     console.error("Error updating wallet balance:", error)
//     throw error
//   }
// }

// /**
//  * Refresh the wallet balance from payment history
//  * @returns {Promise<Object>} The refreshed wallet data
//  */
// export const refreshWalletBalance = async () => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/payments/wallet/refresh`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-auth-token": localStorage.getItem("token"),
//         Authorization: `Bearer ${getAuthToken()}`,
//       },
//     })

//     if (!response.ok) {
//       const errorData = await response.json()
//       throw new Error(errorData.message || "Failed to refresh wallet balance")
//     }

//     const data = await response.json()

//     // Update localStorage with the new balance
//     if (data.success && data.newBalance !== undefined) {
//       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//       userData.walletBalance = data.newBalance
//       localStorage.setItem("userData", JSON.stringify(userData))
//     }

//     return data
//   } catch (error) {
//     console.error("Error refreshing wallet balance:", error)
//     throw error
//   }
// }

// // Add a function to directly update the wallet balance in the UI
// export const updateWalletBalanceUI = (balance) => {
//   if (typeof window !== "undefined") {
//     console.log("Dispatching wallet balance update event with balance:", balance)

//     // Dispatch event with both newBalance and wBalance for compatibility
//     window.dispatchEvent(
//       new CustomEvent("wallet_balance_updated", {
//         detail: {
//           newBalance: balance,
//           wBalance: balance,
//           source: "direct_update",
//           timestamp: Date.now(),
//         },
//       }),
//     )

//     // Also update localStorage
//     try {
//       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//       userData.walletBalance = Number(balance)
//       localStorage.setItem("userData", JSON.stringify(userData))
//     } catch (error) {
//       console.error("Error updating localStorage in updateWalletBalanceUI:", error)
//     }

//     return true
//   }
//   return false
// }

// // Betting API functions
// export const bettingAPI = {
//   // Place a bet
//   placeBet: async (betData) => {
//     try {
//       const token = getAuthToken()
//       if (!token) {
//         throw new Error("Authentication required")
//       }

//       // Ensure we have a Stripe customer ID before placing a bet
//       await walletAPI.getOrCreateCustomer()

//       const response = await fetch(`${API_BASE_URL}/bets/place`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(betData),
//       })

//       const responseData = await handleResponse(response)

//       // If the bet was successful and we have a new balance, update it everywhere
//       if (responseData.success && responseData.newBalance !== undefined) {
//         // Update localStorage
//         try {
//           const userData = JSON.parse(localStorage.getItem("userData") || "{}")
//           userData.walletBalance = responseData.newBalance
//           localStorage.setItem("userData", JSON.stringify(userData))
//         } catch (error) {
//           console.error("Error updating localStorage after bet:", error)
//         }

//         // Emit a custom event for other components
//         if (typeof window !== "undefined") {
//           window.dispatchEvent(
//             new CustomEvent("wallet_balance_updated", {
//               detail: {
//                 newBalance: responseData.newBalance,
//                 source: "bet_placed",
//                 timestamp: Date.now(),
//               },
//             }),
//           )

//           // Also emit a specific bet_placed event
//           window.dispatchEvent(
//             new CustomEvent("bet_placed", {
//               detail: {
//                 betData: responseData,
//                 timestamp: Date.now(),
//               },
//             }),
//           )
//         }
//       }

//       return responseData
//     } catch (error) {
//       console.error("Error placing bet:", error)
//       return { success: false, error: error.message }
//     }
//   },

//   // Place a bet with partial payment
//   placeBetWithPartialPayment: async (betData) => {
//     try {
//       const token = getAuthToken()
//       if (!token) {
//         throw new Error("Authentication required")
//       }

//       // Ensure we have a Stripe customer ID before placing a bet
//       await walletAPI.getOrCreateCustomer()

//       const response = await fetch(`${API_BASE_URL}/bets/place-with-payment`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(betData),
//       })

//       return await handleResponse(response)
//     } catch (error) {
//       console.error("Error placing bet with partial payment:", error)
//       return { success: false, error: error.message }
//     }
//   },

//   // Get active betting question
//   getActiveQuestion: async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/bets/active-question`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })

//       return await handleResponse(response)
//     } catch (error) {
//       console.error("Error fetching active question:", error)
//       return { success: false, error: error.message }
//     }
//   },

//   // Get betting stats
//   getBetStats: async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/bets/stats`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })

//       return await handleResponse(response)
//     } catch (error) {
//       console.error("Error fetching bet stats:", error)
//       return { success: false, error: error.message }
//     }
//   },
// }

// export const getCameraHolder = async () => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/players/get`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })

//     if (!response.ok) {
//       console.warn("Error fetching camera holder:", response.status)
//       return { success: false, cameraHolder: null }
//     }

//     const data = await response.json()
//     console.log("Camera holder data:", data)
    
//     // The API returns an array with a single object
//     if (Array.isArray(data) && data.length > 0) {
//       return { 
//         success: true, 
//         cameraHolder: data[0]
//       }
//     }
    
//     return { success: false, cameraHolder: null }
//   } catch (error) {
//     console.error("Error fetching camera holder:", error)
//     return { success: false, cameraHolder: null, error: error.message }
//   }
// }


// export default {
//   walletAPI,
//   bettingAPI,
//   getWalletBalance,
//   updateWalletBalance,
//   refreshWalletBalance,
//   updateWalletBalanceUI,
//   getCameraHolder
// }



import { BASEURL } from "@/utils/apiservice"
// Add this import to get the global camera holder
import { getCurrentCameraHolder } from "../../components/wallet-service/socketService"

// Add a fallback mechanism for the BASEURL import at the top of the file
// Add this right after the import statement
// This ensures we have a fallback if the import fails
if (typeof BASEURL === "undefined") {
 console.warn("BASEURL is undefined, using fallback API URL")
}

// Fix the API_BASE_URL construction to handle undefined BASEURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof BASEURL !== "undefined" ? `${BASEURL}/api` : "/api")

// Helper function to get auth token
const getAuthToken = () => {
 return (
   localStorage.getItem("authToken") ||
   (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")).token) ||
   (localStorage.getItem("authData") && JSON.parse(localStorage.getItem("authData")).token)
 )
}

// Helper function to handle API responses
const handleResponse = async (response) => {
 if (!response.ok) {
   const errorData = await response.json().catch(() => ({}))
   throw new Error(errorData.message || `API error: ${response.status}`)
 }
 return response.json()
}

// Wallet API functions
export const walletAPI = {
 // Get wallet balance
 getBalance: async () => {
   try {
     const token = getAuthToken()
     if (!token) {
       // Return balance from localStorage if not authenticated
       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
       return {
         success: true,
         balance: userData.walletBalance || 0,
         customerId: userData.stripeCustomerId || null,
       }
     }

     // Try to get balance from wallet endpoint
     try {
       const response = await fetch(`${API_BASE_URL}/payments/wallet`, {
         method: "GET",
         headers: {
           Authorization: `Bearer ${token}`,
           "Content-Type": "application/json",
         },
       })

       const data = await handleResponse(response)

       // Update localStorage with customer ID if available
       if (data.customerId) {
         const userData = JSON.parse(localStorage.getItem("userData") || "{}")
         userData.stripeCustomerId = data.customerId
         localStorage.setItem("userData", JSON.stringify(userData))
       }

       // Store the wallet balance in localStorage
       if (data.walletBalance !== undefined) {
         const userData = JSON.parse(localStorage.getItem("userData") || "{}")
         userData.walletBalance = data.walletBalance
         localStorage.setItem("userData", JSON.stringify(userData))
       }

       return {
         success: true,
         balance: data.walletBalance || 0,
         accountBalance: data.accountBalance || 0,
         customerId: data.customerId || null,
       }
     } catch (walletError) {
       console.warn("Error fetching from wallet endpoint:", walletError)

       // Fallback: Try to get the latest payment data
       try {
         const response = await fetch(`${API_BASE_URL}/payments/history?limit=1`, {
           method: "GET",
           headers: {
             Authorization: `Bearer ${token}`,
             "Content-Type": "application/json",
           },
         })

         const data = await handleResponse(response)

         if (data.success && data.payments && data.payments.length > 0) {
           const latestPayment = data.payments[0]

           // Get the amount from the latest payment
           const paymentAmount = latestPayment.amount || 0

           // Update localStorage with the payment amount
           const userData = JSON.parse(localStorage.getItem("userData") || "{}")
           userData.walletBalance = paymentAmount
           localStorage.setItem("userData", JSON.stringify(userData))

           return {
             success: true,
             balance: paymentAmount,
             customerId: latestPayment.stripeCustomerId || null,
           }
         }
       } catch (paymentError) {
         console.warn("Error fetching from payment history:", paymentError)
       }

       // If all else fails, return balance from localStorage
       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
       return {
         success: true,
         balance: userData.walletBalance || 0,
         customerId: userData.stripeCustomerId || null,
       }
     }
   } catch (error) {
     console.error("Error fetching wallet balance:", error)
     return { success: false, error: error.message }
   }
 },

 // Update wallet balance
 updateBalance: async (amount) => {
   try {
     const token = getAuthToken()
     if (!token) {
       throw new Error("Authentication required")
     }

     const response = await fetch(`${API_BASE_URL}/payments/wallet/update`, {
       method: "POST",
       headers: {
         Authorization: `Bearer ${token}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({ amount }),
     })

     const data = await handleResponse(response)

     // Update localStorage with the new balance
     const userData = JSON.parse(localStorage.getItem("userData") || "{}")
     userData.walletBalance = amount
     localStorage.setItem("userData", JSON.stringify(userData))

     // Emit a custom event for other components to update
     const event = new CustomEvent("wallet_balance_updated", {
       detail: {
         newBalance: amount,
         source: "api_update_balance",
       },
     })
     window.dispatchEvent(event)

     return data
   } catch (error) {
     console.error("Error updating wallet balance:", error)
     return { success: false, error: error.message }
   }
 },

 // Refresh wallet balance from payment history
 refreshBalance: async () => {
   try {
     const token = getAuthToken()
     if (!token) {
       throw new Error("Authentication required")
     }

     const response = await fetch(`${API_BASE_URL}/payments/wallet/refresh`, {
       method: "POST",
       headers: {
         Authorization: `Bearer ${token}`,
         "Content-Type": "application/json",
       },
     })

     const data = await handleResponse(response)

     // Update localStorage with the new balance
     if (data.success && data.newBalance !== undefined) {
       const userData = JSON.parse(localStorage.getItem("userData") || "{}")
       userData.walletBalance = data.newBalance
       localStorage.setItem("userData", JSON.stringify(userData))

       // Emit a custom event for other components to update
       const event = new CustomEvent("wallet_balance_updated", {
         detail: {
           newBalance: data.newBalance,
           source: "api_refresh_balance",
         },
       })
       window.dispatchEvent(event)
     }

     return data
   } catch (error) {
     console.error("Error refreshing wallet balance:", error)
     return { success: false, error: error.message }
   }
 },

 // Get or create Stripe customer
 getOrCreateCustomer: async () => {
   try {
     const token = getAuthToken()
     if (!token) {
       throw new Error("Authentication required")
     }

     // Check if we already have a customer ID in localStorage
     const userData = JSON.parse(localStorage.getItem("userData") || "{}")
     if (userData.stripeCustomerId) {
       return { success: true, customerId: userData.stripeCustomerId }
     }

     const response = await fetch(`${API_BASE_URL}/payments/customer`, {
       method: "GET",
       headers: {
         Authorization: `Bearer ${token}`,
         "Content-Type": "application/json",
       },
     })

     const data = await handleResponse(response)

     // Update localStorage with customer ID
     if (data.customerId) {
       userData.stripeCustomerId = data.customerId
       localStorage.setItem("userData", JSON.stringify(userData))
     }

     return data
   } catch (error) {
     console.error("Error getting or creating Stripe customer:", error)
     return { success: false, error: error.message }
   }
 },

 // Get payment history
 getPaymentHistory: async () => {
   try {
     const token = getAuthToken()
     if (!token) {
       return { success: false, error: "Authentication required" }
     }

     const response = await fetch(`${API_BASE_URL}/payments/history?limit=10`, {
       method: "GET",
       headers: {
         Authorization: `Bearer ${token}`,
         "Content-Type": "application/json",
       },
     })

     return await handleResponse(response)
   } catch (error) {
     console.error("Error fetching payment history:", error)
     return { success: false, error: error.message }
   }
 },

 // Set auth token (used by wallet context)
 setAuthToken: (token) => {
   if (token) {
     localStorage.setItem("authToken", token)
   }
 },
}

/**
* Get the current wallet balance
* @returns {Promise<number>} The wallet balance
*/
export const getWalletBalance = async () => {
 try {
   // First try to get from localStorage for immediate display
   let localBalance = 0
   try {
     const userData = JSON.parse(localStorage.getItem("userData") || "{}")
     localBalance = userData.walletBalance || 0
   } catch (e) {
     console.error("Error reading from localStorage:", e)
   }

   // Then try to get from API
   const response = await fetch(`${API_BASE_URL}/payments/wallet`, {
     method: "GET",
     headers: {
       "Content-Type": "application/json",
       "x-auth-token": localStorage.getItem("token"),
       Authorization: `Bearer ${getAuthToken()}`,
     },
   })

   if (!response.ok) {
     const errorData = await response.json().catch(() => ({}))
     console.warn("API error:", errorData)
     return localBalance // Return localStorage balance if API fails
   }

   const data = await response.json()
   console.log("API wallet response:", data)

   // Update localStorage with the wallet balance
   if (data.success && data.walletBalance !== undefined) {
     const userData = JSON.parse(localStorage.getItem("userData") || "{}")
     userData.walletBalance = data.walletBalance
     localStorage.setItem("userData", JSON.stringify(userData))
     return data.walletBalance
   } else if (data.balance !== undefined) {
     const userData = JSON.parse(localStorage.getItem("userData") || "{}")
     userData.walletBalance = data.balance
     localStorage.setItem("userData", JSON.stringify(userData))
     return data.balance
   } else if (data.newBalance !== undefined) {
     const userData = JSON.parse(localStorage.getItem("userData") || "{}")
     userData.walletBalance = data.newBalance
     localStorage.setItem("userData", JSON.stringify(userData))
     return data.newBalance
   }

   return localBalance
 } catch (error) {
   console.error("Error getting wallet balance:", error)

   // Try to get from localStorage as fallback
   try {
     const userData = JSON.parse(localStorage.getItem("userData") || "{}")
     return userData.walletBalance || 0
   } catch (e) {
     return 0
   }
 }
}

/**
* Update the wallet balance
* @param {number} amount - The new wallet balance amount
* @returns {Promise<Object>} The updated wallet data
*/
export const updateWalletBalance = async (amount) => {
 try {
   // Update localStorage immediately for responsive UI
   try {
     const userData = JSON.parse(localStorage.getItem("userData") || "{}")
     userData.walletBalance = amount
     localStorage.setItem("userData", JSON.stringify(userData))
   } catch (error) {
     console.error("Error updating localStorage:", error)
   }

   // Emit a custom event for other components to update
   if (typeof window !== "undefined") {
     window.dispatchEvent(
       new CustomEvent("wallet_balance_updated", {
         detail: {
           newBalance: amount,
           source: "direct_update",
         },
       }),
     )
   }

   const response = await fetch(`${API_BASE_URL}/payments/wallet/update`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "x-auth-token": localStorage.getItem("token"),
       Authorization: `Bearer ${getAuthToken()}`,
     },
     body: JSON.stringify({ amount }),
   })

   if (!response.ok) {
     const errorData = await response.json()
     throw new Error(errorData.message || "Failed to update wallet balance")
   }

   const data = await response.json()
   return data
 } catch (error) {
   console.error("Error updating wallet balance:", error)
   throw error
 }
}

/**
* Refresh the wallet balance from payment history
* @returns {Promise<Object>} The refreshed wallet data
*/
export const refreshWalletBalance = async () => {
 try {
   const response = await fetch(`${API_BASE_URL}/payments/wallet/refresh`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "x-auth-token": localStorage.getItem("token"),
       Authorization: `Bearer ${getAuthToken()}`,
     },
   })

   if (!response.ok) {
     const errorData = await response.json()
     throw new Error(errorData.message || "Failed to refresh wallet balance")
   }

   const data = await response.json()

   // Update localStorage with the new balance
   if (data.success && data.newBalance !== undefined) {
     const userData = JSON.parse(localStorage.getItem("userData") || "{}")
     userData.walletBalance = data.newBalance
     localStorage.setItem("userData", JSON.stringify(userData))
   }

   return data
 } catch (error) {
   console.error("Error refreshing wallet balance:", error)
   throw error
 }
}

// Add a function to directly update the wallet balance in the UI
export const updateWalletBalanceUI = (balance) => {
 if (typeof window !== "undefined") {
   console.log("Dispatching wallet balance update event with balance:", balance)

   // Dispatch event with both newBalance and wBalance for compatibility
   window.dispatchEvent(
     new CustomEvent("wallet_balance_updated", {
       detail: {
         newBalance: balance,
         wBalance: balance,
         source: "direct_update",
         timestamp: Date.now(),
       },
     }),
   )

   // Also update localStorage
   try {
     const userData = JSON.parse(localStorage.getItem("userData") || "{}")
     userData.walletBalance = Number(balance)
     localStorage.setItem("userData", JSON.stringify(userData))
   } catch (error) {
     console.error("Error updating localStorage in updateWalletBalanceUI:", error)
   }

   return true
 }
 return false
}

// Modified getCameraHolder function to use the global camera holder when possible
export const getCameraHolder = async () => {
 // First check if we have a global camera holder from socket
 const globalCameraHolder = getCurrentCameraHolder()
 if (globalCameraHolder) {
   console.log("Using global camera holder:", globalCameraHolder)
   return { 
     success: true, 
     cameraHolder: globalCameraHolder
   }
 }
 
 // If not, fall back to API call
 try {
   const response = await fetch(`${API_BASE_URL}/players/get`, {
     method: "GET",
     headers: {
       "Content-Type": "application/json",
     },
   })

   if (!response.ok) {
     console.warn("Error fetching camera holder:", response.status)
     return { success: false, cameraHolder: null }
   }

   const data = await response.json()
   console.log("Camera holder data from API:", data)
   
   // The API returns an array with a single object
   if (Array.isArray(data) && data.length > 0) {
     return { 
       success: true, 
       cameraHolder: data[0]
     }
   }
   
   return { success: false, cameraHolder: null }
 } catch (error) {
   console.error("Error fetching camera holder:", error)
   return { success: false, cameraHolder: null, error: error.message }
 }
}

// Betting API functions
export const bettingAPI = {
 // Place a bet
 placeBet: async (betData) => {
   try {
     const token = getAuthToken()
     if (!token) {
       throw new Error("Authentication required")
     }

     // Ensure we have a Stripe customer ID before placing a bet
     await walletAPI.getOrCreateCustomer()

     const response = await fetch(`${API_BASE_URL}/bets/place`, {
       method: "POST",
       headers: {
         Authorization: `Bearer ${token}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify(betData),
     })

     const responseData = await handleResponse(response)

     // If the bet was successful and we have a new balance, update it everywhere
     if (responseData.success && responseData.newBalance !== undefined) {
       // Update localStorage
       try {
         const userData = JSON.parse(localStorage.getItem("userData") || "{}")
         userData.walletBalance = responseData.newBalance
         localStorage.setItem("userData", JSON.stringify(userData))
       } catch (error) {
         console.error("Error updating localStorage after bet:", error)
       }

       // Emit a custom event for other components
       if (typeof window !== "undefined") {
         window.dispatchEvent(
           new CustomEvent("wallet_balance_updated", {
             detail: {
               newBalance: responseData.newBalance,
               source: "bet_placed",
               timestamp: Date.now(),
             },
           }),
         )

         // Also emit a specific bet_placed event
         window.dispatchEvent(
           new CustomEvent("bet_placed", {
             detail: {
               betData: responseData,
               timestamp: Date.now(),
             },
           }),
         )
       }
     }

     return responseData
   } catch (error) {
     console.error("Error placing bet:", error)
     return { success: false, error: error.message }
   }
 },

 // Place a bet with partial payment
 placeBetWithPartialPayment: async (betData) => {
   try {
     const token = getAuthToken()
     if (!token) {
       throw new Error("Authentication required")
     }

     // Ensure we have a Stripe customer ID before placing a bet
     await walletAPI.getOrCreateCustomer()

     const response = await fetch(`${API_BASE_URL}/bets/place-with-payment`, {
       method: "POST",
       headers: {
         Authorization: `Bearer ${token}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify(betData),
     })

     return await handleResponse(response)
   } catch (error) {
     console.error("Error placing bet with partial payment:", error)
     return { success: false, error: error.message }
   }
 },

 // Get active betting question
 getActiveQuestion: async () => {
   try {
     const response = await fetch(`${API_BASE_URL}/bets/active-question`, {
       method: "GET",
       headers: {
         "Content-Type": "application/json",
       },
     })

     return await handleResponse(response)
   } catch (error) {
     console.error("Error fetching active question:", error)
     return { success: false, error: error.message }
   }
 },

 // Get betting stats
 getBetStats: async () => {
   try {
     const response = await fetch(`${API_BASE_URL}/bets/stats`, {
       method: "GET",
       headers: {
         "Content-Type": "application/json",
       },
     })

     return await handleResponse(response)
   } catch (error) {
     console.error("Error fetching bet stats:", error)
     return { success: false, error: error.message }
   }
 },
}

export default {
 walletAPI,
 bettingAPI,
 getWalletBalance,
 updateWalletBalance,
 refreshWalletBalance,
 updateWalletBalanceUI,
 getCameraHolder
}