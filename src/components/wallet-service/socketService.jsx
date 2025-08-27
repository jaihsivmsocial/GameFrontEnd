import { io } from "socket.io-client"
import { getCameraHolder } from "../../components/wallet-service/api"

// Update the extractCompetitionTimeFromQuestion function to add 36 seconds to the extracted time
export const extractCompetitionTimeFromQuestion = (questionText) => {
  if (!questionText) return null

  // Look for patterns like "30 sec", "20 Sec", etc.
  const match = questionText.match(/(\d+)\s*Sec/i)
  if (match && match[1]) {
    // Return the number of seconds PLUS 36 seconds (base competition time)
    const extractedTime = Number.parseInt(match[1], 10)
    const totalCompetitionTime = 36 + extractedTime
    console.log("Extracted time from question:", extractedTime)
    console.log("Total competition time (36 + extracted):", totalCompetitionTime)
    return totalCompetitionTime
  }
  return 36 // Default to 36 seconds if no time is found in the question
}

// Socket.io connection
let socket
let cameraHolderMonitoringActive = false
// Add this global variable to store camera holder data
let globalCameraHolder = null

// Add this function to receive camera holder updates from the server
export const startCameraHolderMonitoring = () => {
  // Don't start multiple monitoring instances
  if (cameraHolderMonitoringActive) {
    console.log("Camera holder monitoring already active")
    return () => {}
  }

  let lastCameraHolderName = null
  cameraHolderMonitoringActive = true

  // Function to check camera holder and request question if needed
  const checkCameraHolder = async () => {
    try {
      const { success, cameraHolder } = await getCameraHolder()

      if (!success || !cameraHolder) {
        return
      }

      const currentName = cameraHolder.CameraHolderName

      // Store the camera holder globally
      globalCameraHolder = cameraHolder

      // If camera holder changed, dispatch event immediately
      if (lastCameraHolderName !== currentName) {
        console.log("Camera holder changed from", lastCameraHolderName, "to", currentName)

        // Emit event to request a new question
        if (socket && socket.connected) {
          socket.emit("get_active_question")

          // Force create a question if we have a valid camera holder
          if (currentName && currentName !== "None") {
            socket.emit("create_bet_question", { streamId: getStreamId() })
          }

          // Dispatch a custom event that UI components can listen for
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("camera_holder_updated", {
                detail: { cameraHolder: cameraHolder },
              }),
            )
          }
        }
      }

      // Update the last camera holder name
      lastCameraHolderName = currentName
    } catch (error) {
      console.error("Error monitoring camera holder:", error)
    }
  }

  // Check immediately on start
  checkCameraHolder()

  // Check less frequently to prevent flickering - every 2 seconds instead of 500ms
  const intervalId = setInterval(checkCameraHolder, 2000)

  // Return a function to stop monitoring
  return () => {
    clearInterval(intervalId)
    cameraHolderMonitoringActive = false
  }
}

// Helper function to get stream ID from URL
export const getStreamId = () => {
  if (typeof window === "undefined") return "default-stream"
  const currentUrl = window.location.pathname
  return currentUrl.includes("/stream/") ? currentUrl.split("/stream/")[1].split("/")[0] : "default-stream"
}

// Update the initializeSocket function to handle camera holder updates
export const initializeSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://api.5mof.gg", {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)

      // Start monitoring camera holder changes when socket connects
      startCameraHolderMonitoring()

      // Request the current camera holder from the server
      socket.emit("get_camera_holder")

      // Request active question immediately on connect
      socket.emit("get_active_question")

      // Force create a question if we have a camera holder
      const currentCameraHolder = getCurrentCameraHolder()
      if (
        currentCameraHolder &&
        currentCameraHolder.CameraHolderName &&
        currentCameraHolder.CameraHolderName !== "None"
      ) {
        socket.emit("create_bet_question", { streamId: getStreamId() })
      }

      // Dispatch a connection event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("socket_connected"))
      }
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)

      // Try to reconnect
      setTimeout(() => {
        socket.connect()
      }, 1000)
    })

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)

      // Dispatch a disconnection event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("socket_disconnected"))
      }

      // Try to reconnect
      setTimeout(() => {
        socket.connect()
      }, 1000)
    })

    // Add listener for camera holder updates from the server
    socket.on("camera_holder_update", (data) => {
      console.log("Camera holder update received from server:", data)
      globalCameraHolder = data.cameraHolder

      // Dispatch a custom event for components that might not be directly using the socket
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("camera_holder_updated", {
            detail: { cameraHolder: data.cameraHolder },
          }),
        )

        // If we have a valid camera holder, immediately request a question
        if (data.cameraHolder && data.cameraHolder.CameraHolderName && data.cameraHolder.CameraHolderName !== "None") {
          socket.emit("get_active_question")
          socket.emit("create_bet_question", { streamId: getStreamId() })
        }
      }
    })

    // Update all socket event handlers to use the updated extraction function
    socket.on("new_question", (data) => {
      console.log("New question received from server:", data)
      console.log("BACKEND SOCKET QUESTION TEXT:", data.question)

      // Extract competition time from question text if not provided
      if (!data.competitionTime && data.question) {
        const extractedTime = extractCompetitionTimeFromQuestion(data.question)
        if (extractedTime) {
          console.log("TOTAL COMPETITION TIME (36 + EXTRACTED):", extractedTime)
          data.competitionTime = extractedTime
        } else {
          // Default to 36 seconds if no time is extracted
          data.competitionTime = 36
          console.log("DEFAULT COMPETITION TIME:", data.competitionTime)
        }
      } else if (data.competitionTime) {
        console.log("COMPETITION TIME FROM BACKEND:", data.competitionTime)
      }

      // Dispatch a custom event for components that might not be directly using the socket
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("new_question_received", {
            detail: { question: data },
          }),
        )
      }
    })

    // Update the current_question handler similarly
    socket.on("current_question", (data) => {
      console.log("Current question received from server:", data)
      console.log("BACKEND CURRENT QUESTION TEXT:", data.question)

      // Extract competition time from question text if not provided
      if (!data.competitionTime && data.question) {
        const extractedTime = extractCompetitionTimeFromQuestion(data.question)
        if (extractedTime) {
          console.log("TOTAL COMPETITION TIME (36 + EXTRACTED):", extractedTime)
          data.competitionTime = extractedTime
        } else {
          // Default to 36 seconds if no time is extracted
          data.competitionTime = 36
          console.log("DEFAULT COMPETITION TIME:", data.competitionTime)
        }
      } else if (data.competitionTime) {
        console.log("COMPETITION TIME FROM BACKEND:", data.competitionTime)
      }

      // Dispatch a custom event for components that might not be directly using the socket
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("current_question_received", {
            detail: { question: data },
          }),
        )
      }
    })

    // Update the question_created handler similarly
    socket.on("question_created", (data) => {
      console.log("Question created received:", data)
      console.log("BACKEND CREATED QUESTION TEXT:", data.question)

      // Extract competition time from question text if not provided
      if (!data.competitionTime && data.question) {
        const extractedTime = extractCompetitionTimeFromQuestion(data.question)
        if (extractedTime) {
          console.log("TOTAL COMPETITION TIME (36 + EXTRACTED):", extractedTime)
          data.competitionTime = extractedTime
        } else {
          // Default to 36 seconds if no time is extracted
          data.competitionTime = 36
          console.log("DEFAULT COMPETITION TIME:", data.competitionTime)
        }
      } else if (data.competitionTime) {
        console.log("COMPETITION TIME FROM BACKEND:", data.competitionTime)
      }

      // Dispatch a custom event for components that might not be directly using the socket
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("question_created", {
            detail: { question: data },
          }),
        )
      }
    })

    // Update the question_update handler similarly
    socket.on("question_update", (data) => {
      console.log("Question update received:", data)
      if (data && data.question) {
        console.log("BACKEND UPDATED QUESTION TEXT:", data.question.question)

        // Extract competition time from question text if not provided
        if (!data.question.competitionTime && data.question.question) {
          const extractedTime = extractCompetitionTimeFromQuestion(data.question.question)
          if (extractedTime) {
            console.log("TOTAL COMPETITION TIME (36 + EXTRACTED):", extractedTime)
            data.question.competitionTime = extractedTime
          } else {
            // Default to 36 seconds if no time is extracted
            data.question.competitionTime = 36
            console.log("DEFAULT COMPETITION TIME:", data.question.competitionTime)
          }
        } else if (data.question.competitionTime) {
          console.log("COMPETITION TIME FROM BACKEND:", data.question.competitionTime)
        }

        // Dispatch a custom event for components that might not be directly using the socket
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("question_updated", {
              detail: { question: data.question },
            }),
          )
        }
      }
    })
  }

  return socket
}

// Add a function to get the current camera holder
export const getCurrentCameraHolder = () => {
  return globalCameraHolder
}

export const getSocket = () => {
  if (!socket) {
    return initializeSocket()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    cameraHolderMonitoringActive = false
  }
}

// Update this function to use the global camera holder
export const shouldGenerateQuestions = async () => {
  try {
    // First check if we have a global camera holder
    if (globalCameraHolder) {
      return globalCameraHolder.CameraHolderName && globalCameraHolder.CameraHolderName !== "None"
    }

    // Fallback to API call
    const { success, cameraHolder } = await getCameraHolder()

    if (!success || !cameraHolder) {
      console.log("Failed to get camera holder or no camera holder data")
      return false
    }

    // Only generate questions if camera holder name is not empty and not "None"
    return cameraHolder.CameraHolderName && cameraHolder.CameraHolderName !== "None"
  } catch (error) {
    console.error("Error checking if questions should be generated:", error)
    return false
  }
}

// Update the socket event listeners to properly handle betting questions
export const socketEvents = {
  // Update the socketEvents.onNewQuestion handler
  onNewQuestion: (callback) => {
    getSocket().on("new_question", async (data) => {
      console.log("New question received from socket:", data)
      console.log("EXACT BACKEND SOCKET QUESTION TEXT:", data.question)

      // Extract competition time from question text if not provided
      if (!data.competitionTime && data.question) {
        const extractedTime = extractCompetitionTimeFromQuestion(data.question)
        if (extractedTime) {
          console.log("TOTAL COMPETITION TIME (36 + EXTRACTED):", extractedTime)
          data.competitionTime = extractedTime
        } else {
          // Default to 36 seconds if no time is extracted
          data.competitionTime = 36
          console.log("DEFAULT COMPETITION TIME:", data.competitionTime)
        }
      } else if (data.competitionTime) {
        console.log("COMPETITION TIME FROM BACKEND:", data.competitionTime)
      }

      // IMPORTANT: Pass the complete question data to the callback without modification
      callback(data)
    })

    // Also listen for current question responses
    getSocket().on("current_question", async (data) => {
      console.log("Current question received:", data)
      console.log("EXACT BACKEND CURRENT QUESTION TEXT:", data.question)

      // Extract competition time from question text if not provided
      if (!data.competitionTime && data.question) {
        const extractedTime = extractCompetitionTimeFromQuestion(data.question)
        if (extractedTime) {
          console.log("TOTAL COMPETITION TIME (36 + EXTRACTED):", extractedTime)
          data.competitionTime = extractedTime
        } else {
          // Default to 36 seconds if no time is extracted
          data.competitionTime = 36
          console.log("DEFAULT COMPETITION TIME:", data.competitionTime)
        }
      } else if (data.competitionTime) {
        console.log("COMPETITION TIME FROM BACKEND:", data.competitionTime)
      }

      // IMPORTANT: Pass the complete question data to the callback without modification
      callback(data)
    })

    // Also listen for question_created events
    getSocket().on("question_created", (data) => {
      console.log("Question created received:", data)
      console.log("BACKEND CREATED QUESTION TEXT:", data.question)

      // Extract competition time from question text if not provided
      if (!data.competitionTime && data.question) {
        const extractedTime = extractCompetitionTimeFromQuestion(data.question)
        if (extractedTime) {
          console.log("TOTAL COMPETITION TIME (36 + EXTRACTED):", extractedTime)
          data.competitionTime = extractedTime
        } else {
          // Default to 36 seconds if no time is extracted
          data.competitionTime = 36
          console.log("DEFAULT COMPETITION TIME:", data.competitionTime)
        }
      } else if (data.competitionTime) {
        console.log("COMPETITION TIME FROM BACKEND:", data.competitionTime)
      }

      // IMPORTANT: Pass the complete question data to the callback without modification
      callback(data)
    })

    // Also listen for question_update events
    getSocket().on("question_update", (data) => {
      console.log("Question update received:", data)
      if (data && data.question) {
        console.log("BACKEND UPDATED QUESTION TEXT:", data.question.question)

        // Extract competition time from question text if not provided
        if (!data.question.competitionTime && data.question.question) {
          const extractedTime = extractCompetitionTimeFromQuestion(data.question.question)
          if (extractedTime) {
            console.log("TOTAL COMPETITION TIME (36 + EXTRACTED):", extractedTime)
            data.question.competitionTime = extractedTime
          } else {
            // Default to 36 seconds if no time is extracted
            data.question.competitionTime = 36
            console.log("DEFAULT COMPETITION TIME:", data.question.competitionTime)
          }
        } else if (data.question.competitionTime) {
          console.log("COMPETITION TIME FROM BACKEND:", data.question.competitionTime)
        }

        // IMPORTANT: Pass the complete question data to the callback without modification
        callback(data.question)
      }
    })
  },

  // Add a new event listener for camera holder updates
  onCameraHolderUpdate: (callback) => {
    getSocket().on("camera_holder_update", (data) => {
      console.log("Camera holder update received:", data)
      globalCameraHolder = data.cameraHolder
      callback(data)
    })
  },

  // Request a question only if conditions are met
  requestQuestion: async () => {
    const generate = await shouldGenerateQuestions()
    if (generate) {
      console.log("Requesting question - camera holder conditions met")
      getSocket().emit("get_active_question")
    } else {
      console.log("Not requesting question - camera holder conditions not met")
    }
  },

  // Force request a question regardless of conditions (for manual requests)
  forceRequestQuestion: () => {
    console.log("Forcing question request")
    getSocket().emit("get_active_question")
  },

  // Request the current camera holder
  requestCameraHolder: () => {
    console.log("Requesting current camera holder")
    getSocket().emit("get_camera_holder")
  },

  // Keep the rest of the existing socket events...
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

  onQuestionResolved: (callback) => {
    getSocket().on("question_resolved", (data) => {
      console.log("Question resolved received:", data)
      callback(data)
    })
  },

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

  onTotalBetsUpdate: (callback) => {
    getSocket().on("total_bets_update", (data) => {
      console.log("Received total_bets_update from socket:", data)
      callback(data)
    })
  },

  onPlayerCountUpdate: (callback) => {
    getSocket().on("player_count_update", (data) => {
      console.log("Received player_count_update from socket:", data)
      callback(data)
    })
  },

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

  // Add a function to generate a new question
  generateNewQuestion: (streamId = null) => {
    const socket = getSocket()
    if (socket && socket.connected) {
      const currentStreamId = streamId || getStreamId()
      console.log("Requesting to create a new question for stream:", currentStreamId)
      socket.emit("create_bet_question", { streamId: currentStreamId })
      return true
    }
    return false
  },
}
