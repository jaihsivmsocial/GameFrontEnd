"use client"

import { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import SettingsTabs from "@/components/settings/SettingsTabs"
import SecuritySection from "@/components/settings/SecuritySection"
import NotificationsSection from "@/components/settings/NotificationsSection"
import ProfileSection from "@/components/settings/ProfileSection"
import TribezPrimeSection from "@/components/settings/TribezPrimeSection"
import { useRouter } from "next/navigation"
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("security")
  const router = useRouter()

  const handleLogout = () => {
    // Add your logout logic here
    // For example:
    // 1. Clear local storage/cookies
    localStorage.removeItem("token")
    // 2. Redirect to login page
    router.push("/AuthHeaderButtons")
  }

  const renderActiveSection = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection />
      case "tribez":
        return <TribezPrimeSection />
      case "security":
        return <SecuritySection />
      case "notifications":
        return <NotificationsSection />
      case "funds":
        router.push("/managefund")
        return null
      default:
        return <SecuritySection />
    }
  }

  return (
    <div className="vh-100 vw-100 d-flex flex-column text-white" style={{ backgroundColor: "#071328" }}>
      <div className="flex-grow-1 p-5 settings-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-white mb-0">Settings</h2>
          <button
            onClick={handleLogout}
            className="d-block text-start px-4 py-2 text-white bg-transparent border-0"
            style={{
              transition: "background-color 0.2s, transform 0.2s",
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
              e.currentTarget.style.transform = "translateX(-3px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.transform = "translateX(0)"
            }}
          >
            SIGNOUT
          </button>
        </div>
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {renderActiveSection()}
      </div>
    </div>
  )
}
