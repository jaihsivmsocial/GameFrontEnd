"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Button, Badge } from "react-bootstrap"
import HeaderOne from "@/components/HeaderOne"
import "bootstrap/dist/css/bootstrap.min.css"


export default function SubscriptionPage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [recentSubscribers, setRecentSubscribers] = useState([
    { name: "Parizval", time: "just" },
    { name: "Sarah", time: "just" },
  ])
  const [currentSubscriber, setCurrentSubscriber] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubscriber((prev) => (prev + 1) % recentSubscribers.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [recentSubscribers.length])
  return (
    <div
      className="text-center text-white"
      style={{
        background: "linear-gradient(180deg, #0b0f19 0%, #0a1a2e 100%)",
        minHeight: "100vh",
        padding: "30px 0",
        width:"100%",
      }}
    >
      <Container>
        <h1 className="fw-bold mb-3 display-4">
          Subscriber <span className="text-info">Exclusive</span>
        </h1>
        <p className="text-secondary mb-5 mx-auto" style={{ maxWidth: "800px", fontSize: "0.9rem", lineHeight: "1.5" }}>
          Take your gaming experience to the next level! With our PRO plan, you unlock exclusive skins, faster
          evolution, and access to restricted areas that only premium players can explore. Don't settle for
          limitations—upgrade now and dominate the game like never before!
        </p>
        {/* Toggle Buttons */}
        <div className="position-relative d-inline-block mb-5">
          <div
            className="btn-group"
            style={{
              borderRadius: "30px",
              overflow: "hidden",
              border: "1px solid #1e3a5a",
              maxWidth: "300px",
              width: "100%",
            }}
          >
            <Button
              variant={!isAnnual ? "dark" : "dark"}
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 w-50 ${!isAnnual ? "text-white" : "text-secondary"}`}
              style={{
                background: !isAnnual ? "transparent" : "transparent",
                border: "none",
                borderRadius: "30px 0 0 30px",
              }}
            >
              MONTHLY
            </Button>
            <Button
              variant={isAnnual ? "warning" : "dark"}
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 w-50 ${isAnnual ? "text-white" : "text-secondary"}`}
              style={{
                background: isAnnual ? "#e67e22" : "transparent",
                border: "none",
                borderRadius: "0 30px 30px 0",
              }}
            >
              ANNUAL
            </Button>
          </div>
        </div>

        <Row className="justify-content-center g-4 mb-4">
          {/* Free Plan */}
          <Col md={5} lg={4}>
            <div
              className="card bg-dark text-light p-4 h-100 position-relative"
              style={{
                borderRadius: "15px",
                border: "1px solid #1e3a5a",
                background: "linear-gradient(180deg, #0b1526 0%, #0a1a2e 100%)",
              }}
            >
              <div className="position-absolute top-0 start-0 p-3">
                <div
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                  style={{ width: "40px", height: "40px" }}
                >
                  <i className="bi bi-check text-white"></i>
                </div>
              </div>
              <div className="mt-4 mb-3">
                <span className="badge bg-secondary px-3 py-2 rounded-pill">BASIC</span>
              </div>
              <h2 className="display-5 fw-bold mb-4">Free</h2>
              <ul className="list-unstyled text-start mb-4">
                <li className="mb-3 d-flex align-items-center">
                  <div
                    className="rounded-circle border border-secondary me-2 d-flex align-items-center justify-content-center"
                    style={{ width: "20px", height: "20px", minWidth: "20px" }}
                  >
                    <i className="bi bi-check text-secondary" style={{ fontSize: "0.8rem" }}></i>
                  </div>
                  <span>LIMITED SKINS</span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <div
                    className="rounded-circle border border-secondary me-2 d-flex align-items-center justify-content-center"
                    style={{ width: "20px", height: "20px", minWidth: "20px" }}
                  >
                    <i className="bi bi-check text-secondary" style={{ fontSize: "0.8rem" }}></i>
                  </div>
                  <span>RESTRICTED ACCESS</span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <div
                    className="rounded-circle border border-secondary me-2 d-flex align-items-center justify-content-center"
                    style={{ width: "20px", height: "20px", minWidth: "20px" }}
                  >
                    <i className="bi bi-check text-secondary" style={{ fontSize: "0.8rem" }}></i>
                  </div>
                  <span>BASIC SKIN EVOLUTION</span>
                </li>
              </ul>
              <div className="mt-auto">
                <Button
                  variant="outline-light"
                  className="w-100 py-2"
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #2a3a4a",
                    backgroundColor: "transparent",
                  }}
                >
                  You're Missing Out
                </Button>
              </div>
            </div>
          </Col>

          {/* Pro Plan */}
          <Col md={5} lg={4}>
            <div
              className="card bg-dark text-light p-4 h-100 position-relative"
              style={{
                borderRadius: "15px",
                border: "1px solid #1e3a5a",
                boxShadow: "0 0 20px rgba(0, 168, 255, 0.1)",
                background: "linear-gradient(180deg, #0b1526 0%, #0a1a2e 100%)",
              }}
            >
              <div className="position-absolute top-0 end-0 p-3">
                <div
                  className="rounded-circle bg-info d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 8L12 14L22 8L12 2Z" fill="white" />
                    <path d="M2 8V16L12 22L22 16V8L12 14L2 8Z" fill="white" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 mb-3">
                <span className="badge bg-primary px-3 py-2 rounded-pill">PRO</span>
              </div>
              <h2 className="display-5 fw-bold text-info mb-2">{isAnnual ? "$49.99" : "$4.99"}</h2>
              <p className="text-secondary mb-4">{isAnnual ? "/ YEAR" : "/ MONTH"}</p>
              <ul className="list-unstyled text-start mb-4">
                <li className="mb-3 d-flex align-items-center">
                  <div
                    className="rounded-circle bg-info me-2 d-flex align-items-center justify-content-center"
                    style={{ width: "20px", height: "20px", minWidth: "20px" }}
                  >
                    <i className="bi bi-check text-dark" style={{ fontSize: "0.8rem" }}></i>
                  </div>
                  <span>EXTRA SKINS</span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <div
                    className="rounded-circle bg-info me-2 d-flex align-items-center justify-content-center"
                    style={{ width: "20px", height: "20px", minWidth: "20px" }}
                  >
                    <i className="bi bi-check text-dark" style={{ fontSize: "0.8rem" }}></i>
                  </div>
                  <span>SKINS EVOLVE MORE</span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <div
                    className="rounded-circle bg-info me-2 d-flex align-items-center justify-content-center"
                    style={{ width: "20px", height: "20px", minWidth: "20px" }}
                  >
                    <i className="bi bi-check text-dark" style={{ fontSize: "0.8rem" }}></i>
                  </div>
                  <span>ACCESS TO RESTRICTED AREAS IN THE WORLD</span>
                </li>
                <li className="mb-3 text-secondary d-flex align-items-center">
                  <span className="ms-4">& many more...</span>
                </li>
              </ul>
              <div className="mt-auto">
                <Button
                  variant="info"
                  className="w-100 py-2 text-white fw-bold"
                  style={{
                    borderRadius: "5px",
                    backgroundColor: "#00a8ff",
                    border: "none",
                  }}
                >
                  Upgrade Now & Save 16%
                </Button>
              </div>
              <div className="position-absolute bottom-0 start-50 translate-middle">
                <Badge
                  bg="light"
                  className="text-dark px-3 py-2 d-flex align-items-center"
                  style={{
                    transform: "translateY(50%)",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                  }}
                >
                  <span className="me-1">✓</span> RECOMMENDED
                </Badge>
              </div>
            </div>
          </Col>
        </Row>

        {isAnnual && (
          <div className="mb-4">
            <div className="bg-info bg-opacity-10 d-inline-block px-4 py-2 rounded-3">
              <span className="text-info fw-bold">762.2 × $18.98</span>
            </div>
          </div>
        )}

        <p className="mt-4 text-secondary">
          <strong className="text-white">{recentSubscribers[currentSubscriber].name}</strong>{" "}
          {recentSubscribers[currentSubscriber].time} subscribed and unlocked his{" "}
          <span className="text-info">first Legendary Skin!</span>
        </p>
      </Container>
    </div>
  )
}

