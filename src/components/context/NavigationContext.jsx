"use client"
import { createContext, useState, useContext, useEffect } from "react"

// Create the context
const NavigationContext = createContext()

// Create a provider component
export function NavigationProvider({ children }) {
  const [activeButton, setActiveButton] = useState(null)

  // Check the current path on initial load and on path changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateActiveButton = () => {
        const path = window.location.pathname

        if (path === "/subscribe") {
          setActiveButton("subscribe")
        } else if (path === "/spectate" || path === "/") {
          setActiveButton("spectate")
        } else if (path === "/play") {
          setActiveButton("play")
        } else if (path === "/shop") {
          setActiveButton("shop")
        }
      }

      // Update immediately
      updateActiveButton()

      // Listen for route changes
      window.addEventListener("popstate", updateActiveButton)

      return () => {
        window.removeEventListener("popstate", updateActiveButton)
      }
    }
  }, [])

  return <NavigationContext.Provider value={{ activeButton, setActiveButton }}>{children}</NavigationContext.Provider>
}

// Custom hook to use the navigation context
export function useNavigation() {
  return useContext(NavigationContext)
}

