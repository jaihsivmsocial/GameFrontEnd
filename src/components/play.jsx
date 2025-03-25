"use client"

import { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"

export const PlayButton = () => {
  const [hover, setHover] = useState(false)

  return (
    <button
      type="button"
      className="btn text-white d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "#000",
        border: `0.5px solid #FFFFFF`, // Updated border to match design
        width: "143px", // Updated to match design
        height: "37px", // Updated to match design
        fontWeight: "bold",
        letterSpacing: "1px",
        boxShadow: hover ? "0 0 10px rgba(13, 202, 240, 0.8)" : "0 0 5px rgba(13, 202, 240, 0.5)",
        transition: "box-shadow 0.3s ease",
        padding: "0",
        overflow: "hidden",
        gap: "8px",
        borderRadius: "8px", // Updated to match design
        position: "relative",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img src="/assets/img/iconImage/gaming 1.png" alt="gaming icon" width="20" height="20" />
      PLAY
    </button>
  )
}

export default PlayButton

