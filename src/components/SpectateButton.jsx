"use client"

import { useState } from "react"
import Link from "next/link"

const SpectateButton = () => {
  const [hover, setHover] = useState(false)

  return (
    <Link href="/" passHref>
      <div
        className="btn text-white d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "#000",
          border: `0.5px solid #FFFFFF`, // Updated to match design
          width: "143px", // Matches design
          height: "37px", // Matches design
          fontWeight: "bold",
          letterSpacing: "1px",
          boxShadow: hover ? "0 0 10px rgba(13, 202, 240, 0.8)" : "0 0 5px rgba(13, 202, 240, 0.5)",
          transition: "all 0.3s ease-out", // Matches the "Ease out" curve with 300ms duration
          padding: "0",
          overflow: "hidden",
          gap: "8px",
          borderRadius: "8px", // Matches design
          position: "relative",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <img
          src="/assets/img/iconImage/eye 1.png"
          alt="eye icon"
          width="20"
          height="20"
          style={{ marginRight: "4px" }}
        />
        SPECTATE
      </div>
    </Link>
  )
}

export default SpectateButton

