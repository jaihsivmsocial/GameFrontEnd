"use client"

import { useState } from "react"
import { Card, Button, Form, Row, Col } from "react-bootstrap"

const ContactSection = () => {
  const [enableAccountCreation, setEnableAccountCreation] = useState(true)

  return (
    <Card className="bg-dark text-white mb-4 p-4 border-0">
      <h4>Contact</h4>
      <p className="text-muted">Where we send important messages about your account</p>

      <Row className="mb-3">
        <Col md={8}>
          <Card className="bg-dark text-white border border-secondary p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">Email Address</h6>
                <p className="mb-0 text-muted small">This email will be linked to your account.</p>
              </div>
              <Button variant="primary" size="sm">
                Change Email Address
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={8}>
          <Card className="bg-dark text-white border border-secondary p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">Enable additional account creation</h6>
                <p className="mb-0 text-muted small">You must have a verified email address to modify this setting.</p>
              </div>
              <Form.Check
                type="switch"
                id="account-creation-switch"
                checked={enableAccountCreation}
                onChange={() => setEnableAccountCreation(!enableAccountCreation)}
                className="custom-switch"
              />
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  )
}

export default ContactSection

