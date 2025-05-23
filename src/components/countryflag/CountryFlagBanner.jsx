"use client"

import { useEffect, useState } from "react"
import PropTypes from "prop-types"

export default function CountryFlagBanner({ playerCount = 2, className = "" }) {
  const [countryCode, setCountryCode] = useState(null)
  const [countryName, setCountryName] = useState(null)
  const [error, setError] = useState(null)

  // Format the player count with commas
  const formattedPlayerCount = playerCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  useEffect(() => {
    // Check if we have cached data and it's less than 24 hours old
    const cachedCountryCode = localStorage.getItem("userCountryCode")
    const cachedCountryName = localStorage.getItem("userCountryName")
    const cacheTimestamp = localStorage.getItem("countryCodeTimestamp")
    const cacheAge = cacheTimestamp ? Date.now() - Number.parseInt(cacheTimestamp) : Number.POSITIVE_INFINITY

    // Use cache if it's less than 1 day old
    if (cachedCountryCode && cachedCountryName && cacheAge < 86400000) {
      setCountryCode(cachedCountryCode)
      setCountryName(cachedCountryName)
      return
    }

    // Fetch country data in the background
    const fetchCountryData = async () => {
      try {
        // Primary API - ipapi.co
        const response = await fetch("https://ipapi.co/json/", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Primary geolocation API failed")
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.reason || "API error")
        }

        if (data.country_code && data.country_name) {
          // Store in state
          setCountryCode(data.country_code.toLowerCase())
          setCountryName(data.country_name)

          // Cache the result
          localStorage.setItem("userCountryCode", data.country_code.toLowerCase())
          localStorage.setItem("userCountryName", data.country_name)
          localStorage.setItem("countryCodeTimestamp", Date.now().toString())
        } else {
          throw new Error("No country data in response")
        }
      } catch (primaryError) {
        console.error("Primary geolocation failed:", primaryError)

        // Fallback API - ipinfo.io
        try {
          const fallbackResponse = await fetch("https://ipinfo.io/json", {
            cache: "no-store",
          })

          if (!fallbackResponse.ok) {
            throw new Error("Fallback geolocation API failed")
          }

          const fallbackData = await fallbackResponse.json()

          if (fallbackData.country && fallbackData.country !== "XX") {
            // Get country name from code
            const countryNameResponse = await fetch(
              `https://restcountries.com/v3.1/alpha/${fallbackData.country.toLowerCase()}`,
            )
            const countryData = await countryNameResponse.json()
            const name = countryData[0]?.name?.common || fallbackData.country

            // Store in state
            setCountryCode(fallbackData.country.toLowerCase())
            setCountryName(name)

            // Cache the result
            localStorage.setItem("userCountryCode", fallbackData.country.toLowerCase())
            localStorage.setItem("userCountryName", name)
            localStorage.setItem("countryCodeTimestamp", Date.now().toString())
          } else {
            throw new Error("No valid country in fallback response")
          }
        } catch (fallbackError) {
          console.error("Fallback geolocation failed:", fallbackError)
          setError("Could not determine location")
        }
      }
    }

    // Start fetching in the background
    fetchCountryData()
  }, [])

  // Function to get flag emoji from country code
  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return ""
    // Convert country code to uppercase
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  return (
    <div
      className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg shadow-md ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap",
        width: "fit-content",
        margin: "0 auto",
      }}
    >
      {countryCode ? (
        <div style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>
          <span style={{ display: "inline-block" }}>Join +{formattedPlayerCount} million players from</span>
          <img
            src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
            alt={countryName || "Country flag"}
            width={24}
            height={16}
            style={{
              display: "inline-block",
              marginLeft: "6px",
              verticalAlign: "middle",
              marginTop: "-2px",
            }}
            onError={(e) => {
              // First fallback: try alternative flag service
              e.target.src = `https://flagsapi.com/${countryCode.toUpperCase()}/flat/32.png`

              // Second fallback: if image still fails, use emoji flag
              e.target.onerror = () => {
                // Replace with emoji
                const parent = e.target.parentNode
                if (parent) {
                  const flagEmoji = document.createElement("span")
                  flagEmoji.textContent = " " + getFlagEmoji(countryCode)
                  flagEmoji.style.fontSize = "16px"
                  flagEmoji.style.marginLeft = "4px"
                  parent.replaceChild(flagEmoji, e.target)
                }
              }
            }}
          />
        </div>
      ) : (
        <span>Join +{formattedPlayerCount} million players worldwide!</span>
      )}
    </div>
  )
}

// Add prop validation
CountryFlagBanner.propTypes = {
  playerCount: PropTypes.number,
  className: PropTypes.string,
}
