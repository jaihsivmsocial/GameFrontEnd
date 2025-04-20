

const io = require("socket.io-client")

// Socket.io connection
let socket

const initializeSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: true,
    })

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
    })
  }

  return socket
}

const getSocket = () => {
  if (!socket) {
    return initializeSocket()
  }
  return socket
}

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Update the socket event listeners to properly handle betting stats
const socketEvents = {
  // Listen for new questions
  onNewQuestion: (callback) => {
    getSocket().on("new_question", (data) => {
      console.log("New question received:", data)
      callback(data)
    })
  },

  // Listen for bet updates
  onBetPlaced: (callback) => {
    getSocket().on("bet_placed", (data) => {
      console.log("Bet placed received:", data)
      callback(data)
    })

    // Also listen for bet_update which contains percentage updates
    getSocket().on("bet_update", (data) => {
      console.log("Bet update received:", data)
      callback(data)
    })

    // Listen for the API response with balance updates
    getSocket().on("bet_response", (data) => {
      console.log("Bet response received:", data)
      if (data.success && data.newBalance !== undefined) {
        // Dispatch a custom event for real-time updates
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("wallet_balance_updated", {
              detail: { newBalance: data.newBalance },
            }),
          )
        }
      }
      callback(data)
    })
  },

  // Listen for question resolution
  onQuestionResolved: (callback) => {
    getSocket().on("question_resolved", (data) => {
      console.log("Question resolved received:", data)
      callback(data)
    })
  },

  // Listen for betting stats updates
  onBettingStats: (callback) => {
    getSocket().on("betting_stats", (data) => {
      console.log("Received betting stats from socket:", data)
      callback(data)
    })

    // Also listen for alternative event names that might be used
    getSocket().on("bet_stats", (data) => {
      console.log("Received bet_stats from socket:", data)
      callback(data)
    })

    getSocket().on("stats_update", (data) => {
      console.log("Received stats_update from socket:", data)
      callback(data)
    })
  },

  // Listen for total bets updates
  onTotalBetsUpdate: (callback) => {
    getSocket().on("total_bets_update", (data) => {
      console.log("Received total_bets_update from socket:", data)
      callback(data)
    })
  },

  // Listen for player count updates
  onPlayerCountUpdate: (callback) => {
    getSocket().on("player_count_update", (data) => {
      console.log("Received player_count_update from socket:", data)
      callback(data)
    })
  },

  // Add a specific handler for wallet balance updates
  onWalletUpdate: (callback) => {
    getSocket().on("wallet_update", (data) => {
      console.log("Wallet update received:", data)
      if (data.newBalance !== undefined) {
        // Dispatch a custom event for real-time updates
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("wallet_balance_updated", {
              detail: { newBalance: data.newBalance },
            }),
          )
        }
      }
      callback(data)
    })
  },

  // Remove event listener
  removeListener: (event) => {
    getSocket().off(event)
  },
}

module.exports = {
  initializeSocket,
  getSocket,
  disconnectSocket,
  socketEvents,
}
