"use client"

import { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import HeaderOne from "@/components/HeaderOne"
import SettingsTabs from "@/components/settings/SettingsTabs"
import SecuritySection from "@/components/settings/SecuritySection"
import NotificationsSection from "@/components/settings/NotificationsSection"
import ManageFundsSection from "@/components/settings/ManageFundsSection"
import ProfileSection from "@/components/settings/ProfileSection"
import TribezPrimeSection from "@/components/settings/TribezPrimeSection"
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("security")
  const router = useRouter();
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
          router.push('/managefund'); 
          return null; 
      default:
        return <SecuritySection />
    }
  }

  return (
    <div className="vh-100 vw-100 d-flex flex-column text-white" style={{ backgroundColor: "#071328" }}>
      <div className="flex-grow-1 p-5 settings-container">
        <h2 className="text-white mb-4">Settings</h2>
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {renderActiveSection()}
      </div>
    </div>
  )
}

