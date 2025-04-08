"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import "bootstrap/dist/css/bootstrap.min.css"
import AuthHeaderButtons from "../components/register/SignupLogin"

export default function StreamBottomBar() {
  const [donationAmount, setDonationAmount] = useState("")
  const [betAmount, setBetAmount] = useState("100")
  const [giftToPlayer, setGiftToPlayer] = useState(false)
  const [addToPrizepool, setAddToPrizepool] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [initialAuthView, setInitialAuthView] = useState(null)

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  // Handle auth state changes from the AuthHeaderButtons component
  const handleAuthStateChange = (loggedIn, userData) => {
    setIsLoggedIn(loggedIn)
    if (showAuthModal) {
      setShowAuthModal(false)
    }
  }

  // Handle signup button click
  const handleSignupClick = () => {
    setInitialAuthView("signup")
    setShowAuthModal(true)
  }

  return (
    <div
      style={{
        bottom: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(to bottom, #0f172a, #0a0f1a)",
        color: "white",
        padding: "10px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 9999,
        borderTop: "1px solid #1e293b",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Left Section - Donation */}
      <div style={{ width: "33%", paddingRight: "15px", borderRight: "1px solid #1e293b" }}>
        <div style={{ marginBottom: "5px" }}>
          <span style={{ fontSize: "14px" }}>
            <span style={{ color: "#06b6d4", fontWeight: "bold" }}> Want to donate?</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1e293b",
              borderRadius: "4px",
              marginRight: "5px",
              position: "relative",
              height: "32px",
              width: "165px",
            }}
          >
            <span style={{ color: "#06b6d4", marginLeft: "8px", marginRight: "5px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
                  fill="#06b6d4"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Enter amount here..."
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                padding: "0",
                width: "calc(100% - 60px)",
                fontSize: "12px",
                outline: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "8px",
                color: "#9ca3af",
                fontSize: "10px",
                cursor: "pointer",
              }}
            >
              CLEAR
            </span>
          </div>

          <button
            style={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "4px",
              color: "#06b6d4",
              padding: "6px 8px",
              marginRight: "5px",
              fontSize: "11px",
              height: "32px",
            }}
          >
            +1.00
          </button>

          <button
            style={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "4px",
              color: "#06b6d4",
              padding: "6px 8px",
              marginRight: "5px",
              fontSize: "11px",
              height: "32px",
            }}
          >
            +5.00
          </button>

          <button
            style={{
              backgroundColor: "#06b6d4",
              border: "none",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
            }}
          >
            <Check size={18} color="white" />
          </button>
        </div>

        <div style={{ display: "flex", marginBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
            <input
              type="checkbox"
              id="giftToPlayer"
              checked={giftToPlayer}
              onChange={() => setGiftToPlayer(!giftToPlayer)}
              style={{ marginRight: "5px", width: "12px", height: "12px" }}
            />
            <label htmlFor="giftToPlayer" style={{ fontSize: "11px", margin: 0 }}>
              Gift to Player
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              id="addToPrizepool"
              checked={addToPrizepool}
              onChange={() => setAddToPrizepool(!addToPrizepool)}
              style={{ marginRight: "5px", width: "12px", height: "12px" }}
            />
            <label htmlFor="addToPrizepool" style={{ fontSize: "11px", margin: 0 }}>
              Add to Prizepool
            </label>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px dashed #475569",
            borderBottom: "1px dashed #475569",
            paddingTop: "4px",
            paddingBottom: "4px",
            display: "flex",
          }}
        >
          <span style={{ color: "#06b6d4", fontSize: "11px", marginRight: "15px" }}>$5 shows up on stream</span>
          <span style={{ color: "#9ca3af", fontSize: "11px" }}>$50 fireworks</span>
        </div>
      </div>

      {/* Center Section - Betting */}
      <div style={{ width: "33%", padding: "0 15px", borderRight: "1px solid #1e293b" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "8px",
              position: "relative",
            }}
          >
            <div>
              <span style={{ fontSize: "14px", color: "white" }}>Will </span>
              <span style={{ color: "#06b6d4", fontSize: "14px" }}>James5423</span>
              <span style={{ fontSize: "14px", color: "white" }}> survive the full 5 minutes?</span>
            </div>
            <div
              style={{
                position: "absolute",
                right: "0",
                backgroundColor: "#7f1d1d",
                border: "1px solid #b91c1c",
                borderRadius: "4px",
                color: "white",
                padding: "1px 6px",
                fontSize: "12px",
              }}
            >
              00:36
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
            <button
              style={{
                backgroundColor: "#166534",
                border: "1px solid #15803d",
                borderRadius: "4px",
                color: "#22c55e",
                padding: "6px 12px",
                fontSize: "14px",
                fontWeight: "bold",
                position: "relative",
                height: "32px",
                width: "80px",
              }}
            >
              YES
              <span
                style={{
                  position: "absolute",
                  right: "0",
                  top: "0",
                  backgroundColor: "#15803d",
                  borderRadius: "0 4px 0 4px",
                  padding: "1px 4px",
                  fontSize: "10px",
                  color: "white",
                }}
              >
                52%
              </span>
            </button>

            <button
              style={{
                backgroundColor: "#7f1d1d",
                border: "1px solid #b91c1c",
                borderRadius: "4px",
                color: "#ef4444",
                padding: "6px 12px",
                fontSize: "14px",
                fontWeight: "bold",
                position: "relative",
                height: "32px",
                width: "80px",
              }}
            >
              NO
              <span
                style={{
                  position: "absolute",
                  right: "0",
                  top: "0",
                  backgroundColor: "#b91c1c",
                  borderRadius: "0 4px 0 4px",
                  padding: "1px 4px",
                  fontSize: "10px",
                  color: "white",
                }}
              >
                48%
              </span>
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#1e293b",
                borderRadius: "4px",
                position: "relative",
                height: "32px",
                width: "80px",
              }}
            >
              <span style={{ color: "#06b6d4", marginLeft: "8px", marginRight: "5px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
                    fill="#06b6d4"
                  />
                </svg>
              </span>
              <span style={{ color: "#06b6d4", fontSize: "14px", fontWeight: "bold" }}>100</span>
              <span
                style={{
                  position: "absolute",
                  right: "8px",
                  color: "#9ca3af",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                CLEAR
              </span>
            </div>

            <button
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "4px",
                color: "#06b6d4",
                padding: "6px 8px",
                fontSize: "11px",
                height: "32px",
                width: "50px",
              }}
            >
              +1.00
            </button>

            <button
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "4px",
                color: "#06b6d4",
                padding: "6px 8px",
                fontSize: "11px",
                height: "32px",
                width: "50px",
              }}
            >
              +5.00
            </button>

            <button
              style={{
                backgroundColor: "#06b6d4",
                border: "none",
                borderRadius: "4px",
                color: "black",
                padding: "6px 12px",
                fontSize: "14px",
                fontWeight: "bold",
                height: "32px",
                width: "100px",
              }}
            >
              PLACE BET
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
            }}
          >
            <div>
              <span style={{ color: "#9ca3af" }}>Total Bets:</span>
              <span style={{ color: "#06b6d4" }}> $3,560</span>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: "4px" }}
              >
                <path
                  d="M7 10V14H10V21H14V14H17L18 10H14V8C14 7.73478 14.1054 7.48043 14.2929 7.29289C14.4804 7.10536 14.7348 7 15 7H18V3H15C13.6739 3 12.4021 3.52678 11.4645 4.46447C10.5268 5.40215 10 6.67392 10 8V10H7Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ color: "#9ca3af" }}>Potential Payout:</span>
              <span style={{ color: "#06b6d4" }}> $187</span>
            </div>

            <div>
              <span style={{ color: "#9ca3af" }}>Biggest Win this week:</span>
              <span style={{ color: "#06b6d4" }}> $2,370</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div
        style={{
          width: "33%",
          padding: "0 15px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "8px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>CHAT</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ color: "#f59e0b", fontSize: "14px", marginRight: "2px", marginLeft: "2px" }}>♦</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" />
              <circle cx="12" cy="12" r="2" stroke="white" strokeWidth="2" />
              <path d="M16 8L18 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 16L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 16L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 8L6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>INFLUENCE</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ color: "#f59e0b", fontSize: "14px", marginRight: "2px", marginLeft: "2px" }}>♦</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6 11H4C3.44772 11 3 11.4477 3 12V19C3 19.5523 3.44772 20 4 20H6C6.55228 20 7 19.5523 7 19V12C7 11.4477 6.55228 11 6 11Z"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 11H18C17.4477 11 17 11.4477 17 12V19C17 19.5523 17.4477 20 18 20H20C20.5523 20 21 19.5523 21 19V12C21 11.4477 20.5523 11 20 11Z"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 13C17 11.9391 16.5786 10.9217 15.8284 10.1716C15.0783 9.42143 14.0609 9 13 9H11C9.93913 9 8.92172 9.42143 8.17157 10.1716C7.42143 10.9217 7 11.9391 7 13"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7Z"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ color: "#06b6d4", fontWeight: "bold", fontSize: "14px" }}>PLAY</span>
          </div>
        </div>

        {/* Conditional rendering based on login state */}
        {!isLoggedIn ? (
          <>
            <div
              style={{
                fontSize: "11px",
                color: "white",
                marginBottom: "6px",
                textAlign: "center",
              }}
            >
              Join +2 million players from <span style={{ marginLeft: "4px" }}>🇮🇳</span>
            </div>

            <button
              onClick={handleSignupClick}
              style={{
                backgroundColor: "#06b6d4",
                border: "none",
                borderRadius: "4px",
                color: "white",
                padding: "6px 12px",
                width: "200px",
                fontSize: "13px",
                fontWeight: "bold",
                textAlign: "center",
                height: "32px",
              }}
            >
              Sign Up Now (It's Free)
            </button>
          </>
        ) : (
          <>
            {/* Subscribe section - shown after login */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ fontSize: "11px", color: "white", marginRight: "5px" }}>Subscriber</div>
                <div
                  style={{
                    backgroundColor: "#06b6d4",
                    color: "white",
                    fontSize: "10px",
                    padding: "1px 5px",
                    borderRadius: "2px",
                    fontWeight: "bold",
                  }}
                >
                  Exclusive
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "white",
                    marginRight: "5px",
                    textDecoration: "line-through",
                  }}
                >
                  $9.99
                </div>
                <div
                  style={{
                    color: "#06b6d4",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  $4.99
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "white",
                    marginLeft: "3px",
                    alignSelf: "flex-end",
                    marginBottom: "2px",
                  }}
                >
                  PER MONTH
                </div>
              </div>

              <button
                style={{
                  backgroundColor: "#06b6d4",
                  border: "none",
                  borderRadius: "4px",
                  color: "white",
                  padding: "6px 12px",
                  width: "200px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  textAlign: "center",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: "6px" }}
                >
                  <path
                    d="M20 12V22H4V12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 7H2V12H22V7Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                SUBSCRIBE
              </button>

              <div
                style={{
                  fontSize: "10px",
                  color: "#9ca3af",
                  marginTop: "4px",
                  textAlign: "center",
                }}
              >
                Only 6,842 remaining
              </div>
            </div>
          </>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(2px)",
            zIndex: 1050,
          }}
        >
          <AuthHeaderButtons
            initialView={initialAuthView}
            onAuthStateChange={handleAuthStateChange}
            isModal={true}
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      )}
    </div>
  )
}
