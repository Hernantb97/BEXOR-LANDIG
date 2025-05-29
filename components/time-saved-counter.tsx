"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { calculateTimeSaved, TimeSavedMetrics } from "@/lib/analytics"
import { supabase } from "@/lib/supabase"
import { getBusinessId } from "@/lib/supabase"

interface TimeSavedCounterProps {
  timeRange: "daily" | "weekly" | "monthly" | "yearly"
  className?: string
}

export function TimeSavedCounter({ timeRange, className }: TimeSavedCounterProps) {
  const [timeSaved, setTimeSaved] = useState<TimeSavedMetrics>({ 
    hours: 0, 
    minutes: 0, 
    messageCount: 0 
  })
  const [isIncrementing, setIsIncrementing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load real time saved data
  useEffect(() => {
    const loadTimeSavedData = async () => {
      try {
        setIsLoading(true)
        
        // Get the business ID for the current user
        const session = await supabase.auth.getSession()
        if (!session?.data?.session?.user?.id) {
          console.error('No hay sesión de usuario para obtener business_id')
          return
        }
        
        const userId = session.data.session.user.id
        const businessData = await getBusinessId(userId)
        const businessId = businessData?.businessId
        
        if (!businessId) {
          console.error('No se pudo obtener el business_id')
          return
        }
        
        // Calculate time saved for the current period
        const savedTime = await calculateTimeSaved(timeRange, businessId)
        
        // Show animation when time saved changes
        setIsIncrementing(true)
        setTimeSaved(savedTime)
        
        setTimeout(() => {
          setIsIncrementing(false)
        }, 1000)
      } catch (error) {
        console.error('Error al cargar datos de tiempo ahorrado:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTimeSavedData()
  }, [timeRange])

  // Format hours and minutes for display
  const formattedHours = timeSaved.hours.toString().padStart(2, "0")
  const formattedMinutes = timeSaved.minutes.toString().padStart(2, "0")

  return (
    <Card className={cn("border-0 shadow-sm dark:bg-gray-800", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="dark:text-white">Tiempo Ahorrado</CardTitle>
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription className="dark:text-gray-300">Horas ahorradas por automatización</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full"></div>
            <span className="ml-2 dark:text-white">Calculando tiempo ahorrado...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="flex items-center">
              <div className="flex">
                {/* Horas */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div
                      className={cn(
                        "text-5xl font-bold tabular-nums bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-lg transition-all duration-300 dark:text-white",
                        isIncrementing && "scale-110",
                      )}
                    >
                      {formattedHours}
                    </div>
                    {isIncrementing && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        +
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 dark:text-gray-300">HORAS</span>
                </div>

                <div className="text-4xl font-bold mx-2 self-start mt-2 dark:text-white">:</div>

                {/* Minutos */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div
                      className={cn(
                        "text-5xl font-bold tabular-nums bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-lg transition-all duration-300 dark:text-white",
                        isIncrementing && "scale-110",
                      )}
                    >
                      {formattedMinutes}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 dark:text-gray-300">MINUTOS</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-6 text-center max-w-xs dark:text-gray-300">
              Tiempo ahorrado gracias a {timeSaved.messageCount} respuestas automáticas (1m 35s por mensaje)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

