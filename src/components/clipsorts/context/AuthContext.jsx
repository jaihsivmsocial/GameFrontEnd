"use client"

import { createContext, useState, useContext, useEffect, useRef } from "react"

// Base URL for API requests
const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000"

// At the top of the file, add this check to safely access browser APIs
const isBrowser = typeof window !== "undefined"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showVerifyCode, setShowVerifyCode] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")
  const [loginFormData, setLoginFormData] = useState({ username: "", password: "" })
  const [signupFormData, setSignupFormData] = useState({ username: "", email: "", password: "" })
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [error, setError] = useState("")
  const [usernameTaken, setUsernameTaken] = useState(false)
  const suggestedUsernames = ["@user2407", "@userJ007"]
  const postLoginTimerRef = useRef(null)
  const [isMounted, setIsMounted] = useState(false)

  // Check if we're in a browser environment
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check if user is logged in on component mount
  useEffect(() => {
    if (!isMounted) return

    const checkLocalAuth = () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
        const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}")

        if (token && userData && userData.username) {
          setUser(userData)
        }
        setLoading(false)
      } catch (error) {
        console.error("Error checking local auth:", error)
        setLoading(false)
      }
    }

    checkLocalAuth()
    checkAuthStatus()

    const authCheckInterval = setInterval(
      () => {
        checkAuthStatus()
      },
      15 * 60 * 1000,
    )

    return () => {
      clearInterval(authCheckInterval)
      if (postLoginTimerRef.current) {
        clearTimeout(postLoginTimerRef.current)
      }
    }
  }, [isMounted])

  const syncAuthState = () => {
    if (!isBrowser) return { token: null, userData: null }

    try {
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
    } catch (error) {
      console.error("Error syncing auth state:", error)
      return { token: null, userData: null }
    }
  }

  const checkAuthStatus = async () => {
    if (!isBrowser) return false

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
        const userData = {
          username: data.user.username,
          email: data.user.email,
          walletBalance: data.user.walletBalance || 0,
          profilePicture: data.user.profilePicture || "/placeholder.svg?height=40&width=40",
        }

        setUser(userData)

        localStorage.setItem("userData", JSON.stringify(userData))
        sessionStorage.setItem("userData", JSON.stringify(userData))
        localStorage.setItem("username", data.user.username)
        sessionStorage.setItem("username", data.user.username)

        return true
      } else if (!response.ok) {
        if (response.status === 401) {
          handleLogout()
          return false
        } else {
          const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
          const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}")

          if (token && userData && userData.username) {
            return true
          } else {
            handleLogout()
            return false
          }
        }
      } else {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
        const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}")

        if (token && userData && userData.username) {
          return true
        } else {
          handleLogout()
          return false
        }
      }
    } catch (error) {
      console.error("Auth check error:", error)

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}")

      if (token && userData && userData.username) {
        return true
      } else {
        handleLogout()
        return false
      }
    }
  }

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginFormData({ ...loginFormData, [name]: value })
  }

  const handleSignupChange = (e) => {
    const { name, value } = e.target
    setSignupFormData({ ...signupFormData, [name]: value })

    if (name === "username") {
      checkUsername(value)
    }
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
    if (e) e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${BASEURL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginFormData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "Login failed")
      }

      if (data.token) {
        localStorage.setItem("authToken", data.token)
        sessionStorage.setItem("authToken", data.token)

        document.cookie = `authToken=${data.token}; path=/; max-age=2592000; SameSite=Lax`

        const userData = {
          username: loginFormData.username,
          walletBalance: data.walletBalance || 0,
          avatar: data.profilePicture || "/placeholder.svg?height=40&width=40",
        }

        localStorage.setItem("userData", JSON.stringify(userData))
        sessionStorage.setItem("userData", JSON.stringify(userData))
      }

      if (data.playfabSessionTicket) {
        localStorage.setItem("playfabSessionTicket", data.playfabSessionTicket)
      }

      localStorage.setItem("username", loginFormData.username || "User")
      localStorage.setItem("avatar", data.profilePicture || "/placeholder.svg?height=40&width=40")

      const userData = {
        username: loginFormData.username || "User",
        avatar: data.profilePicture || "/placeholder.svg?height=40&width=40",
      }
      setUser(userData)
      setShowLoginModal(false)

      setLoginFormData({ username: "", password: "" })
      return true
    } catch (err) {
      setError(err.message)
      return false
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
      const response = await fetch(`${BASEURL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(signupFormData),
      })

      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Error parsing registration response:", e)
        setError("Received invalid response from server")
        return
      }

      if (response.ok) {
        localStorage.setItem("registrationComplete", "true")
        sessionStorage.setItem("registrationComplete", "true")

        alert("Registration successful! Please login with your credentials.")

        setShowSignupModal(false)
        setShowLoginModal(true)

        setLoginFormData({
          ...loginFormData,
          username: signupFormData.username,
        })

        setSignupFormData({
          username: "",
          email: "",
          password: "",
        })
      } else {
        setError(data.message || data.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (code, newPassword) => {
    setLoading(true)

    try {
      const response = await fetch(`${BASEURL}/api/verify-otp-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: verificationEmail,
          otp: code,
          newPassword: newPassword,
        }),
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
      console.error("Error:", error)
      alert("An error occurred while processing your request")
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!isMounted) return

    try {
      await fetch(`${BASEURL}/api/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout API error:", error)
    }

    try {
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
    } catch (error) {
      console.error("Error clearing storage:", error)
    }

    setUser(null)
  }

  const closeAllModals = () => {
    setShowLoginModal(false)
    setShowSignupModal(false)
    setShowForgotPassword(false)
    setShowVerifyCode(false)
  }

  const openLoginModal = () => {
    setShowLoginModal(true)
    setShowSignupModal(false)
  }

  const openSignupModal = () => {
    setShowSignupModal(true)
    setShowLoginModal(false)
  }

  const openForgotPasswordModal = () => {
    setShowForgotPassword(true)
    setShowLoginModal(false)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login: handleLoginSubmit,
        logout: handleLogout,
        showLoginModal,
        showSignupModal,
        showForgotPassword,
        showVerifyCode,
        setShowLoginModal,
        setShowSignupModal,
        setShowForgotPassword,
        setShowVerifyCode,
        openLoginModal,
        openSignupModal,
        openForgotPasswordModal,
        closeAllModals,
        loginFormData,
        signupFormData,
        handleLoginChange,
        handleSignupChange,
        handleLoginSubmit,
        handleSignupSubmit,
        handleVerifyOtp,
        error,
        setError,
        usernameTaken,
        suggestedUsernames,
        verificationEmail,
        setVerificationEmail,
        forgotPasswordEmail,
        setForgotPasswordEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
