import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
import Login from "@/components/Login";
export const Signup = () => {
  const [showPopup, setShowPopup] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profilePicture: ""
  });
  const [hover, setHover] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const suggestedUsernames = ["@mark2407", "@markJ007"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "username") {
      setUsernameTaken(value.toLowerCase() === "mark_j"); // Simulating username taken
    }
  };

  // Add handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameTaken) {
      alert("Please choose a different username");
      return;
    }

    try {
      const response = await fetch(`${BASEURL}/api/register`, { // Adjust URL to your backend endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration successful!");
        setShowPopup(false);
        // Redirect to Chat Page

        setFormData({
          username: "",
          email: "",
          password: "",
          profilePicture: ""
        });
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during registration");
    }
  };

  return (
    <>
      {/* Signup Button */}
      <button
        type="button"
        className="btn btn-dark border border-info text-white px-5 py-2 rounded-3"
        style={{
          backgroundColor: "#000",
          border: `3px solid ${hover ? "#0dcaf0" : "#0dcaf0"}`,
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => setShowPopup(true)}
      >
        SIGNUP
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
            {/* Close Button (X) */}
            <button
              className="btn-close position-absolute top-0 end-0 m-2"
              style={{ backgroundColor: "#fff", opacity: "1" }}
              onClick={() => setShowPopup(false)}
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

            {/* Form wrapper */}
            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className={`form-control ${usernameTaken ? "is-invalid" : ""}`}
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#333" }}
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
                        onClick={() => setFormData({ ...formData, username: name.replace("@", "") })}
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
                  value={formData.email}
                  onChange={handleChange}
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
                  style={{ backgroundColor: "#1a1a1a", borderColor: "#333" }}
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
              <img
                src="/assets/img/iconImage/g.webp"
                alt="Google"
                width="20"
                height="20"
                className="me-2"
              />
              Sign up with Google
            </button>

            {/* Login Link */}
            <div className="text-center mt-3">
              <small>
                Already have an account?{" "}
                <a
                  onClick={() => {
                    setShowPopup(false)
                    setShowForgotPassword(true)
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
      {/* <Login show={showForgotPassword} handleClose={() => setShowForgotPassword(false)} /> */}
    </>
  );
};