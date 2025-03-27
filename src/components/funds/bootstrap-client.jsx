"use client"

import { useEffect } from "react"

export default function BootstrapClient() {
  useEffect(() => {
    // Use dynamic import instead of require
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch((err) => console.error("Error loading Bootstrap:", err))
  }, [])

  return null
}

