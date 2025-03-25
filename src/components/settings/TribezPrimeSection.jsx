"use client"
import { Card, Button, Row, Col, Badge } from "react-bootstrap"

const TribezPrimeSection = () => {
  return (
    <Card className="bg-dark text-white p-4 border-0">
      <h4>Tribez Prime</h4>
      <p className="text-muted">Manage your subscription</p>

      <Row className="mb-3">
        <Col md={8}>
          <Card className="bg-dark text-white border border-secondary p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">
                  Current Plan <Badge bg="success">Active</Badge>
                </h6>
                <p className="mb-0 text-muted small">Tribez Prime Monthly</p>
              </div>
              <Button variant="outline-primary" size="sm">
                Manage Plan
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
                <h6 className="mb-1">Billing Information</h6>
                <p className="mb-0 text-muted small">Update your payment method</p>
              </div>
              <Button variant="outline-primary" size="sm">
                Update
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  )
}

export default TribezPrimeSection

