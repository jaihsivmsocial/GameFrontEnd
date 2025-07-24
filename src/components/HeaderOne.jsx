"use client"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import SpectateButton from "./SpectateButton"
import Shop from "./cloths/Shop"
import PlayButton from "./play"
import Clip from "./Clip"
import AuthHeaderButtons from "../components/register/SignupLogin"
import { NavigationProvider } from "./context/NavigationContext"
import styles from "../viewscreen/screen.module.css"
import "../viewscreen/header-style.css" // Import the mobile-specific CSS

const HeaderOne = () => {
  const [scroll, setScroll] = useState(false)
  const location = usePathname()
  const [isMobileView, setIsMobileView] = useState(false)
  const [isTabletView, setIsTabletView] = useState(false)

  // Handle scroll behavior
  useEffect(() => {
    window.onscroll = () => {
      if (window.pageYOffset < 150) {
        setScroll(false)
      } else if (window.pageYOffset > 150) {
        setScroll(true)
      }
      return () => (window.onscroll = null)
    }
  }, [])

  // Handle responsive views
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
      setIsTabletView(window.innerWidth >= 768 && window.innerWidth < 1024)
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

  const bodyOverlayRef = useRef(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Toggle mobile menu
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <NavigationProvider>
      {/* Body overlay for mobile menu */}
      <div className="body-overlay" id="body-overlay" ref={bodyOverlayRef} />

      {/* Desktop Navigation */}
      {!isMobileView && (
        <nav
          className={`navbar main navbar-area navbar-area-1 navbar-border navbar-expand-lg ${scroll ? "sticky-active" : ""}`}
          style={{ background: "linear-gradient(to right, #07090ef,#070f17)" }}
        >
          <div className="container nav-container">
            <div className="logo">
              <div className="d-flex items-center">
                <Link href="/" style={{ marginLeft: "-105px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img src="/assets/img/logo/headlogo.png" alt="img" />
                    <span
                      style={{
                        color: "white",
                        fontWeight: "Rajdhani",
                        font: "bold",
                        fontSize: "27.58px",
                        marginLeft: "8px",
                        width: "103px",
                        height: "46px",
                        lineHeight: "85%",
                        letterSpacing: "-4%",
                        stroke: "FFFFFF",
                      }}
                    ></span>
                  </div>
                </Link>
              </div>
            </div>
            <div className={styles.liveIcon} style={{ marginLeft: "-100px" }}>
              <img
                src="/assets/img/bg/live.png"
                width={16}
                height={16}
                alt="Live"
                className={styles.icon || ""}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=16&width=16"
                  console.log("Failed to load image: /assets/img/live.png")
                }}
              />
              LIVE
            </div>
            {/* Navigation Buttons with fixed positioning */}
            <div className="d-flex align-items-center" style={{ gap: "20px" }}>
              <div style={{ width: "180px", height: "37px" }}>
                <Shop />
              </div>

              <div style={{ width: "180px", height: "37px" }}>
                <SpectateButton />
              </div>
              <div style={{ width: "180px", height: "37px" }}>
                <PlayButton />
              </div>
              <div style={{ width: "180px", height: "37px" }}>
                <Clip />
              </div>
              <div style={{ minWidth: "180px" }}>
                <AuthHeaderButtons />
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Navigation */}
      {isMobileView && (
        <div
          className="mobile-header"
          style={{
            // background: "linear-gradient(to right, #090909, #081e2e)",

            // padding: "15px 0",
            // borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Title and Auth Buttons */}
          <div
            style={{
              // padding: "0 15px 15px",
              // borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              // marginBottom: "15px",
              display: "flex",
              justifyContent: "space-between", // Added to distribute content
              alignItems: "center", // Added to center vertically
            }}
          >
            {/* Title */}
            {/* <div
              style={{
                color: "#06b6d4",
                fontSize: "22px",
                fontWeight: "bold",
                textAlign: "left", // Changed from center to left
                marginBottom: "0", // Removed bottom margin
                fontFamily: "'Rajdhani', sans-serif",
                textShadow: "0 0 10px rgba(6, 182, 212, 0.5)",
                lineHeight: "1",
              }}
            >
              5 Minutes
              <br />
              Of Fame
            </div> */}

            {/* Login/Signup Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end", // Changed to flex-end
                gap: "10px",
                padding: "0",
              }}
            >
              <AuthHeaderButtons />
            </div>
          </div>

          {/* Spectate and Play Buttons - MODIFIED FOR HORIZONTAL LAYOUT */}
          <div
            style={{
              padding: "0 15px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center", // Changed to center
              gap: "20px",
            }}
          >
            <div style={{ position: "relative",  maxWidth: "45%" }}>
              <SpectateButton />
            </div>
            <div style={{ position: "relative",  maxWidth: "45%" }}>
              <PlayButton />
            </div>
          </div>
        </div>
      )}
    </NavigationProvider>
  )
}

export default HeaderOne
