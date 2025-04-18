"use client"

import { useState } from "react"
import Image from "next/image"

export default function PaymentModal({ show, onHide }) {
  const [paymentMethod, setPaymentMethod] = useState("credit")
  const [saveCard, setSaveCard] = useState(false)
  const [cardNumber, setCardNumber] = useState("8561 6499 9992 XXXX")
  const [cardName, setCardName] = useState("Mark Jake")
  const [cardExpiry, setCardExpiry] = useState("08/35")
  const [cardCvv, setCardCvv] = useState("985")

  if (!show) return null

  return (
    <div className="modal-backdrop show">
      <div
        className="position-fixed bottom-0 start-50 translate-middle-x"
        style={{
          zIndex: 1050,
          width: "600px",
          maxWidth: "90%",
          marginBottom: "100px", // Space for the bottom bar
        }}
      >
        <div
          style={{
            backgroundColor: "#001a33",
            color: "white",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">Payment Options</h5>
              <p className="text-muted small mb-0">Choose how you want to proceed with payment</p>
            </div>
            <div className="d-flex gap-2">
              <div className="payment-icon">
                <Image src="/visa.png" alt="Visa" width={30} height={20} />
              </div>
              <div className="payment-icon">
                <Image src="/mastercard.png" alt="Mastercard" width={30} height={20} />
              </div>
              <div className="payment-icon">
                <Image src="/discover.png" alt="Discover" width={30} height={20} />
              </div>
              <div className="payment-icon">
                <Image src="/amex.png" alt="American Express" width={30} height={20} />
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onHide} aria-label="Close"></button>
          </div>

          <div className="row">
            {/* Payment methods */}
            <div className="col-md-5">
              {/* First row of payment options */}
              <div className="d-flex mb-2">
                <div className="form-check me-4">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="creditCard"
                    checked={paymentMethod === "credit"}
                    onChange={() => setPaymentMethod("credit")}
                  />
                  <label className="form-check-label" htmlFor="creditCard">
                    Credit Card
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="debitCard"
                    checked={paymentMethod === "debit"}
                    onChange={() => setPaymentMethod("debit")}
                  />
                  <label className="form-check-label" htmlFor="debitCard">
                    Debit Card
                  </label>
                </div>
              </div>

              {/* Second row of payment options */}
              <div className="d-flex mb-2">
                <div className="form-check me-4">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                  />
                  <label className="form-check-label" htmlFor="paypal">
                    Paypal
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="crypto"
                    checked={paymentMethod === "crypto"}
                    onChange={() => setPaymentMethod("crypto")}
                  />
                  <label className="form-check-label" htmlFor="crypto">
                    Cryptocurrency
                  </label>
                </div>
              </div>

              {/* Account Balance option */}
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="balance"
                  checked={paymentMethod === "balance"}
                  onChange={() => setPaymentMethod("balance")}
                />
                <label className="form-check-label" htmlFor="balance">
                  Account Balance
                </label>
                <div className="text-muted small ms-4">Available Balance: $300</div>
              </div>
            </div>

            {/* Card details */}
            <div className="col-md-7">
              <div className="mb-3 position-relative">
                <input
                  type="text"
                  className="form-control"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  style={{
                    height: "45px",
                    backgroundColor: "#0a2744",
                    border: "1px solid #0a2744",
                    borderRadius: "4px",
                    fontSize: "16px",
                    paddingLeft: "15px",
                    color: "white",
                  }}
                />
                <div className="position-absolute end-0 top-50 translate-middle-y me-2">
                  <div className="payment-icon">
                    <Image src="/visa.png" alt="Visa" width={40} height={25} />
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <input
                    type="text"
                    className="form-control"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={{
                      height: "45px",
                      backgroundColor: "#0a2744",
                      border: "1px solid #0a2744",
                      borderRadius: "4px",
                      fontSize: "16px",
                      paddingLeft: "15px",
                      color: "white",
                    }}
                  />
                </div>
                <div className="col-4">
                  <input
                    type="text"
                    className="form-control"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    style={{
                      height: "45px",
                      backgroundColor: "#0a2744",
                      border: "1px solid #0a2744",
                      borderRadius: "4px",
                      fontSize: "16px",
                      paddingLeft: "15px",
                      color: "white",
                    }}
                  />
                </div>
                <div className="col-4">
                  <input
                    type="text"
                    className="form-control"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    style={{
                      height: "45px",
                      backgroundColor: "#0a2744",
                      border: "1px solid #0a2744",
                      borderRadius: "4px",
                      fontSize: "16px",
                      paddingLeft: "15px",
                      color: "white",
                    }}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="saveCard"
                    checked={saveCard}
                    onChange={() => setSaveCard(!saveCard)}
                  />
                  <label className="form-check-label small" htmlFor="saveCard">
                    Save card details for future payments
                  </label>
                </div>

                <button
                  className="btn"
                  style={{
                    backgroundColor: "#00A3FF",
                    borderColor: "#00A3FF",
                    color: "white",
                    height: "45px",
                    width: "150px",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
