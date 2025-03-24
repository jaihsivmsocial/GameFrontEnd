"use client"

import { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "./styles.css"

import BootstrapClient from "@/components/funds/bootstrap-client"
import DepositFunds from "@/components/funds/deposit-funds."
import WithdrawFunds from "@/components/funds/withdraw-funds"
import TransactionHistory from "@/components/funds/transaction-history"

export default function ManageFundsPage() {
  const [activeTab, setActiveTab] = useState("deposit")

  return (
    <div className="banking-app w-100">
      <BootstrapClient />
      <div className="container py-4">
        <h1 className="display-5 fw-bold mb-4">Manage Funds</h1>

        <div className="tabs-container mb-4">
          <button
            className={`tab-button ${activeTab === "deposit" ? "active" : ""}`}
            onClick={() => setActiveTab("deposit")}
          >
            Deposit Funds
          </button>
          <button
            className={`tab-button ${activeTab === "withdraw" ? "active" : ""}`}
            onClick={() => setActiveTab("withdraw")}
          >
            Withdraw Funds
          </button>
          <button
            className={`tab-button ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            Transaction History
          </button>
        </div>

        {activeTab === "deposit" && <DepositFunds />}
        {activeTab === "withdraw" && <WithdrawFunds />}
        {activeTab === "history" && <TransactionHistory />}
      </div>
    </div>
  )
}

