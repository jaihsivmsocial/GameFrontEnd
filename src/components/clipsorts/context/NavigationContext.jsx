"use client"

import { createContext, useState, useContext } from "react"

const NavigationContext = createContext()

export function NavigationProvider({ children }) {
  const [activeButton, setActiveButton] = useState("Home")

  return <NavigationContext.Provider value={{ activeButton, setActiveButton }}>{children}</NavigationContext.Provider>
}

export function useNavigation() {
  return useContext(NavigationContext)
}
