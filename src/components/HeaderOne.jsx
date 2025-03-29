"use client"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import SpectateButton from "./SpectateButton"
import { Login } from "./Login"
import { Signup } from "./Signup"
import Shope from "./cloths/Shope"
import PlayButton from "./play"
import SucribeButton from "./SubcribeButton"
import AuthHeaderButtons from "./SignupLogin"
import { NavigationProvider } from "./context/NavigationContext"

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
          className={`navbar main navbar-area navbar-area-1 navbar-border navbar-expand-lg ${
            scroll ? "sticky-active" : ""
          }`}
          style={{  background: "linear-gradient(to right, #07090ef,#070f17)" }}
        >
          <div className="container nav-container px-lg-0">
            <div className="logo">
              <div className="d-flex items-center gap-5">
                <Link href="/">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img src="assets/fonts/logo.png" alt="img" />
                    <span
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1.5rem",
                        marginLeft: "8px",
                         width: "60px",
                         height:"50px"
                      }}
                    >
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Navigation Buttons with fixed spacing */}
            <div className="d-flex align-items-center" style={{ gap: "20px" }}>
              <div style={{ marginRight: "0px" }}>
                <SucribeButton />
              </div>
              <div style={{ marginRight: "0px" }}>
                <SpectateButton />
              </div>
              <div style={{ marginRight: "0px" }}>
                <PlayButton />
              </div>
              <div style={{ marginRight: "0px" }}>
                <Shope />
              </div>
              <AuthHeaderButtons />
            </div>
          </div>
        </nav>
      )}

      {/* Mobile/Tablet Navigation */}
      {(isMobileView || isTabletView) && (
        <nav
          className={`navbar mobile navbar-area navbar-area-1 navbar-border navbar-expand-lg ${
            scroll ? "sticky-active" : ""
          }`}
        >
          <div className="container nav-container px-lg-0">
            {/* Mobile Menu Toggle Button */}
            <div className="responsive-mobile-menu">
              <button
                className={`menu toggle-btn d-block ${isMobileMenuOpen ? "open" : ""}`}
                onClick={handleMobileMenuToggle}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation"
              >
                <span className="icon-left"></span>
                <span className="icon-right"></span>
              </button>
            </div>

            {/* Logo */}
            <div className="logo">
              <Link href="/">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img src="assets/fonts/logo.png" alt="img" />
                  <span
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      marginLeft: "5px",
                    }}
                  >

                  </span>
                </div>
              </Link>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`collapse navbar-collapse ${isMobileMenuOpen ? "sopen" : ""}`} id="xdyat_main_menu">
              <ul className="navbar-nav menu-open ps-lg-5 pe-xl-4 text-end">
                <li className="mb-3">
                  <SucribeButton />
                </li>
                <li className="mb-3">
                  <SpectateButton />
                </li>
                <li className="mb-3">
                  <PlayButton />
                </li>
                <li className="mb-3">
                  <Shope />
                </li>
                <li className="mb-3">
                  <Login />
                </li>
                <li className="mb-3">
                  <Signup />
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}
    </NavigationProvider>
  )
}

export default HeaderOne

