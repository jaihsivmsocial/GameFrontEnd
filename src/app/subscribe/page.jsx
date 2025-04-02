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
    <h1>under Development</h1>
    </div>
  )
}

