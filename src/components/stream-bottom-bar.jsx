"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import "bootstrap/dist/css/bootstrap.min.css"

export default function StreamBottomBar() {
  const [donationAmount, setDonationAmount] = useState("")
  const [betAmount, setBetAmount] = useState("100")
  const [giftToPlayer, setGiftToPlayer] = useState(false)
  const [addToPrizepool, setAddToPrizepool] = useState(false)

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
        height: "110px",
      }}
    >
      {/* Left Section - Donation */}
      <div style={{ width: "33%", paddingRight: "15px", borderRight: "1px solid #1e293b" }}>
        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontSize: "14px" }}>
            Want to <span style={{ color: "#06b6d4", fontWeight: "bold" }}>donate</span>?
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ position: "relative", marginRight: "5px", display: "flex", alignItems: "center" }}>
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                paddingLeft: "5px",
                marginRight: "5px",
              }}
            >
              <span style={{ color: "#06b6d4", marginRight: "5px" }}>$</span>
              <input
                type="text"
                placeholder="Enter amount here..."
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "white",
                  padding: "6px 40px 6px 0",
                  width: "140px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "10px",
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
                fontSize: "12px",
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
                fontSize: "12px",
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
        </div>

        <div style={{ display: "flex", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
            <input
              type="checkbox"
              id="giftToPlayer"
              checked={giftToPlayer}
              onChange={() => setGiftToPlayer(!giftToPlayer)}
              style={{ marginRight: "5px", width: "14px", height: "14px" }}
            />
            <label htmlFor="giftToPlayer" style={{ fontSize: "12px", margin: 0 }}>
              Gift to Player
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              id="addToPrizepool"
              checked={addToPrizepool}
              onChange={() => setAddToPrizepool(!addToPrizepool)}
              style={{ marginRight: "5px", width: "14px", height: "14px" }}
            />
            <label htmlFor="addToPrizepool" style={{ fontSize: "12px", margin: 0 }}>
              Add to Prizepool
            </label>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px dashed #475569",
            borderBottom: "1px dashed #475569",
            paddingTop: "6px",
            paddingBottom: "6px",
            display: "flex",
          }}
        >
          <span style={{ color: "#06b6d4", fontSize: "12px", marginRight: "15px" }}>$5 shows up on stream</span>
          <span style={{ color: "#9ca3af", fontSize: "12px" }}>$50 fireworks</span>
        </div>
      </div>

      {/* Center Section - Betting */}
      <div style={{ width: "33%", padding: "0 15px", borderRight: "1px solid #1e293b" }}>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "14px" }}>Will </span>
            <span style={{ color: "#06b6d4", margin: "0 5px", fontSize: "14px" }}>James5423</span>
            <span style={{ fontSize: "14px" }}>survive the full 5 minutes?</span>
            <div
              style={{
                backgroundColor: "#7f1d1d",
                border: "1px solid #b91c1c",
                borderRadius: "4px",
                color: "white",
                padding: "1px 6px",
                marginLeft: "10px",
                fontSize: "12px",
              }}
            >
              00:36
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
            <button
              style={{
                backgroundColor: "#166534",
                border: "none",
                borderRadius: "4px",
                color: "white",
                padding: "6px 12px",
                marginRight: "8px",
                display: "flex",
                alignItems: "center",
                fontSize: "14px",
              }}
            >
              YES
              <span
                style={{
                  backgroundColor: "#15803d",
                  borderRadius: "4px",
                  padding: "1px 4px",
                  marginLeft: "4px",
                  fontSize: "11px",
                }}
              >
                52%
              </span>
            </button>

            <button
              style={{
                backgroundColor: "#991b1b",
                border: "none",
                borderRadius: "4px",
                color: "white",
                padding: "6px 12px",
                marginRight: "8px",
                display: "flex",
                alignItems: "center",
                fontSize: "14px",
              }}
            >
              NO
              <span
                style={{
                  backgroundColor: "#b91c1c",
                  borderRadius: "4px",
                  padding: "1px 4px",
                  marginLeft: "4px",
                  fontSize: "11px",
                }}
              >
                48%
              </span>
            </button>

            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                paddingLeft: "5px",
                marginRight: "5px",
              }}
            >
              <span style={{ color: "#06b6d4", marginRight: "5px" }}>$</span>
              <input
                type="text"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "white",
                  padding: "6px 40px 6px 0",
                  width: "60px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "10px",
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
                fontSize: "12px",
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
                fontSize: "12px",
              }}
            >
              +5.00
            </button>

            <button
              style={{
                backgroundColor: "#06b6d4",
                border: "none",
                borderRadius: "4px",
                color: "white",
                padding: "6px 12px",
                fontSize: "14px",
              }}
            >
              PLACE BET
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
            <div>
              <span style={{ color: "#9ca3af" }}>Total Bets:</span>
              <span style={{ color: "#06b6d4" }}> $3,560</span>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "white",
                  borderRadius: "2px",
                  transform: "rotate(45deg)",
                  marginRight: "5px",
                }}
              ></div>
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
            marginBottom: "10px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        <div
          style={{
            fontSize: "12px",
            color: "white",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Join +2 million players from <span style={{ marginLeft: "4px" }}>🇮🇳</span>
        </div>

        <button
          style={{
            backgroundColor: "#06b6d4",
            border: "none",
            borderRadius: "4px",
            color: "white",
            padding: "8px 15px",
            width: "250px",
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Sign Up Now (It's Free)
        </button>
      </div>
    </div>
  )
}

