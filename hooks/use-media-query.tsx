"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(e.matches)
    }

    // Set initial value
    updateMatches(mediaQuery)

    // Add listener for subsequent changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateMatches)
      return () => mediaQuery.removeEventListener("change", updateMatches)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(updateMatches)
      return () => mediaQuery.removeListener(updateMatches)
    }
  }, [query])

  return matches
}
