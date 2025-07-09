"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import PaymentModal from "../../components/subscribes/paymentModal" // Adjust path as needed
import paymentApi from "../../components/subscribes/paymentApi" // Adjust path as needed
import styles from "./purchase-currency.module.css" // Adjust path as needed

export default function PurchaseCurrencyPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [accountBalance, setAccountBalance] = useState(0)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [balanceError, setBalanceError] = useState(null)

  const currencyPackages = [
    { id: "package_1", points: 475, price: 415, bonus: 0, image: "/placeholder.svg?height=100&width=100" },
    { id: "package_2", points: 1000, price: 830, bonus: 50, image: "/placeholder.svg?height=100&width=100" },
    { id: "package_3", points: 2050, price: 1660, bonus: 150, image: "/placeholder.svg?height=100&width=100" },
    { id: "package_4", points: 3650, price: 2900, bonus: 325, image: "/placeholder.svg?height=100&width=100" },
    { id: "package_5", points: 5350, price: 4150, bonus: 600, image: "/placeholder.svg?height=100&width=100" },
    { id: "package_6", points: 11000, price: 8330, bonus: 1475, image: "/placeholder.svg?height=100&width=100" },
  ]

  useEffect(() => {
    const fetchBalance = async () => {
      setLoadingBalance(true)
      setBalanceError(null)
      try {
        const { accountBalance } = await paymentApi.getAccountBalance()
        setAccountBalance(accountBalance)
      } catch (err) {
        console.error("Error fetching account balance:", err)
        setBalanceError("Failed to fetch account balance.")
      } finally {
        setLoadingBalance(false)
      }
    }
    fetchBalance()
  }, [])

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (payment) => {
    console.log("Payment successful:", payment)
    // Optionally update balance or show a success message
    alert(`Payment of ₹${payment.amount} successful!`)
    // Re-fetch balance to reflect changes
    const fetchBalance = async () => {
      try {
        const { accountBalance } = await paymentApi.getAccountBalance()
        setAccountBalance(accountBalance)
      } catch (err) {
        console.error("Error fetching account balance after success:", err)
      }
    }
    fetchBalance()
  }

  const handlePaymentError = (error) => {
    console.error("Payment error:", error)
    alert(`Payment failed: ${error.message || "An unknown error occurred."}`)
  }

  return (
    <div className={styles.container}>
      {/* Header is now handled by ClientLayout, so it's removed from here */}
      <main className={styles.mainContent}>
        {/* <h1 className={styles.title}>SELECT</h1> */}

        {/* <section className={styles.purchaseMethodSection}>
          <div className={styles.paymentMethods}>

            <div className={styles.paymentMethodCard}>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-08%20130055-Sx7dLNGsda8rLbycufxw1ZQEaAv7tB.png"
                alt="Visa Mastercard UPI"
                width={100}
                height={60}
              />
              <p>Visa Mastercard UPI</p>
            </div>
            <div className={styles.paymentMethodCard}>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-08%20130055-Sx7dLNGsda8rLbycufxw1ZQEaAv7tB.png"
                alt="PayPal"
                width={100}
                height={60}
              />
              <p>PayPal</p>
            </div>
            <div className={styles.paymentMethodCard}>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-08%20130055-Sx7dLNGsda8rLbycufxw1ZQEaAv7tB.png"
                alt="Prepaid Cards & Codes"
                width={100}
                height={60}
              />
              <p>Prepaid Cards & Codes</p>
            </div>
          </div>
        </section> */}

        <section className={styles.valorantPointsSection}>
          {/* <h2 className={styles.sectionTitle}>SELECT VALORANT POINTS</h2>
          <p className={styles.vatInfo}>(ALL PRICES ARE INCLUSIVE OF VAT IF APPLICABLE)</p> */}
          <div className={styles.currencyPackages}>
            {currencyPackages.map((pkg) => (
              <div key={pkg.id} className={styles.packageCard} onClick={() => handlePackageSelect(pkg)}>
                <span className={styles.packagePrice}>₹{pkg.price.toLocaleString()}</span>
                <Image
                  src={pkg.image || "/placeholder.svg"}
                  alt={`${pkg.points} VIRT Points`}
                  width={100}
                  height={100}
                />
                <span className={styles.packagePoints}>{pkg.points.toLocaleString()}</span>
                <p className={styles.packageDescription}>
                  {pkg.points.toLocaleString()} VIRT Points
                  <br />
                  {pkg.bonus > 0 ? `+ ${pkg.bonus} bonus VALORANT Points` : "+ 0 bonus VALORANT Points"}
                </p>
              </div>
            ))}
          </div>
        </section>

 
      </main>

      {selectedPackage && (
        <PaymentModal
          show={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          amountNeeded={selectedPackage.price}
          currentBalance={accountBalance}
          selectedPackageData={selectedPackage}
        />
      )}
    </div>
  )
}
