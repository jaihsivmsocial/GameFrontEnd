// Update the helper function to be more direct and forceful
// Replace the existing updateWalletBalanceInUI function with this improved version:

export const updateWalletBalanceInUI = (newBalance) => {
  console.log("DIRECTLY UPDATING WALLET BALANCE IN UI TO:", newBalance)

  // Convert to number to ensure proper handling
  const numBalance = Number(newBalance)

  // Update localStorage
  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    userData.walletBalance = numBalance
    localStorage.setItem("userData", JSON.stringify(userData))
  } catch (error) {
    console.error("Error updating localStorage:", error)
  }

  // Dispatch multiple events to ensure all components get updated
  if (typeof window !== "undefined") {
    // Standard event
    window.dispatchEvent(
      new CustomEvent("wallet_balance_updated", {
        detail: {
          newBalance: numBalance,
          source: "api_helper",
          timestamp: Date.now(),
        },
      }),
    )

    // Direct update event with high priority
    window.dispatchEvent(
      new CustomEvent("direct_balance_update", {
        detail: {
          newBalance: numBalance,
          source: "api_helper",
          timestamp: Date.now(),
        },
      }),
    )
  }

  // Try to emit a socket event if socket is available
  try {
    const socket = window.io ? window.io() : null
    if (socket && socket.connected) {
      socket.emit("direct_balance_update", {
        newBalance: numBalance,
        timestamp: Date.now(),
      })
    }
  } catch (socketError) {
    console.error("Error emitting socket event:", socketError)
  }

  // If we have access to the wallet context, update it directly
  try {
    if (window.__walletContext && window.__walletContext.updateBalance) {
      window.__walletContext.updateBalance(numBalance)
    }
  } catch (contextError) {
    console.error("Error updating wallet context directly:", contextError)
  }
}

// Update the handleBetResponse function to be more forceful
export const handleBetResponse = (response) => {
  console.log("Handling bet response:", response)

  if (response.success && response.newBalance !== undefined) {
    // Make sure to use the newBalance from the response
    updateWalletBalanceInUI(Number(response.newBalance))

    // Also try to update any global state directly
    try {
      if (window.__updateGlobalBalance) {
        window.__updateGlobalBalance(Number(response.newBalance))
      }
    } catch (error) {
      console.error("Error updating global balance:", error)
    }

    return true
  }
  return false
}
