"use client"
import { useState, useEffect, useRef } from "react"
import { BASEURL } from "@/utils/apiservice"
import ForgotPasswordModal from "../../components/register/forgetpassword"
import VerifyCodeModal from "./verify-code"
import SignupVerifyCodeModal from "./verify-code" // New component for signup OTP
import GameHeader from "../game-header"
import UnderstandingModal from "../../components/model/understanding-modal"
import ExplanationModal from "../../components/model/explanation-modal"
import RewardModal from "../../components/model/reward-modal"

const mobileStyles = `
/* Mobile S (320px) */
@media screen and (min-width: 320px) and (max-width: 374px) and (max-height: 642px) {
  .auth-button-mobile {
    margin-right: 0 !important;
    width: 75px !important;
    height: 26px !important;
    font-size: 12px !important;
    padding: 0 !important;
    border-radius: 4px !important;
    flex: 0 0 auto !important;
    background: linear-gradient(to right, #090e12, #081e2e) !important;
  }
  
  .auth-buttons-container {
    gap: 15px !important;
  }
}

/* Mobile M (375px) */
@media screen and (min-width: 375px) and (max-width: 424px) and (max-height: 642px) {
  .auth-button-mobile {
    margin-right: 0 !important;
    width: 75px !important;
    height: 26px !important;
    font-size: 12px !important;
    padding: 0 !important;
    border-radius: 4px !important;
    background: linear-gradient(to right, #090e12, #081e2e) !important;
  }
  
  .auth-buttons-container {
    gap: 8px !important;
  }
}

/* Mobile L (425px) */
@media screen and (min-width: 425px) and (max-width: 767px) and (max-height: 642px) {
  .auth-button-mobile {
    margin-right: 0 !important;
    width: 75px !important;
    height: 26px !important;
    font-size: 12px !important;
    padding: 0 !important;
    border-radius: 4px !important;
    background: linear-gradient(to right, #090e12, #081e2e) !important;
  }
  
  .auth-buttons-container {
    gap: 8px !important;
  }
}

/* General mobile styles (for other mobile dimensions) */
@media screen and (max-width: 767px) {
  .auth-button-mobile {
    margin-right: 0 !important;
    width: 75px !important;
    height: 26px !important;
    font-size: 12px !important;
    padding: 0 !important;
    border-radius: 4px !important;
    background: linear-gradient(to right, #090e12, #081e2e) !important;
  }
  
  .auth-buttons-container {
    gap: 8px !important;
  }
}
`

export default function AuthHeaderButtons({
  initialView = null,
  onAuthStateChange = () => {},
  isModal = false,
  onClose = () => {},
}) {
  const [showLoginModal, setShowLoginModal] = useState(initialView === "login")
  const [showSignupModal, setShowSignupModal] = useState(initialView === "signup" || (!initialView && isModal))
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showVerifyCode, setShowVerifyCode] = useState(false)
  const [showSignupVerifyCode, setShowSignupVerifyCode] = useState(false) // New state for signup OTP
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")
  const [signupVerificationEmail, setSignupVerificationEmail] = useState("") // New state for signup email
  const [isMobileView, setIsMobileView] = useState(false)
  const [mobileSize, setMobileSize] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [loginFormData, setLoginFormData] = useState({ username: "", password: "" })
  const [signupFormData, setSignupFormData] = useState({ username: "", email: "", password: "" })
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [usernameTaken, setUsernameTaken] = useState(false)
  const suggestedUsernames = ["@mark2407", "@markJ007"]
  const [gameModalStep, setGameModalStep] = useState(0)
  const [explanationFromUser, setExplanationFromUser] = useState("")
  const postLoginTimerRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      if (width <= 767) {
        setIsMobileView(true)
        if (width >= 425 && width <= 767 && height <= 642) setMobileSize("L")
        else if (width >= 375 && width < 425 && height <= 642) setMobileSize("M")
        else if (width >= 320 && width < 375 && height <= 642) setMobileSize("S")
        else setMobileSize(null)
      } else {
        setIsMobileView(false)
        setMobileSize(null)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const checkLocalAuth = () => {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      const storedUserData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}")
      if (token && storedUserData && storedUserData.username) {
        setIsLoggedIn(true)
        setUserData(storedUserData)
        onAuthStateChange(true, storedUserData)
      }
    }
    checkLocalAuth()
    checkAuthStatus()
    const authCheckInterval = setInterval(() => checkAuthStatus(), 15 * 40 * 1000)
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => {
      window.removeEventListener("resize", checkMobile)
      clearInterval(authCheckInterval)
      if (postLoginTimerRef.current) {
        clearTimeout(postLoginTimerRef.current)
      }
    }
  }, [])

  const syncAuthState = () => {
    const localToken = localStorage.getItem("authToken")
    const sessionToken = sessionStorage.getItem("authToken")
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="))
      ?.split("=")[1]
    const token = localToken || sessionToken || cookieToken
    if (token) {
      localStorage.setItem("authToken", token)
      sessionStorage.setItem("authToken", token)
      document.cookie = `authToken=${token}; path=/; max-age=2592000; SameSite=Lax`
      const localUserData = JSON.parse(localStorage.getItem("userData") || "{}")
      const sessionUserData = JSON.parse(sessionStorage.getItem("userData") || "{}")
      const userData = { ...sessionUserData, ...localUserData }
      localStorage.setItem("userData", JSON.stringify(userData))
      sessionStorage.setItem("userData", JSON.stringify(userData))
      if (userData.username) {
        localStorage.setItem("username", userData.username)
        sessionStorage.setItem("username", userData.username)
      }
      return { token, userData }
    }
    return { token: null, userData: null }
  }

  const checkAuthStatus = async () => {
    try {
      syncAuthState()
      const response = await fetch(`${BASEURL}/api/verify-auth`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || ""}`,
        },
        credentials: "include",
      })
      const data = await response.json()
      if (response.ok && data.authenticated) {
        const currentData = {
          username: data.user.username,
          email: data.user.email,
          walletBalance: data.user.walletBalance || 0,
          profilePicture: data.user.profilePicture || "/placeholder.svg?height=40&width=40",
        }
        setIsLoggedIn(true)
        setUserData(currentData)
        localStorage.setItem("userData", JSON.stringify(currentData))
        sessionStorage.setItem("userData", JSON.stringify(currentData))
        localStorage.setItem("username", data.user.username)
        sessionStorage.setItem("username", data.user.username)
        onAuthStateChange(true, currentData)
        return true
      } else if (!response.ok) {
        if (response.status === 401) handleLogout()
        else {
          const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
          const storedUserData = JSON.parse(
            localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}",
          )
          if (!(token && storedUserData && storedUserData.username)) handleLogout()
        }
        return false
      } else {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
        const storedUserData = JSON.parse(
          localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}",
        )
        if (!(token && storedUserData && storedUserData.username)) handleLogout()
        return false
      }
    } catch (error) {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      const storedUserData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}")
      if (!(token && storedUserData && storedUserData.username)) handleLogout()
      return false
    }
  }

  const handleLoginChange = (e) => setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value })
  const handleSignupChange = (e) => {
    setSignupFormData({ ...signupFormData, [e.target.name]: e.target.value })
    if (e.target.name === "username") checkUsername(e.target.value)
  }

  const checkUsername = async (username) => {
    if (username.length < 3) return
    try {
      const response = await fetch(`${BASEURL}/api/check-username/${username}`)
      setUsernameTaken(response.status === 400)
    } catch (error) {
      console.error("Error checking username:", error)
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`${BASEURL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginFormData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || data.error || "Login failed")

      if (data.token) {
        localStorage.setItem("authToken", data.token)
        sessionStorage.setItem("authToken", data.token)
        document.cookie = `authToken=${data.token}; path=/; max-age=2592000; SameSite=Lax`
        const userDataToStore = {
          username: loginFormData.username,
          walletBalance: data.walletBalance || 0,
          avatar: data.profilePicture || "/placeholder.svg?height=40&width=40",
        }
        localStorage.setItem("userData", JSON.stringify(userDataToStore))
        sessionStorage.setItem("userData", JSON.stringify(userDataToStore))
      }
      if (data.playfabSessionTicket) localStorage.setItem("playfabSessionTicket", data.playfabSessionTicket)
      localStorage.setItem("username", loginFormData.username || "User")
      localStorage.setItem("avatar", data.profilePicture || "/placeholder.svg?height=40&width=40")

      const loggedInUserData = {
        username: loginFormData.username || "MARK9874",
        avatar: data.profilePicture || "/placeholder.svg?height=40&width=40",
      }
      setIsLoggedIn(true)
      setUserData(loggedInUserData)
      setShowLoginModal(false)
      onAuthStateChange(true, loggedInUserData)
      if (isModal) onClose()
      setLoginFormData({ username: "", password: "" })

      if (postLoginTimerRef.current) clearTimeout(postLoginTimerRef.current)
      postLoginTimerRef.current = setTimeout(() => {
        console.log("Timer fired! Attempting to start game flow.") // For debugging
        // The timer firing implies login was successful and user hasn't logged out.
        handleStartGameFlow()
      }, 60000) // 1 minute
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    if (usernameTaken) {
      alert("Please choose a different username")
      return
    }
    setLoading(true)
    setError("")
    try {
      // First send OTP to email for signup verification
      const otpResponse = await fetch(`${BASEURL}/api/send-signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupFormData.email }),
      })
      
      const otpData = await otpResponse.json()
      
      if (otpResponse.ok) {
        // OTP sent successfully, now show OTP verification modal
        setSignupVerificationEmail(signupFormData.email)
        setShowSignupModal(false)
        setShowSignupVerifyCode(true)
        
        // Show success message if test OTP is provided (for development)
        if (otpData.testOtp) {
          console.log("Test Signup OTP:", otpData.testOtp)
          alert(`OTP sent to your email! (Test OTP: ${otpData.testOtp})`)
        } else {
          alert("OTP sent to your email! Please check your inbox.")
        }
      } else {
        throw new Error(otpData.message || "Failed to send OTP")
      }
    } catch (error) {
      setError(error.message || "An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  // New function to handle signup OTP verification
  const handleSignupOtpVerify = async (code) => {
    setLoading(true)
    try {
      const response = await fetch(`${BASEURL}/api/verify-signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupVerificationEmail,
          otp: code,
          userData: signupFormData // Send the signup form data
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // OTP verified and user registered successfully
        localStorage.setItem("registrationComplete", "true")
        sessionStorage.setItem("registrationComplete", "true")
        alert("Registration successful! Please login with your credentials.")
        setShowSignupVerifyCode(false)
        setShowLoginModal(true)
        setLoginFormData({ ...loginFormData, username: signupFormData.username })
        setSignupFormData({ username: "", email: "", password: "" })
        setSignupVerificationEmail("")
        return true
      } else {
        alert(data.message || "Failed to verify OTP")
        return false
      }
    } catch (error) {
      alert("An error occurred while verifying OTP")
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (code, newPassword) => {
    setLoading(true)
    try {
      const response = await fetch(`${BASEURL}/api/verify-otp-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail, otp: code, newPassword: newPassword }),
      })
      const data = await response.json()
      if (response.ok) {
        alert("Password reset successful! You can now login with your new password.")
        setShowVerifyCode(false)
        setShowLoginModal(true)
        return true
      } else {
        alert(data.message || "Failed to verify OTP")
        return false
      }
    } catch (error) {
      alert("An error occurred while processing your request")
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (postLoginTimerRef.current) {
      clearTimeout(postLoginTimerRef.current)
      postLoginTimerRef.current = null
    }
    // try {
    //   await fetch(`${BASEURL}/api/logout`, { method: "POST", credentials: "include" })
    // } catch (error) {
    //   console.error("Logout API error:", error)
    // }
    localStorage.removeItem("authToken")
    localStorage.removeItem("username")
    localStorage.removeItem("avatar")
    localStorage.removeItem("playfabSessionTicket")
    localStorage.removeItem("userData")
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("username")
    sessionStorage.removeItem("avatar")
    sessionStorage.removeItem("playfabSessionTicket")
    sessionStorage.removeItem("userData")
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure"
    setIsLoggedIn(false)
    setUserData(null)
    setIsProfileMenuOpen(false)
    onAuthStateChange(false, null)
  }

  const closeAllModals = () => {
    setShowLoginModal(false)
    setShowSignupModal(false)
    setShowForgotPassword(false)
    setShowVerifyCode(false)
    setShowSignupVerifyCode(false) // Close signup OTP modal
    setGameModalStep(0)
    if (isModal) onClose()
  }

  const isSpecificMobileSize = mobileSize === "S" || mobileSize === "M" || mobileSize === "L"
  const handleStartGameFlow = () => setGameModalStep(1)
  const handleUnderstandYes = () => setGameModalStep(2)
  const handleUnderstandNo = () => setGameModalStep(0)
  const handleExplanationSubmit = (explanation) => {
    setExplanationFromUser(explanation)
    console.log("User explanation:", explanation)
    setGameModalStep(3)
  }
  const handleRewardOkay = () => setGameModalStep(0)
  const handleCloseGameModal = () => setGameModalStep(0)

  return (
    <>
      <style jsx global>
        {mobileStyles}
      </style>
  {!isModal && !isLoggedIn && !isMobile ? (
  <div className="d-flex gap-2 auth-buttons-container">
    {/* LOGIN Button */}
    <button
      type="button"
      className="btn btn-dark border border-info  auth-button-mobile"
      style={{
        backgroundColor: isSpecificMobileSize ? "#081e2e" : "#050505",
        background: isSpecificMobileSize ? "linear-gradient(to right, #090e12, #070a0f)" : "#050505",
          border: "2px solid$ #0046c0",
        width: isSpecificMobileSize ? "75px" : "141px",
        height: isSpecificMobileSize ? "26px" : "37px",
        fontWeight: "bold",
        font: "Poppins",
        letterSpacing: "1px",
        boxShadow: "0 0 1px rgba(13, 202, 240, 0.5)",
        transition: "box-shadow 0.3s ease",
        padding: "0",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "16px",
        borderRadius: "4px",
        fontSize: isSpecificMobileSize ? "12px" : "inherit",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 10px rgba(13, 202, 240, 0.8)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 5px rgba(13, 202, 240, 0.5)")}
      onClick={() => setShowLoginModal(true)}
    >
      LOGIN
    </button>

    {/* SIGNUP Button */}
    <button
      type="button"
      className="btn btn-dark border border-info text-white auth-button-mobile"
      style={{
        backgroundColor: isSpecificMobileSize ? "#081e2e" : "#050505",
        background: isSpecificMobileSize ? "linear-gradient(to right, #070a0f, #070a0f)" : "#050505",
        border: "2px solid #0046c0",
        width: isSpecificMobileSize ? "75px" : "141px",
        height: isSpecificMobileSize ? "26px" : "37px",
        fontWeight: "bold",
        font: "Poppins",
        letterSpacing: "1px",
        boxShadow: "0 0 1px rgba(13, 202, 240, 0.5)",
        transition: "box-shadow 0.3s ease",
        padding: "0",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: isSpecificMobileSize ? "0" : "61px",
        borderRadius: "4px",
        fontSize: isSpecificMobileSize ? "12px" : "inherit",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 10px rgba(13, 202, 240, 0.8)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 5px rgba(13, 202, 240, 0.5)")}
      onClick={() => setShowSignupModal(true)}
    >
      {isSpecificMobileSize ? "SIGN UP" : "SIGNUP"}
    </button>
  </div>
) : !isModal && isLoggedIn && !isMobile ? (
  <div className="position-relative d-flex align-items-center">
    <div className="d-flex align-items-center gap-5" style={{ minWidth: "250px", marginRight: "-190px" }}>
      <GameHeader />
    </div>
    {isProfileMenuOpen && (
      <div
        className="position-absolute end-0 mt-2 border rounded shadow-lg py-1"
        style={{ width: "250px", zIndex: 1000, backgroundColor: "#121212", borderColor: "#333" }}
      ></div>
    )}
  </div>
) : null}


      {isModal && (
        <>
          {showLoginModal && (
            <div
              className="card p-4 text-white position-relative"
              style={{ background: "#050505", borderRadius: "10px", width: "400px", border: "2px solid #0dcaf0" }}
            >
              {" "}
              <button
                className="btn-close position-absolute top-0 end-0 m-2"
                style={{ backgroundColor: "#fff", opacity: "1" }}
                onClick={closeAllModals}
              ></button>{" "}
              <div className="text-center mb-3">
                <img
                  src="/assets/img/logo/5 Minutes Of Fame (2).png"
                  alt="M's TRIBE Logo"
                  style={{ maxWidth: "150px", height: "auto" }}
                />
              </div>{" "}
              {error && <p className="text-danger text-center">{error}</p>}{" "}
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    placeholder="username"
                    value={loginFormData.username}
                    onChange={handleLoginChange}
                    required
                    style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={loginFormData.password}
                    onChange={handleLoginChange}
                    required
                    style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn w-100 mb-2"
                  disabled={loading}
                  style={{ backgroundColor: "#07a1fe", color: "#fff", fontWeight: "bold", borderRadius: "5px" }}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>{" "}
              <button
                className="btn btn-light w-100 d-flex align-items-center justify-content-center mb-2"
                style={{ borderRadius: "5px" }}
              >
                <img
                  src="/assets/img/iconImage/g.webp"
                  alt="google"
                  width="25"
                  height="25"
                  className="me-2"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/20"
                  }}
                />
                Sign in with Google
              </button>{" "}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    style={{ backgroundColor: "#737374", borderColor: "#333" }}
                  />
                  <label className="form-check-label text-white" htmlFor="rememberMe">
                    Remember for 30 days
                  </label>
                </div>
                <div className="text-center">
                  <a
                    onClick={() => {
                      setShowLoginModal(false)
                      setShowForgotPassword(true)
                    }}
                    className="text-info"
                    style={{ cursor: "pointer" }}
                  >
                    Forgot password?
                  </a>
                </div>
              </div>{" "}
              <div className="text-center">
                <small>
                  Don't have an account?{" "}
                  <a
                    onClick={() => {
                      setShowLoginModal(false)
                      setShowSignupModal(true)
                    }}
                    className="text-info"
                    style={{ cursor: "pointer" }}
                  >
                    Sign up
                  </a>
                </small>
              </div>{" "}
            </div>
          )}
          {showSignupModal && (
            <div
              className="card p-4 text-white position-relative"
              style={{ background: "#050505", borderRadius: "10px", width: "400px", border: "2px solid #0dcaf0" }}
            >
              {" "}
              <button
                className="btn-close position-absolute top-0 end-0 m-2"
                style={{ backgroundColor: "#fff", opacity: "1" }}
                onClick={closeAllModals}
              ></button>{" "}
              <div className="text-center mb-3">
                <img
                  src="/assets/img/logo/5 Minutes Of Fame (2).png"
                  alt="M's TRIBE Logo"
                  style={{ maxWidth: "150px", height: "auto" }}
                />
              </div>{" "}
              {error && <p className="text-danger text-center">{error}</p>}{" "}
              <form onSubmit={handleSignupSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    className={`form-control ${usernameTaken ? "is-invalid" : ""}`}
                    placeholder="Enter your username"
                    value={signupFormData.username}
                    onChange={handleSignupChange}
                    style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                  />
                  {usernameTaken && (
                    <div className="text-danger mt-1">
                      Username already taken <span style={{ color: "#dc3545" }}>✗</span>
                    </div>
                  )}
                  {usernameTaken && (
                    <div className="mt-2">
                      <small>Use Suggested: </small>
                      {suggestedUsernames.map((name) => (
                        <button
                          key={name}
                          type="button"
                          className="btn btn-sm btn-outline-info mx-1"
                          onClick={() => setSignupFormData({ ...signupFormData, username: name.replace("@", "") })}
                          style={{ color: "#0dcaf0", borderColor: "#0dcaf0" }}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="mark@gmail.com"
                    value={signupFormData.email}
                    onChange={handleSignupChange}
                    style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={signupFormData.password}
                    onChange={handleSignupChange}
                    style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn w-100 mb-2"
                  disabled={loading}
                  style={{ backgroundColor: "#0dcaf0", color: "#fff", fontWeight: "bold", borderRadius: "5px" }}
                >
                  {loading ? "Sending OTP..." : "Sign Up"}
                </button>
              </form>{" "}
              <button
                className="btn btn-light w-100 d-flex align-items-center justify-content-center"
                style={{ borderRadius: "5px" }}
              >
                <img src="/assets/img/iconImage/g.webp" alt="Google" width="20" height="20" className="me-2" />
                Sign up with Google
              </button>{" "}
              <div className="text-center mt-3">
                <small>
                  Already have an account?{" "}
                  <a
                    onClick={() => {
                      setShowSignupModal(false)
                      setShowLoginModal(true)
                    }}
                    className="text-info"
                    style={{ cursor: "pointer" }}
                  >
                    Login?
                  </a>
                </small>
              </div>{" "}
            </div>
          )}
          {showForgotPassword && (
            <ForgotPasswordModal
              show={showForgotPassword}
              handleClose={closeAllModals}
              onRequestOTP={() => {
                setShowForgotPassword(false)
                setVerificationEmail(forgotPasswordEmail)
                setShowVerifyCode(true)
              }}
              email={forgotPasswordEmail}
              setEmail={setForgotPasswordEmail}
            />
          )}
          {showVerifyCode && (
            <VerifyCodeModal
              show={showVerifyCode}
              handleClose={closeAllModals}
              email={verificationEmail}
              onVerify={handleVerifyOtp}
              loading={loading}
            />
          )}
          {showSignupVerifyCode && (
            <SignupVerifyCodeModal
              show={showSignupVerifyCode}
              handleClose={closeAllModals}
              email={signupVerificationEmail}
              onVerify={handleSignupOtpVerify}
              loading={loading}
            />
          )}
        </>
      )}

      {!isModal && (
        <>
          {showLoginModal && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(2px)", zIndex: 1050 }}
            >
              {" "}
              <div
                className="card p-4 text-white position-relative"
                style={{ background: "#050505", borderRadius: "10px", width: "400px", border: "2px solid #0dcaf0" }}
              >
                {" "}
                <button
                  className="btn-close position-absolute top-0 end-0 m-2"
                  style={{ backgroundColor: "#fff", opacity: "1" }}
                  onClick={closeAllModals}
                ></button>{" "}
                <div className="text-center mb-3">
                  <img
                    src="/assets/img/logo/5 Minutes Of Fame (2).png"
                    alt="M's TRIBE Logo"
                    style={{ maxWidth: "150px", height: "auto" }}
                  />
                </div>{" "}
                {error && <p className="text-danger text-center">{error}</p>}{" "}
                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      placeholder="username"
                      value={loginFormData.username}
                      onChange={handleLoginChange}
                      required
                      style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={loginFormData.password}
                      onChange={handleLoginChange}
                      required
                      style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 mb-2"
                    disabled={loading}
                    style={{ backgroundColor: "#07a1fe", color: "#fff", fontWeight: "bold", borderRadius: "5px" }}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </form>{" "}
                <button
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center mb-2"
                  style={{ borderRadius: "5px" }}
                >
                  <img
                    src="/assets/img/iconImage/g.webp"
                    alt="google"
                    width="25"
                    height="25"
                    className="me-2"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/20"
                    }}
                  />
                  Sign in with Google
                </button>{" "}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMeModal"
                      style={{ backgroundColor: "#737374", borderColor: "#333" }}
                    />
                    <label className="form-check-label text-white" htmlFor="rememberMeModal">
                      Remember for 30 days
                    </label>
                  </div>
                  <div className="text-center">
                    <a
                      onClick={() => {
                        setShowLoginModal(false)
                        setShowForgotPassword(true)
                      }}
                      className="text-info"
                      style={{ cursor: "pointer" }}
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>{" "}
                <div className="text-center">
                  <small>
                    Don't have an account?{" "}
                    <a
                      onClick={() => {
                        setShowLoginModal(false)
                        setShowSignupModal(true)
                      }}
                      className="text-info"
                      style={{ cursor: "pointer" }}
                    >
                      Sign up
                    </a>
                  </small>
                </div>{" "}
              </div>{" "}
            </div>
          )}
          {showSignupModal && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(2px)", zIndex: 1050 }}
            >
              {" "}
              <div
                className="card p-4 text-white position-relative"
                style={{ background: "#050505", borderRadius: "10px", width: "400px", border: "2px solid #0dcaf0" }}
              >
                {" "}
                <button
                  className="btn-close position-absolute top-0 end-0 m-2"
                  style={{ backgroundColor: "#fff", opacity: "1" }}
                  onClick={closeAllModals}
                ></button>{" "}
                <div className="text-center mb-3">
                  <img
                    src="/assets/img/logo/5 Minutes Of Fame (2).png"
                    alt="M's TRIBE Logo"
                    style={{ maxWidth: "150px", height: "auto" }}
                  />
                </div>{" "}
                {error && <p className="text-danger text-center">{error}</p>}{" "}
                <form onSubmit={handleSignupSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      className={`form-control ${usernameTaken ? "is-invalid" : ""}`}
                      placeholder="Enter your username"
                      value={signupFormData.username}
                      onChange={handleSignupChange}
                      style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                    />
                    {usernameTaken && (
                      <div className="text-danger mt-1">
                        Username already taken <span style={{ color: "#dc3545" }}>✗</span>
                      </div>
                    )}
                    {usernameTaken && (
                      <div className="mt-2">
                        <small>Use Suggested: </small>
                        {suggestedUsernames.map((name) => (
                          <button
                            key={name}
                            type="button"
                            className="btn btn-sm btn-outline-info mx-1"
                            onClick={() => setSignupFormData({ ...signupFormData, username: name.replace("@", "") })}
                            style={{ color: "#0dcaf0", borderColor: "#0dcaf0" }}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="mark@gmail.com"
                      value={signupFormData.email}
                      onChange={handleSignupChange}
                      style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={signupFormData.password}
                      onChange={handleSignupChange}
                      style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 mb-2"
                    disabled={loading}
                    style={{ backgroundColor: "#0dcaf0", color: "#fff", fontWeight: "bold", borderRadius: "5px" }}
                  >
                    {loading ? "Sending OTP..." : "Sign Up"}
                  </button>
                </form>{" "}
                <button
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center"
                  style={{ borderRadius: "5px" }}
                >
                  <img src="/assets/img/iconImage/g.webp" alt="Google" width="20" height="20" className="me-2" />
                  Sign up with Google
                </button>{" "}
                <div className="text-center mt-3">
                  <small>
                    Already have an account?{" "}
                    <a
                      onClick={() => {
                        setShowSignupModal(false)
                        setShowLoginModal(true)
                      }}
                      className="text-info"
                      style={{ cursor: "pointer" }}
                    >
                      Login?
                    </a>
                  </small>
                </div>{" "}
              </div>{" "}
            </div>
          )}
          {showForgotPassword && (
            <ForgotPasswordModal
              show={showForgotPassword}
              handleClose={closeAllModals}
              onRequestOTP={() => {
                setShowForgotPassword(false)
                setVerificationEmail(forgotPasswordEmail)
                setShowVerifyCode(true)
              }}
              email={forgotPasswordEmail}
              setEmail={setForgotPasswordEmail}
            />
          )}
          {showVerifyCode && (
            <VerifyCodeModal
              show={showVerifyCode}
              handleClose={closeAllModals}
              email={verificationEmail}
              onVerify={handleVerifyOtp}
              loading={loading}
            />
          )}
          {showSignupVerifyCode && (
            <SignupVerifyCodeModal
              show={showSignupVerifyCode}
              handleClose={closeAllModals}
              email={signupVerificationEmail}
              onVerify={handleSignupOtpVerify}
              loading={loading}
            />
          )}
        </>
      )}
      <UnderstandingModal
        show={gameModalStep === 1}
        onClose={handleCloseGameModal}
        onYes={handleUnderstandYes}
        onNo={handleUnderstandNo}
      />
      <ExplanationModal show={gameModalStep === 2} onClose={handleCloseGameModal} onSubmit={handleExplanationSubmit} />
      <RewardModal show={gameModalStep === 3} onClose={handleRewardOkay} />
    </>
  )
}