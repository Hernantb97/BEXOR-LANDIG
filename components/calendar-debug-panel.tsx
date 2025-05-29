"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RefreshCw, CalendarCheck } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function CalendarDebugPanel({ businessId }: { businessId: string }) {
  const [status, setStatus] = useState<any>(null)
  const [availability, setAvailability] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [useMockData, setUseMockData] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { toast } = useToast()
  
  const fetchStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:3095/api/calendar/status?business_id=${businessId}&t=${Date.now()}`)
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Error fetching status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailability = async (useMock = false, date = selectedDate) => {
    try {
      setIsLoading(true)
      const dateString = date.toISOString().split('T')[0]
      
      console.log("Consultando disponibilidad para fecha:", dateString)
      
      const response = await fetch('http://localhost:3095/api/calendar/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: businessId,
          date: dateString,
          use_mock_data: useMock
        })
      })
      const data = await response.json()
      console.log("Respuesta de la API:", data)
      setAvailability(data)
      
      if (useMock && data.success) {
        toast({
          title: "Datos de ejemplo generados",
          description: `Se han generado ${data.events?.length || 0} eventos ficticios para demostración.`,
          duration: 5000
        })
      }
    } catch (error) {
      console.error("Error fetching availability:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchAvailability(useMockData)
  }, [businessId, useMockData, selectedDate])

  const handleToggleMockData = () => {
    setUseMockData(!useMockData)
  }
  
  const handleGenerateEvents = () => {
    fetchAvailability(true)
  }
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }
  
  // Función para comprobar disponibilidad en fechas específicas
  const checkSpecificDates = async () => {
    setIsLoading(true)
    
    try {
      // Verificar el 10 de mayo
      const may10 = new Date(2024, 4, 10) // Mes es 0-indexed, por lo que 4 = mayo
      console.log("Consultando eventos para el 10 de mayo")
      const may10Response = await fetch('http://localhost:3095/api/calendar/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: businessId,
          date: may10.toISOString().split('T')[0]
        })
      })
      
      const may10Data = await may10Response.json()
      console.log("Eventos 10 de mayo:", may10Data)
      
      // Verificar el 13 de mayo
      const may13 = new Date(2024, 4, 13)
      console.log("Consultando eventos para el 13 de mayo")
      const may13Response = await fetch('http://localhost:3095/api/calendar/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: businessId,
          date: may13.toISOString().split('T')[0]
        })
      })
      
      const may13Data = await may13Response.json()
      console.log("Eventos 13 de mayo:", may13Data)
      
      // Mostrar resultados
      toast({
        title: "Verificación de fechas específicas",
        description: `10 de mayo: ${may10Data.events?.length || 0} eventos, 13 de mayo: ${may13Data.events?.length || 0} eventos`,
        duration: 5000
      })
      
      // Mostrar la fecha con más eventos
      if ((may10Data.events?.length || 0) > (may13Data.events?.length || 0)) {
        setSelectedDate(may10)
        setAvailability(may10Data)
      } else {
        setSelectedDate(may13)
        setAvailability(may13Data)
      }
      
    } catch (error) {
      console.error("Error verificando fechas específicas:", error)
      toast({
        title: "Error",
        description: "No se pudieron verificar las fechas específicas",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader className="px-4 py-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Información de Depuración del Calendario</span>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 mr-2">
              <Switch
                id="use-mock-data"
                checked={useMockData}
                onCheckedChange={handleToggleMockData}
                disabled={isLoading}
              />
              <Label htmlFor="use-mock-data" className="text-xs">Usar datos de ejemplo</Label>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                fetchStatus()
                fetchAvailability(useMockData)
              }}
              disabled={isLoading}
              className="h-7 text-xs"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              <span className="ml-1">Actualizar</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Columna izquierda: Estado y Eventos */}
          <div>
            {/* Estado */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-sm">Estado</h3>
                {status ? (
                  <div className={`px-2 py-0.5 text-xs rounded-full ${status.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status.connected ? 'Conectado' : 'Desconectado'}
                  </div>
                ) : null}
              </div>
              
              {status ? (
                <div className="border rounded-lg p-2 text-xs">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-medium">Conectado:</div>
                    <div className="col-span-2">{status.connected ? '✅ Sí' : '❌ No'}</div>
                    
                    <div className="font-medium">Habilitado:</div>
                    <div className="col-span-2">{status.enabled ? '✅ Sí' : '❌ No'}</div>
                    
                    <div className="font-medium">Mensaje:</div>
                    <div className="col-span-2 truncate">{status.message}</div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-2 flex items-center justify-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  <span className="text-xs text-muted-foreground">Cargando...</span>
                </div>
              )}
            </div>
            
            {/* Eventos */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-sm">Eventos encontrados: {availability?.events?.length || 0}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    onClick={handleGenerateEvents}
                    disabled={isLoading}
                    size="sm"
                    className="h-6 text-xs px-2"
                  >
                    <CalendarCheck className="h-3 w-3 mr-1" />
                    Generar ejemplos
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchAvailability(useMockData)}
                    disabled={isLoading}
                    className="h-6 text-xs px-2"
                  >
                    Actualizar
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center p-2 border rounded-lg">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  <span className="text-xs">Cargando eventos...</span>
                </div>
              ) : (
                availability ? (
                  availability.events?.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="max-h-[400px] overflow-y-auto p-2">
                        <ul className="space-y-2">
                          {availability.events.map((event: any, index: number) => (
                            <li key={index} className="border rounded-lg p-2 bg-card text-xs">
                              <div className="font-medium">{event.summary || 'Sin título'}</div>
                              <div className="text-muted-foreground flex items-center mt-1">
                                <CalendarCheck className="h-3 w-3 mr-1 flex-shrink-0" />
                                {new Date(event.start.dateTime || event.start.date).toLocaleTimeString()} - 
                                {new Date(event.end.dateTime || event.end.date).toLocaleTimeString()}
                              </div>
                              {event.description && (
                                <div className="mt-1 p-1 bg-muted/20 rounded">
                                  {event.description}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-2 text-xs text-muted-foreground">
                      No hay eventos disponibles para {selectedDate.toLocaleDateString()}
                    </div>
                  )
                ) : (
                  <div className="border rounded-lg p-2 text-xs text-muted-foreground">
                    Cargando información de disponibilidad...
                  </div>
                )
              )}
            </div>
          </div>
          
          {/* Columna derecha: Selección de fecha y datos crudos */}
          <div>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-sm">Seleccionar Fecha</h3>
                <div className="text-xs text-muted-foreground">
                  {selectedDate.toLocaleDateString()}
                </div>
              </div>
              
              <div className="border rounded-lg p-2">
                <div className="grid grid-cols-4 gap-1 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const date = new Date();
                      setSelectedDate(date);
                      fetchAvailability(useMockData, date);
                    }}
                    className="h-6 text-xs"
                  >
                    Hoy
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 1);
                      setSelectedDate(date);
                      fetchAvailability(useMockData, date);
                    }}
                    className="h-6 text-xs"
                  >
                    Mañana
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const date = new Date(2024, 4, 10); // 10 de mayo
                      setSelectedDate(date);
                      fetchAvailability(useMockData, date);
                    }}
                    className="h-6 text-xs"
                  >
                    10/05
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const date = new Date(2024, 4, 13); // 13 de mayo
                      setSelectedDate(date);
                      fetchAvailability(useMockData, date);
                    }}
                    className="h-6 text-xs"
                  >
                    13/05
                  </Button>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={checkSpecificDates}
                  disabled={isLoading}
                  className="w-full h-6 text-xs"
                >
                  Verificar fechas específicas
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-1">Datos Crudos</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-medium">Estado:</h4>
                    {availability?.is_mock_data && (
                      <div className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Datos de ejemplo
                      </div>
                    )}
                  </div>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32 text-[10px]">
                    {JSON.stringify(status, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium mb-1">Disponibilidad:</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32 text-[10px]">
                    {JSON.stringify(availability, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 