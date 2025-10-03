"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 1800)

    const removeTimer = setTimeout(() => {
      setIsLoading(false)
    }, 2300)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <div className="relative">
          <div className="absolute -inset-4 animate-pulse-ring rounded-full bg-blue-400/20" />
          <div className="absolute -inset-2 animate-pulse-ring-delayed rounded-full bg-blue-500/15" />

          <div className="relative animate-float">
            <Image
              src="/icon-192x192.png"
              alt="Barangay Mancruz Logo"
              width={120}
              height={120}
              className="rounded-full shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Barangay Mancruz</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Daet, Camarines Norte</p>
        </div>

        <div className="flex gap-2">
          <div className="h-3 w-3 animate-wave rounded-full bg-blue-500" style={{ animationDelay: "0s" }} />
          <div className="h-3 w-3 animate-wave rounded-full bg-blue-600" style={{ animationDelay: "0.15s" }} />
          <div className="h-3 w-3 animate-wave rounded-full bg-blue-700" style={{ animationDelay: "0.3s" }} />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 animate-fade-in">Loading Report System...</p>
      </div>
    </div>
  )
}
