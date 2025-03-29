"use client"
import { useState } from "react"
import Link from "next/link"
import { useNavigation } from "../context/NavigationContext"
const Shope = () => {
  const [hover, setHover] = useState(false)
  const { activeButton, setActiveButton } = useNavigation()
  const isActive = activeButton === "shop"

  // Base gradient for the button
 const baseGradient = "linear-gradient(90deg, #00a0e9 0%, #0073d5 50%, #0046c0 100%)"

  const handleClick = () => {
    setActiveButton("shop")
  }

  return (
    <Link
      href="/shop"
      className="btn text-white d-flex align-items-center justify-content-center"
      style={{
        background: isActive ? baseGradient : "#071019",
        border: `0.5px solid ${isActive ? "#0046c0" : "#FFFFFF"}`,
        width: isActive ? "180px" : "143px",
        height: "37px",
        fontWeight: "bold",
        letterSpacing: "1px",
        boxShadow: isActive
          ? "0 0 15px rgba(0, 160, 233, 0.6)"
          : hover
            ? "0 0 10px rgba(0, 160, 233, 0.5)"
            : "0 0 5px rgba(0, 70, 192, 0.4)",
        padding: "0",
        overflow: "hidden",
        gap: "8px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
    >
      <img
        src={isActive ? "/assets/img/iconImage/shopping-bag 1.png" : "/assets/img/iconImage/shopping-bag 1.png"}
        alt="shopping bag icon"
        width="20"
        height="20"
        style={{ marginRight: "4px" }}
      />
      SHOP
    </Link>
  )
}

export default Shope
