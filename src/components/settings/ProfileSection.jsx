"use client"
import { Card, Form, Button, Row, Col } from "react-bootstrap"

const ProfileSection = () => {
  return (
    <Card className="bg-dark text-white p-4 border-0">
      <h4>Profile</h4>
      <p className="text-muted">Manage your personal information</p>

      <Row className="mb-3">
        <Col md={8}>
          <Card className="bg-dark text-white border border-secondary p-3">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Display Name</Form.Label>
                <Form.Control type="text" placeholder="Your display name" className="bg-dark text-white" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Tell us about yourself"
                  className="bg-dark text-white"
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Card>
  )
}

export default ProfileSection

