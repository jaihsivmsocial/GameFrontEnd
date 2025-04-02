// "use client"
// import { useState, useEffect } from "react"
// import Image from "next/image"
// import { BASEURL } from "@/utils/apiservice"

// export default function AuthHeaderButtons({
//   initialView = null,
//   onAuthStateChange = () => { },
//   isModal = false,
//   onClose = () => { },
// }) {
//   // State for modals and authentication
//   const [showLoginModal, setShowLoginModal] = useState(initialView === "login")
//   const [showSignupModal, setShowSignupModal] = useState(initialView === "signup" || (!initialView && isModal))
//   const [showForgotPassword, setShowForgotPassword] = useState(false)
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [userData, setUserData] = useState(null)
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

//   // State for form data
//   const [loginFormData, setLoginFormData] = useState({ username: "", password: "" })
//   const [signupFormData, setSignupFormData] = useState({ username: "", email: "", password: "" })
//   const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")

//   // Loading and error states
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [usernameTaken, setUsernameTaken] = useState(false)
//   const suggestedUsernames = ["@mark2407", "@markJ007"]

//   // Check if user is already logged in on component mount
//   useEffect(() => {
//     const token = localStorage.getItem("authToken")
//     if (token) {
//       // You could verify the token here if needed
//       setIsLoggedIn(true)
//       // Set some basic user data
//       setUserData({
//         username: localStorage.getItem("username") || "User",
//         avatar: localStorage.getItem("avatar") || "/placeholder.svg?height=40&width=40",
//       })

//       // Notify parent component
//       onAuthStateChange(true, userData)
//     }
//   }, [])

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
//       setUsernameTaken(value.toLowerCase() === "mark_j") // Simulating username taken
//     }
//   }

//   // Update the handleLoginSubmit function to ensure profile is immediately visible after login
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
//         throw new Error(data.message || "Login failed")
//       }

//       console.log("Login response:", data)

//       // Save token if needed
//       if (data.token) {
//         localStorage.setItem("authToken", data.token)
//       } else {
//         // For demo purposes, set a dummy token if the API doesn't return one
//         localStorage.setItem("authToken", "demo-token-" + Date.now())
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

//   // Update the handleSignupSubmit function with the API details
//   const handleSignupSubmit = async (e) => {
//     e.preventDefault()

//     if (usernameTaken) {
//       alert("Please choose a different username")
//       return
//     }

//     setLoading(true)

//     try {
//       const response = await fetch(`${BASEURL}/api/register`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(signupFormData),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         alert("Registration successful!")

//         // After successful signup, switch to login form
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
//         alert(data.message || "Registration failed")
//       }
//     } catch (error) {
//       console.error("Error:", error)
//       alert("An error occurred during registration")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Update the handleForgotPasswordSubmit function with similar API structure
//   const handleForgotPasswordSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const response = await fetch(`${BASEURL}api/forgot-password`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email: forgotPasswordEmail }),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         alert("Password reset link has been sent to your email")
//         setShowForgotPassword(false)
//         setForgotPasswordEmail("")
//       } else {
//         alert(data.message || "Failed to send reset link")
//       }
//     } catch (error) {
//       console.error("Error:", error)
//       alert("An error occurred while processing your request")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Handle logout
//   const handleLogout = () => {
//     // Clear local storage
//     localStorage.removeItem("authToken")
//     localStorage.removeItem("username")
//     localStorage.removeItem("avatar")

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
//     if (isModal) {
//       onClose()
//     }
//   }

//   return (
//     <>
//       {/* Auth Buttons - Only show if not in modal mode */}
//       {!isModal && !isLoggedIn ? (
//         <div className="d-flex gap-2">
//           {/* Login Button */}
//           <button
//             type="button"
//             className="btn btn-dark border border-info text-white"
//             style={{
//               backgroundColor: "#000",
//               border: "3px solid #0dcaf0",
//               width: "110px",
//               height: "40px",
//               fontWeight: "bold",
//               letterSpacing: "1px",
//               boxShadow: "0 0 5px rgba(13, 202, 240, 0.5)",
//               transition: "box-shadow 0.3s ease",
//               padding: "0",
//               overflow: "hidden",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
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
//             className="btn btn-dark border border-info text-white"
//             style={{
//               backgroundColor: "#000",
//               border: "3px solid #0dcaf0",
//               width: "110px",
//               height: "40px",
//               fontWeight: "bold",
//               letterSpacing: "1px",
//               boxShadow: "0 0 5px rgba(13, 202, 240, 0.5)",
//               transition: "box-shadow 0.3s ease",
//               padding: "0",
//               overflow: "hidden",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.boxShadow = "0 0 10px rgba(13, 202, 240, 0.8)"
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.boxShadow = "0 0 5px rgba(13, 202, 240, 0.5)"
//             }}
//             onClick={() => setShowSignupModal(true)}
//           >
//             SIGNUP
//           </button>
//         </div>
//       ) : !isModal && isLoggedIn ? (
//         /* User Profile Section - Matches the screenshot design */
//         <div className="position-relative">
//           <div
//             className="d-flex align-items-center gap-5"
//             style={{
//               border: "1px solid rgba(255, 255, 255, 0.1)",
//               minWidth: "250px",
//             }}
//           >
//             {/* Settings Icon - Now as a link to settings page */}
//             <a
//               href="/setting"
//               className="text-white text-decoration-none"
//               style={{ opacity: 0.75 }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.opacity = 1
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.opacity = 0.75
//               }}
//             >
//               <img
//                 src="/assets/img/iconImage/settings 1.png" 
//                 alt="Settings"
//                 width="24"
//                 height="24"
//               />
//             </a>

//             <div className="d-flex align-items-center px-3 py-2 rounded">
//               {/* User Info */}
//               <div className="d-flex flex-column ms-3 text-end ">
//                 <span className="fw-bold text-white">{userData?.username || "MARK9874"}</span>
//                 <span className="text-secondary small text-end" style={{ cursor: "pointer" }}>
//                   Change Avatar
//                 </span>
//               </div>
//               {/* Profile Picture with Verification Badge */}
//               <div className="position-relative ms-auto ">
//                 <div
//                   className="rounded-circle overflow-hidden"
//                   style={{
//                     width: "40px",
//                     height: "40px",
//                     border: "2px solid rgba(255, 255, 255, 0.1)",
//                     marginLeft: "10px",
//                   }}
//                   onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
//                 >
//                   <Image
//                     src={userData?.avatar || "/placeholder.svg?height=40&width=40"}
//                     alt="Profile"
//                     width={40}
//                     height={40}
//                     style={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                     }}
//                   />
//                 </div>
//               </div>
//               {/* Verification Badge */}
//               <div
//                 className="position-absolute"
//                 style={{
//                   bottom: -2,
//                   right: -2,
//                   backgroundColor: "#0dcaf0",
//                   borderRadius: "50%",
//                   width: "16px",
//                   height: "16px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   border: "2px solid #000",
//                 }}
//               >
//               </div>
//             </div>
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
//               {/* Profile Info at Top of Dropdown */}
//               <div className="d-flex align-items-center p-3 border-bottom" style={{ borderColor: "#333" }}>
//                 <div>
//                   <div className="fw-bold text-white">{userData?.username || "MARK9874"}</div>
//                   <div className="text-secondary small">View your profile</div>
//                 </div>
//                 <div className="ms-auto">
//                   <div
//                     className="rounded-circle overflow-hidden"
//                     style={{
//                       width: "32px",
//                       height: "32px",
//                       border: "1px solid rgba(255, 255, 255, 0.1)",
//                     }}
//                   >
//                     <Image
//                       src={userData?.avatar || "/placeholder.svg?height=32&width=32"}
//                       alt="Profile"
//                       width={32}
//                       height={32}
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Menu Items */}
//               <button
//                 onClick={handleLogout}
//                 className="d-block w-100 text-start px-4 py-2 text-white bg-transparent border-0"
//                 style={{ transition: "background-color 0.2s" }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.backgroundColor = "transparent"
//                 }}
//               >
//                 Sign out
//               </button>
//             </div>
//           )}
//         </div>
//       ) : null}

//       {/* When in modal mode, show the appropriate modal */}
//       {isModal && (
//         <>
//           {showLoginModal && (
//             <div
//               className="card p-4 text-white position-relative"
//               style={{
//                 backgroundColor: "#121212",
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
//                   src="/assets/fonts/logo.png"
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
//                     className="text-info"
//                     style={{ cursor: "pointer" }}
//                     onClick={() => {
//                       setShowLoginModal(false)
//                       setShowSignupModal(true)
//                     }}
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
//                 backgroundColor: "#121212",
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
//                   src="/assets/fonts/logo.png"
//                   alt="M's TRIBE Logo"
//                   style={{
//                     maxWidth: "150px",
//                     height: "auto",
//                   }}
//                 />
//               </div>

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

//           {showForgotPassword && (
//             <div
//               className="card text-white p-4 position-relative"
//               style={{
//                 backgroundColor: "#121212",
//                 borderRadius: "12px",
//                 width: "400px",
//                 border: "2px solid #0dcaf0",
//               }}
//             >
//               {/* Close Button */}
//               <button
//                 className="btn-close position-absolute top-0 end-0 m-3"
//                 style={{ backgroundColor: "#fff", opacity: "1" }}
//                 onClick={closeAllModals}
//               ></button>

//               {/* Emoji + Heading */}
//               <div className="flex flex-col items-center mb-2 mt-2">
//                 {/* Emoji with proper sizing */}
//                 <div className="text-7xl mb-6">
//                   <span role="img" aria-label="crying emoji">
//                     😭
//                   </span>
//                 </div>

//                 {/* Heading with matching style */}
//                 <h2 className="text-1xl font-bold mb-2 text-center">Forgot your password?</h2>

//                 {/* Subtitle with matching style */}
//                 <p className="text-gray-400 text-center mb-6">
//                   Reset your password using your registered email address.
//                 </p>
//               </div>

//               {/* Form */}
//               <form onSubmit={handleForgotPasswordSubmit}>
//                 <div className="mb-3">
//                   <label className="form-label fw-bold">Email address</label>
//                   <input
//                     type="email"
//                     className="form-control"
//                     placeholder="Enter your email address"
//                     value={forgotPasswordEmail}
//                     onChange={(e) => setForgotPasswordEmail(e.target.value)}
//                     style={{
//                       backgroundColor: "#1a1a1a",
//                       borderColor: "#333",
//                       color: "#fff",
//                     }}
//                     required
//                   />
//                 </div>

//                 {/* Reset Password Button */}
//                 <button
//                   type="submit"
//                   className="btn w-100"
//                   style={{
//                     backgroundColor: "#07a1fe",
//                     color: "#fff",
//                     fontWeight: "bold",
//                     borderRadius: "5px",
//                   }}
//                 >
//                   Reset password
//                 </button>
//               </form>

//               {/* Support Section */}
//               <p className="text-center mt-3">
//                 Need help??{" "}
//                 <a href="/support" className="text-white hover:underline">
//                   Contact Support
//                 </a>
//               </p>
//             </div>
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
//                   backgroundColor: "#121212",
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
//                     src="/assets/fonts/logo.png"
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
//                       className="text-info"
//                       style={{ cursor: "pointer" }}
//                       onClick={() => {
//                         setShowLoginModal(false)
//                         setShowSignupModal(true)
//                       }}
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
//                   backgroundColor: "#121212",
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
//                     src="/assets/fonts/logo.png"
//                     alt="M's TRIBE Logo"
//                     style={{
//                       maxWidth: "150px",
//                       height: "auto",
//                     }}
//                   />
//                 </div>

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
//             <div
//               className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
//               style={{
//                 backgroundColor: "rgba(0, 0, 0, 0.7)",
//                 backdropFilter: "blur(2px)",
//                 zIndex: 1051,
//               }}
//             >
//               <div className="position-fixed top-50 start-50 translate-middle">
//                 <div
//                   className="card text-white p-4 position-relative"
//                   style={{
//                     backgroundColor: "#121212",
//                     borderRadius: "12px",
//                     width: "400px",
//                     border: "2px solid #0dcaf0",
//                   }}
//                 >
//                   {/* Close Button */}
//                   <button
//                     className="btn-close position-absolute top-0 end-0 m-3"
//                     style={{ backgroundColor: "#fff", opacity: "1" }}
//                     onClick={closeAllModals}
//                   ></button>

//                   {/* Emoji + Heading */}
//                   <div className="flex flex-col items-center mb-2 mt-2">
//                     {/* Emoji with proper sizing */}
//                     <div className="text-7xl mb-6">
//                       <span role="img" aria-label="crying emoji">
//                         😭
//                       </span>
//                     </div>

//                     {/* Heading with matching style */}
//                     <h2 className="text-1xl font-bold mb-2 text-center">Forgot your password?</h2>

//                     {/* Subtitle with matching style */}
//                     <p className="text-gray-400 text-center mb-6">
//                       Reset your password using your registered email address.
//                     </p>
//                   </div>

//                   {/* Form */}
//                   <form onSubmit={handleForgotPasswordSubmit}>
//                     <div className="mb-3">
//                       <label className="form-label fw-bold">Email address</label>
//                       <input
//                         type="email"
//                         className="form-control"
//                         placeholder="Enter your email address"
//                         value={forgotPasswordEmail}
//                         onChange={(e) => setForgotPasswordEmail(e.target.value)}
//                         style={{
//                           backgroundColor: "#1a1a1a",
//                           borderColor: "#333",
//                           color: "#fff",
//                         }}
//                         required
//                       />
//                     </div>

//                     {/* Reset Password Button */}
//                     <button
//                       type="submit"
//                       className="btn w-100"
//                       style={{
//                         backgroundColor: "#07a1fe",
//                         color: "#fff",
//                         fontWeight: "bold",
//                         borderRadius: "5px",
//                       }}
//                     >
//                       Reset password
//                     </button>
//                   </form>

//                   {/* Support Section */}
//                   <p className="text-center mt-3">
//                     Need help??{" "}
//                     <a href="/support" className="text-white hover:underline">
//                       Contact Support
//                     </a>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </>
//   )
// }


"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { BASEURL } from "@/utils/apiservice"
import ForgotPasswordModal from "./forgetpassword"
import VerifyCodeModal from "./verify-code"

export default function AuthHeaderButtons({
  initialView = null,
  onAuthStateChange = () => {},
  isModal = false,
  onClose = () => {},
}) {
  // State for modals and authentication
  const [showLoginModal, setShowLoginModal] = useState(initialView === "login")
  const [showSignupModal, setShowSignupModal] = useState(initialView === "signup" || (!initialView && isModal))
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showVerifyCode, setShowVerifyCode] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")

  // State for form data
  const [loginFormData, setLoginFormData] = useState({ username: "", password: "" })
  const [signupFormData, setSignupFormData] = useState({ username: "", email: "", password: "" })
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")

  // Loading and error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [usernameTaken, setUsernameTaken] = useState(false)
  const suggestedUsernames = ["@mark2407", "@markJ007"]

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      // You could verify the token here if needed
      setIsLoggedIn(true)
      // Set some basic user data
      setUserData({
        username: localStorage.getItem("username") || "User",
        avatar: localStorage.getItem("avatar") || "/placeholder.svg?height=40&width=40",
      })

      // Notify parent component
      onAuthStateChange(true, userData)
    }
  }, [])

  // Update the handleLoginChange function
  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginFormData({ ...loginFormData, [name]: value })
  }

  // Update the handleSignupChange function
  const handleSignupChange = (e) => {
    const { name, value } = e.target
    setSignupFormData({ ...signupFormData, [name]: value })

    if (name === "username") {
      // Check if username is taken
      checkUsername(value)
    }
  }

  // Check if username is taken
  const checkUsername = async (username) => {
    if (username.length < 3) return

    try {
      const response = await fetch(`${BASEURL}/api/check-username/${username}`)
      const data = await response.json()

      setUsernameTaken(response.status === 400)
    } catch (error) {
      console.error("Error checking username:", error)
    }
  }

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
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

      console.log("Login response:", data)

      // Save token if needed
      if (data.token) {
        localStorage.setItem("authToken", data.token)
      } else {
        // For demo purposes, set a dummy token if the API doesn't return one
        localStorage.setItem("authToken", "demo-token-" + Date.now())
      }

      // Save PlayFab session ticket if available
      if (data.playfabSessionTicket) {
        localStorage.setItem("playfabSessionTicket", data.playfabSessionTicket)
      }

      // Save username and avatar for future reference
      localStorage.setItem("username", loginFormData.username || "User")
      localStorage.setItem("avatar", data.profilePicture || "/placeholder.svg?height=40&width=40")

      // Set user as logged in
      setIsLoggedIn(true)
      const userData = {
        username: loginFormData.username || "MARK9874",
        avatar: data.profilePicture || "/placeholder.svg?height=40&width=40",
      }
      setUserData(userData)
      setShowLoginModal(false)

      // Notify parent component about auth state change
      onAuthStateChange(true, userData)

      // If in modal mode, close the modal
      if (isModal) {
        onClose()
      }

      // Reset form
      setLoginFormData({ username: "", password: "" })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle signup submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault()

    if (usernameTaken) {
      alert("Please choose a different username")
      return
    }

    setLoading(true)
    setError("") // Clear any previous errors

    try {
      console.log("Submitting registration data:", {
        username: signupFormData.username,
        email: signupFormData.email,
        passwordLength: signupFormData.password.length,
      })

      const response = await fetch(`${BASEURL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        
        },
        credentials: "include",
        body: JSON.stringify(signupFormData),
      })

      // Log the full response for debugging
      const responseText = await response.text()
      console.log("Raw registration response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Error parsing registration response:", e)
        setError("Received invalid response from server")
        return
      }

      if (response.ok) {
        alert("Registration successful!")

        // After successful signup, switch to login form
        setShowSignupModal(false)
        setShowLoginModal(true)

        // Pre-fill the login form with the username from signup
        setLoginFormData({
          ...loginFormData,
          username: signupFormData.username,
        })

        // Reset signup form
        setSignupFormData({
          username: "",
          email: "",
          password: "",
        })
      } else {
        console.error("Registration failed:", data)
        setError(data.message || data.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  // Handle verify OTP and reset password
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

  // Handle logout
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("authToken")
    localStorage.removeItem("username")
    localStorage.removeItem("avatar")
    localStorage.removeItem("playfabSessionTicket")

    setIsLoggedIn(false)
    setUserData(null)
    setIsProfileMenuOpen(false)

    // Notify parent component
    onAuthStateChange(false, null)
  }

  // Close all modals
  const closeAllModals = () => {
    setShowLoginModal(false)
    setShowSignupModal(false)
    setShowForgotPassword(false)
    setShowVerifyCode(false)
    if (isModal) {
      onClose()
    }
  }

  return (
    <>
      {/* Auth Buttons - Only show if not in modal mode */}
      {!isModal && !isLoggedIn ? (
        <div className="d-flex gap-2">
          {/* Login Button */}
          <button
            type="button"
            className="btn btn-dark border border-info text-white"
            style={{
              backgroundColor: "#000",
              border: "3px solid #0dcaf0",
              width: "110px",
              height: "40px",
              fontWeight: "bold",
              letterSpacing: "1px",
              boxShadow: "0 0 5px rgba(13, 202, 240, 0.5)",
              transition: "box-shadow 0.3s ease",
              padding: "0",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 10px rgba(13, 202, 240, 0.8)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 5px rgba(13, 202, 240, 0.5)"
            }}
            onClick={() => setShowLoginModal(true)}
          >
            LOGIN
          </button>
          {/* Signup Button */}
          <button
            type="button"
            className="btn btn-dark border border-info text-white"
            style={{
              backgroundColor: "#000",
              border: "3px solid #0dcaf0",
              width: "110px",
              height: "40px",
              fontWeight: "bold",
              letterSpacing: "1px",
              boxShadow: "0 0 5px rgba(13, 202, 240, 0.5)",
              transition: "box-shadow 0.3s ease",
              padding: "0",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 10px rgba(13, 202, 240, 0.8)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 5px rgba(13, 202, 240, 0.5)"
            }}
            onClick={() => setShowSignupModal(true)}
          >
            SIGNUP
          </button>
        </div>
      ) : !isModal && isLoggedIn ? (
        /* User Profile Section - Matches the screenshot design */
        <div className="position-relative">
          <div
            className="d-flex align-items-center gap-5"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
              minWidth: "250px",
            }}
          >
            {/* Settings Icon - Now as a link to settings page */}
            <a
              href="/setting"
              className="text-white text-decoration-none"
              style={{ opacity: 0.75 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = 1
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = 0.75
              }}
            >
              <img src="/assets/img/iconImage/settings 1.png" alt="Settings" width="24" height="24" />
            </a>

            <div className="d-flex align-items-center px-3 py-2 rounded">
              {/* User Info */}
              <div className="d-flex flex-column ms-3 text-end ">
                <span className="fw-bold text-white">{userData?.username || "MARK9874"}</span>
                <span className="text-secondary small text-end" style={{ cursor: "pointer" }}>
                  Change Avatar
                </span>
              </div>
              {/* Profile Picture with Verification Badge */}
              <div className="position-relative ms-auto ">
                <div
                  className="rounded-circle overflow-hidden"
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "2px solid rgba(255, 255, 255, 0.1)",
                    marginLeft: "10px",
                  }}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <Image
                    src={userData?.avatar || "/placeholder.svg?height=40&width=40"}
                    alt="Profile"
                    width={40}
                    height={40}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
              {/* Verification Badge */}
              <div
                className="position-absolute"
                style={{
                  bottom: -2,
                  right: -2,
                  backgroundColor: "#0dcaf0",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #000",
                }}
              ></div>
            </div>
          </div>

          {/* Dropdown Menu - Updated with username on left and image on right */}
          {isProfileMenuOpen && (
            <div
              className="position-absolute end-0 mt-2 border rounded shadow-lg py-1"
              style={{
                width: "250px",
                zIndex: 1000,
                backgroundColor: "#121212",
                borderColor: "#333",
              }}
            >
              {/* Profile Info at Top of Dropdown */}
              <div className="d-flex align-items-center p-3 border-bottom" style={{ borderColor: "#333" }}>
                <div>
                  <div className="fw-bold text-white">{userData?.username || "MARK9874"}</div>
                  <div className="text-secondary small">View your profile</div>
                </div>
                <div className="ms-auto">
                  <div
                    className="rounded-circle overflow-hidden"
                    style={{
                      width: "32px",
                      height: "32px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Image
                      src={userData?.avatar || "/placeholder.svg?height=32&width=32"}
                      alt="Profile"
                      width={32}
                      height={32}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <button
                onClick={handleLogout}
                className="d-block w-100 text-start px-4 py-2 text-white bg-transparent border-0"
                style={{ transition: "background-color 0.2s" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* When in modal mode, show the appropriate modal */}
      {isModal && (
        <>
          {showLoginModal && (
            <div
              className="card p-4 text-white position-relative"
              style={{
                backgroundColor: "#121212",
                borderRadius: "10px",
                width: "400px",
                border: "2px solid #0dcaf0",
              }}
            >
              {/* Close Button */}
              <button
                className="btn-close position-absolute top-0 end-0 m-2"
                style={{ backgroundColor: "#fff", opacity: "1" }}
                onClick={closeAllModals}
              ></button>

              {/* Welcome Header */}
              <div className="text-center mb-3">
                <img
                  src="/assets/fonts/logo.png"
                  alt="M's TRIBE Logo"
                  style={{
                    maxWidth: "150px",
                    height: "auto",
                  }}
                />
              </div>

              {/* Error Message */}
              {error && <p className="text-danger text-center">{error}</p>}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit}>
                {/* Username Field */}
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
                {/* Password Field */}
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

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="btn w-100 mb-2"
                  disabled={loading}
                  style={{
                    backgroundColor: "#07a1fe",
                    color: "#fff",
                    fontWeight: "bold",
                    borderRadius: "5px",
                  }}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              {/* Sign in with Google */}
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
                    console.log("Image failed to load:", e.target.src)
                    e.target.src = "https://via.placeholder.com/20"
                  }}
                />
                Sign in with Google
              </button>

              {/* Remember Checkbox and Forgot Password */}
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
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <small>
                  Don't have an account?{" "}
                  <a
                    className="text-info"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setShowLoginModal(false)
                      setShowSignupModal(true)
                    }}
                  >
                    Sign up
                  </a>
                </small>
              </div>
            </div>
          )}

          {showSignupModal && (
            <div
              className="card p-4 text-white position-relative"
              style={{
                backgroundColor: "#121212",
                borderRadius: "10px",
                width: "400px",
                border: "2px solid #0dcaf0",
              }}
            >
              {/* Close Button (X) */}
              <button
                className="btn-close position-absolute top-0 end-0 m-2"
                style={{ backgroundColor: "#fff", opacity: "1" }}
                onClick={closeAllModals}
              ></button>

              {/* Welcome Header replaced with Image */}
              <div className="text-center mb-3">
                <img
                  src="/assets/fonts/logo.png"
                  alt="M's TRIBE Logo"
                  style={{
                    maxWidth: "150px",
                    height: "auto",
                  }}
                />
              </div>

              {/* Error Message */}
              {error && <p className="text-danger text-center">{error}</p>}

              {/* Form wrapper */}
              <form onSubmit={handleSignupSubmit}>
                {/* Username Field */}
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
                          type="button" // Prevent form submission
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

                {/* Email Field */}
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

                {/* Password Field */}
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

                {/* Sign Up Button */}
                <button
                  type="submit"
                  className="btn w-100 mb-2"
                  style={{
                    backgroundColor: "#0dcaf0",
                    color: "#fff",
                    fontWeight: "bold",
                    borderRadius: "5px",
                  }}
                >
                  Sign Up
                </button>
              </form>

              {/* Sign up with Google Button */}
              <button
                className="btn btn-light w-100 d-flex align-items-center justify-content-center"
                style={{ borderRadius: "5px" }}
              >
                <img src="/assets/img/iconImage/g.webp" alt="Google" width="20" height="20" className="me-2" />
                Sign up with Google
              </button>

              {/* Login Link */}
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
              </div>
            </div>
          )}

          {/* Forgot Password Modal */}
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

          {/* Verify Code Modal */}
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

      {/* Non-modal login/signup/forgot password modals */}
      {!isModal && (
        <>
          {/* Login Modal */}
          {showLoginModal && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(2px)",
                zIndex: 1050,
              }}
            >
              <div
                className="card p-4 text-white position-relative"
                style={{
                  backgroundColor: "#121212",
                  borderRadius: "10px",
                  width: "400px",
                  border: "2px solid #0dcaf0",
                }}
              >
                {/* Close Button */}
                <button
                  className="btn-close position-absolute top-0 end-0 m-2"
                  style={{ backgroundColor: "#fff", opacity: "1" }}
                  onClick={closeAllModals}
                ></button>

                {/* Welcome Header */}
                <div className="text-center mb-3">
                  <img
                    src="/assets/fonts/logo.png"
                    alt="M's TRIBE Logo"
                    style={{
                      maxWidth: "150px",
                      height: "auto",
                    }}
                  />
                </div>

                {/* Error Message */}
                {error && <p className="text-danger text-center">{error}</p>}

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit}>
                  {/* Username Field */}
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

                  {/* Password Field */}
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

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    className="btn w-100 mb-2"
                    disabled={loading}
                    style={{
                      backgroundColor: "#07a1fe",
                      color: "#fff",
                      fontWeight: "bold",
                      borderRadius: "5px",
                    }}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </form>

                {/* Sign in with Google */}
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
                      console.log("Image failed to load:", e.target.src)
                      e.target.src = "https://via.placeholder.com/20"
                    }}
                  />
                  Sign in with Google
                </button>

                {/* Remember Checkbox and Forgot Password */}
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
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <small>
                    Don't have an account?{" "}
                    <a
                      className="text-info"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setShowLoginModal(false)
                        setShowSignupModal(true)
                      }}
                    >
                      Sign up
                    </a>
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Signup Modal */}
          {showSignupModal && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(2px)",
                zIndex: 1050,
              }}
            >
              <div
                className="card p-4 text-white position-relative"
                style={{
                  backgroundColor: "#121212",
                  borderRadius: "10px",
                  width: "400px",
                  border: "2px solid #0dcaf0",
                }}
              >
                {/* Close Button (X) */}
                <button
                  className="btn-close position-absolute top-0 end-0 m-2"
                  style={{ backgroundColor: "#fff", opacity: "1" }}
                  onClick={closeAllModals}
                ></button>

                {/* Welcome Header replaced with Image */}
                <div className="text-center mb-3">
                  <img
                    src="/assets/fonts/logo.png"
                    alt="M's TRIBE Logo"
                    style={{
                      maxWidth: "150px",
                      height: "auto",
                    }}
                  />
                </div>

                {/* Error Message */}
                {error && <p className="text-danger text-center">{error}</p>}

                {/* Form wrapper */}
                <form onSubmit={handleSignupSubmit}>
                  {/* Username Field */}
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
                            type="button" // Prevent form submission
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

                  {/* Email Field */}
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

                  {/* Password Field */}
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

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    className="btn w-100 mb-2"
                    style={{
                      backgroundColor: "#0dcaf0",
                      color: "#fff",
                      fontWeight: "bold",
                      borderRadius: "5px",
                    }}
                  >
                    Sign Up
                  </button>
                </form>

                {/* Sign up with Google Button */}
                <button
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center"
                  style={{ borderRadius: "5px" }}
                >
                  <img src="/assets/img/iconImage/g.webp" alt="Google" width="20" height="20" className="me-2" />
                  Sign up with Google
                </button>

                {/* Login Link */}
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
                </div>
              </div>
            </div>
          )}

          {/* Forgot Password Modal */}
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

          {/* Verify Code Modal */}
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
    </>
  )
}


