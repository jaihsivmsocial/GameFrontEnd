"use client"

import { useState } from "react"

const GameHeader = () => {
  const [timeLeft, setTimeLeft] = useState("05:12")

  return (
    <div
      style={{
        background: "#0a0f1a",
        color: "white",
        padding: "0",
        display: "flex",
        alignItems: "center",
        height: "60px",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Settings Icon */}
      <div style={{ display: "flex", alignItems: "center", marginLeft: "15px" }}>
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
      </div>

      {/* Character 1: MoJo */}
      <div style={{ display: "flex", alignItems: "center", marginLeft: "30px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #333",
            marginRight: "10px",
            backgroundColor: "#222",
          }}
        >
          <img
            src="/placeholder.svg?height=48&width=48"
            alt="Character Avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                color: "#00e5ff",
                fontSize: "18px",
                fontWeight: "bold",
                lineHeight: "1",
                marginBottom: "1px",
              }}
            >
              MoJo
            </div>
            {/* Currency Button - Positioned beside the name */}
            <div
              style={{
                backgroundColor: "#00e5ff",
                color: "black",
                borderRadius: "4px",
                padding: "1px 6px",
                marginLeft: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                height: "20px",
              }}
            >
              <span style={{ marginRight: "2px", fontSize: "14px" }}>$</span>
              300 <span style={{ marginLeft: "2px", fontSize: "14px" }}>+</span>
            </div>
          </div>
          <div style={{ color: "#999", fontSize: "12px", lineHeight: "1", marginBottom: "3px" }}>LEVEL 64</div>
          <div style={{ width: "120px" }}>
            <div
              style={{
                height: "4px",
                width: "100%",
                backgroundColor: "#222",
                borderRadius: "2px",
                marginBottom: "2px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "62%", // 8,450/13,500 ≈ 62%
                  backgroundColor: "#00e5ff",
                  borderRadius: "2px",
                }}
              ></div>
            </div>
            <div style={{ color: "#666", fontSize: "10px", lineHeight: "1" }}>8,450/13,500 XP</div>
          </div>
        </div>
      </div>

      {/* Character 2: POM */}
      <div style={{ display: "flex", alignItems: "center", marginLeft: "30px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #333",
            marginRight: "10px",
            backgroundColor: "#222",
          }}
        >
          <img
            src="/placeholder.svg?height=48&width=48"
            alt="POM Avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div>
          <div style={{ color: "#00e5ff", fontSize: "18px", fontWeight: "bold", lineHeight: "1", marginBottom: "1px" }}>
            POM
          </div>
          <div style={{ color: "#999", fontSize: "12px", lineHeight: "1", marginBottom: "3px" }}>COMPANION</div>
          <div style={{ width: "120px" }}>
            <div
              style={{
                height: "4px",
                width: "100%",
                backgroundColor: "#222",
                borderRadius: "2px",
                marginBottom: "2px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: "#ff3333",
                  borderRadius: "2px",
                }}
              ></div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div
                style={{
                  color: "white",
                  fontSize: "12px",
                  backgroundColor: "#ff3333",
                  padding: "1px 6px",
                  borderRadius: "2px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  height: "20px",
                }}
              >
                <span style={{ marginRight: "4px" }}>❤️</span>
                100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Reward Timer - Positioned at the far right */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          marginLeft: "auto",
          marginRight: "15px",
        }}
      >
        <div style={{ color: "#999", fontSize: "11px", marginBottom: "2px", textAlign: "right" }}>Next Reward in</div>
        <div style={{ color: "#ffcc00", fontSize: "22px", fontWeight: "bold", lineHeight: "1" }}>{timeLeft}</div>
      </div>
    </div>
  )
}

export default GameHeader
