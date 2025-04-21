// Update the helper function to be more direct and forceful
// Replace the existing updateWalletBalanceInUI function with this improved version:
import { updateWalletBalanceInUI } from "../../components/wallet-service/api"
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
  
      // Try to update the balance via API as well
      try {
        const walletAPI = require("./api").walletAPI
        walletAPI
          .updateBalance(Number(response.newBalance))
          .then((result) => {
            console.log("API balance update result:", result)
          })
          .catch((error) => {
            console.error("Error updating balance via API:", error)
          })
      } catch (apiError) {
        console.error("Error importing walletAPI:", apiError)
      }
  
      return true
    }
    return false
  }
  