"use client"

import { useState } from "react"
import { Card, Form } from "react-bootstrap"

const NotificationsSection = () => {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)

  return (
    <Card className="bg-dark text-white p-4 border-0">
      <h4>Notifications</h4>
      <p className="text-muted">Manage how we contact you</p>

      <Card className="bg-dark text-white border border-secondary p-3 mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-1">Email Notifications</h6>
            <p className="mb-0 text-muted small">Receive updates and alerts via email</p>
          </div>
          <Form.Check
            type="switch"
            id="email-notifications-switch"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
            className="custom-switch"
          />
        </div>
      </Card>

      <Card className="bg-dark text-white border border-secondary p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-1">Push Notifications</h6>
            <p className="mb-0 text-muted small">Receive notifications on your device</p>
          </div>
          <Form.Check
            type="switch"
            id="push-notifications-switch"
            checked={pushNotifications}
            onChange={() => setPushNotifications(!pushNotifications)}
            className="custom-switch"
          />
        </div>
      </Card>
    </Card>
  )
}

export default NotificationsSection

