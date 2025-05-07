import { bettingAPI } from "../../components/wallet-service/api"

export const betService = {
  // Place a bet and handle insufficient funds
  placeBet: async (betData) => {
    try {
      const response = await bettingAPI.placeBet(betData)
      return response
    } catch (error) {
      // If it's a 400 Bad Request with insufficient funds, return the error data
      if (error.response?.status === 400 && error.response?.data?.insufficientFunds) {
        return error.response.data
      }
      throw error
    }
  },
}

export default betService
