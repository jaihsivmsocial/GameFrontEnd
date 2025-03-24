"use client"

import { useState } from "react"
import { Card, Button, Form } from "react-bootstrap"
import ContactSection from "./ContactSection"

const SecuritySection = () => {
  const [twoFactorAuth, setTwoFactorAuth] = useState(true)

  return (
    <>
      <ContactSection />

      <Card className="bg-dark text-white p-4 border-0">
        <h4>Security</h4>
        <p className="text-muted">Keep your account safe and sound</p>

        <Card className="bg-dark text-white border border-secondary p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">Password</h6>
              <p className="mb-0 text-muted small">Improve your security with a strong password.</p>
            </div>
            <Button variant="primary" size="sm">
              Change Password
            </Button>
          </div>
        </Card>

        <Card className="bg-dark text-white border border-secondary p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">Turn on Two-factor Authentication</h6>
              <p className="mb-0 text-muted small">This will add another security level to your account.</p>
            </div>
            <Form.Check
              type="switch"
              id="two-factor-switch"
              checked={twoFactorAuth}
              onChange={() => setTwoFactorAuth(!twoFactorAuth)}
              className="custom-switch"
            />
          </div>
        </Card>
      </Card>
    </>
  )
}

export default SecuritySection

