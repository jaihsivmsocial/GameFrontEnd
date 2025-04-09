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
  const [activeMobileSection, setActiveMobileSection] = useState(null) // 'donate', 'bet', or null
  const [isMobile, setIsMobile] = useState(false)

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      setIsLoggedIn(true)
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
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

  // Render donation section for mobile
  const renderDonationSection = () => {
    return (
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          padding: "15px",
          borderRadius: "16px 16px 0 0",
          position: "fixed",
          bottom: "60px",
          left: 0,
          right: 0,
          zIndex: 50,
          boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.5)",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ color: "#06b6d4", fontWeight: "bold", fontSize: "16px" }}>Donate</span>
          <button
            onClick={() => setActiveMobileSection(null)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <span style={{ fontSize: "14px", color: "#06b6d4", fontWeight: "bold" }}>Want to donate?</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1e293b",
              borderRadius: "4px",
              marginRight: "5px",
              position: "relative",
              height: "40px",
              flex: 1,
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
                fontSize: "14px",
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
              onClick={() => setDonationAmount("")}
            >
              CLEAR
            </span>
          </div>

          <button
            style={{
              backgroundColor: "#06b6d4",
              border: "none",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 5L19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <button
            style={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "4px",
              color: "#06b6d4",
              padding: "8px 12px",
              fontSize: "14px",
              flex: 1,
            }}
            onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
          >
            +1.00
          </button>

          <button
            style={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "4px",
              color: "#06b6d4",
              padding: "8px 12px",
              fontSize: "14px",
              flex: 1,
            }}
            onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
          >
            +5.00
          </button>

          <button
            style={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "4px",
              color: "#06b6d4",
              padding: "8px 12px",
              fontSize: "14px",
              flex: 1,
            }}
            onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 10 + "")}
          >
            +10.00
          </button>
        </div>

        <div style={{ display: "flex", marginBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
            <input
              type="checkbox"
              id="giftToPlayerMobile"
              checked={giftToPlayer}
              onChange={() => setGiftToPlayer(!giftToPlayer)}
              style={{ marginRight: "5px", width: "16px", height: "16px" }}
            />
            <label htmlFor="giftToPlayerMobile" style={{ fontSize: "14px", margin: 0, color: "white" }}>
              Gift to Player
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              id="addToPrizepoolMobile"
              checked={addToPrizepool}
              onChange={() => setAddToPrizepool(!addToPrizepool)}
              style={{ marginRight: "5px", width: "16px", height: "16px" }}
            />
            <label htmlFor="addToPrizepoolMobile" style={{ fontSize: "14px", margin: 0, color: "white" }}>
              Add to Prizepool
            </label>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px dashed #475569",
            borderBottom: "1px dashed #475569",
            paddingTop: "8px",
            paddingBottom: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <span style={{ color: "#06b6d4", fontSize: "14px" }}>$5 shows up on stream</span>
          <span style={{ color: "#9ca3af", fontSize: "14px" }}>$50 fireworks</span>
        </div>
      </div>
    )
  }

  // Render betting section for mobile
  const renderBettingSection = () => {
    return (
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          padding: "15px",
          borderRadius: "16px 16px 0 0",
          position: "fixed",
          bottom: "60px",
          left: 0,
          right: 0,
          zIndex: 50,
          boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.5)",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ color: "#06b6d4", fontWeight: "bold", fontSize: "16px" }}>Place a Bet</span>
          <button
            onClick={() => setActiveMobileSection(null)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "15px",
            position: "relative",
          }}
        >
          <div>
            <span style={{ fontSize: "16px", color: "white" }}>Will </span>
            <span style={{ color: "#06b6d4", fontSize: "16px" }}>James5423</span>
            <span style={{ fontSize: "16px", color: "white" }}> survive the full 5 minutes?</span>
          </div>
          <div
            style={{
              position: "absolute",
              right: "0",
              backgroundColor: "#7f1d1d",
              border: "1px solid #b91c1c",
              borderRadius: "4px",
              color: "white",
              padding: "2px 8px",
              fontSize: "14px",
            }}
          >
            00:36
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
          <button
            style={{
              backgroundColor: "#166534",
              border: "1px solid #15803d",
              borderRadius: "8px",
              color: "#22c55e",
              padding: "10px 15px",
              fontSize: "16px",
              fontWeight: "bold",
              position: "relative",
              width: "48%",
              height: "50px",
            }}
          >
            YES
            <span
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                backgroundColor: "#15803d",
                borderRadius: "0 8px 0 8px",
                padding: "2px 6px",
                fontSize: "12px",
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
              borderRadius: "8px",
              color: "#ef4444",
              padding: "10px 15px",
              fontSize: "16px",
              fontWeight: "bold",
              position: "relative",
              width: "48%",
              height: "50px",
            }}
          >
            NO
            <span
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                backgroundColor: "#b91c1c",
                borderRadius: "0 8px 0 8px",
                padding: "2px 6px",
                fontSize: "12px",
                color: "white",
              }}
            >
              48%
            </span>
          </button>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1e293b",
              borderRadius: "8px",
              position: "relative",
              height: "50px",
              width: "100%",
              marginBottom: "10px",
            }}
          >
            <span style={{ color: "#06b6d4", marginLeft: "15px", marginRight: "10px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
                  fill="#06b6d4"
                />
              </svg>
            </span>
            <span style={{ color: "#06b6d4", fontSize: "18px", fontWeight: "bold" }}>{betAmount}</span>
            <span
              style={{
                position: "absolute",
                right: "15px",
                color: "#9ca3af",
                fontSize: "12px",
                cursor: "pointer",
              }}
              onClick={() => setBetAmount("")}
            >
              CLEAR
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#06b6d4",
                padding: "10px",
                fontSize: "14px",
                flex: 1,
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
            >
              +1.00
            </button>

            <button
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#06b6d4",
                padding: "10px",
                fontSize: "14px",
                flex: 1,
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
            >
              +5.00
            </button>

            <button
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#06b6d4",
                padding: "10px",
                fontSize: "14px",
                flex: 1,
              }}
              onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 10 + "")}
            >
              +10.00
            </button>
          </div>
        </div>

        <button
          style={{
            backgroundColor: "#06b6d4",
            border: "none",
            borderRadius: "8px",
            color: "white",
            padding: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            width: "100%",
            marginBottom: "10px",
          }}
        >
          PLACE BET
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: "#9ca3af",
          }}
        >
          <div>
            <span>Total Bets:</span>
            <span style={{ color: "#06b6d4" }}> $3,560</span>
          </div>

          <div>
            <span>Potential Payout:</span>
            <span style={{ color: "#06b6d4" }}> $187</span>
          </div>
        </div>
      </div>
    )
  }

  // Mobile bottom bar with buttons that open the sections
  const renderMobileBottomBar = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <button
          onClick={() => setActiveMobileSection("donate")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "#06b6d4",
            padding: "5px 0",
            width: "20%",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
              fill="#06b6d4"
            />
          </svg>
          <span style={{ fontSize: "12px", marginTop: "2px" }}>Donate</span>
        </button>

        <button
          onClick={() => setActiveMobileSection("bet")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "#06b6d4",
            padding: "5px 0",
            width: "20%",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" stroke="#06b6d4" strokeWidth="2" />
            <circle cx="12" cy="12" r="2" stroke="#06b6d4" strokeWidth="2" />
            <path d="M16 8L18 6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 16L6 18" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 16L18 18" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 8L6 6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: "12px", marginTop: "2px" }}>Bet</span>
        </button>

        <button
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "white",
            padding: "5px 0",
            width: "20%",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 2H8C7.44772 2 7 2.44772 7 3V21C7 21.5523 7.44772 22 8 22H16C16.5523 22 17 21.5523 17 21V3C17 2.44772 16.5523 2 16 2Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 18H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: "12px", marginTop: "2px" }}>Shop</span>
        </button>

        <button
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "white",
            padding: "5px 0",
            width: "20%",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 10L19.5528 7.72361C19.8343 7.58281 20 7.30279 20 7V5C20 4.44772 19.5523 4 19 4H5C4.44772 4 4 4.44772 4 5V7C4 7.30279 4.16571 7.58281 4.44721 7.72361L9 10L4.44721 12.2764C4.16571 12.4172 4 12.6972 4 13V15C4 15.5523 4.44772 16 5 16H19C19.5523 16 20 15.5523 20 15V13C20 12.6972 19.8343 12.4172 19.5528 12.2764L15 10Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M5 20L19 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: "12px", marginTop: "2px" }}>Clips</span>
        </button>

        <button
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "white",
            padding: "5px 0",
            width: "20%",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: "12px", marginTop: "2px" }}>Settings</span>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Desktop version */}
      {!isMobile && (
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
                  onClick={() => setDonationAmount("")}
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
                onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
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
                onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
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

              <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}
              >
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
                  <span style={{ color: "#06b6d4", fontSize: "14px", fontWeight: "bold" }}>{betAmount}</span>
                  <span
                    style={{
                      position: "absolute",
                      right: "8px",
                      color: "#9ca3af",
                      fontSize: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() => setBetAmount("")}
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
                  onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
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
                  onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
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
      )}

      {/* Mobile version */}
      {isMobile && (
        <>
          {renderMobileBottomBar()}
          {activeMobileSection === "donate" && renderDonationSection()}
          {activeMobileSection === "bet" && renderBettingSection()}
        </>
      )}
    </>
  )
}
