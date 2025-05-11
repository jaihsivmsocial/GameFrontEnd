"use client"
import { useState } from "react"
import Link from "next/link"
import { useNavigation } from "../context/NavigationContext"
const Shop = () => {
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
      href="/Shop"
      className="btn text-white d-flex align-items-center justify-content-center"
      style={{
        background: isActive ? baseGradient : "#071019",
        border: `0.5px solid ${isActive ? "#0046c0" : "#FFFFFF"}`,
        width: isActive ? "143px" : "143px",
        height: "37px",
        fontWeight: "bold",
        font: "Poppins",
        letterSpacing: "1px",
        boxShadow
          : hover
            ? "0 0 5px rgba(0, 160, 233, 0.5)"
            : "0 0 5px rgba(0, 70, 192, 0.4)",
        padding: "0",
        overflow: "hidden",
        gap: "8px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "45px" 
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

export default Shop
