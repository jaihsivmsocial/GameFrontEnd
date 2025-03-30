'use client'
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
import ForgotPasswordModal from '@/components/forgetpassword'
import {BASEURL} from "@/utils/apiservice"
export const Login = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [hover, setHover] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BASEURL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      alert("Login successful!");
      console.log("Login response:", data);

      // Save token if needed
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        router.push("/signup"); // ✅ Redirect after successful login
      }
      setShowPopup(false);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Login Button */}
      <button
        type="button"
        className="btn btn-dark border border-info text-white d-flex align-items-center gap-2 px-3 py-1 rounded-2"
        style={{
          backgroundColor: "#000",
          border: `2px solid ${hover ? "#0dcaf0" : "#0dcaf0"}`,
          width: "110px",
          height: "40px",
          fontWeight: "bold",
          letterSpacing: "1px",
          boxShadow: hover
            ? "0 0 10px rgba(13, 202, 240, 0.8)"
            : "0 0 5px rgba(13, 202, 240, 0.5)",
          transition: "box-shadow 0.3s ease",
          padding: "0",
          overflow: "hidden",
          gap: "8px",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => setShowPopup(true)}
      >
        LOGIN
      </button>

      {/* Popup Modal */}
      {showPopup && (
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
              onClick={() => setShowPopup(false)}
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
            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder="mark@gmail.com"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#333" }}
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
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#333" }}
                />
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="btn w-100 mb-2"
                disabled={loading}
                style={{
                  backgroundColor: "#0dcaf0",
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
                  console.log("Image failed to load:", e.target.src);
                  e.target.src = "https://via.placeholder.com/20";
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
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#333" }}
                />
                <label className="form-check-label text-white" htmlFor="rememberMe">
                  Remember for 30 days
                </label>
              </div>
              <div className="text-center">
                <a
                  onClick={() => {
                    setShowPopup(false)
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
                  {/* <a href="/signup" className="text-info" style={{ cursor: "pointer" }}> */}
                  {/* </a> */}
                </small>
              <button className="btn" onClick={() => setShowPopup(true)}              >

                  {/* <a href="/signup" className="text-info" style={{ cursor: "pointer" }}> */}
                  Sign up
                  {/* </a> */}

              </button>

            </div>
          </div>
        </div>
      )}
       <ForgotPasswordModal show={showForgotPassword} handleClose={() => setShowForgotPassword(false)} />
    </>

  );
};

export default Login;
