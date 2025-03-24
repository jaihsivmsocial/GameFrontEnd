"use client"
import { Card, Button, Row, Col, Table } from "react-bootstrap"

const ManageFundsSection = () => {
  return (
    <Card className="bg-dark text-white p-4 border-0">
      <h4>Manage Funds</h4>
      <p className="text-muted">Control your financial information</p>

      <Row className="mb-3">
        <Col md={8}>
          <Card className="bg-dark text-white border border-secondary p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Payment Methods</h6>
              <Button variant="outline-primary" size="sm">
                Add New
              </Button>
            </div>

            <Table variant="dark" responsive>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Credit Card</td>
                  <td>**** **** **** 4321</td>
                  <td>
                    <Button variant="link" size="sm" className="text-primary p-0 me-2">
                      Edit
                    </Button>
                    <Button variant="link" size="sm" className="text-danger p-0">
                      Remove
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={8}>
          <Card className="bg-dark text-white border border-secondary p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">Billing History</h6>
                <p className="mb-0 text-muted small">View your past transactions</p>
              </div>
              <Button variant="outline-primary" size="sm">
                View All
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  )
}

export default ManageFundsSection

