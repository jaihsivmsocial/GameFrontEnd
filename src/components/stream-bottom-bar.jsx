"use client"

import { useState } from "react"
import { Check, MessageSquare, Star, Gamepad } from "lucide-react"

export default function StreamBottomBar() {
  const [donationAmount, setDonationAmount] = useState("")
  const [betAmount, setBetAmount] = useState("100")
  const [giftToPlayer, setGiftToPlayer] = useState(false)
  const [addToPrizepool, setAddToPrizepool] = useState(false)

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0f172a",
        color: "#fff",
        padding: "10px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderTop: "1px solid #1e293b",
        zIndex: 9999,
        height: "160px",
      }}
    >
      {/* Left Section - Donation */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "33%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              color: "#06b6d4",
              marginRight: "10px",
            }}
          >
            Want to <span style={{ fontWeight: "bold" }}>donate</span>?
          </span>

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                marginRight: "4px",
              }}
            >
              <input
                type="text"
                placeholder="Enter amount here..."
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: "4px",
                  padding: "8px 50px 8px 30px",
                  width: "180px",
                  fontSize: "14px",
                  border: "none",
                  color: "white",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#06b6d4",
                }}
              >
                <span style={{ fontSize: "16px" }}>$</span>
              </div>
              <button
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "12px",
                  color: "#9ca3af",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                CLEAR
              </button>
            </div>

            <button
              style={{
                backgroundColor: "#1e293b",
                padding: "8px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                color: "#06b6d4",
                border: "none",
                marginRight: "4px",
              }}
            >
              +1.00
            </button>

            <button
              style={{
                backgroundColor: "#1e293b",
                padding: "8px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                color: "#06b6d4",
                border: "none",
                marginRight: "4px",
              }}
            >
              +5.00
            </button>

            <button
              style={{
                backgroundColor: "#06b6d4",
                padding: "8px",
                borderRadius: "4px",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
              }}
            >
              <Check size={20} color="white" />
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "15px",
            }}
          >
            <input
              type="checkbox"
              id="giftToPlayer"
              checked={giftToPlayer}
              onChange={() => setGiftToPlayer(!giftToPlayer)}
              style={{
                marginRight: "5px",
                width: "14px",
                height: "14px",
              }}
            />
            <label htmlFor="giftToPlayer" style={{ fontSize: "12px" }}>
              Gift to Player
            </label>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              id="addToPrizepool"
              checked={addToPrizepool}
              onChange={() => setAddToPrizepool(!addToPrizepool)}
              style={{
                marginRight: "5px",
                width: "14px",
                height: "14px",
              }}
            />
            <label htmlFor="addToPrizepool" style={{ fontSize: "12px" }}>
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
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#06b6d4",
              marginRight: "20px",
            }}
          >
            $5 shows up on stream
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "#9ca3af",
            }}
          >
            $50 fireworks
          </span>
        </div>
      </div>

      {/* Center Section - Betting */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "33%",
          borderLeft: "1px solid #334155",
          borderRight: "1px solid #334155",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <span>Will </span>
          <span style={{ color: "#06b6d4", margin: "0 4px" }}>James5423</span>
          <span>survive the full 5 minutes?</span>
          <div
            style={{
              backgroundColor: "#7f1d1d",
              color: "white",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "14px",
              marginLeft: "10px",
              border: "1px solid #b91c1c",
            }}
          >
            00:36
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginBottom: "10px",
            gap: "8px",
          }}
        >
          <button
            style={{
              backgroundColor: "#166534",
              padding: "6px 16px",
              borderRadius: "4px",
              fontSize: "14px",
              border: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            YES
            <span
              style={{
                backgroundColor: "#15803d",
                fontSize: "12px",
                padding: "1px 4px",
                borderRadius: "4px",
                marginLeft: "4px",
              }}
            >
              52%
            </span>
          </button>

          <button
            style={{
              backgroundColor: "#991b1b",
              padding: "6px 16px",
              borderRadius: "4px",
              fontSize: "14px",
              border: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            NO
            <span
              style={{
                backgroundColor: "#b91c1c",
                fontSize: "12px",
                padding: "1px 4px",
                borderRadius: "4px",
                marginLeft: "4px",
              }}
            >
              48%
            </span>
          </button>

          <div
            style={{
              position: "relative",
              marginRight: "4px",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#06b6d4",
              }}
            >
              <span style={{ fontSize: "16px" }}>$</span>
            </div>
            <input
              type="text"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "4px",
                padding: "8px 50px 8px 30px",
                width: "100px",
                fontSize: "14px",
                border: "none",
                color: "white",
              }}
            />
            <button
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                color: "#9ca3af",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              CLEAR
            </button>
          </div>

          <button
            style={{
              backgroundColor: "#1e293b",
              padding: "8px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#06b6d4",
              border: "none",
              marginRight: "4px",
            }}
          >
            +1.00
          </button>

          <button
            style={{
              backgroundColor: "#1e293b",
              padding: "8px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#06b6d4",
              border: "none",
              marginRight: "4px",
            }}
          >
            +5.00
          </button>

          <button
            style={{
              backgroundColor: "#06b6d4",
              padding: "8px 16px",
              borderRadius: "4px",
              fontSize: "14px",
              border: "none",
              color: "white",
            }}
          >
            PLACE BET
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            fontSize: "12px",
          }}
        >
          <div>
            <span style={{ color: "#9ca3af" }}>Total Bets:</span>
            <span style={{ color: "#06b6d4" }}> $3,560</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "inline-block",
                marginRight: "5px",
                transform: "rotate(45deg)",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "2px",
                  backgroundColor: "white",
                }}
              ></div>
            </div>
            <span style={{ color: "#9ca3af" }}>Potential Payout:</span>
            <span style={{ color: "#06b6d4" }}> $187</span>
          </div>

          <div>
            <span style={{ color: "#9ca3af" }}>Biggest Win this week:</span>
            <span style={{ color: "#06b6d4" }}> $2,370</span>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          width: "33%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontWeight: "bold",
            }}
          >
            <MessageSquare size={18} />
            <span>CHAT</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontWeight: "bold",
            }}
          >
            <Star size={18} />
            <span>INFLUENCE</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontWeight: "bold",
              color: "#06b6d4",
            }}
          >
            <Gamepad size={18} />
            <span>PLAY</span>
          </div>
        </div>

        <div
          style={{
            fontSize: "12px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          Join +2 million players from <span style={{ marginLeft: "4px" }}>🇮🇳</span>
        </div>

        <button
          style={{
            backgroundColor: "#06b6d4",
            color: "white",
            padding: "10px 20px",
            borderRadius: "4px",
            fontSize: "14px",
            border: "none",
            width: "200px",
            textAlign: "center",
          }}
        >
          Sign Up Now (It's Free)
        </button>

        <div
          style={{
            fontSize: "10px",
            color: "#9ca3af",
            marginTop: "5px",
            textAlign: "right",
          }}
        >
          342 Players Have Already Bet
        </div>
      </div>
    </div>
  )
}

