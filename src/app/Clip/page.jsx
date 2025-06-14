"use client"

import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import VideoFeed from "@/components/clipsorts/VideoFeed"
import UploadModal from "@/components/clipsorts/UploadModal"
import { fetchVideos } from "@/components/clipsorts/api"
import { useAuth } from "@/components/clipsorts/context/AuthContext"

export default function ClipPage() {
  console.log("🏠 Main page (app/page.jsx) is being rendered")
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  const {
    showLoginModal,
    showSignupModal,
    showForgotPassword,
    showVerifyCode,
    closeAllModals,
    openLoginModal,
    openSignupModal,
    openForgotPasswordModal,
    loginFormData,
    signupFormData,
    handleLoginChange,
    handleSignupChange,
    handleLoginSubmit,
    handleSignupSubmit,
    error,
    usernameTaken,
    suggestedUsernames,
    verificationEmail,
    setVerificationEmail,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    handleVerifyOtp,
    loading: authLoading,
    isAuthenticated,
    user,
    logout,
    setShowVerifyCode,
    setSignupFormData,
  } = useAuth()

  // Set isMounted to true once the component mounts on the client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      loadVideos()
    }
  }, [refreshKey, isMounted])

  const loadVideos = async (pageNum = 1) => {
    if (!isMounted) return

    try {
      setLoading(true)
      const response = await fetchVideos(pageNum)

      if (pageNum === 1) {
        setVideos(response.videos)
      } else {
        setVideos((prev) => [...prev, ...response.videos])
      }

      setHasMore(response.hasMore)
      setPage(pageNum)
    } catch (error) {
      console.error("Failed to load videos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadVideos(page + 1)
    }
  }

  const handleVideoUploaded = (newVideo) => {
    if (newVideo) {
      setVideos((prev) => [newVideo, ...prev])
    }
    setRefreshKey((prev) => prev + 1)
    setShowUploadModal(false)
  }

  const handleRequestOTP = () => {
    closeAllModals()
    setVerificationEmail(forgotPasswordEmail)
    setShowVerifyCode(true)
  }

  // Only render client-side content after mounting
  if (!isMounted) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          height: "100vh",
          background: "#0f0f0f",
        }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="clip-container text-white"
      style={{
        background: "#0f0f0f",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <div className="container-fluid p-0">
        <div
          className="d-flex justify-content-between align-items-center p-3 sticky-top"
          style={{ background: "#0f0f0f", zIndex: 10 }}
        >
          <h2 className="m-0">CLIP</h2>
          <div className="d-flex align-items-center">
            <button
              className="btn rounded-circle"
              style={{
                background: "linear-gradient(90deg, #00a0e9 0%, #0073d5 50%, #0046c0 100%)",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => (isAuthenticated ? setShowUploadModal(true) : openLoginModal())}
            >
              <i className="bi bi-plus-lg text-white"></i>
            </button>
          </div>
        </div>

        {/* Main content area with centered video feed */}
        <div className="d-flex justify-content-center">
          <div style={{ maxWidth: "480px", width: "100%" }}>
            {loading && videos.length === 0 ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : videos.length > 0 ? (
              <VideoFeed videos={videos} onLoadMore={handleLoadMore} hasMore={hasMore} loading={loading} />
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "80vh" }}>
                <i className="bi bi-camera-video text-muted" style={{ fontSize: "64px" }}></i>
                <p className="mt-3">No videos available. Be the first to upload!</p>
                <button
                  className="btn mt-3"
                  style={{
                    background: "linear-gradient(90deg, #00a0e9 0%, #0073d5 50%, #0046c0 100%)",
                    color: "white",
                  }}
                  onClick={() => (isAuthenticated ? setShowUploadModal(true) : openLoginModal())}
                >
                  Upload Video
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <UploadModal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        onVideoUploaded={handleVideoUploaded}
      />

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
              background: "#050505",
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
                src="/assets/img/logo/headlogo.png"
                alt="Logo"
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
                disabled={authLoading}
                style={{
                  backgroundColor: "#07a1fe",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "5px",
                }}
              >
                {authLoading ? "Signing In..." : "Sign In"}
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
                <a onClick={openForgotPasswordModal} className="text-info" style={{ cursor: "pointer" }}>
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <small>
                Don't have an account?{" "}
                <a
                  onClick={() => {
                    closeAllModals()
                    openSignupModal()
                  }}
                  className="text-info"
                  style={{ cursor: "pointer" }}
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
              background: "#050505",
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
                src="/assets/img/logo/headlogo.png"
                alt="Logo"
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
                    closeAllModals()
                    openLoginModal()
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
              background: "#050505",
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

            {/* Header */}
            <div className="text-center mb-4">
              <h4>Forgot Password</h4>
              <p className="text-muted">Enter your email to reset your password</p>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleRequestOTP()
              }}
            >
              <div className="mb-3">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                />
              </div>

              <button
                type="submit"
                className="btn w-100"
                style={{
                  backgroundColor: "#0dcaf0",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "5px",
                }}
              >
                Send Reset Link
              </button>
            </form>

            {/* Back to Login */}
            <div className="text-center mt-3">
              <small>
                <a
                  onClick={() => {
                    closeAllModals()
                    openLoginModal()
                  }}
                  className="text-info"
                  style={{ cursor: "pointer" }}
                >
                  Back to Login
                </a>
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Verify Code Modal */}
      {showVerifyCode && (
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
              background: "#050505",
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

            {/* Header */}
            <div className="text-center mb-4">
              <h4>Verify Code</h4>
              <p className="text-muted">Enter the verification code sent to {verificationEmail}</p>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const code = e.target.code.value
                const newPassword = e.target.newPassword.value
                const confirmPassword = e.target.confirmPassword.value

                if (newPassword !== confirmPassword) {
                  alert("Passwords do not match")
                  return
                }

                handleVerifyOtp(code, newPassword)
              }}
            >
              <div className="mb-3">
                <label className="form-label">Verification Code</label>
                <input
                  type="text"
                  name="code"
                  className="form-control"
                  placeholder="Enter verification code"
                  required
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-control"
                  placeholder="Enter new password"
                  required
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm new password"
                  required
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#333", color: "#fff" }}
                />
              </div>

              <button
                type="submit"
                className="btn w-100"
                style={{
                  backgroundColor: "#0dcaf0",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "5px",
                }}
              >
                Reset Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
