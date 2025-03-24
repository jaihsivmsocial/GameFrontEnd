"use client"

import { useState } from "react"
import Image from "next/image"

export default function WithdrawFunds() {
  const [withdrawMethod, setWithdrawMethod] = useState("bank")
  const [selectedCard, setSelectedCard] = useState("visa")
  const [amount, setAmount] = useState(1000)
  const [customAmount, setCustomAmount] = useState("")

  const withdrawMethods = [
    { id: "bank", label: "Bank Account" },
    { id: "credit", label: "Credit Card" },
    { id: "paypal", label: "Paypal" },
    { id: "crypto", label: "Cryptocurrency" },
  ]

  const cardOptions = [
    { id: "visa", name: "Visa", image: "/assets/img/funds/visa.png?height=60&width=100" },
    { id: "mastercard", name: "Mastercard", image: "/assets/img/funds/Mastercard.png?height=60&width=100" },
    { id: "discover", name: "Discover", image: "/assets/img/funds/Discover.png?height=60&width=100" },
    { id: "amex", name: "American Express", image: "/assets/img/funds/American Express.png?height=60&width=100" },
    { id: "maestro", name: "Maestro", image: "/assets/img/funds/Maestro.png?height=60&width=100" },
  ]

  const amountOptions = [
    { value: 100, fee: 1 },
    { value: 500, fee: 3 },
    { value: 1000, fee: 5 },
    { value: 2000, fee: 8 },
  ]

  const handleAmountSelect = (value) => {
    setAmount(value)
    setCustomAmount("")
  }

  const handleCardSelect = (id) => {
    setSelectedCard(id)
  }

  const getFee = () => {
    const option = amountOptions.find((opt) => opt.value === amount)
    return option ? option.fee : 0
  }

  const getTotal = () => {
    return amount - getFee()
  }

  return (
    <div className="row">
      <div className="col-md-8">
        {/* Withdrawal Methods */}
        <div className="mb-4">
          <div className="payment-methods">
            {withdrawMethods.map((method) => (
              <div key={method.id} className="payment-method">
                <div
                  className={`radio-button ${withdrawMethod === method.id ? "active" : ""}`}
                  onClick={() => setWithdrawMethod(method.id)}
                >
                  {withdrawMethod === method.id && <div className="radio-dot"></div>}
                </div>
                <span>{method.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        {withdrawMethod === "credit" && (
          <div className="mb-4">
            <h6 className="section-title">Select Card</h6>
            <div className="card-options">
              {cardOptions.map((card) => (
                <div key={card.id} className="card-option" onClick={() => handleCardSelect(card.id)}>
                  <div className="card-image-container">
                    <div className="card-image">
                      <Image
                        src={card.image || "/placeholder.svg"}
                        alt={card.name}
                        fill
                        className="object-fit-contain"
                      />
                    </div>
                  </div>
                  <p className="card-name">{card.name}</p>
                  {selectedCard === card.id && (
                    <div className="check-mark">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bank Details */}
        {withdrawMethod === "bank" && (
          <div className="mb-4">
            <h6 className="section-title">Bank Details</h6>
            <div className="bank-details">
              <div className="form-group">
                <label>Account Holder Name</label>
                <input type="text" placeholder="Enter account holder name" />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input type="text" placeholder="Enter account number" />
              </div>
              <div className="form-group">
                <label>Routing Number</label>
                <input type="text" placeholder="Enter routing number" />
              </div>
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="mb-4">
          <h6 className="section-title">Amount</h6>
          <div className="amount-options">
            {amountOptions.map((option) => (
              <div
                key={option.value}
                className={`amount-option ${amount === option.value ? "active" : ""}`}
                onClick={() => handleAmountSelect(option.value)}
              >
                <div className="amount-value">${option.value}</div>
                <div className="amount-fee">Fee: ${option.fee}</div>
              </div>
            ))}
          </div>
          <div className="custom-amount">
            <input
              type="text"
              placeholder="Enter Amount Here..."
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setAmount(null)
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="col-md-4">
        <div className="summary-card">
          <h5 className="summary-title">Summary</h5>

          <div className="summary-row">
            <span>To Withdraw</span>
            <span className="summary-value">${amount}</span>
          </div>

          <div className="summary-row">
            <span>Account Status</span>
            <span className="status-pro">Pro</span>
          </div>

          <div className="summary-row">
            <span>Withdrawal Method</span>
            <span>{withdrawMethod === "bank" ? "Bank Account" : selectedCard}</span>
          </div>

          <div className="summary-row">
            <span>Fee</span>
            <span className="fee-value">${getFee()}</span>
          </div>

          <div className="summary-row">
            <span>You Receive</span>
            <span className="summary-value">${getTotal()}</span>
          </div>

          <button className="action-button">
            Withdraw Funds
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ms-2"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

