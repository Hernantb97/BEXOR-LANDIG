import { useState, useEffect } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Save, Info, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"

interface TimeSlot {
  from: string
  to: string
}

interface DaySchedule {
  enabled: boolean
  timeSlots: TimeSlot[]
}

interface ScheduleData {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

interface BusinessScheduleEditorProps {
  businessId: string
  onAfterSave?: () => void;
}

export default function BusinessScheduleEditor({ businessId, onAfterSave }: BusinessScheduleEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    monday: { enabled: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
    tuesday: { enabled: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
    wednesday: { enabled: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
    thursday: { enabled: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
    friday: { enabled: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
    saturday: { enabled: false, timeSlots: [{ from: '10:00', to: '14:00' }] },
    sunday: { enabled: false, timeSlots: [{ from: '10:00', to: '14:00' }] }
  })
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [allowOverlapping, setAllowOverlapping] = useState(false)
  const [maxOverlapping, setMaxOverlapping] = useState(1)

  // Mapeo de nombres de días en español
  const dayNames: Record<keyof ScheduleData, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }

  // Opciones de horas para los selectores
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return {
      value: `${hour}:00`,
      label: `${hour}:00`
    }
  })

  // Cargar horarios del negocio al iniciar
  useEffect(() => {
    if (!businessId) return;
    const fetchSchedule = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3095/api/business/hours/${businessId}`);
        const data = await response.json();
        console.log('Datos recibidos del backend:', data.data); // DEPURACIÓN
        if (data.success && data.data) {
          // Adaptar los datos recibidos al estado local
          const backendHours = data.data.hours || {};
          const newSchedule: ScheduleData = {
            monday: { enabled: backendHours.monday?.length > 0, timeSlots: backendHours.monday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [{ from: '09:00', to: '17:00' }] },
            tuesday: { enabled: backendHours.tuesday?.length > 0, timeSlots: backendHours.tuesday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [{ from: '09:00', to: '17:00' }] },
            wednesday: { enabled: backendHours.wednesday?.length > 0, timeSlots: backendHours.wednesday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [{ from: '09:00', to: '17:00' }] },
            thursday: { enabled: backendHours.thursday?.length > 0, timeSlots: backendHours.thursday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [{ from: '09:00', to: '17:00' }] },
            friday: { enabled: backendHours.friday?.length > 0, timeSlots: backendHours.friday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [{ from: '09:00', to: '17:00' }] },
            saturday: { enabled: backendHours.saturday?.length > 0, timeSlots: backendHours.saturday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [{ from: '10:00', to: '14:00' }] },
            sunday: { enabled: backendHours.sunday?.length > 0, timeSlots: backendHours.sunday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [{ from: '10:00', to: '14:00' }] },
          };
          setScheduleData(newSchedule);
          setAllowOverlapping(Boolean(data.data.allowOverlapping));
          setMaxOverlapping(Number(data.data.maxOverlapping) || 1);
        } else {
          setError(data.error || 'No se pudieron cargar los horarios.');
        }
      } catch (err) {
        setError('No se pudieron cargar los horarios. Inténtalo de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, [businessId]);

  const saveBusinessSchedule = async () => {
    if (!businessId) return

    setIsSaving(true)
    setError(null)

    try {
      // Adaptar los datos al formato esperado por el backend
      const hours: Record<string, { start: string, end: string }[]> = {}
      Object.entries(scheduleData).forEach(([day, dayData]) => {
        hours[day] = dayData.enabled
          ? dayData.timeSlots.map((slot: TimeSlot) => ({ start: slot.from, end: slot.to }))
          : []
      })

      const payload: any = {
        businessId,
        hours,
        allowOverlapping,
        maxOverlapping: allowOverlapping ? maxOverlapping : 1
      }
      console.log('Guardando horarios...', payload)

      const response = await fetch('http://localhost:3095/api/business/hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      console.log('Respuesta del backend al guardar horarios:', data)
      if (data.success) {
        toast({
          title: "Horarios guardados",
          description: "Los horarios de atención han sido actualizados correctamente.",
        })
        if (onAfterSave) onAfterSave();
      } else {
        setError(data.error || "No se pudieron guardar los horarios. Inténtalo de nuevo más tarde.")
      }
    } catch (err) {
      console.error("Error al guardar horarios:", err)
      setError("No se pudieron guardar los horarios. Inténtalo de nuevo más tarde.")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleDayEnabled = (day: keyof ScheduleData) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }))
  }

  const addTimeSlot = (day: keyof ScheduleData) => {
    setScheduleData(prev => {
      const updatedDay = { ...prev[day] }
      const lastSlot = updatedDay.timeSlots[updatedDay.timeSlots.length - 1]
      
      // Calculamos un horario lógico para el nuevo slot basado en el último
      let newFrom = '09:00'
      let newTo = '17:00'
      
      if (lastSlot) {
        // Intentamos poner el nuevo slot una hora después del último
        const [lastHour, lastMinute] = lastSlot.to.split(':').map(Number)
        const fromHour = lastHour
        const toHour = (lastHour + 1 > 23) ? 23 : lastHour + 1
        
        newFrom = `${fromHour.toString().padStart(2, '0')}:${lastMinute.toString().padStart(2, '0')}`
        newTo = `${toHour.toString().padStart(2, '0')}:${lastMinute.toString().padStart(2, '0')}`
      }
      
      updatedDay.timeSlots = [
        ...updatedDay.timeSlots,
        { from: newFrom, to: newTo }
      ]
      
      return {
        ...prev,
        [day]: updatedDay
      }
    })
  }

  const removeTimeSlot = (day: keyof ScheduleData, index: number) => {
    setScheduleData(prev => {
      const updatedDay = { ...prev[day] }
      updatedDay.timeSlots = updatedDay.timeSlots.filter((_, i) => i !== index)
      
      // Asegurarnos de que siempre haya al menos un slot
      if (updatedDay.timeSlots.length === 0) {
        updatedDay.timeSlots = [{ from: '09:00', to: '17:00' }]
      }
      
      return {
        ...prev,
        [day]: updatedDay
      }
    })
  }

  const updateTimeSlot = (day: keyof ScheduleData, index: number, field: 'from' | 'to', value: string) => {
    setScheduleData(prev => {
      const updatedDay = { ...prev[day] }
      updatedDay.timeSlots = updatedDay.timeSlots.map((slot, i) => {
        if (i === index) {
          return { ...slot, [field]: value }
        }
        return slot
      })
      
      return {
        ...prev,
        [day]: updatedDay
      }
    })
  }

  const copyScheduleToAllDays = (sourceDay: keyof ScheduleData) => {
    setScheduleData(prev => {
      const sourceDayData = prev[sourceDay]
      const newSchedule = { ...prev }
      
      Object.keys(prev).forEach(day => {
        if (day !== sourceDay) {
          newSchedule[day as keyof ScheduleData] = {
            enabled: sourceDayData.enabled,
            timeSlots: [...sourceDayData.timeSlots.map(slot => ({ ...slot }))]
          }
        }
      })
      
      return newSchedule
    })
    
    toast({
      title: "Horarios copiados",
      description: `Los horarios del ${dayNames[sourceDay]} han sido copiados a todos los días.`,
    })
  }

  const copyScheduleToWeekdays = (sourceDay: keyof ScheduleData) => {
    setScheduleData(prev => {
      const sourceDayData = prev[sourceDay]
      const newSchedule = { ...prev }
      const weekdays: (keyof ScheduleData)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      
      weekdays.forEach(day => {
        if (day !== sourceDay) {
          newSchedule[day] = {
            enabled: sourceDayData.enabled,
            timeSlots: [...sourceDayData.timeSlots.map(slot => ({ ...slot }))]
          }
        }
      })
      
      return newSchedule
    })
    
    toast({
      title: "Horarios copiados",
      description: `Los horarios del ${dayNames[sourceDay]} han sido copiados a todos los días laborables.`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">
            Cargando horarios de atención...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 overflow-y-auto mb-8" style={{maxHeight: '45vh'}}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Configuración de Horarios</h2>
          <p className="text-sm text-muted-foreground">
            Define los horarios de atención para cada día de la semana.
          </p>
        </div>
        <Button
          onClick={saveBusinessSchedule}
          disabled={isSaving}
          className="flex items-center"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Horarios
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Alert variant="default" className="bg-primary-50 border-primary-100">
        <Info className="h-4 w-4 mr-2 text-primary" />
        <AlertDescription className="text-black text-sm">
          Estos horarios se aplicarán al calendario para determinar cuándo están disponibles las citas.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-4">
        {Object.entries(scheduleData).map(([day, dayData]) => {
          const typedDay = day as keyof ScheduleData
          
          return (
            <Card key={day} className={cn(
              "overflow-hidden", 
              !dayData.enabled && "opacity-70"
            )}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={dayData.enabled}
                      onCheckedChange={() => toggleDayEnabled(typedDay)}
                      id={`enable-${day}`}
                    />
                    <Label htmlFor={`enable-${day}`} className="font-medium">
                      {dayNames[typedDay]}
                    </Label>
                    {!dayData.enabled && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Cerrado)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-xs">
                      <Select onValueChange={(value) => {
                        if (value === 'copyToAll') {
                          copyScheduleToAllDays(typedDay)
                        } else if (value === 'copyToWeekdays') {
                          copyScheduleToWeekdays(typedDay)
                        }
                      }}>
                        <SelectTrigger className="h-7 w-[130px] text-xs">
                          <SelectValue placeholder="Copiar horario" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="copyToAll">Copiar a todos</SelectItem>
                          <SelectItem value="copyToWeekdays">Copiar a L-V</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className={cn("space-y-3", !dayData.enabled && "opacity-50")}>
                  {dayData.timeSlots.map((slot: TimeSlot, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm mr-2">Horario {index + 1}:</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select
                          disabled={!dayData.enabled}
                          value={slot.from}
                          onValueChange={(value) => updateTimeSlot(typedDay, index, 'from', value)}
                        >
                          <SelectTrigger className="w-[90px] h-8">
                            <SelectValue placeholder="Desde" />
                          </SelectTrigger>
                          <SelectContent>
                            {hourOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <span className="text-sm">a</span>
                        
                        <Select
                          disabled={!dayData.enabled}
                          value={slot.to}
                          onValueChange={(value) => updateTimeSlot(typedDay, index, 'to', value)}
                        >
                          <SelectTrigger className="w-[90px] h-8">
                            <SelectValue placeholder="Hasta" />
                          </SelectTrigger>
                          <SelectContent>
                            {hourOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!dayData.enabled || dayData.timeSlots.length <= 1}
                          onClick={() => removeTimeSlot(typedDay, index)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!dayData.enabled}
                    onClick={() => addTimeSlot(typedDay)}
                    className="text-xs mt-2"
                  >
                    + Añadir horario
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 