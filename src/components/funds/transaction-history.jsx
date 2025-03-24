"use client"

import { useState } from "react"

export default function TransactionHistory() {
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock transaction data
  const transactions = [
    { id: 1, type: "deposit", amount: 1000, method: "Credit Card", date: "2025-03-10", status: "completed" },
    { id: 2, type: "withdraw", amount: 500, method: "Bank Transfer", date: "2025-03-08", status: "completed" },
    { id: 3, type: "deposit", amount: 2000, method: "Credit Card", date: "2025-03-05", status: "completed" },
    { id: 4, type: "withdraw", amount: 300, method: "PayPal", date: "2025-03-01", status: "completed" },
    { id: 5, type: "deposit", amount: 5000, method: "Bank Transfer", date: "2025-02-28", status: "completed" },
    { id: 6, type: "withdraw", amount: 1200, method: "Bank Transfer", date: "2025-02-25", status: "pending" },
    { id: 7, type: "deposit", amount: 750, method: "Credit Card", date: "2025-02-20", status: "completed" },
    { id: 8, type: "withdraw", amount: 250, method: "PayPal", date: "2025-02-15", status: "failed" },
  ]

  const filteredTransactions = transactions.filter((transaction) => {
    // Apply type filter
    if (filter !== "all" && transaction.type !== filter) {
      return false
    }

    // Apply search filter
    if (searchTerm && !transaction.method.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "status-completed"
      case "pending":
        return "status-pending"
      case "failed":
        return "status-failed"
      default:
        return ""
    }
  }

  return (
    <div className="row">
      <div className="col-12">
        <div className="history-controls">
          <div className="filter-controls">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="all">All Transactions</option>
              <option value="deposit">Deposits</option>
              <option value="withdraw">Withdrawals</option>
            </select>

            <input
              type="text"
              placeholder="Search by method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button className="export-button">Export History</button>
        </div>

        <div className="transaction-table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Method</th>
                <th className="text-end">Amount</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td className="text-capitalize">{transaction.type}</td>
                  <td>{transaction.method}</td>
                  <td className="text-end">
                    <span className={transaction.type === "deposit" ? "amount-deposit" : "amount-withdraw"}>
                      {transaction.type === "deposit" ? "+" : "-"}${transaction.amount}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`status ${getStatusClass(transaction.status)}`}>{transaction.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="no-transactions">No transactions found matching your filters.</div>
        )}

        <div className="pagination-controls">
          <div className="showing-info">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>

          <div className="pagination-buttons">
            <button className="pagination-button" disabled>
              Previous
            </button>
            <button className="pagination-button">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

