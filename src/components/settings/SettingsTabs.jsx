"use client"
import { Nav } from "react-bootstrap"

const SettingsTabs = ({ activeTab, onTabChange }) => {
  return (
    <Nav variant="tabs" className="mb-4 navTabs">
      <Nav.Item>
        <Nav.Link eventKey="profile" active={activeTab === "profile"} onClick={() => onTabChange("profile")}>
          Profile
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="tribez" active={activeTab === "tribez"} onClick={() => onTabChange("tribez")}>
          Tribez Prime
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="security" active={activeTab === "security"} onClick={() => onTabChange("security")}>
          Security
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link
          eventKey="notifications"
          active={activeTab === "notifications"}
          onClick={() => onTabChange("notifications")}
        >
          Notifications
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="funds" active={activeTab === "funds"} onClick={() => onTabChange("funds")}>
          Manage Funds
        </Nav.Link>
      </Nav.Item>
    </Nav>
  )
}

export default SettingsTabs

