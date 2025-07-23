"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useNavigation } from "./context/NavigationContext"

const PlayButton = () => {
  const [hover, setHover] = useState(false)
  const { activeButton, setActiveButton } = useNavigation()
  const isActive = activeButton === "play"
  const [isMobileView, setIsMobileView] = useState(false)

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Base gradient for the button
  const baseGradient = "linear-gradient(90deg, #00a0e9 0%, #0073d5 50%, #0046c0 100%)"

  const handleClick = () => {
    setActiveButton("play")
  }
  if (isMobileView) return null // <- 👈 Add this
  return (
    <Link
      href="/play"
      className="btn text-white d-flex align-items-center justify-content-center"
      style={{
        background: isActive ? baseGradient : "linear-gradient(to right, #ff5500, #ff7b00,  #fe5e00)",
        border: `0.5px solid ${isActive ? "#0046c0" : "#FFFFFF"}`,
        width: isMobileView ? "115px" : "143px", // Different width based on device
        height: isMobileView ? "30px" : "37px", // Different height based on device
        fontWeight: "bold",
        font: "Poppins",
        letterSpacing: "1px",
        boxShadow: hover ? "0 0 10px rgba(0, 160, 233, 0.5)" : "0 0 5px rgba(0, 70, 192, 0.4)",
        padding: "0",
        fontSize: isMobileView ? "12px" : "14px", // Adjust font size for better proportions
        overflow: "hidden",
        gap: "8px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: isMobileView ? "0" : "13px", // Remove negative margin on mobile
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
    >
      <img
        src={isActive ? "/assets/img/iconImage/gaming 1.png" : "/assets/img/iconImage/gaming 1.png"}
        alt="gaming icon"
        width={isMobileView ? "18" : "20"} // Slightly smaller icon for mobile
        height={isMobileView ? "18" : "20"}
        style={{ marginRight: "4px" }}
      />
      PLAY
    </Link>
  )
}

export default PlayButton
