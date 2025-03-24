"use client"

import { useState } from "react"
import Image from "next/image"

export default function DepositFunds() {
  const [paymentMethod, setPaymentMethod] = useState("credit")
  const [selectedCard, setSelectedCard] = useState("visa")
  const [amount, setAmount] = useState(1000)
  const [customAmount, setCustomAmount] = useState("")
  const [couponCode, setCouponCode] = useState("MOJOONPC")

  const paymentMethods = [
    { id: "credit", label: "Credit Card" },
    { id: "debit", label: "Debit Card" },
    { id: "paypal", label: "Paypal" },
    { id: "crypto", label: "Cryptocurrency" },
    { id: "bank", label: "Bank Transfer" },
  ]

  const cardOptions = [
    { id: "visa", name: "Visa", image: "/assets/img/funds/visa.png?height=60&width=100" },
    { id: "mastercard", name: "Mastercard", image: "/assets/img/funds/Mastercard.png?height=60&width=100" },
    { id: "discover", name: "Discover", image: "/assets/img/funds/Discover.png?height=60&width=100" },
    { id: "amex", name: "American Express", image: "/assets/img/funds/American Express.png?height=60&width=100" },
    { id: "maestro", name: "Maestro", image: "/assets/img/funds/Maestro.png?height=60&width=100" },
  ]

  const amountOptions = [
    { value: 500, bonus: 10 },
    { value: 1000, bonus: 30 },
    { value: 2000, bonus: 50 },
    { value: 5000, bonus: 70 },
  ]

  const handleAmountSelect = (value) => {
    setAmount(value)
    setCustomAmount("")
  }

  const handleCardSelect = (id) => {
    setSelectedCard(id)
  }

  const getBonus = () => {
    const option = amountOptions.find((opt) => opt.value === amount)
    return option ? (amount * option.bonus) / 100 : 0
  }

  const getTotal = () => {
    return amount + getBonus()
  }

  return (
    <div className="row">
      <div className="col-md-8">
        {/* Payment Methods */}
        <div className="mb-4">
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <div key={method.id} className="payment-method">
                <div
                  className={`radio-button ${paymentMethod === method.id ? "active" : ""}`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  {paymentMethod === method.id && <div className="radio-dot"></div>}
                </div>
                <span>{method.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="mb-4">
          <h6 className="section-title">Services</h6>
          <div className="card-options">
            {cardOptions.map((card) => (
              <div key={card.id} className="card-option" onClick={() => handleCardSelect(card.id)}>
                <div className="card-image-container">
                  <div className="card-image">
                    <Image src={card.image || "/placeholder.svg"} alt={card.name} fill className="object-fit-contain" />
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
                <div className="amount-bonus">+{option.bonus}% Bonus</div>
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

        {/* Coupon Code */}
        <div className="mb-4">
          <h6 className="section-title">Enter Coupon or Referral Code</h6>
          <div className="coupon-input">
            <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            <button className="apply-button">Apply</button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="col-md-4 d-flex flex-column justify-content-between h-100">
  <div className="summary-card p-3 shadow rounded">
    <h5 className="summary-title text-center">Summary</h5>

    <div className="summary-row d-flex justify-content-between">
      <span>To Deposit</span>
      <span className="summary-value">${getTotal()}</span>
    </div>

    <div className="summary-row d-flex justify-content-between">
      <span>Account Status</span>
      <span className="status-pro">Pro</span>
    </div>

    <div className="summary-row d-flex justify-content-between">
      <span>Payment Method</span>
      <span>{selectedCard.charAt(0).toUpperCase() + selectedCard.slice(1)}</span>
    </div>

    <div className="summary-row d-flex justify-content-between">
      <span>To Pay</span>
      <span className="summary-value">${amount}</span>
    </div>

    {/* Add Funds Button (Anchored at Bottom) */}
    <button className="btn btn-primary w-100 mt-auto d-flex justify-content-center align-items-center">
      Add Funds
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

