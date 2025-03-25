"use client"

import { useState } from "react"
import Link from "next/link"
import "bootstrap/dist/css/bootstrap.min.css"

export const Shope = () => {
  const [hover, setHover] = useState(false)

  return (
    <Link href="/shop" passHref>
      <button
        type="button"
        className="btn text-white d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "#000",
          border: `0.5px solid #FFFFFF`, // Updated to match design
          width: "142px", // Updated to match design
          height: "37px", // Updated to match design
          fontWeight: "bold",
          letterSpacing: "1px",
          boxShadow: hover ? "0 0 10px rgba(13, 202, 240, 0.8)" : "0 0 5px rgba(13, 202, 240, 0.5)",
          transition: "all 0.3s cubic-bezier(0.5, 0, 0.5, 1)", // Spring-like transition
          padding: "0",
          overflow: "hidden",
          gap: "8px",
          borderRadius: "8px", // Updated to match design
          position: "relative",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <img src="/assets/img/iconImage/shopping-bag 1.png" alt="shopping bag icon" width="20" height="20" />
        SHOP
      </button>
    </Link>
  )
}

export default Shope

