"use client"

import { useState } from "react"
import { useBetHandler } from "./bet-handler"
import PaymentModal from "./payment-modal"

export default function BetComponent() {
  const [betAmount, setBetAmount] = useState(100)
  const [betSelection, setBetSelection] = useState("")

  const {
    placeBet,
    loading,
    error,
    betSuccess,
    showPaymentModal,
    amountNeeded,
    currentBalance,
    handlePaymentSuccess,
    handlePaymentError,
    closePaymentModal,
    openPaymentModal,
  } = useBetHandler()

  const handleBetSubmit = async (e) => {
    e.preventDefault()

    const betData = {
      amount: betAmount,
      selection: betSelection,
      // Add other bet data as needed
    }

    const result = await placeBet(betData)

    // If insufficient funds, the bet handler will show the payment modal automatically
  }

  const handleAddFundsClick = () => {
    console.log("Add funds button clicked")
    // Don't pass any default amount, only open the modal
    openPaymentModal()
  }

  return (
    <div className="container">
      {betSuccess ? (
        <div className="alert alert-success">Your bet was placed successfully!</div>
      ) : (
        <form onSubmit={handleBetSubmit}>
          <div className="mb-3">
            <label htmlFor="betAmount" className="form-label">
              Bet Amount
            </label>
            <input
              type="number"
              className="form-control"
              id="betAmount"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min="1"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="betSelection" className="form-label">
              Selection
            </label>
            <input
              type="text"
              className="form-control"
              id="betSelection"
              value={betSelection}
              onChange={(e) => setBetSelection(e.target.value)}
              required
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="d-flex">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Processing..." : "Place Bet"}
            </button>

            <button type="button" className="btn btn-secondary ms-2" onClick={handleAddFundsClick}>
              Add Funds
            </button>
          </div>
        </form>
      )}

      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        onHide={closePaymentModal}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        amountNeeded={amountNeeded}
        currentBalance={currentBalance}
      />
    </div>
  )
}
