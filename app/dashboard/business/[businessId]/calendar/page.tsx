"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CalendarAvailabilitySelector from "@/components/calendar-availability-selector"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function BusinessCalendarPage() {
  const params = useParams() || {}
  const businessId = typeof params.businessId === 'string' ? params.businessId : ""
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)

  const handleTimeSlotSelected = (date: Date, timeString: string) => {
    setSelectedDate(date)
    setSelectedTimeSlot(timeString)
    
    toast({
      title: "Horario seleccionado",
      description: `Has seleccionado el ${date.toLocaleDateString()} a las ${timeString}`,
    })
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Calendario</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full md:col-span-1 lg:col-span-5">
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
            <CardDescription>
              Gestiona tus citas y eventos desde un solo lugar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarAvailabilitySelector 
              businessId={businessId}
              onSelectTimeSlot={handleTimeSlotSelected}
            />
          </CardContent>
        </Card>
        
        <div className="space-y-4 md:col-span-1 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Instrucciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>Este calendario te permite:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ver todos tus eventos del Google Calendar</li>
                  <li>Crear nuevos eventos</li>
                  <li>Editar eventos existentes</li>
                  <li>Eliminar eventos</li>
                </ul>
                <p className="pt-2">
                  Todos los cambios se sincronizan automáticamente con tu cuenta de Google Calendar.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estado de conexión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium">Conectado a Google Calendar</p>
                  <p className="text-sm text-muted-foreground">
                    Última sincronización: hace 5 minutos
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Sincronizar ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 