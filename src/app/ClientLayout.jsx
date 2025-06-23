"use client"

import "./font.css"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/thumbs"
import "aos/dist/aos.css"
import "./globals.scss"
import BootstrapInit from "@/helper/BootstrapInit"
import RouteScrollToTop from "@/helper/RouteScrollToTop"
import LoadPhosphorIcons from "@/helper/LoadPhosphorIcons"
import styles from "../custonCss/home.module.css"
import { useState } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"

import CustomCursor from "@/helper/CustomCursor"
import BackToTop from "@/helper/BackToTop"
import HeaderOne from "@/components/HeaderOne"

export default function ClientLayout({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(true)

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const pathname = usePathname()
  const showHeader = pathname !== "/chat"

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <BootstrapInit />
        <CustomCursor />
        <BackToTop />
        <LoadPhosphorIcons />
        <RouteScrollToTop />

        <div className={styles.container}>
          {showHeader && <HeaderOne />}
          <div className={styles.contentWrapper}>
            {children}
            <button
              className={`${styles.chatToggleBtn} ${!isChatOpen ? styles.chatToggleBtnClosed : ""}`}
              onClick={toggleChat}
            >
              <Image
                src="/assets/img/iconImage/arrow.png?height=16&width=16"
                width={16}
                height={16}
                alt="Chat"
                className={styles.icon}
              />
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
