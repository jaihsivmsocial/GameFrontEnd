"use client"

import { useState, useRef, useEffect } from "react"
import { BASEURL } from "@/utils/apiservice"

const SignupVerifyCodeModal = ({ show, handleClose, email, onVerify, loading: externalLoading }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("success")

  const inputRefs = useRef([])

  useEffect(() => {
    if (show) {
      // Focus the first input when modal opens
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
        
      }

      // Start the countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [show])

  // Format the time remaining
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!code[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus()
      }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setCode(digits)

      // Focus the last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus()
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setVerificationLoading(true)
    setMessage("")

    try {
      // Get the full OTP code
      const otp = code.join("")

      console.log("Submitting signup verification with:", {
        email,
        otp,
      })

      // Call the parent's onVerify function
      const success = await onVerify(otp)

      if (success) {
        // Success message will be handled by parent component
        setMessageType("success")
        setMessage("Email verified successfully!")
        
        // Reset form
        setCode(["", "", "", "", "", ""])
        
        return true
      } else {
        setMessageType("error")
        setMessage("Invalid verification code. Please try again.")
        return false
      }
    } catch (err) {
      console.error("Signup verification error:", err)
      setMessageType("error")
      setMessage(err.message || "Verification failed")
      return false
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      // Reset the timer
      setTimeLeft(300)

      // Resend signup OTP
      const response = await fetch(`${BASEURL}/api/send-signup-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code")
      }

      // If we have a test OTP in the response (for development), show it
      if (data.testOtp) {
        console.log("Test Signup OTP:", data.testOtp)
        setMessage(`New verification code sent! (Test OTP: ${data.testOtp})`)
      } else {
        setMessage("New verification code sent!")
      }
      setMessageType("success")
    } catch (err) {
      console.error("Resend signup code error:", err)
      setMessage(err.message || "Failed to resend code")
      setMessageType("error")
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
        style={{
          backgroundColor: "#121212",
          borderRadius: "10px",
          width: "400px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          maxWidth: "90%",
        }}
      >
        {/* Back button */}
        <button
          className="btn btn-sm position-absolute top-0 start-0 m-3 text-white d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "#07a1fe",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            padding: 0,
          }}
          onClick={handleClose}
        >
          <span>←</span>
        </button>

        {/* Close button */}
        <button
          className="btn-close position-absolute top-0 end-0 m-3"
          style={{ backgroundColor: "#fff" }}
          onClick={handleClose}
        ></button>

        <div className="text-center mt-4">
          <div className="mb-3">
            <span role="img" aria-label="email emoji" style={{ fontSize: "2rem" }}>
              📧
            </span>
          </div>
          <h5>Verify Your Email</h5>
          <p className="text-muted small mb-4">Complete your registration</p>
          <p className="mb-3 small">
            We have sent a verification code to <span className="text-info">{email}</span>
          </p>

          {message && <p className={`text-${messageType === "success" ? "success" : "danger"} mb-3`}>{message}</p>}

          <form onSubmit={handleSubmit}>
            {/* Code input fields */}
            <div className="d-flex justify-content-center gap-2 mb-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  className="form-control text-center"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  style={{
                    backgroundColor: "#333",
                    borderColor: "#555",
                    color: "#fff",
                    width: "45px",
                    height: "45px",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    borderRadius: "8px",
                  }}
                />
              ))}
            </div>

            <p className="text-muted small mb-3">This code will expire in {formatTime(timeLeft)}.</p>

            {/* Submit button */}
            <button
              type="submit"
              className="btn w-100 mb-3"
              disabled={verificationLoading || externalLoading || code.some((digit) => !digit)}
              style={{
                backgroundColor: "#0dcaf0",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "5px",
              }}
            >
              {verificationLoading || externalLoading ? "Verifying..." : "Verify & Complete Registration"}
            </button>
          </form>

          <p className="text-muted small">Didn't receive the code?</p>

          {/* Resend code button */}
          <button
            onClick={handleResendCode}
            className="btn btn-outline-info w-100 mt-2"
            disabled={timeLeft > 0 && timeLeft < 300} // Disable if timer is active but not at max
          >
            Resend code
          </button>
          
          <div className="text-center mt-3">
            <small className="text-muted">
              After verification, you'll be able to login with your credentials.
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupVerifyCodeModal