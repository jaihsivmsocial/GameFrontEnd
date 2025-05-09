// "use client"

// import { useState, useEffect, useRef } from "react"
// import Image from "next/image"
// import Modal from "react-bootstrap/Modal"
// import { loadStripe } from "@stripe/stripe-js"
// import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
// import paymentApi from "../../components/subscribes/paymentApi"
// import styles from "./modal.module.css"

// const STRIPE_PUBLISHABLE_KEY =
//   "pk_test_51NSgbNLI0jeNQhyDiJ8YYAOYlZHKf0GQ7CtpQIZF8PoEi0iXz22HS1ywEF7N01bl4jOSqozywkNtVnL5It4Gg85t00DfhbhWhq"

// // Initialize Stripe with locale setting to handle region automatically
// const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY, {
//   locale: "auto", // This handles region automatically
// })

// // Modified StripeLoader that doesn't create a CardElement
// const StripeLoader = () => {
//   const stripe = useStripe()
//   const elements = useElements()

//   useEffect(() => {
//     // This effect runs when the component mounts, ensuring Stripe is loaded
//     if (stripe && elements) {
//       console.log("Stripe successfully loaded and initialized")
//       // Make stripe available globally if needed
//       if (typeof window !== "undefined") {
//         window.stripeInstance = stripe
//         window.elementsInstance = elements
//       }
//     }
//   }, [stripe, elements])

//   // Return empty div instead of CardElement
//   return <div style={{ display: "none" }}></div>
// }

// const PaymentFormContent = ({ show, onHide, onSuccess, onError, amountNeeded, currentBalance }) => {
//   console.log("PaymentFormContent rendered with amountNeeded:", amountNeeded)

//   const stripe = useStripe()
//   const elements = useElements()
//   const [paymentMethod, setPaymentMethod] = useState("credit")
//   const [saveCard, setSaveCard] = useState(false)
//   const [cardName, setCardName] = useState("Mark Jake")
//   const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242") // Test card that works
//   const [cardExpiry, setCardExpiry] = useState("12/30")
//   const [cardCvv, setCardCvv] = useState("123")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [savedPaymentMethods, setSavedPaymentMethods] = useState([])
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
//   const [accountBalance, setAccountBalance] = useState(currentBalance || 0) // Use provided balance or default to 0
//   const [fetchingMethods, setFetchingMethods] = useState(false)
//   const [stripeReady, setStripeReady] = useState(false)
//   const [cardComplete, setCardComplete] = useState(false)

//   // Initialize with amountNeeded only, no default values
//   const [paymentAmount, setPaymentAmount] = useState(amountNeeded > 0 ? Number(amountNeeded) : 0)

//   // Keep track of the latest amountNeeded value
//   const latestAmountNeeded = useRef(amountNeeded)

//   // Update payment amount when amountNeeded prop changes
//   useEffect(() => {
//     console.log("Amount needed updated from API:", amountNeeded, typeof amountNeeded)

//     // Always update the ref with the latest value
//     latestAmountNeeded.current = amountNeeded

//     // Only update if amountNeeded is provided and greater than 0
//     if (amountNeeded > 0) {
//       console.log("Setting payment amount to exact API value:", Number(amountNeeded))
//       setPaymentAmount(Number(amountNeeded))
//     }
//   }, [amountNeeded])

//   // Update account balance when currentBalance prop changes
//   useEffect(() => {
//     if (currentBalance !== undefined) {
//       setAccountBalance(Number(currentBalance))
//     }
//   }, [currentBalance])

//   // Check if Stripe is loaded
//   useEffect(() => {
//     const checkStripeReady = async () => {
//       if (stripe && elements) {
//         console.log("✅ Stripe is loaded and ready")
//         setStripeReady(true)
//       } else {
//         console.log("⏳ Waiting for Stripe to load...")
//       }
//     }

//     checkStripeReady()

//     // Poll every second to check if Stripe is ready
//     const interval = setInterval(() => {
//       if (stripe && elements) {
//         console.log("✅ Stripe is now ready")
//         setStripeReady(true)
//         clearInterval(interval)
//       }
//     }, 1000)

//     return () => clearInterval(interval)
//   }, [stripe, elements])

//   // When modal is shown, ensure we're using the latest amountNeeded
//   useEffect(() => {
//     if (show && latestAmountNeeded.current > 0) {
//       console.log("Modal shown, updating payment amount to latest amountNeeded:", latestAmountNeeded.current)
//       setPaymentAmount(Number(latestAmountNeeded.current))
//     }
//   }, [show])

//   // Fetch saved payment methods when component mounts
//   useEffect(() => {
//     const fetchPaymentMethods = async () => {
//       if (!show || fetchingMethods) return

//       setFetchingMethods(true)
//       try {
//         console.log("Fetching payment methods...")
//         const { paymentMethods } = await paymentApi.getPaymentMethods()
//         console.log("Payment methods fetched:", paymentMethods)

//         if (paymentMethods && Array.isArray(paymentMethods)) {
//           setSavedPaymentMethods(paymentMethods)
//         }
//       } catch (err) {
//         console.error("Error fetching payment methods:", err)
//         // Don't show error to user, just log it
//       } finally {
//         setFetchingMethods(false)
//       }
//     }

//     if (show) {
//       fetchPaymentMethods()
//     }
//   }, [show, fetchingMethods])

//   // Handle card element change
//   const handleCardChange = (event) => {
//     setCardComplete(event.complete)
//     if (event.error) {
//       setError(event.error.message)
//     } else {
//       setError(null)
//     }
//   }

//   const processDirectPayment = async () => {
//     try {
//       // Always use the latest amountNeeded for payment
//       const amount = latestAmountNeeded.current > 0 ? Number(latestAmountNeeded.current) : paymentAmount

//       console.log("Processing direct payment without Stripe for amount:", amount)

//       // Create a direct payment without Stripe
//       const { payment } = await paymentApi.createPaymentIntent({
//         amount,
//         currency: "usd",
//         paymentMethod: paymentMethod,
//         directPayment: true,
//         cardDetails: {
//           name: cardName,
//           number: cardNumber.replace(/\s+/g, ""),
//           expiry: cardExpiry,
//           cvc: cardCvv,
//         },
//       })

//       console.log("Direct payment successful:", payment)
//       onSuccess?.(payment)
//       onHide()
//     } catch (err) {
//       console.error("Direct payment error:", err)

//       // Check if it's an authentication error
//       if (
//         err.response?.status === 401 ||
//         err.message?.includes("authentication") ||
//         err.message?.includes("unauthorized")
//       ) {
//         setError("Authentication failed. Please refresh the page and try again.")
//       } else {
//         setError(err.message || "Payment failed. Please try again.")
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSubmit = async (event) => {
//     event.preventDefault()

//     // Only use the amount from the API, no defaults
//     const finalAmount = latestAmountNeeded.current > 0 ? Number(latestAmountNeeded.current) : 0

//     // If no amount is specified, show an error
//     if (finalAmount <= 0) {
//       setError("No payment amount specified. Please try again.")
//       return
//     }

//     console.log("Submitting payment with amount:", finalAmount)
//     console.log("Latest amountNeeded from API:", latestAmountNeeded.current)

//     setLoading(true)
//     setError(null)

//     // Debug authentication state before submission
//     console.log("=== PAYMENT SUBMISSION DEBUG ===")
//     console.log("Payment method:", paymentMethod)
//     console.log("Payment amount:", finalAmount)
//     console.log("Card details:", {
//       name: cardName,
//       number: cardNumber ? `${cardNumber.substring(0, 4)}...` : "none",
//       expiry: cardExpiry,
//       cvc: cardCvv ? "***" : "none",
//     })

//     // Check token
//     const token =
//       localStorage.getItem("authToken") ||
//       (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")).token) ||
//       (localStorage.getItem("authData") && JSON.parse(localStorage.getItem("authData")).token)

//     console.log("Auth token available:", token ? "Yes" : "No")
//     console.log("====================================")

//     try {
//       // Handle account balance payment
//       if (paymentMethod === "balance") {
//         if (accountBalance < finalAmount) {
//           setError("Insufficient account balance")
//           setLoading(false)
//           return
//         }

//         console.log("Processing balance payment...")
//         const { payment } = await paymentApi.createPaymentIntent({
//           amount: finalAmount,
//           currency: "usd",
//           paymentMethod: "balance",
//         })

//         console.log("Balance payment successful:", payment)
//         onSuccess?.(payment)
//         onHide()
//         return
//       }

//       // For credit/debit card payments with Stripe
//       if ((paymentMethod === "credit" || paymentMethod === "debit") && !selectedPaymentMethod) {
//         // Check if Stripe is ready
//         if (!stripeReady || !stripe || !elements) {
//           console.log("Stripe not ready, attempting direct payment...")
//           await processDirectPayment()
//           return
//         }

//         // Get the card element
//         const cardElement = elements.getElement(CardElement)

//         if (!cardElement) {
//           setError("Card element not found. Please refresh and try again.")
//           setLoading(false)
//           return
//         }

//         if (!cardComplete) {
//           setError("Please complete card information")
//           setLoading(false)
//           return
//         }

//         console.log("Processing payment with Stripe...")
//         console.log("Creating payment intent for amount:", finalAmount)

//         // Create payment intent
//         const { clientSecret, paymentId } = await paymentApi.createPaymentIntent({
//           amount: finalAmount,
//           currency: "usd",
//           paymentMethod: paymentMethod,
//           saveCard,
//         })

//         console.log("Payment intent created:", { clientSecret: clientSecret ? "received" : "missing", paymentId })

//         // Process the payment with Stripe
//         const paymentResult = await stripe.confirmCardPayment(clientSecret, {
//           payment_method: {
//             card: cardElement,
//             billing_details: {
//               name: cardName,
//             },
//           },
//         })

//         console.log("Payment result:", paymentResult)

//         if (paymentResult.error) {
//           console.error("Payment error:", paymentResult.error)
//           setError(paymentResult.error.message)
//           onError?.(paymentResult.error)
//         } else if (paymentResult.paymentIntent.status === "succeeded") {
//           // Payment succeeded immediately
//           const { payment } = await paymentApi.confirmPayment(paymentId, {
//             paymentIntentId: paymentResult.paymentIntent.id,
//             saveCard,
//           })

//           console.log("Payment confirmed:", payment)
//           onSuccess?.(payment)
//           onHide()
//         } else if (paymentResult.paymentIntent.status === "requires_action") {
//           // 3D Secure authentication required
//           console.log("3D Secure authentication required")

//           // Show 3D Secure dialog
//           const { error, paymentIntent } = await stripe.handleCardAction(clientSecret)

//           if (error) {
//             console.error("3D Secure error:", error)
//             setError(error.message)
//             onError?.(error)
//           } else if (paymentIntent.status === "requires_confirmation") {
//             // After successful authentication, confirm the payment
//             const confirmResult = await stripe.confirmCardPayment(clientSecret)

//             if (confirmResult.error) {
//               console.error("Confirmation error:", confirmResult.error)
//               setError(confirmResult.error.message)
//               onError?.(confirmResult.error)
//             } else if (confirmResult.paymentIntent.status === "succeeded") {
//               // Payment confirmed after authentication
//               const { payment } = await paymentApi.confirmPayment(paymentId, {
//                 paymentIntentId: confirmResult.paymentIntent.id,
//                 saveCard,
//               })

//               console.log("Payment confirmed after 3D Secure:", payment)
//               onSuccess?.(payment)
//               onHide()
//             }
//           }
//         }
//       } else if (selectedPaymentMethod) {
//         // Using a saved payment method
//         console.log("Processing payment with saved method:", selectedPaymentMethod)

//         // Create payment intent
//         const { clientSecret, paymentId } = await paymentApi.createPaymentIntent({
//           amount: finalAmount,
//           currency: "usd",
//           paymentMethod: paymentMethod,
//         })

//         // Process the payment with Stripe
//         const paymentResult = await stripe.confirmCardPayment(clientSecret, {
//           payment_method: selectedPaymentMethod,
//         })

//         if (paymentResult.error) {
//           console.error("Payment error:", paymentResult.error)
//           setError(paymentResult.error.message)
//           onError?.(paymentResult.error)
//         } else if (paymentResult.paymentIntent.status === "succeeded") {
//           // Payment succeeded immediately
//           const { payment } = await paymentApi.confirmPayment(paymentId, {
//             paymentIntentId: paymentResult.paymentIntent.id,
//           })

//           console.log("Payment confirmed:", payment)
//           onSuccess?.(payment)
//           onHide()
//         }
//       } else {
//         // Handle other payment methods (PayPal, crypto, etc.)
//         setError("This payment method is not yet implemented")
//       }
//     } catch (err) {
//       console.error("Payment processing error:", err)

//       // Enhanced error logging
//       if (err.response) {
//         console.error("Error response data:", err.response.data)
//         console.error("Error response status:", err.response.status)
//       }

//       // Check if it's an authentication error
//       if (
//         err.response?.status === 401 ||
//         err.message?.includes("authentication") ||
//         err.message?.includes("unauthorized")
//       ) {
//         setError("Authentication failed. Please refresh the page and try again.")
//       } else if (err.response?.status === 500) {
//         setError("Server error. Please try again later or contact support.")
//       } else {
//         setError(err.message || "An error occurred during payment processing")
//       }

//       onError?.(err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!show) return null

//   // Only use the amount from the API, no defaults
//   const displayAmount = latestAmountNeeded.current > 0 ? Number(latestAmountNeeded.current) : 0

//   return (
//     <Modal
//       show={show}
//       onHide={onHide}
//       centered={false}
//       dialogClassName={styles["payment-modal-dialog"]}
//       contentClassName={styles["payment-modal-content"]}
//     >
//       <div className={styles["payment-modal-container"]}>
//         <div className={styles["payment-modal-inner"]}>
//           {/* Header */}
//           <div className={styles["payment-header"]}>
//             <div>
//               <h5>Payment Options</h5>
//               <p>Choose how you want to proceed with payment.</p>
//             </div>
//             <div className={styles["payment-icons"]}>
//               <Image src="/assets/img/paymentimg/visa.png" alt="Visa" width={40} height={24} />
//               <Image src="/assets/img/funds/Mastercard.png" alt="Mastercard" width={40} height={24} />
//               <Image src="/assets/img/funds/Discover.png" alt="Discover" width={40} height={24} />
//               <Image src="/assets/img/funds/American Express.png" alt="American Express" width={40} height={24} />
//             </div>
//             <button type="button" className={styles["close-button"]} onClick={onHide} aria-label="Close">
//               <span>&times;</span>
//             </button>
//           </div>

//           <form onSubmit={handleSubmit}>
//             <div className={styles["payment-content"]}>
//               {/* Payment methods */}
//               <div className={styles["payment-methods"]}>
//                 <div className={styles["payment-method-row"]}>
//                   <div className={styles["payment-method-option"]}>
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       id="creditCard"
//                       checked={paymentMethod === "credit"}
//                       onChange={() => {
//                         setPaymentMethod("credit")
//                         setSelectedPaymentMethod(null)
//                       }}
//                     />
//                     <label htmlFor="creditCard">Credit Card</label>
//                   </div>

//                   <div className={styles["payment-method-option"]}>
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       id="debitCard"
//                       checked={paymentMethod === "debit"}
//                       onChange={() => {
//                         setPaymentMethod("debit")
//                         setSelectedPaymentMethod(null)
//                       }}
//                     />
//                     <label htmlFor="debitCard">Debit Card</label>
//                   </div>
//                 </div>

//                 <div className={styles["payment-method-row"]}>
//                   <div className={styles["payment-method-option"]}>
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       id="paypal"
//                       checked={paymentMethod === "paypal"}
//                       onChange={() => {
//                         setPaymentMethod("paypal")
//                         setSelectedPaymentMethod(null)
//                       }}
//                     />
//                     <label htmlFor="paypal">Paypal</label>
//                   </div>

//                   <div className={styles["payment-method-option"]}>
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       id="crypto"
//                       checked={paymentMethod === "crypto"}
//                       onChange={() => {
//                         setPaymentMethod("crypto")
//                         setSelectedPaymentMethod(null)
//                       }}
//                     />
//                     <label htmlFor="crypto">Cryptocurrency</label>
//                   </div>
//                 </div>

//                 <div className={styles["payment-method-option"]}>
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     id="balance"
//                     checked={paymentMethod === "balance"}
//                     onChange={() => {
//                       setPaymentMethod("balance")
//                       setSelectedPaymentMethod(null)
//                     }}
//                   />
//                   <label htmlFor="balance">Account Balance</label>
//                   <div className={styles["balance-amount"]}>Available Balance: ${accountBalance.toFixed(2)}</div>
//                 </div>
//               </div>

//               {/* Card details - MODIFIED SECTION */}
//               <div className={styles["card-details"]}>
//                 {(paymentMethod === "credit" || paymentMethod === "debit") && !selectedPaymentMethod && (
//                   <>
//                     {/* Card Number - First Row */}
//                     <div className={styles["card-number-field"]}>
//                       {stripeReady ? (
//                         <div className={styles["stripe-card-element"]}>
//                           <CardElement
//                             onChange={handleCardChange}
//                             options={{
//                               style: {
//                                 base: {
//                                   color: "white",
//                                   fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
//                                   fontSmoothing: "antialiased",
//                                   fontSize: "16px",
//                                   "::placeholder": {
//                                     color: "#aab7c4",
//                                   },
//                                 },
//                                 invalid: {
//                                   color: "#fa755a",
//                                   iconColor: "#fa755a",
//                                 },
//                               },
//                               hidePostalCode: true,
//                             }}
//                           />
//                         </div>
//                       ) : (
//                         <input
//                           type="text"
//                           value={cardNumber}
//                           onChange={(e) => setCardNumber(e.target.value)}
//                           placeholder="8561 6499 9992 XXXX"
//                           disabled={!stripeReady}
//                           className={styles["card-input"]}
//                         />
//                       )}
//                       <div className={styles["card-logo"]}>
//                         <Image src="/assets/img/paymentimg/visa.png" alt="Visa" width={40} height={24} style={{marginRight:"157px"}} />
//                       </div>
//                     </div>

//                     {/* Card Holder Name - Second Row */}
//                     <div className={styles["card-row"]}>
//                       <input
//                         type="text"
//                         className={styles["card-name"]}
//                         value={cardName}
//                         onChange={(e) => setCardName(e.target.value)}
//                         placeholder="Mark Jake"
//                       />
//                     </div>

//                     {/* Expiry Date - Third Row */}
//                     {!stripeReady && (
//                       <div className={styles["card-row"]}>
//                         <input
//                           type="text"
//                           className={styles["card-expiry"]}
//                           value={cardExpiry}
//                           onChange={(e) => setCardExpiry(e.target.value)}
//                           placeholder="08/35"
//                         />
//                       </div>
//                     )}

//                     {/* CVV - Fourth Row */}
//                     {!stripeReady && (
//                       <div className={styles["card-row"]}>
//                         <input
//                           type="text"
//                           className={styles["card-cvv"]}
//                           value={cardCvv}
//                           onChange={(e) => setCardCvv(e.target.value)}
//                           placeholder="985"
//                         />
//                       </div>
//                     )}
//                   </>
//                 )}

//                 {error && <div className={styles["error-message"]}>{error}</div>}

//                 <div className={styles["payment-footer"]}>
//                   <div className={styles["save-card"]}>
//                     <input type="checkbox" id="saveCard" checked={saveCard} onChange={() => setSaveCard(!saveCard)} />
//                     <label htmlFor="saveCard">Save card details for future payments</label>
//                   </div>

//                   <button
//                     type="submit"
//                     className={styles["continue-button"]}
//                     disabled={
//                       loading ||
//                       ((paymentMethod === "credit" || paymentMethod === "debit") &&
//                         !selectedPaymentMethod &&
//                         stripeReady &&
//                         !cardComplete)
//                     }
//                   >
//                     {loading ? "Processing..." : "Continue"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//     </Modal>
//   )
// }

// // Wrapper component with Stripe Elements
// export default function PaymentModal(props) {
//   // Use more options to ensure Stripe loads properly
//   const stripeOptions = {
//     locale: "auto", 
//   }

//   console.log("PaymentModal wrapper rendered with amountNeeded:", props.amountNeeded)

//   return (
//     <Elements stripe={stripePromise} options={stripeOptions}>
//       <StripeLoader />
//       <PaymentFormContent {...props} />
//     </Elements>
//   )
// }

"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Modal from "react-bootstrap/Modal"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import paymentApi from "../../components/subscribes/paymentApi"
import styles from "./modal.module.css"

const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51NSgbNLI0jeNQhyDiJ8YYAOYlZHKf0GQ7CtpQIZF8PoEi0iXz22HS1ywEF7N01bl4jOSqozywkNtVnL5It4Gg85t00DfhbhWhq"

// Initialize Stripe with locale setting to handle region automatically
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY, {
  locale: "auto", // This handles region automatically
})

// Modified StripeLoader that doesn't create a CardElement
const StripeLoader = () => {
  const stripe = useStripe()
  const elements = useElements()

  useEffect(() => {
    // This effect runs when the component mounts, ensuring Stripe is loaded
    if (stripe && elements) {
      console.log("Stripe successfully loaded and initialized")
      // Make stripe available globally if needed
      if (typeof window !== "undefined") {
        window.stripeInstance = stripe
        window.elementsInstance = elements
      }
    }
  }, [stripe, elements])

  // Return empty div instead of CardElement
  return <div style={{ display: "none" }}></div>
}

const PaymentFormContent = ({ show, onHide, onSuccess, onError, amountNeeded, currentBalance }) => {
  console.log("PaymentFormContent rendered with amountNeeded:", amountNeeded)

  const stripe = useStripe()
  const elements = useElements()
  const [paymentMethod, setPaymentMethod] = useState("credit")
  const [saveCard, setSaveCard] = useState(false)
  const [cardName, setCardName] = useState("Mark Jake")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [accountBalance, setAccountBalance] = useState(currentBalance || 0) // Use provided balance or default to 0
  const [fetchingMethods, setFetchingMethods] = useState(false)
  const [stripeReady, setStripeReady] = useState(false)
  const [cardNumberComplete, setCardNumberComplete] = useState(false)
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false)
  const [cardCvcComplete, setCardCvcComplete] = useState(false)

  // Initialize with amountNeeded only, no default values
  const [paymentAmount, setPaymentAmount] = useState(amountNeeded > 0 ? Number(amountNeeded) : 0)

  // Keep track of the latest amountNeeded value
  const latestAmountNeeded = useRef(amountNeeded)

  // Update payment amount when amountNeeded prop changes
  useEffect(() => {
    console.log("Amount needed updated from API:", amountNeeded, typeof amountNeeded)

    // Always update the ref with the latest value
    latestAmountNeeded.current = amountNeeded

    // Only update if amountNeeded is provided and greater than 0
    if (amountNeeded > 0) {
      console.log("Setting payment amount to exact API value:", Number(amountNeeded))
      setPaymentAmount(Number(amountNeeded))
    }
  }, [amountNeeded])

  // Update account balance when currentBalance prop changes
  useEffect(() => {
    if (currentBalance !== undefined) {
      setAccountBalance(Number(currentBalance))
    }
  }, [currentBalance])

  // Check if Stripe is loaded
  useEffect(() => {
    const checkStripeReady = async () => {
      if (stripe && elements) {
        console.log("✅ Stripe is loaded and ready")
        setStripeReady(true)
      } else {
        console.log("⏳ Waiting for Stripe to load...")
      }
    }

    checkStripeReady()

    // Poll every second to check if Stripe is ready
    const interval = setInterval(() => {
      if (stripe && elements) {
        console.log("✅ Stripe is now ready")
        setStripeReady(true)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [stripe, elements])

  // When modal is shown, ensure we're using the latest amountNeeded
  useEffect(() => {
    if (show && latestAmountNeeded.current > 0) {
      console.log("Modal shown, updating payment amount to latest amountNeeded:", latestAmountNeeded.current)
      setPaymentAmount(Number(latestAmountNeeded.current))
    }
  }, [show])

  // Fetch saved payment methods when component mounts
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!show || fetchingMethods) return

      setFetchingMethods(true)
      try {
        console.log("Fetching payment methods...")
        const { paymentMethods } = await paymentApi.getPaymentMethods()
        console.log("Payment methods fetched:", paymentMethods)

        if (paymentMethods && Array.isArray(paymentMethods)) {
          setSavedPaymentMethods(paymentMethods)
        }
      } catch (err) {
        console.error("Error fetching payment methods:", err)
        // Don't show error to user, just log it
      } finally {
        setFetchingMethods(false)
      }
    }

    if (show) {
      fetchPaymentMethods()
    }
  }, [show, fetchingMethods])

  // Handle card element changes
  const handleCardNumberChange = (event) => {
    setCardNumberComplete(event.complete)
    if (event.error) {
      setError(event.error.message)
    } else {
      setError(null)
    }
  }

  const handleCardExpiryChange = (event) => {
    setCardExpiryComplete(event.complete)
    if (event.error) {
      setError(event.error.message)
    } else {
      setError(null)
    }
  }

  const handleCardCvcChange = (event) => {
    setCardCvcComplete(event.complete)
    if (event.error) {
      setError(event.error.message)
    } else {
      setError(null)
    }
  }

  // Check if all card fields are complete
  const isCardComplete = () => {
    // For Stripe elements, check if all fields are complete
    return cardNumberComplete && cardExpiryComplete && cardCvcComplete
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    console.log(amountNeeded, "amt need", currentBalance, "current balance")
    console.log(paymentAmount, "payment amount")

    // Use paymentAmount as fallback if latestAmountNeeded is not valid
    const finalAmount = latestAmountNeeded.current > 0 ? Number(latestAmountNeeded.current) : paymentAmount

    // If no amount is specified, show an error
    if (!finalAmount || finalAmount <= 0) {
      setError("No payment amount specified. Please try again.")
      return
    }

    setLoading(true)
    setError(null)

    console.log("Payment method:", paymentMethod)
    console.log("Final amount:", finalAmount)
    console.log("Stripe ready:", stripeReady)
    console.log("Card complete:", isCardComplete())

    // Check token
    const token =
      localStorage.getItem("authToken") ||
      (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")).token) ||
      (localStorage.getItem("authData") && JSON.parse(localStorage.getItem("authData")).token)

    console.log("Auth token available:", token ? "Yes" : "No")

    try {
      // Handle account balance payment
      if (paymentMethod === "balance") {
        if (accountBalance < finalAmount) {
          setError("Insufficient account balance")
          setLoading(false)
          return
        }

        console.log("Processing balance payment for amount:", finalAmount)
        const { payment } = await paymentApi.createPaymentIntent({
          amount: finalAmount,
          currency: "usd",
          paymentMethod: "balance",
        })

        console.log("Balance payment successful:", payment)
        onSuccess?.(payment)
        onHide()
        return
      }

      // For credit/debit card payments with Stripe
      if ((paymentMethod === "credit" || paymentMethod === "debit") && !selectedPaymentMethod) {
        // Check if card is complete
        if (!isCardComplete()) {
          setError("Please complete all card information")
          setLoading(false)
          return
        }

        if (!stripeReady || !stripe || !elements) {
          setError("Stripe is not ready. Please try again.")
          setLoading(false)
          return
        }

        console.log("Processing payment with Stripe...")
        console.log("Creating payment intent for amount:", finalAmount)

        // Create payment intent on your server
        const { clientSecret, paymentId } = await paymentApi.createPaymentIntent({
          amount: finalAmount,
          currency: "usd",
          paymentMethod: paymentMethod,
          saveCard,
        })

        if (!clientSecret) {
          setError("Failed to create payment intent. Please try again.")
          setLoading(false)
          return
        }

        console.log("Payment intent created:", { clientSecret: clientSecret ? "received" : "missing", paymentId })

        // Get the card elements
        const cardNumberElement = elements.getElement(CardNumberElement)
        const cardExpiryElement = elements.getElement(CardExpiryElement)
        const cardCvcElement = elements.getElement(CardCvcElement)

        // If we're using the Stripe elements
        if (cardNumberElement && cardExpiryElement && cardCvcElement) {
          // Create payment method with all card elements
          const { error, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card: cardNumberElement,
            billing_details: {
              name: cardName,
            },
          })

          if (error) {
            console.error("Error creating payment method:", error)
            setError(error.message)
            setLoading(false)
            return
          }

          // Process the payment with Stripe
          const paymentResult = await stripe.confirmCardPayment(clientSecret, {
            payment_method: stripePaymentMethod.id,
          })

          console.log("Payment result:", paymentResult)

          if (paymentResult.error) {
            console.error("Payment error:", paymentResult.error)
            setError(paymentResult.error.message)
            onError?.(paymentResult.error)
            setLoading(false)
          } else if (paymentResult.paymentIntent.status === "succeeded") {
            // Payment succeeded immediately
            const { payment } = await paymentApi.confirmPayment(paymentId, {
              paymentIntentId: paymentResult.paymentIntent.id,
              saveCard,
            })

            console.log("Payment confirmed:", payment)
            onSuccess?.(payment)
            onHide()
          } else if (paymentResult.paymentIntent.status === "requires_action") {
            // 3D Secure authentication required
            console.log("3D Secure authentication required")

            // Show 3D Secure dialog
            const { error, paymentIntent } = await stripe.handleCardAction(clientSecret)

            if (error) {
              console.error("3D Secure error:", error)
              setError(error.message)
              onError?.(error)
              setLoading(false)
            } else if (paymentIntent.status === "requires_confirmation") {
              // After successful authentication, confirm the payment
              const confirmResult = await stripe.confirmCardPayment(clientSecret)

              if (confirmResult.error) {
                console.error("Confirmation error:", confirmResult.error)
                setError(confirmResult.error.message)
                onError?.(confirmResult.error)
                setLoading(false)
              } else if (confirmResult.paymentIntent.status === "succeeded") {
                // Payment confirmed after authentication
                const { payment } = await paymentApi.confirmPayment(paymentId, {
                  paymentIntentId: confirmResult.paymentIntent.id,
                  saveCard,
                })

                console.log("Payment confirmed after 3D Secure:", payment)
                onSuccess?.(payment)
                onHide()
              }
            }
          }
        } else {
          setError("Card elements not found. Please refresh and try again.")
          setLoading(false)
        }
      } else if (selectedPaymentMethod) {
        // Using a saved payment method
        console.log("Processing payment with saved method:", selectedPaymentMethod)

        // Create payment intent
        const { clientSecret, paymentId } = await paymentApi.createPaymentIntent({
          amount: finalAmount,
          currency: "usd",
          paymentMethod: paymentMethod,
        })

        // Process the payment with Stripe
        const paymentResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: selectedPaymentMethod,
        })

        if (paymentResult.error) {
          console.error("Payment error:", paymentResult.error)
          setError(paymentResult.error.message)
          onError?.(paymentResult.error)
          setLoading(false)
        } else if (paymentResult.paymentIntent.status === "succeeded") {
          // Payment succeeded immediately
          const { payment } = await paymentApi.confirmPayment(paymentId, {
            paymentIntentId: paymentResult.paymentIntent.id,
          })

          console.log("Payment confirmed:", payment)
          onSuccess?.(payment)
          onHide()
        }
      } else {
        // Handle other payment methods (PayPal, crypto, etc.)
        setError("This payment method is not yet implemented")
        setLoading(false)
      }
    } catch (err) {
      console.error("Payment processing error:", err)

      // Enhanced error logging
      if (err.response) {
        console.error("Error response data:", err.response.data)
        console.error("Error response status:", err.response.status)
      }

      // Check if it's an authentication error
      if (
        err.response?.status === 401 ||
        err.message?.includes("authentication") ||
        err.message?.includes("unauthorized")
      ) {
        setError("Authentication failed. Please refresh the page and try again.")
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later or contact support.")
      } else {
        setError(err.message || "An error occurred during payment processing")
      }

      onError?.(err)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  // Only use the amount from the API, no defaults
  const displayAmount = latestAmountNeeded.current > 0 ? Number(latestAmountNeeded.current) : paymentAmount

  // Update the Stripe element styles to have better placeholder visibility and text color
  const stripeElementStyle = {
    style: {
      base: {
        color: "white",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
        padding: "12px 15px",
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  }

  const cardNumberStyle = {
    ...stripeElementStyle,
    hidePostalCode: true,
    placeholder: "8561 6499 9992 XXXX",
  }

  const cardExpiryStyle = {
    ...stripeElementStyle,
    placeholder: "MM/YY",
  }

  const cardCvcStyle = {
    ...stripeElementStyle,
    placeholder: "CVC",
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered={false}
      dialogClassName={styles["payment-modal-dialog"]}
      contentClassName={styles["payment-modal-content"]}
    >
      <div className={styles["payment-modal-container"]}>
        <div className={styles["payment-modal-inner"]}>
          {/* Header */}
          <div className={styles["payment-header"]}>
            <div>
              <h5>Payment Options</h5>
              <p>Choose how you want to proceed with payment.</p>
            </div>
            <div className={styles["payment-icons"]}>
              <Image src="/assets/img/paymentimg/visa.png" alt="Visa" width={40} height={24} />
              <Image src="/assets/img/funds/Mastercard.png" alt="Mastercard" width={40} height={24} />
              <Image src="/assets/img/funds/Discover.png" alt="Discover" width={40} height={24} />
              <Image src="/assets/img/funds/American Express.png" alt="American Express" width={40} height={24} />
            </div>
            <button type="button" className={styles["close-button"]} onClick={onHide} aria-label="Close">
              <span>&times;</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles["payment-content"]}>
              {/* Payment methods */}
              <div className={styles["payment-methods"]}>
                <div className={styles["payment-method-row"]}>
                  <div className={styles["payment-method-option"]}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      id="creditCard"
                      checked={paymentMethod === "credit"}
                      onChange={() => {
                        setPaymentMethod("credit")
                        setSelectedPaymentMethod(null)
                      }}
                    />
                    <label htmlFor="creditCard">Credit Card</label>
                  </div>

                  <div className={styles["payment-method-option"]}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      id="debitCard"
                      checked={paymentMethod === "debit"}
                      onChange={() => {
                        setPaymentMethod("debit")
                        setSelectedPaymentMethod(null)
                      }}
                    />
                    <label htmlFor="debitCard">Debit Card</label>
                  </div>
                </div>

                <div className={styles["payment-method-row"]}>
                  <div className={styles["payment-method-option"]}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      id="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={() => {
                        setPaymentMethod("paypal")
                        setSelectedPaymentMethod(null)
                      }}
                    />
                    <label htmlFor="paypal">Paypal</label>
                  </div>

                  <div className={styles["payment-method-option"]}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      id="crypto"
                      checked={paymentMethod === "crypto"}
                      onChange={() => {
                        setPaymentMethod("crypto")
                        setSelectedPaymentMethod(null)
                      }}
                    />
                    <label htmlFor="crypto">Cryptocurrency</label>
                  </div>
                </div>

                <div className={styles["payment-method-option"]}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    id="balance"
                    checked={paymentMethod === "balance"}
                    onChange={() => {
                      setPaymentMethod("balance")
                      setSelectedPaymentMethod(null)
                    }}
                  />
                  <label htmlFor="balance">Account Balance</label>
                  <div className={styles["balance-amount"]}>Available Balance: ${accountBalance.toFixed(2)}</div>
                </div>
              </div>

              {/* Card details - MODIFIED SECTION */}
              <div className={styles["card-details"]}>
                {(paymentMethod === "credit" || paymentMethod === "debit") && !selectedPaymentMethod && (
                  <>
                    {/* Card Number - First Row */}
                    <div className={styles["card-number-field"]}>
                      {stripeReady ? (
                        <div className={styles["stripe-card-number-wrapper"]}>
                          <CardNumberElement onChange={handleCardNumberChange} options={cardNumberStyle} />
                        </div>
                      ) : (
                        <div className={styles["loading-stripe"]}>Loading payment form...</div>
                      )}
                      <div className={styles["card-logo"]}>
                        <Image
                          src="/assets/img/paymentimg/visa.png"
                          alt="Visa"
                          width={40}
                          height={24}
                          style={{ marginRight: 270 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* Card Holder Name */}
                      <div className={styles["card-name-wrapper"]}>
                        <input
                          type="text"
                          className={styles["card-name-input"]}
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Mark Jake"
                        />
                      </div>

                      {/* Expiry Date - Using Stripe Element */}
                      <div className={styles["card-expiry-wrapper"]}>
                        {stripeReady ? (
                          <CardExpiryElement
                            onChange={handleCardExpiryChange}
                            options={cardExpiryStyle}
                            className={styles["stripe-card-expiry"]}
                          />
                        ) : (
                          <div className={styles["loading-stripe-small"]}>Loading...</div>
                        )}
                      </div>

                      {/* CVV - Using Stripe Element */}
                      <div className={styles["card-cvv-wrapper"]}>
                        {stripeReady ? (
                          <CardCvcElement
                            onChange={handleCardCvcChange}
                            options={cardCvcStyle}
                            className={styles["stripe-card-cvc"]}
                          />
                        ) : (
                          <div className={styles["loading-stripe-small"]}>Loading...</div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {error && <div className={styles["error-message"]}>{error}</div>}

                <div className={styles["payment-footer"]}>
                  <div className={styles["save-card"]}>
                    <input type="checkbox" id="saveCard" checked={saveCard} onChange={() => setSaveCard(!saveCard)} />
                    <label htmlFor="saveCard">Save card details for future payments</label>
                  </div>

                  <button type="submit" className={styles["continue-button"]} disabled={loading || !stripeReady}>
                    {loading
                      ? "Processing..."
                      : displayAmount > 0
                        ? `Continue $${displayAmount.toFixed(2)}`
                        : "Continue"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}

// Wrapper component with Stripe Elements
export default function PaymentModal(props) {
  // Use more options to ensure Stripe loads properly
  const stripeOptions = {
    locale: "auto", // This handles region automatically
    fonts: [
      {
        cssSrc: "https://fonts.googleapis.com/css?family=Roboto",
      },
    ],
  }

  console.log("PaymentModal wrapper rendered with amountNeeded:", props.amountNeeded)

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <StripeLoader />
      <PaymentFormContent {...props} />
    </Elements>
  )
}
