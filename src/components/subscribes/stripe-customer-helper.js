import { BASEURL } from "../../utils/apiservice"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${BASEURL}/api`


/**
 * Ensures a payment method is attached to a customer before use
 * @param {string} paymentMethodId - The Stripe payment method ID
 * @returns {Promise<{success: boolean, customerId: string}>}
 */
export const ensurePaymentMethodAttached = async (paymentMethodId) => {
    try {
      console.log(`Ensuring payment method ${paymentMethodId} is attached to customer...`)
  
      const token = getAuthToken()
      if (!token) {
        console.error("No auth token available")
        return { success: false, error: "Authentication required" }
      }
  
      // First, get or create customer
      const customerResult = await getOrCreateCustomer()
      if (!customerResult.success) {
        console.warn("Could not get customer ID, skipping payment method attachment")
        return customerResult
      }
  
      const stripeCustomerId = customerResult.customerId
      console.log(`Got customer ID: ${stripeCustomerId}`)
  
      // Now attach the payment method to the customer
      try {
        const attachResponse = await fetch(`${API_BASE_URL}/payments/methods/attach`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentMethodId,
            customerId: stripeCustomerId,
          }),
        })
  
        if (!attachResponse.ok) {
          const errorData = await attachResponse.json().catch(() => ({}))
          console.error("Failed to attach payment method:", errorData)
  
          // If we're in development, continue anyway
          if (process.env.NODE_ENV === "development") {
            console.warn("In development mode, continuing despite attachment error")
            return {
              success: true,
              customerId: stripeCustomerId,
              paymentMethodId: paymentMethodId,
              warning: "Payment method attachment failed but continuing in development mode",
            }
          }
  
          return { success: false, error: errorData.message || "Failed to attach payment method" }
        }
  
        const attachData = await attachResponse.json()
        console.log("Payment method attached successfully:", attachData)
  
        return {
          success: true,
          customerId: stripeCustomerId,
          paymentMethodId: paymentMethodId,
        }
      } catch (error) {
        console.error("Error attaching payment method:", error)
  
        // If we're in development, continue anyway
        if (process.env.NODE_ENV === "development") {
          console.warn("In development mode, continuing despite attachment error")
          return {
            success: true,
            customerId: stripeCustomerId,
            paymentMethodId: paymentMethodId,
            warning: "Payment method attachment failed but continuing in development mode",
          }
        }
  
        return { success: false, error: error.message }
      }
    } catch (error) {
      console.error("Error in ensurePaymentMethodAttached:", error)
  
      // If we're in development, continue anyway
      if (process.env.NODE_ENV === "development") {
        console.warn("In development mode, continuing despite errors")
        return {
          success: true,
          customerId: "dev_customer_id",
          paymentMethodId: paymentMethodId,
          warning: "Errors occurred but continuing in development mode",
        }
      }
  
      return { success: false, error: error.message }
    }
  }
  