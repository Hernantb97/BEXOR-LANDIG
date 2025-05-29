"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CalendarDemoRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la página de configuración del calendario
    router.push('/dashboard/config/calendar')
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Redireccionando...</p>
    </div>
  )
} 