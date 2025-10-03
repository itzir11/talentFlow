"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { seedDatabase } from "@/lib/seed-data"

export function Providers({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function init() {
      if (typeof window !== "undefined") {
        const { worker } = await import("@/lib/mock-api")
        await worker.start({ onUnhandledRequest: "bypass" })
        await seedDatabase()
        setIsReady(true)
      }
    }

    init()
  }, [])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing TalentFlow...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
