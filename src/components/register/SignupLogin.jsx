// "use client"
// import { useState, useEffect } from "react"
// import { BASEURL } from "@/utils/apiservice"
// import ForgotPasswordModal from "../../components/register/forgetpassword"
// import VerifyCodeModal from "./verify-code"
// import GameHeader from "../game-header"

// // Update the mobile styles with specific mobile dimensions
// const mobileStyles = `
// /* Mobile S (320px) */
// @media screen and (min-width: 320px) and (max-width: 374px) and (max-height: 642px) {
//   .auth-button-mobile {
//     margin-right: 0 !important;
//     width: 75px !important;
//     height: 26px !important;
//     font-size: 12px !important;
//     padding: 0 !important;
//     border-radius: 4px !important;
//     flex: 0 0 auto !impo tant;
//     background: linear-gradient(to right, #090e12, #081e2e) !important;
//   }
  
//   .auth-buttons-container {
//     gap: 15px !important;
//   }
// }

// /* Mobile M (375px) */
// @media screen and (min-width: 375px) and (max-width: 424px) and (max-height: 642px) {
//   .auth-button-mobile {
//     margin-right: 0 !important;
//     width: 75px !important;
//     height: 26px !important;
//     font-size: 12px !important;
//     padding: 0 !important;
//     border-radius: 4px !important;
//     background: linear-gradient(to right, #090e12, #081e2e) !important;
//   }
  
//   .auth-buttons-container {
//     gap: 8px !important;
//   }
// }

// /* Mobile L (425px) */
// @media screen and (min-width: 425px) and (max-width: 767px) and (max-height: 642px) {
//   .auth-button-mobile {
//     margin-right: 0 !important;
//     width: 75px !important;
//     height: 26px !important;
//     font-size: 12px !important;
//     padding: 0 !important;
//     border-radius: 4px !important;
//     background: linear-gradient(to right, #090e12, #081e2e) !important;
//   }
  
//   .auth-buttons-container {
//     gap: 8px !important;
//   }
// }

// /* General mobile styles (for other mobile dimensions) */
// @media screen and (max-width: 767px) {
//   .auth-button-mobile {
//     margin-right: 0 !important;
//     width: 75px !important;
//     height: 26px !important;
//     font-size: 12px !important;
//     padding: 0 !important;
//     border-radius: 4px !important;
//     background: linear-gradient(to right, #090e12, #081e2e) !important;
//   }
  
//   .auth-buttons-container {
//     gap: 8px !important;
//   }
// }
// `

// export default function AuthHeaderButtons({
//   initialView = null,
//   onAuthStateChange = () => {},
//   isModal = false,
//   onClose = () => {},
// }) {
//   // State for modals and authentication
//   const [showLoginModal, setShowLoginModal] = useState(initialView === "login")
//   const [showSignupModal, setShowSignupModal] = useState(initialView === "signup" || (!initialView && isModal))
//   const [showForgotPassword, setShowForgotPassword] = useState(false)
//   const [showVerifyCode, setShowVerifyCode] = useState(false)
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [userData, setUserData] = useState(null)
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
//   const [verificationEmail, setVerificationEmail] = useState("")
//   const [isMobileView, setIsMobileView] = useState(false)
//   const [mobileSize, setMobileSize] = useState(null) // 'S', 'M', or 'L'
//   const [isMobile, setIsMobile] = useState(false)

//   // State for form data
//   const [loginFormData, setLoginFormData] = useState({ username: "", password: "" })
//   const [signupFormData, setSignupFormData] = useState({ username: "", email: "", password: "" })
//   const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")

//   // Loading and error states
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [usernameTaken, setUsernameTaken] = useState(false)
//   const suggestedUsernames = ["@mark2407", "@markJ007"]

//   // Check if mobile view and determine size
//   useEffect(() => {
//     const handleResize = () => {
//       const width = window.innerWidth
//       const height = window.innerHeight

//       if (width <= 767) {
//         setIsMobileView(true)

//         if (width >= 425 && width <= 767 && height <= 642) {
//           setMobileSize("L")
//         } else if (width >= 375 && width < 425 && height <= 642) {
//           setMobileSize("M")
//         } else if (width >= 320 && width < 375 && height <= 642) {
//           setMobileSize("S")
//         } else {
//           setMobileSize(null)
//         }
//       } else {
//         setIsMobileView(false)
//         setMobileSize(null)
//       }
//     }

//     // Set initial state
//     handleResize()

//     // Add event listener
//     window.addEventListener("resize", handleResize)

//     // Cleanup
//     return () => {
//       window.removeEventListener("resize", handleResize)
//     }
//   }, [])

//   // Check if user is already logged in on component mount
//   useEffect(() => {
//     // First check local storage and cookies for authentication data
//     const checkLocalAuth = () => {
//       const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
//       const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}")

//       if (token && userData && userData.username) {
//         // Set logged in state immediately based on local storage
//         // This prevents flashing of login buttons on page refresh
//         setIsLoggedIn(true)
//         setUserData(userData)

//         // Notify parent component
//         onAuthStateChange(true, userData)
//       }
//     }

//     // Run local check immediately
//     checkLocalAuth()

//     // Then verify with the server
//     checkAuthStatus()

//     // Set up periodic checks every 15 minutes
//     const authCheckInterval = setInterval(
//       () => {
//         checkAuthStatus()
//       },
//       15 * 60 * 1000,
//     )

//     // Check if mobile
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth <= 768)
//     }

//     checkMobile()
//     window.addEventListener("resize", checkMobile)

//     return () => {
//       window.removeEventListener("resize", checkMobile)
//       clearInterval(authCheckInterval)
//     }
//   }, [])

//   // Function to verify token with backend
//   const verifyToken = async (token) => {
//     try {
//       const response = await fetch(`${BASEURL}/api/verify-auth`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: "include", // Important for sending cookies
//       })

//       if (!response.ok) {
//         return false
//       }

//       const data = await response.json()
//       return data.authenticated
//     } catch (error) {
//       console.error("Error verifying token:", error)
//       return false
//     }
//   }

//   const syncAuthState = () => {
//     // Try to get token from multiple sources
//     const localToken = localStorage.getItem("authToken")
//     const sessionToken = sessionStorage.getItem("authToken")
//     const cookieToken = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("authToken="))
//       ?.split("=")[1]

//     // Use the first available token
//     const token = localToken || sessionToken || cookieToken

//     if (token) {
//       // Ensure token is stored in all places
//       localStorage.setItem("authToken", token)
//       sessionStorage.setItem("authToken", token)
//       document.cookie = `authToken=${token}; path=/; max-age=2592000; SameSite=Lax`

//       // Get user data
//       const localUserData = JSON.parse(localStorage.getItem("userData") || "{}")
//       const sessionUserData = JSON.parse(sessionStorage.getItem("userData") || "{}")

//       // Merge user data, preferring local storage
//       const userData = { ...sessionUserData, ...localUserData }

//       // Update all storage
//       localStorage.setItem("userData", JSON.stringify(userData))
//       sessionStorage.setItem("userData", JSON.stringify(userData))

//       // Also ensure username is stored separately for backward compatibility
//       if (userData.username) {
//         localStorage.setItem("username", userData.username)
//         sessionStorage.setItem("username", userData.username)
//       }

//       return { token, userData }
//     }

//     return { token: null, userData: null }
//   }

//   // Add this function after syncAuthState
//   const checkAuthStatus = async () => {
//     try {
//       // First sync auth state across storage mechanisms
//       syncAuthState()

//       // Then verify with the server
//       const response = await fetch(`${BASEURL}/api/verify-auth`, {
//         method: "GET",
//         headers: {
//           // Include the token in the Authorization header
//           Authorization: `Bearer ${localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || ""}`,
//         },
//         credentials: "include", // Important for sending cookies
//       })

//       const data = await response.json()

//       if (response.ok && data.authenticated) {
//         // Update user data with the latest from server
//         const userData = {
//           username: data.user.username,
//           email: data.user.email,
//           walletBalance: data.user.walletBalance || 0,
//           profilePicture: data.user.profilePicture || "/placeholder.svg?height=40&width=40",
//         }

//         // Update state
//         setIsLoggedIn(true)
//         setUserData(userData)

//         // Update storage
//         localStorage.setItem("userData", JSON.stringify(userData))
//         sessionStorage.setItem("userData", JSON.stringify(userData))
//         localStorage.setItem("username", data.user.username)
//         sessionStorage.setItem("username", data.user.username)

//         // Notify parent component
//         onAuthStateChange(true, userData)

//         return true
//       } else if (!response.ok) {
//         console.log("Auth check failed with status:", response.status)

//         // Only log out if the token is explicitly invalid (401)
//         // For other errors (like network issues), keep the user logged in based on local storage
//         if (response.status === 401) {
//           handleLogout()
//           return false
//         } else {
//           // For other errors, keep the user logged in if we have local data
//           const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
//           const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}")

//           if (token && userData && userData.username) {
//             return true
//           } else {
//             handleLogout()
//             return false
//           }
//         }
//       } else {
//         // If not authenticated according to server, check local storage as fallback
//         const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
//         const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}")

//         if (token && userData && userData.username) {
//           return true
//         } else {
//           handleLogout()
//           return false
//         }
//       }
//     } catch (error) {
//       console.error("Auth check error:", error)

//       // On network error, don't log out if we have local data
//       const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
//       const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}")

//       if (token && userData && userData.username) {
//         return true
//       } else {
//         handleLogout()
//         return false
//       }
//     }
//   }

//   // Update the handleLoginChange function
//   const handleLoginChange = (e) => {
//     const { name, value } = e.target
//     setLoginFormData({ ...loginFormData, [name]: value })
//   }

//   // Update the handleSignupChange function
//   const handleSignupChange = (e) => {
//     const { name, value } = e.target
//     setSignupFormData({ ...signupFormData, [name]: value })

//     if (name === "username") {
//       // Check if username is taken
//       checkUsername(value)
//     }
//   }

//   // Check if username is taken
//   const checkUsername = async (username) => {
//     if (username.length < 3) return

//     try {
//       const response = await fetch(`${BASEURL}/api/check-username/${username}`)
//       const data = await response.json()

//       setUsernameTaken(response.status === 400)
//     } catch (error) {
//       console.error("Error checking username:", error)
//     }
//   }

//   // Handle login submission
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError("")

//     try {
//       const response = await fetch(`${BASEURL}/api/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(loginFormData),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.message || data.error || "Login failed")
//       }

//       console.log("Login response:", data)

//       // Save token if needed
//       if (data.token) {
//         // Store token in multiple places for cross-system compatibility
//         localStorage.setItem("authToken", data.token)
//         sessionStorage.setItem("authToken", data.token)

//         // Set a cookie with proper attributes for cross-domain support
//         document.cookie = `authToken=${data.token}; path=/; max-age=2592000; SameSite=Lax`

//         // Also store user data in all storage mechanisms
//         const userData = {
//           username: loginFormData.username,
//           walletBalance: data.walletBalance || 0,
//           avatar: data.profilePicture || "/placeholder.svg?height=40&width=40",
//         }

//         localStorage.setItem("userData", JSON.stringify(userData))
//         sessionStorage.setItem("userData", JSON.stringify(userData))
//       }

//       // Save PlayFab session ticket if available
//       if (data.playfabSessionTicket) {
//         localStorage.setItem("playfabSessionTicket", data.playfabSessionTicket)
//       }

//       // Save username and avatar for future reference
//       localStorage.setItem("username", loginFormData.username || "User")
//       localStorage.setItem("avatar", data.profilePicture || "/placeholder.svg?height=40&width=40")

//       // Set user as logged in
//       setIsLoggedIn(true)
//       const userData = {
//         username: loginFormData.username || "MARK9874",
//         avatar: data.profilePicture || "/placeholder.svg?height=40&width=40",
//       }
//       setUserData(userData)
//       setShowLoginModal(false)

//       // Notify parent component about auth state change
//       onAuthStateChange(true, userData)

//       // If in modal mode, close the modal
//       if (isModal) {
//         onClose()
//       }

//       // Reset form
//       setLoginFormData({ username: "", password: "" })
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Handle signup submission
//   const handleSignupSubmit = async (e) => {
//     e.preventDefault()

//     if (usernameTaken) {
//       alert("Please choose a different username")
//       return
//     }

//     setLoading(true)
//     setError("") // Clear any previous errors

//     try {
//       console.log("Submitting registration data:", {
//         username: signupFormData.username,
//         email: signupFormData.email,
//         passwordLength: signupFormData.password.length,
//       })

//       const response = await fetch(`${BASEURL}/api/register`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(signupFormData),
//       })

//       // Log the full response for debugging
//       const responseText = await response.text()
//       console.log("Raw registration response:", responseText)

//       let data
//       try {
//         data = JSON.parse(responseText)
//       } catch (e) {
//         console.error("Error parsing registration response:", e)
//         setError("Received invalid response from server")
//         return
//       }

//       if (response.ok) {
//         // Store registration status in localStorage and sessionStorage
//         localStorage.setItem("registrationComplete", "true")
//         sessionStorage.setItem("registrationComplete", "true")

//         // Always show success message and redirect to login page
//         alert("Registration successful! Please login with your credentials.")

//         // Switch to login modal
//         setShowSignupModal(false)
//         setShowLoginModal(true)

//         // Pre-fill the login form with the username from signup
//         setLoginFormData({
//           ...loginFormData,
//           username: signupFormData.username,
//         })

//         // Reset signup form
//         setSignupFormData({
//           username: "",
//           email: "",
//           password: "",
//         })
//       } else {
//         console.error("Registration failed:", data)
//         setError(data.message || data.error || "Registration failed")
//       }
//     } catch (error) {
//       console.error("Registration error:", error)
//       setError("An error occurred during registration")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Handle verify OTP and reset password
//   const handleVerifyOtp = async (code, newPassword) => {
//     setLoading(true)

//     try {
//       const response = await fetch(`${BASEURL}/api/verify-otp-reset`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: verificationEmail,
//           otp: code,
//           newPassword: newPassword,
//         }),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         alert("Password reset successful! You can now login with your new password.")
//         setShowVerifyCode(false)
//         setShowLoginModal(true)
//         return true
//       } else {
//         alert(data.message || "Failed to verify OTP")
//         return false
//       }
//     } catch (error) {
//       console.error("Error:", error)
//       alert("An error occurred while processing your request")
//       return false
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Handle logout
//   const handleLogout = async () => {
//     try {
//       // Call the logout endpoint to clear HTTP-only cookies
//       await fetch(`${BASEURL}/api/logout`, {
//         method: "POST",
//         credentials: "include",
//       })
//     } catch (error) {
//       console.error("Logout API error:", error)
//     }

//     // Clear all storage locations
//     localStorage.removeItem("authToken")
//     localStorage.removeItem("username")
//     localStorage.removeItem("avatar")
//     localStorage.removeItem("playfabSessionTicket")
//     localStorage.removeItem("userData")

//     sessionStorage.removeItem("authToken")
//     sessionStorage.removeItem("username")
//     sessionStorage.removeItem("avatar")
//     sessionStorage.removeItem("playfabSessionTicket")
//     sessionStorage.removeItem("userData")

//     // Clear cookies
//     document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure"

//     setIsLoggedIn(false)
//     setUserData(null)
//     setIsProfileMenuOpen(false)

//     // Notify parent component
//     onAuthStateChange(false, null)
//   }

//   // Close all modals
//   const closeAllModals = () => {
//     setShowLoginModal(false)
//     setShowSignupModal(false)
//     setShowForgotPassword(false)
//     setShowVerifyCode(false)
//     if (isModal) {
//       onClose()
//     }
//   }

//   // Check if current view is one of the specified mobile dimensions
//   const isSpecificMobileSize = mobileSize === "S" || mobileSize === "M" || mobileSize === "L"

//   return (
//     <>
//       {/* Add the style tag with media queries */}
//       <style jsx global>
//         {mobileStyles}
//       </style>

//       {!isModal && !isLoggedIn ? (
//         <div className="d-flex gap-2 auth-buttons-container">
//           {/* Login Button */}
//           <button
//             type="button"
//             className="btn btn-dark border border-info text-white auth-button-mobile"
//             style={{
//               backgroundColor: isSpecificMobileSize ? "#081e2e" : "#050505",
//               background: isSpecificMobileSize ? "linear-gradient(to right, #090e12, #070a0f)" : "#050505",
//               border: "1px solid #0dcaf0",
//               width: isSpecificMobileSize ? "75px" : "141px",
//               height: isSpecificMobileSize ? "26px" : "37px",
//               fontWeight: "bold",
//               font: "Poppins",
//               letterSpacing: "1px",
//               boxShadow: "0 0 1px rgba(13, 202, 240, 0.5)",
//               transition: "box-shadow 0.3s ease",
//               padding: "0",
//               overflow: "hidden",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               marginRight: "6px",
//               borderRadius: "4px",
//               fontSize: isSpecificMobileSize ? "12px" : "inherit",
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.boxShadow = "0 0 10px rgba(13, 202, 240, 0.8)"
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.boxShadow = "0 0 5px rgba(13, 202, 240, 0.5)"
//             }}
//             onClick={() => setShowLoginModal(true)}
//           >
//             LOGIN
//           </button>
//           {/* Signup Button */}
//           <button
//             type="button"
//             className="btn btn-dark border border-info text-white auth-button-mobile"
//             style={{
//               backgroundColor: isSpecificMobileSize ? "#081e2e" : "#050505",
//               background: isSpecificMobileSize ? "linear-gradient(to right, #070a0f, #070a0f)" : "#050505",
//               border: "1px solid #0dcaf0",
//               width: isSpecificMobileSize ? "75px" : "141px",
//               height: isSpecificMobileSize ? "26px" : "37px",
//               fontWeight: "bold",
//               font: "Poppins",
//               letterSpacing: "1px",
//               boxShadow: "0 0 1px rgba(13, 202, 240, 0.5)",
//               transition: "box-shadow 0.3s ease",
//               padding: "0",
//               overflow: "hidden",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               marginRight: isSpecificMobileSize ? "0" : "-95px",
//               borderRadius: "4px",
//               fontSize: isSpecificMobileSize ? "12px" : "inherit",
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.boxShadow = "0 0 10px rgba(13, 202, 240, 0.8)"
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.boxShadow = "0 0 5px rgba(13, 202, 240, 0.5)"
//             }}
//             onClick={() => setShowSignupModal(true)}
//           >
//             {isSpecificMobileSize ? "SIGN UP" : "SIGNUP"}
//           </button>
//         </div>
//       ) : !isModal && isLoggedIn ? (
//         /* User Profile Section - Matches the screenshot design */
//         <div className="position-relative">
//           <div
//             className="d-flex align-items-center gap-5"
//             style={{
//               minWidth: "250px",
//               marginRight: "-190px",
//             }}
//           >
//             <GameHeader />
//           </div>

//           {/* Dropdown Menu - Updated with username on left and image on right */}
//           {isProfileMenuOpen && (
//             <div
//               className="position-absolute end-0 mt-2 border rounded shadow-lg py-1"
//               style={{
//                 width: "250px",
//                 zIndex: 1000,
//                 backgroundColor: "#121212",
//                 borderColor: "#333",
//               }}
//             >
//               {/* Menu Items */}
//             </div>
//           )}
//         </div>
//       ) : null}

//       {/* The rest of the component remains unchanged */}
//       {/* (Modal code would remain the same) */}
//       {/* When in modal mode, show the appropriate modal */}
//       {isModal && (
//         <>
//           {showLoginModal && (
//             <div
//               className="card p-4 text-white position-relative"
//               style={{
//                 background: "#050505",
//                 borderRadius: "10px",
//                 width: "400px",
//                 border: "2px solid #0dcaf0",
//               }}
//             >
//               {/* Close Button */}
//               <button
//                 className="btn-close position-absolute top-0 end-0 m-2"
//                 style={{ backgroundColor: "#fff", opacity: "1" }}
//                 onClick={closeAllModals}
//               ></button>

//               {/* Welcome Header */}
//               <div className="text-center mb-3">
//                 <img
//                   src="/assets/img/logo/headlogo.png"
//                   alt="M's TRIBE Logo"
//                   style={{
//                     maxWidth: "150px",
//                     height: "auto",
//                   }}
//                 />
//               </div>

//               {/* Error Message */}
//               {error && <p className="text-danger text-center">{error}</p>}

//               {/* Login Form */}
//               <form onSubmit={handleLoginSubmit}>
//                 {/* Username Field */}
//                 <div className="mb-3">
//                   <label className="form-label">Username</label>
//                   <input
//                     type="text"
//                     name="username"
//                     className="form-control"
//                     placeholder="username"
//                     value={loginFormData.username}
//                     onChange={handleLoginChange}
//                     required
//                     style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
//                   />
//                 </div>
//                 {/* Password Field */}
//                 <div className="mb-3">
//                   <label className="form-label">Password</label>
//                   <input
//                     type="password"
//                     name="password"
//                     className="form-control"
//                     placeholder="Enter your password"
//                     value={loginFormData.password}
//                     onChange={handleLoginChange}
//                     required
//                     style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
//                   />
//                 </div>

//                 {/* Sign In Button */}
//                 <button
//                   type="submit"
//                   className="btn w-100 mb-2"
//                   disabled={loading}
//                   style={{
//                     backgroundColor: "#07a1fe",
//                     color: "#fff",
//                     fontWeight: "bold",
//                     borderRadius: "5px",
//                   }}
//                 >
//                   {loading ? "Signing In..." : "Sign In"}
//                 </button>
//               </form>

//               {/* Sign in with Google */}
//               <button
//                 className="btn btn-light w-100 d-flex align-items-center justify-content-center mb-2"
//                 style={{ borderRadius: "5px" }}
//               >
//                 <img
//                   src="/assets/img/iconImage/g.webp"
//                   alt="google"
//                   width="25"
//                   height="25"
//                   className="me-2"
//                   onError={(e) => {
//                     console.log("Image failed to load:", e.target.src)
//                     e.target.src = "https://via.placeholder.com/20"
//                   }}
//                 />
//                 Sign in with Google
//               </button>

//               {/* Remember Checkbox and Forgot Password */}
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <div className="form-check">
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     id="rememberMe"
//                     style={{ backgroundColor: "#737374", borderColor: "#333" }}
//                   />
//                   <label className="form-check-label text-white" htmlFor="rememberMe">
//                     Remember for 30 days
//                   </label>
//                 </div>
//                 <div className="text-center">
//                   <a
//                     onClick={() => {
//                       setShowLoginModal(false)
//                       setShowForgotPassword(true)
//                     }}
//                     className="text-info"
//                     style={{ cursor: "pointer" }}
//                   >
//                     Forgot password?
//                   </a>
//                 </div>
//               </div>

//               {/* Sign Up Link */}
//               <div className="text-center">
//                 <small>
//                   Don't have an account?{" "}
//                   <a
//                     onClick={() => {
//                       setShowLoginModal(false)
//                       setShowSignupModal(true)
//                     }}
//                     className="text-info"
//                     style={{ cursor: "pointer" }}
//                   >
//                     Sign up
//                   </a>
//                 </small>
//               </div>
//             </div>
//           )}

//           {showSignupModal && (
//             <div
//               className="card p-4 text-white position-relative"
//               style={{
//                 background: "#050505",
//                 borderRadius: "10px",
//                 width: "400px",
//                 border: "2px solid #0dcaf0",
//               }}
//             >
//               {/* Close Button (X) */}
//               <button
//                 className="btn-close position-absolute top-0 end-0 m-2"
//                 style={{ backgroundColor: "#fff", opacity: "1" }}
//                 onClick={closeAllModals}
//               ></button>

//               {/* Welcome Header replaced with Image */}
//               <div className="text-center mb-3">
//                 <img
//                   src="/assets/img/logo/headlogo.png"
//                   alt="M's TRIBE Logo"
//                   style={{
//                     maxWidth: "150px",
//                     height: "auto",
//                   }}
//                 />
//               </div>

//               {/* Error Message */}
//               {error && <p className="text-danger text-center">{error}</p>}

//               {/* Form wrapper */}
//               <form onSubmit={handleSignupSubmit}>
//                 {/* Username Field */}
//                 <div className="mb-3">
//                   <label className="form-label">Username</label>
//                   <input
//                     type="text"
//                     name="username"
//                     className={`form-control ${usernameTaken ? "is-invalid" : ""}`}
//                     placeholder="Enter your username"
//                     value={signupFormData.username}
//                     onChange={handleSignupChange}
//                     style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
//                   />
//                   {usernameTaken && (
//                     <div className="text-danger mt-1">
//                       Username already taken <span style={{ color: "#dc3545" }}>✗</span>
//                     </div>
//                   )}
//                   {usernameTaken && (
//                     <div className="mt-2">
//                       <small>Use Suggested: </small>
//                       {suggestedUsernames.map((name) => (
//                         <button
//                           key={name}
//                           type="button" // Prevent form submission
//                           className="btn btn-sm btn-outline-info mx-1"
//                           onClick={() => setSignupFormData({ ...signupFormData, username: name.replace("@", "") })}
//                           style={{ color: "#0dcaf0", borderColor: "#0dcaf0" }}
//                         >
//                           {name}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Email Field */}
//                 <div className="mb-3">
//                   <label className="form-label">Email address</label>
//                   <input
//                     type="email"
//                     name="email"
//                     className="form-control"
//                     placeholder="mark@gmail.com"
//                     value={signupFormData.email}
//                     onChange={handleSignupChange}
//                     style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
//                   />
//                 </div>

//                 {/* Password Field */}
//                 <div className="mb-3">
//                   <label className="form-label">Password</label>
//                   <input
//                     type="password"
//                     name="password"
//                     className="form-control"
//                     placeholder="Enter your password"
//                     value={signupFormData.password}
//                     onChange={handleSignupChange}
//                     style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
//                   />
//                 </div>

//                 {/* Sign Up Button */}
//                 <button
//                   type="submit"
//                   className="btn w-100 mb-2"
//                   style={{
//                     backgroundColor: "#0dcaf0",
//                     color: "#fff",
//                     fontWeight: "bold",
//                     borderRadius: "5px",
//                   }}
//                 >
//                   Sign Up
//                 </button>
//               </form>

//               {/* Sign up with Google Button */}
//               <button
//                 className="btn btn-light w-100 d-flex align-items-center justify-content-center"
//                 style={{ borderRadius: "5px" }}
//               >
//                 <img src="/assets/img/iconImage/g.webp" alt="Google" width="20" height="20" className="me-2" />
//                 Sign up with Google
//               </button>

//               {/* Login Link */}
//               <div className="text-center mt-3">
//                 <small>
//                   Already have an account?{" "}
//                   <a
//                     onClick={() => {
//                       setShowSignupModal(false)
//                       setShowLoginModal(true)
//                     }}
//                     className="text-info"
//                     style={{ cursor: "pointer" }}
//                   >
//                     Login?
//                   </a>
//                 </small>
//               </div>
//             </div>
//           )}

//           {/* Forgot Password Modal */}
//           {showForgotPassword && (
//             <ForgotPasswordModal
//               show={showForgotPassword}
//               handleClose={closeAllModals}
//               onRequestOTP={() => {
//                 setShowForgotPassword(false)
//                 setVerificationEmail(forgotPasswordEmail)
//                 setShowVerifyCode(true)
//               }}
//               email={forgotPasswordEmail}
//               setEmail={setForgotPasswordEmail}
//             />
//           )}

//           {/* Verify Code Modal */}
//           {showVerifyCode && (
//             <VerifyCodeModal
//               show={showVerifyCode}
//               handleClose={closeAllModals}
//               email={verificationEmail}
//               onVerify={handleVerifyOtp}
//               loading={loading}
//             />
//           )}
//         </>
//       )}

//       {/* Non-modal login/signup/forgot password modals */}
//       {!isModal && (
//         <>
//           {/* Login Modal */}
//           {showLoginModal && (
//             <div
//               className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
//               style={{
//                 backgroundColor: "rgba(0, 0, 0, 0.7)",
//                 backdropFilter: "blur(2px)",
//                 zIndex: 1050,
//               }}
//             >
//               <div
//                 className="card p-4 text-white position-relative"
//                 style={{
//                   background: "#050505",
//                   borderRadius: "10px",
//                   width: "400px",
//                   border: "2px solid #0dcaf0",
//                 }}
//               >
//                 {/* Close Button */}
//                 <button
//                   className="btn-close position-absolute top-0 end-0 m-2"
//                   style={{ backgroundColor: "#fff", opacity: "1" }}
//                   onClick={closeAllModals}
//                 ></button>

//                 {/* Welcome Header */}
//                 <div className="text-center mb-3">
//                   <img
//                     src="/assets/img/logo/headlogo.png"
//                     alt="M's TRIBE Logo"
//                     style={{
//                       maxWidth: "150px",
//                       height: "auto",
//                     }}
//                   />
//                 </div>

//                 {/* Error Message */}
//                 {error && <p className="text-danger text-center">{error}</p>}

//                 {/* Login Form */}
//                 <form onSubmit={handleLoginSubmit}>
//                   {/* Username Field */}
//                   <div className="mb-3">
//                     <label className="form-label">Username</label>
//                     <input
//                       type="text"
//                       name="username"
//                       className="form-control"
//                       placeholder="username"
//                       value={loginFormData.username}
//                       onChange={handleLoginChange}
//                       required
//                       style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
//                     />
//                   </div>

//                   {/* Password Field */}
//                   <div className="mb-3">
//                     <label className="form-label">Password</label>
//                     <input
//                       type="password"
//                       name="password"
//                       className="form-control"
//                       placeholder="Enter your password"
//                       value={loginFormData.password}
//                       onChange={handleLoginChange}
//                       required
//                       style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
//                     />
//                   </div>

//                   {/* Sign In Button */}
//                   <button
//                     type="submit"
//                     className="btn w-100 mb-2"
//                     disabled={loading}
//                     style={{
//                       backgroundColor: "#07a1fe",
//                       color: "#fff",
//                       fontWeight: "bold",
//                       borderRadius: "5px",
//                     }}
//                   >
//                     {loading ? "Signing In..." : "Sign In"}
//                   </button>
//                 </form>

//                 {/* Sign in with Google */}
//                 <button
//                   className="btn btn-light w-100 d-flex align-items-center justify-content-center mb-2"
//                   style={{ borderRadius: "5px" }}
//                 >
//                   <img
//                     src="/assets/img/iconImage/g.webp"
//                     alt="google"
//                     width="25"
//                     height="25"
//                     className="me-2"
//                     onError={(e) => {
//                       console.log("Image failed to load:", e.target.src)
//                       e.target.src = "https://via.placeholder.com/20"
//                     }}
//                   />
//                   Sign in with Google
//                 </button>

//                 {/* Remember Checkbox and Forgot Password */}
//                 <div className="d-flex justify-content-between align-items-center mb-3">
//                   <div className="form-check">
//                     <input
//                       type="checkbox"
//                       className="form-check-input"
//                       id="rememberMe"
//                       style={{ backgroundColor: "#737374", borderColor: "#333" }}
//                     />
//                     <label className="form-check-label text-white" htmlFor="rememberMe">
//                       Remember for 30 days
//                     </label>
//                   </div>
//                   <div className="text-center">
//                     <a
//                       onClick={() => {
//                         setShowLoginModal(false)
//                         setShowForgotPassword(true)
//                       }}
//                       className="text-info"
//                       style={{ cursor: "pointer" }}
//                     >
//                       Forgot password?
//                     </a>
//                   </div>
//                 </div>

//                 {/* Sign Up Link */}
//                 <div className="text-center">
//                   <small>
//                     Don't have an account?{" "}
//                     <a
//                       onClick={() => {
//                         setShowLoginModal(false)
//                         setShowSignupModal(true)
//                       }}
//                       className="text-info"
//                       style={{ cursor: "pointer" }}
//                     >
//                       Sign up
//                     </a>
//                   </small>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Signup Modal */}
//           {showSignupModal && (
//             <div
//               className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
//               style={{
//                 backgroundColor: "rgba(0, 0, 0, 0.7)",
//                 backdropFilter: "blur(2px)",
//                 zIndex: 1050,
//               }}
//             >
//               <div
//                 className="card p-4 text-white position-relative"
//                 style={{
//                   background: "#050505",
//                   borderRadius: "10px",
//                   width: "400px",
//                   border: "2px solid #0dcaf0",
//                 }}
//               >
//                 {/* Close Button (X) */}
//                 <button
//                   className="btn-close position-absolute top-0 end-0 m-2"
//                   style={{ backgroundColor: "#fff", opacity: "1" }}
//                   onClick={closeAllModals}
//                 ></button>

//                 {/* Welcome Header replaced with Image */}
//                 <div className="text-center mb-3">
//                   <img
//                     src="/assets/img/logo/headlogo.png"
//                     alt="M's TRIBE Logo"
//                     style={{
//                       maxWidth: "150px",
//                       height: "auto",
//                     }}
//                   />
//                 </div>

//                 {/* Error Message */}
//                 {error && <p className="text-danger text-center">{error}</p>}

//                 {/* Form wrapper */}
//                 <form onSubmit={handleSignupSubmit}>
//                   {/* Username Field */}
//                   <div className="mb-3">
//                     <label className="form-label">Username</label>
//                     <input
//                       type="text"
//                       name="username"
//                       className={`form-control ${usernameTaken ? "is-invalid" : ""}`}
//                       placeholder="Enter your username"
//                       value={signupFormData.username}
//                       onChange={handleSignupChange}
//                       style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
//                     />
//                     {usernameTaken && (
//                       <div className="text-danger mt-1">
//                         Username already taken <span style={{ color: "#dc3545" }}>✗</span>
//                       </div>
//                     )}
//                     {usernameTaken && (
//                       <div className="mt-2">
//                         <small>Use Suggested: </small>
//                         {suggestedUsernames.map((name) => (
//                           <button
//                             key={name}
//                             type="button" // Prevent form submission
//                             className="btn btn-sm btn-outline-info mx-1"
//                             onClick={() => setSignupFormData({ ...signupFormData, username: name.replace("@", "") })}
//                             style={{ color: "#0dcaf0", borderColor: "#0dcaf0" }}
//                           >
//                             {name}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* Email Field */}
//                   <div className="mb-3">
//                     <label className="form-label">Email address</label>
//                     <input
//                       type="email"
//                       name="email"
//                       className="form-control"
//                       placeholder="mark@gmail.com"
//                       value={signupFormData.email}
//                       onChange={handleSignupChange}
//                       style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
//                     />
//                   </div>

//                   {/* Password Field */}
//                   <div className="mb-3">
//                     <label className="form-label">Password</label>
//                     <input
//                       type="password"
//                       name="password"
//                       className="form-control"
//                       placeholder="Enter your password"
//                       value={signupFormData.password}
//                       onChange={handleSignupChange}
//                       style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
//                     />
//                   </div>

//                   {/* Sign Up Button */}
//                   <button
//                     type="submit"
//                     className="btn w-100 mb-2"
//                     style={{
//                       backgroundColor: "#0dcaf0",
//                       color: "#fff",
//                       fontWeight: "bold",
//                       borderRadius: "5px",
//                     }}
//                   >
//                     Sign Up
//                   </button>
//                 </form>

//                 {/* Sign up with Google Button */}
//                 <button
//                   className="btn btn-light w-100 d-flex align-items-center justify-content-center"
//                   style={{ borderRadius: "5px" }}
//                 >
//                   <img src="/assets/img/iconImage/g.webp" alt="Google" width="20" height="20" className="me-2" />
//                   Sign up with Google
//                 </button>

//                 {/* Login Link */}
//                 <div className="text-center mt-3">
//                   <small>
//                     Already have an account?{" "}
//                     <a
//                       onClick={() => {
//                         setShowSignupModal(false)
//                         setShowLoginModal(true)
//                       }}
//                       className="text-info"
//                       style={{ cursor: "pointer" }}
//                     >
//                       Login?
//                     </a>
//                   </small>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Forgot Password Modal */}
//           {showForgotPassword && (
//             <ForgotPasswordModal
//               show={showForgotPassword}
//               handleClose={closeAllModals}
//               onRequestOTP={() => {
//                 setShowForgotPassword(false)
//                 setVerificationEmail(forgotPasswordEmail)
//                 setShowVerifyCode(true)
//               }}
//               email={forgotPasswordEmail}
//               setEmail={setForgotPasswordEmail}
//             />
//           )}

//           {/* Verify Code Modal */}
//           {showVerifyCode && (
//             <VerifyCodeModal
//               show={showVerifyCode}
//               handleClose={closeAllModals}
//               email={verificationEmail}
//               onVerify={handleVerifyOtp}
//               loading={loading}
//             />
//           )}
//         </>
//       )}
//     </>
//   )
// }
"use client"
import { useState, useEffect, useRef } from "react"
import { BASEURL } from "@/utils/apiservice"
import ForgotPasswordModal from "../../components/register/forgetpassword"
import VerifyCodeModal from "./verify-code"
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")
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
      const response = await fetch(`${BASEURL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(signupFormData),
      })
      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        setError("Received invalid response from server")
        return
      }
      if (response.ok) {
        localStorage.setItem("registrationComplete", "true")
        sessionStorage.setItem("registrationComplete", "true")
        alert("Registration successful! Please login with your credentials.")
        setShowSignupModal(false)
        setShowLoginModal(true)
        setLoginFormData({ ...loginFormData, username: signupFormData.username })
        setSignupFormData({ username: "", email: "", password: "" })
      } else {
        setError(data.message || data.error || "Registration failed")
      }
    } catch (error) {
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
    try {
      await fetch(`${BASEURL}/api/logout`, { method: "POST", credentials: "include" })
    } catch (error) {
      console.error("Logout API error:", error)
    }
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
      {!isModal && !isLoggedIn ? (
        <div className="d-flex gap-2 auth-buttons-container">
          <button
            type="button"
            className="btn btn-dark border border-info text-white auth-button-mobile"
            style={{
              backgroundColor: isSpecificMobileSize ? "#081e2e" : "#050505",
              background: isSpecificMobileSize ? "linear-gradient(to right, #090e12, #070a0f)" : "#050505",
              border: "1px solid #0dcaf0",
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
              marginRight: "6px",
              borderRadius: "4px",
              fontSize: isSpecificMobileSize ? "12px" : "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 10px rgba(13, 202, 240, 0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 5px rgba(13, 202, 240, 0.5)")}
            onClick={() => setShowLoginModal(true)}
          >
            LOGIN
          </button>
          <button
            type="button"
            className="btn btn-dark border border-info text-white auth-button-mobile"
            style={{
              backgroundColor: isSpecificMobileSize ? "#081e2e" : "#050505",
              background: isSpecificMobileSize ? "linear-gradient(to right, #070a0f, #070a0f)" : "#050505",
              border: "1px solid #0dcaf0",
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
              marginRight: isSpecificMobileSize ? "0" : "-95px",
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
      ) : !isModal && isLoggedIn ? (
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
                  src="/assets/img/logo/headlogo.png"
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
                  src="/assets/img/logo/headlogo.png"
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
                  style={{ backgroundColor: "#0dcaf0", color: "#fff", fontWeight: "bold", borderRadius: "5px" }}
                >
                  Sign Up
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
                    src="/assets/img/logo/headlogo.png"
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
                    src="/assets/img/logo/headlogo.png"
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
                    style={{ backgroundColor: "#0dcaf0", color: "#fff", fontWeight: "bold", borderRadius: "5px" }}
                  >
                    Sign Up
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
