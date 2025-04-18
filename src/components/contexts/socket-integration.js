// import io from "socket.io-client"
// import jwt_decode from "jwt-decode" // Add this package to your project

// // Initialize socket connection
// export const initializeSocket = (token) => {
//   // Decode the token to get the user ID
//   let userId = null
//   try {
//     if (token) {
//       const decoded = jwt_decode(token)
//       userId = decoded.id
//       console.log("Socket integration: Decoded user ID from token:", userId)
//     }
//   } catch (error) {
//     console.error("Error decoding token:", error)
//   }

//   const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
//     auth: {
//       token,
//       userId, // Add the actual user ID to the auth object
//     },
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000,
//     timeout: 10000,
//   })

//   // Add connection event handlers
//   socket.on("connect", () => {
//     console.log("Socket connected successfully with ID:", socket.id)
//   })

//   socket.on("connect_error", (error) => {
//     console.error("Socket connection error:", error)
//   })

//   socket.on("disconnect", (reason) => {
//     console.log(`Socket disconnected: ${reason}`)
//   })

//   return socket
// }

// // Betting socket events
// export const setupBettingSocket = (socket, callbacks = {}) => {
//   // Handle active bet
//   socket.on("active_bet", (data) => {
//     if (callbacks.onActiveBet) {
//       callbacks.onActiveBet(data)
//     }
//   })

//   // Handle new bet
//   socket.on("new_bet", (data) => {
//     if (callbacks.onNewBet) {
//       callbacks.onNewBet(data)
//     }
//   })

//   // Handle bet update
//   socket.on("bet_update", (data) => {
//     if (callbacks.onBetUpdate) {
//       callbacks.onBetUpdate(data)
//     }
//   })

//   // Handle bet closed
//   socket.on("bet_closed", (data) => {
//     if (callbacks.onBetClosed) {
//       callbacks.onBetClosed(data)
//     }
//   })

//   // Handle bet resolved
//   socket.on("bet_resolved", (data) => {
//     if (callbacks.onBetResolved) {
//       callbacks.onBetResolved(data)
//     }
//   })

//   // Handle bet placed
//   socket.on("bet_placed", (data) => {
//     if (callbacks.onBetPlaced) {
//       callbacks.onBetPlaced(data)
//     }
//   })

//   // Handle balance update
//   socket.on("balance_update", (data) => {
//     if (callbacks.onBalanceUpdate) {
//       callbacks.onBalanceUpdate(data)
//     }
//   })

//   // Handle errors
//   socket.on("error", (data) => {
//     if (callbacks.onError) {
//       callbacks.onError(data)
//     }
//   })

//   return {
//     // Join a stream room
//     joinStream: (streamId) => {
//       socket.emit("join_stream", streamId)
//     },

//     // Leave a stream room
//     leaveStream: (streamId) => {
//       socket.emit("leave_stream", streamId)
//     },

//     // Create a new bet
//     createBet: (data) => {
//       socket.emit("create_bet", data)
//     },

//     // Place a bet
//     placeBet: (data) => {
//       socket.emit("place_bet", data)
//     },

//     // Resolve a bet
//     resolveBet: (data) => {
//       socket.emit("resolve_bet", data)
//     },

//     // Get user balance
//     getBalance: () => {
//       socket.emit("get_balance")
//     },

//     // Disconnect socket
//     disconnect: () => {
//       socket.disconnect()
//     },
//   }
// }
