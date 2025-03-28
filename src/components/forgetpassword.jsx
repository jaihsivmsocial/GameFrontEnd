'use client';

import React, { useState } from "react";
import { BASEURL } from "@/utils/apiservice";

const ForgotPasswordModal = ({ show, handleClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${BASEURL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to reset password");

      setMessage("Password reset link sent to your email!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(2px)", zIndex: 1050 }}
    >
      <div
        className="card p-4 text-white position-relative"
        style={{ backgroundColor: "#121212", borderRadius: "10px", width: "400px", border: "2px solid #0dcaf0" }}
      >
        <button className="btn-close position-absolute top-0 end-0 m-2" style={{ backgroundColor: "#fff" }} onClick={handleClose}></button>
        <div className="text-center">
          <span role="img" aria-label="crying emoji" style={{ fontSize: "2rem" }}>
            😭
          </span>
          <h5 className="mt-2">Forgot your password?</h5>
          <p className="text-muted">Reset your password using your registered email address.</p>
        </div>
        {message && <p className="text-success text-center">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ backgroundColor: "#1a1a1a", borderColor: "#333" }}
            />
          </div>
          <button type="submit" className="btn w-100" style={{ backgroundColor: "#0dcaf0", color: "#fff", fontWeight: "bold" }}>
            Reset Password
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-muted">
            Need help?? <a href="#" className="text-white fw-bold">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
