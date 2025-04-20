// This file provides a direct way to update the balance from anywhere in the app
import { updateWalletBalanceInUI } from "../wallet-service/api-helper"

class BalanceUpdater {
  constructor() {
    this.listeners = []
  }

  // Update the balance and notify all listeners
  updateBalance(newBalance) {
    console.log("BalanceUpdater: Updating balance to", newBalance)

    // Update the UI directly
    updateWalletBalanceInUI(Number(newBalance))

    // Notify all listeners
    this.listeners.forEach((listener) => listener(Number(newBalance)))

    // Emit a socket event if available
    try {
      const socket = window.io ? window.io() : null
      if (socket) {
        socket.emit("direct_balance_update", {
          newBalance: Number(newBalance),
        })
      }
    } catch (error) {
      console.error("Error emitting socket event:", error)
    }
  }

  // Add a listener
  addListener(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }
}

// Create a singleton instance
const balanceUpdater = new BalanceUpdater()

export default balanceUpdater
