"use client"

import { useState } from "react"
import { BASEURL } from "@/utils/apiservice"

const ForgotPasswordModal = ({ show, handleClose, onRequestOTP, email, setEmail }) => {
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("success") // 'success' or 'error'
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setMessageType("success")
    setLoading(true)

    try {
      console.log("Sending forgot password request for email:", email)

      // You can use either endpoint once auth middleware is removed
      const response = await fetch(`${BASEURL}/api/request-otp-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      // Log the raw response for debugging
      const responseText = await response.text()
      console.log("Forgot password response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Error parsing response:", e)
        throw new Error("Invalid response from server")
      }

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error("Email not found. Please check your email address or register a new account.")
        } else {
          throw new Error(data.message || data.error || "Failed to send verification code")
        }
      }

      // Success case
      setMessageType("success")
      setMessage("Verification code sent to your email!")

      // If we have a test OTP in the response (for development), show it
      if (data.testOtp) {
        console.log("Test OTP:", data.testOtp)
        setMessage(`Verification code sent to your email! (Test OTP: ${data.testOtp})`)
      }

      // Wait a moment to show the success message before closing
      setTimeout(() => {
        if (onRequestOTP) {
          onRequestOTP(email) // Pass email to onRequestOTP if needed
        } else {
          handleClose()
        }
      }, 2000)
    } catch (err) {
      console.error("Forgot password error:", err)
      setMessageType("error")
      setMessage(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(2px)", zIndex: 1050 }}
    >
      <div
        className="card p-4 text-white position-relative"
        style={{ backgroundColor: "#121212", borderRadius: "10px", width: "400px", border: "2px solid #0dcaf0" }}
      >
        <button
          className="btn-close position-absolute top-0 end-0 m-2"
          style={{ backgroundColor: "#fff" }}
          onClick={handleClose}
          aria-label="Close"
        ></button>
        <div className="text-center">
          <span role="img" aria-label="crying emoji" style={{ fontSize: "2rem" }}>
            😭
          </span>
          <h5 className="mt-2">Forgot your password?</h5>
          <p className="text-muted">Reset your password using your registered email address.</p>
        </div>
        {message && (
          <p className={`text-${messageType === "success" ? "success" : "danger"} text-center`} role="alert">
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email-input" className="form-label">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#0dcaf0", color: "#fff", fontWeight: "bold" }}
            disabled={loading || !email}
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-muted">
            Need help?{" "}
            <a href="/support" className="text-white fw-bold">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordModal

