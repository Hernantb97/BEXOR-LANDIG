"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { AlertCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Loader2, Plus, PenSquare, Trash2, ChevronUp } from "lucide-react"
import { addDays, addMonths, eachDayOfInterval, endOfMonth, format, isBefore, isSameDay, isSameMonth, startOfDay, startOfMonth, subDays, subMonths, isToday, parseISO, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import { useCallback } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import EventForm from "@/components/event-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Event {
  id: string;
  start: Date;
  end: Date;
  title: string;
  description?: string;
  location?: string;
  status?: string;
  attendees?: any[];
  htmlLink?: string;
  name?: string;
  phone?: string;
  customer_name?: string;
}

interface BusinessHoursTimeSlot {
  from: string;
  to: string;
}

interface DaySchedule {
  enabled: boolean;
  timeSlots: BusinessHoursTimeSlot[];
}

interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface CalendarAvailabilityProps {
  businessId: string;
  defaultDate?: Date;
  timeSlotDuration?: number; // en minutos, default: 30
  startTime?: number; // hora de inicio (0-23), default: 0 (12am)
  endTime?: number; // hora final (0-23), default: 24 (12am)
  onSelectTimeSlot?: (date: Date, timeString: string) => void;
}

export default function CalendarAvailabilitySelector({
  businessId,
  defaultDate = new Date(),
  timeSlotDuration = 30,
  startTime = 0,
  endTime = 24,
  onSelectTimeSlot,
}: CalendarAvailabilityProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(defaultDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showTimeSlots, setShowTimeSlots] = useState<boolean>(false)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingMonth, setIsLoadingMonth] = useState<boolean>(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month')
  const [dayEvents, setDayEvents] = useState<Event[]>([])
  const { toast } = useToast()
  const [statusMessage, setStatusMessage] = useState<{ type: string; message: string }>({ type: '', message: '' })
  const [showDialog, setShowDialog] = useState<boolean>(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false)
  const [canManageEvents, setCanManageEvents] = useState<boolean>(true) // Podría venir de un prop o verificación de permisos
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null)
  const [isLoadingBusinessHours, setIsLoadingBusinessHours] = useState<boolean>(false)

  // Cargar eventos del mes actual para mostrar indicadores en el calendario
  useEffect(() => {
    if (currentMonth) {
      fetchMonthEvents(currentMonth);
    }
  }, [currentMonth, businessId]);

  // Cargar horarios de atención al iniciar
  useEffect(() => {
    fetchBusinessHours();
  }, [businessId]);

  // Generar time slots y cargar eventos cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate]);

  const fetchMonthEvents = async (month: Date) => {
    if (!businessId) return;
    
    setIsLoadingMonth(true);
    console.log(`Fetching events for month: ${format(month, 'MMMM yyyy', { locale: es })}`);
    
    try {
      const response = await fetch('http://localhost:3095/api/calendar/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: businessId,
          month: format(month, 'yyyy-MM')
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error al obtener eventos del mes:", errorText);
        setStatusMessage({
          type: 'error',
          message: 'No se pudieron cargar los eventos del calendario'
        });
        setIsLoadingMonth(false);
        return;
      }
      
      const data = await response.json();
      console.log("Respuesta de API para el mes:", data);
      
      if (data.success) {
        // Si no hay eventos, mostrar un mensaje informativo
        if (!data.events || data.events.length === 0) {
          console.log("No hay eventos disponibles para este mes");
          setStatusMessage({
            type: 'info',
            message: 'No hay eventos programados en este mes'
          });
          setEvents([]);
          return;
        }
        
        // Transformar los eventos recibidos al formato que espera el componente
        const calendarEvents: Event[] = data.events.map((event: {
          id: string;
          start: { dateTime: string; date: string };
          end: { dateTime: string; date: string };
          summary: string;
          description?: string;
          location?: string;
          status: string;
          attendees?: any[];
          htmlLink?: string;
        }) => {
          // Intentar usar dateTime y si no existe usar date, garantizando que usamos la fecha correcta
          const startDateTime = event.start.dateTime || event.start.date;
          const endDateTime = event.end.dateTime || event.end.date;
          
          return {
            id: event.id,
            start: new Date(startDateTime),
            end: new Date(endDateTime),
            title: event.summary || 'Evento sin título',
            description: event.description || '',
            location: event.location || '',
            status: event.status,
            attendees: event.attendees || [],
            htmlLink: event.htmlLink || '',
            customer_name: event.summary && event.summary.match(/^Cita agendada por WhatsApp para (.+)$/) ? event.summary.match(/^Cita agendada por WhatsApp para (.+)$/)![1] : '',
          };
        }).filter((event: Event) => event.status !== 'cancelled');
        
        console.log("Se encontraron eventos para el mes:", calendarEvents.length);
        if (calendarEvents.length > 0) {
          console.log("Primer evento transformado:", calendarEvents[0]);
        }
        
        setEvents(calendarEvents);
      } else {
        console.error("Error en respuesta de API para eventos del mes:", data.error);
        setStatusMessage({
          type: 'error',
          message: data.error || 'Error al obtener eventos'
        });
      }
    } catch (error) {
      console.error("Error al cargar eventos del mes:", error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar el calendario'
      });
    } finally {
      setIsLoadingMonth(false);
    }
  };

  const fetchAvailability = async (selectedDate: Date) => {
    if (!businessId) return;
    
    console.log(`Obteniendo disponibilidad para fecha:`, selectedDate.toISOString());
    setIsLoadingSlots(true);
    setTimeSlots([]);
    setDayEvents([]); // Limpiar eventos existentes
    setShowTimeSlots(false); // Asegurarse de que no se muestran los time slots automáticamente
    
    try {
      // Formatear la fecha para enviarla a la API - usamos UTC para evitar problemas de zona horaria
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      console.log("Consultando disponibilidad con fecha:", dateString);
      
      const response = await fetch('http://localhost:3095/api/calendar/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: businessId,
          date: dateString,
          _ts: new Date().getTime()
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error al obtener disponibilidad:", errorText);
        setStatusMessage({
          type: 'error',
          message: 'No se pudo cargar la disponibilidad'
        });
        setIsLoadingSlots(false);
        return;
      }
      
      const data = await response.json();
      console.log("Respuesta de API para día específico:", data);
      
      if (data.success) {
        // Si hay eventos, procesarlos primero
        let processedEvents: Event[] = [];
        
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          console.log(`Procesando ${data.events.length} eventos recibidos de la API`);
          
          processedEvents = data.events.map((event: any) => {
            // Para debugging
            console.log("Evento original recibido:", event);
            
            // Definimos variables para start y end
            let startDate, endDate;
            let title = event.summary || 'Evento sin título';
            
            // Procesamiento correcto de la fecha de inicio según el formato que llega
            if (event.start) {
              if (typeof event.start === 'string') {
                startDate = new Date(event.start);
              } else if (event.start.dateTime) {
                startDate = new Date(event.start.dateTime);
              } else if (event.start.date) {
                startDate = new Date(event.start.date);
              }
            }
            
            // Procesamiento correcto de la fecha de fin según el formato que llega
            if (event.end) {
              if (typeof event.end === 'string') {
                endDate = new Date(event.end);
              } else if (event.end.dateTime) {
                endDate = new Date(event.end.dateTime);
              } else if (event.end.date) {
                endDate = new Date(event.end.date);
              }
            }
            
            // Si no se pudieron procesar las fechas, usar la fecha actual como fallback
            if (!startDate || isNaN(startDate.getTime())) {
              console.error("Error: Fecha de inicio inválida para evento", event);
              startDate = new Date();
            }
            
            if (!endDate || isNaN(endDate.getTime())) {
              console.error("Error: Fecha de fin inválida para evento", event);
              endDate = new Date(startDate.getTime() + 3600000); // 1 hora después
            }
            
            // Evento procesado
            const processedEvent = {
              id: event.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
              start: startDate,
              end: endDate,
              title: title,
              description: event.description || '',
              location: event.location || '',
              status: event.status || 'confirmed',
              attendees: event.attendees || [],
              htmlLink: event.htmlLink || '',
              customer_name: event.summary && event.summary.match(/^Cita agendada por WhatsApp para (.+)$/) ? event.summary.match(/^Cita agendada por WhatsApp para (.+)$/)![1] : '',
            };
            
            console.log("Evento procesado:", processedEvent);
            return processedEvent;
          }).filter((event: Event) => event.status !== 'cancelled');
        
          console.log(`Se encontraron ${processedEvents.length} eventos procesados para el día seleccionado`);
        }
        
        // Filtrar eventos solo para el día seleccionado
        const eventsForDay = filterDayEvents(processedEvents, selectedDate);
        console.log(`Eventos específicos para el día ${format(selectedDate, 'yyyy-MM-dd')}: ${eventsForDay.length}`);
          
        setDayEvents(eventsForDay);
        
        // Si tenemos eventos para este día, mostrar vista diaria
        if (eventsForDay.length > 0) {
          console.log("Hay eventos este día, mostrando vista de día");
          setViewMode('day');
          setIsLoadingSlots(false);
          setStatusMessage({
            type: 'info',
            message: `${eventsForDay.length} eventos encontrados para este día.`
          });
          return;
        } else {
          // Verificar si hay eventos para este día en los eventos globales
          if (events.length > 0) {
            const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
            const matchingEvents = events.filter(event => {
              if (!(event.start instanceof Date)) return false;
              const eventDate = format(event.start, 'yyyy-MM-dd');
              return eventDate === formattedSelectedDate;
            });
            
            if (matchingEvents.length > 0) {
              console.log(`Encontrados ${matchingEvents.length} eventos para ${formattedSelectedDate} en eventos globales`);
              setDayEvents(matchingEvents);
              setViewMode('day');
              setIsLoadingSlots(false);
              setStatusMessage({
                type: 'info',
                message: `${matchingEvents.length} eventos encontrados para este día.`
              });
              return;
            }
          }
        }
        
        // Si no hay eventos, también mostrar vista diaria en lugar de solo time slots
        console.log("No hay eventos para esta fecha, mostrando día vacío");
        setViewMode('day');
        setIsLoadingSlots(false);
        
        // Mensaje informativo
        setStatusMessage({
          type: 'info',
          message: 'No hay eventos programados para este día.'
        });
      } else {
        console.error("Error en respuesta de API:", data.error);
        setStatusMessage({
          type: 'error',
          message: data.error || 'Error al obtener disponibilidad'
        });
        setIsLoadingSlots(false);
      }
    } catch (error) {
      console.error("Error al cargar disponibilidad:", error);
      setStatusMessage({
        type: 'error',
        message: 'Error al cargar disponibilidad'
      });
      setIsLoadingSlots(false);
    }
  };

  // Nueva función para obtener los horarios de atención
  const fetchBusinessHours = async () => {
    if (!businessId) return;
    setIsLoadingBusinessHours(true);
    try {
      const response = await fetch(`http://localhost:3095/api/business/hours/${businessId}`);
      const data = await response.json();
      if (data.success && data.data && data.data.hours) {
        // Adaptar la respuesta del backend al formato esperado
        const backendHours = data.data.hours;
        const businessHours: BusinessHours = {
          monday: { enabled: backendHours.monday?.length > 0, timeSlots: backendHours.monday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [] },
          tuesday: { enabled: backendHours.tuesday?.length > 0, timeSlots: backendHours.tuesday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [] },
          wednesday: { enabled: backendHours.wednesday?.length > 0, timeSlots: backendHours.wednesday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [] },
          thursday: { enabled: backendHours.thursday?.length > 0, timeSlots: backendHours.thursday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [] },
          friday: { enabled: backendHours.friday?.length > 0, timeSlots: backendHours.friday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [] },
          saturday: { enabled: backendHours.saturday?.length > 0, timeSlots: backendHours.saturday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [] },
          sunday: { enabled: backendHours.sunday?.length > 0, timeSlots: backendHours.sunday?.map((slot: any) => ({ from: slot.start, to: slot.end })) || [] },
        };
        setBusinessHours(businessHours);
        console.log("Horarios de atención cargados:", businessHours);
      } else {
        setBusinessHours(null);
        console.error("No se pudieron cargar los horarios de atención del backend.", data.error);
      }
    } catch (error) {
      setBusinessHours(null);
      console.error("Error al cargar horarios de atención:", error);
    } finally {
      setIsLoadingBusinessHours(false);
    }
  };

  // Función para determinar si un horario está dentro de los horarios de atención
  const isWithinBusinessHours = (date: Date, timeString: string): boolean => {
    if (!businessHours) return true; // Si no hay horarios configurados, permitimos todos
    
    // Determinar qué día de la semana es
    const dayOfWeek = format(date, 'EEEE', { locale: es }).toLowerCase();
    const dayKey = getDayKey(dayOfWeek);
    
    if (!dayKey) return false;
    
    // Verificar si este día está habilitado para atención
    const daySchedule = businessHours[dayKey];
    if (!daySchedule.enabled) return false;
    
    // Convertir timeString a minutos para comparar fácilmente
    const [hours, minutes] = timeString.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    // Verificar si el horario está dentro de alguno de los rangos configurados
    return daySchedule.timeSlots.some(slot => {
      const [fromHours, fromMinutes] = slot.from.split(':').map(Number);
      const [toHours, toMinutes] = slot.to.split(':').map(Number);
      
      const fromInMinutes = fromHours * 60 + fromMinutes;
      const toInMinutes = toHours * 60 + toMinutes;
      
      return timeInMinutes >= fromInMinutes && timeInMinutes < toInMinutes;
    });
  };
  
  // Función auxiliar para convertir el nombre del día en español a la clave en BusinessHours
  const getDayKey = (dayName: string): keyof BusinessHours | null => {
    const dayMapping: Record<string, keyof BusinessHours> = {
      'lunes': 'monday',
      'martes': 'tuesday',
      'miércoles': 'wednesday',
      'jueves': 'thursday',
      'viernes': 'friday',
      'sábado': 'saturday',
      'domingo': 'sunday'
    };
    
    return dayMapping[dayName] || null;
  };
  
  // Función para verificar si un día está habilitado para atención
  const isDayEnabled = (date: Date): boolean => {
    if (!businessHours) return true;
    
    const dayOfWeek = format(date, 'EEEE', { locale: es }).toLowerCase();
    const dayKey = getDayKey(dayOfWeek);
    
    if (!dayKey) return false;
    
    return businessHours[dayKey].enabled;
  };

  // Mejorar la función de generación de slots con la información de eventos y horarios de atención
  const generateTimeSlots = (events: Event[]) => {
    console.log("Generando time slots con información de", events.length, "eventos");
    const slots: TimeSlot[] = [];
    
    if (!selectedDate) return;
    
    // Crear slots para cada intervalo de tiempo
    for (let hour = startTime; hour < endTime; hour++) {
      for (let minute = 0; minute < 60; minute += timeSlotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotStart = new Date(selectedDate!);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + timeSlotDuration);
        
        // Verificar si está ocupado (se superpone con algún evento)
        let isAvailable = true;
        for (const event of events) {
          if (slotStart < event.end && slotEnd > event.start) {
            isAvailable = false;
            break;
          }
        }
        
        // Verificar si está dentro de los horarios de atención configurados
        const isWithinHours = isWithinBusinessHours(selectedDate, timeString);
        
        // Un slot solo está disponible si no tiene eventos y está dentro de los horarios de atención
        slots.push({
          time: timeString,
          available: isAvailable && isWithinHours
        });
      }
    }
    
    console.log(`Generados ${slots.length} slots de tiempo (${slots.filter(s => s.available).length} disponibles)`);
    setTimeSlots(slots);
    setShowTimeSlots(true);
  };

  // Mejorar la función de filtrado para garantizar que solo contamos eventos del día seleccionado
  const filterDayEvents = (processedEvents: Event[], selectedDate: Date) => {
    // Asegurarse de que los eventos son válidos
    if (!processedEvents || !Array.isArray(processedEvents) || processedEvents.length === 0) {
      console.log("No hay eventos para filtrar");
      return [];
    }

    // Normalizar la fecha seleccionada para comparar solo fecha sin hora
    const selectedDateNormalized = new Date(selectedDate);
    selectedDateNormalized.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDateNormalized);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    console.log(`Filtrando ${processedEvents.length} eventos para el día ${formattedSelectedDate}`);
    
    // Filtrar los eventos que ocurren en el día seleccionado
    const filteredEvents = processedEvents.filter(event => {
      // Verificar que las fechas son válidas
      if (!(event.start instanceof Date) || isNaN(event.start.getTime()) ||
          !(event.end instanceof Date) || isNaN(event.end.getTime())) {
        console.error("Evento con fechas inválidas:", event);
        return false;
      }
      
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const eventStartDate = format(eventStart, 'yyyy-MM-dd');
      const eventEndDate = format(eventEnd, 'yyyy-MM-dd');
      
      // Solución temporal: forzar la comparación como strings en formato yyyy-MM-dd
      // Esto evita problemas con zonas horarias
      if (eventStartDate === formattedSelectedDate || eventEndDate === formattedSelectedDate) {
        console.log(`Evento "${event.title}" INCLUIDO por coincidencia de fecha: Inicio=${eventStartDate}, Fin=${eventEndDate}, Seleccionada=${formattedSelectedDate}`);
        return true;
      }
      
      // Normalizar las fechas para comparar solo la fecha sin la hora
      const eventStartNormalized = new Date(eventStartDate);
      const eventEndNormalized = new Date(eventEndDate);
      
      // Un evento pertenece al día si:
      // 1. Comienza durante el día, o
      // 2. Termina durante el día, o
      // 3. Comienza antes del día y termina después (abarca todo el día)
      const startsDuringDay = eventStart >= selectedDateNormalized && eventStart < nextDay;
      const endsDuringDay = eventEnd > selectedDateNormalized && eventEnd <= nextDay;
      const spansDuringDay = eventStart <= selectedDateNormalized && eventEnd >= nextDay;
      
      const isEventOnSelectedDay = startsDuringDay || endsDuringDay || spansDuringDay;
      
      console.log(`Evento: ${event.title}, Inicio: ${eventStartDate}, Fin: ${eventEndDate}, ¿Mostrar?: ${isEventOnSelectedDay}`);
      
      return isEventOnSelectedDay;
    });
    
    console.log(`Filtrados: quedan ${filteredEvents.length} eventos para mostrar`);
    return filteredEvents;
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    
    if (onSelectTimeSlot && selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const selectedDateTime = new Date(selectedDate);
      selectedDateTime.setHours(hours, minutes, 0, 0);
      
      onSelectTimeSlot(selectedDateTime, time);
    }
  };

  const handleSelectDate = (date: Date) => {
    console.log(`Seleccionando fecha: ${format(date, 'yyyy-MM-dd')}`);
    setSelectedDate(date);
    setViewMode('day'); // Cambiar siempre a vista diaria al seleccionar una fecha
    fetchAvailability(date); // Obtener eventos específicamente para la fecha seleccionada
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePrevDay = () => {
    if (selectedDate) {
      const prevDay = subDays(selectedDate, 1);
      setSelectedDate(prevDay);
      fetchAvailability(prevDay);
    }
  };

  const handleNextDay = () => {
    if (selectedDate) {
      const nextDay = addDays(selectedDate, 1);
      setSelectedDate(nextDay);
      fetchAvailability(nextDay);
    }
  };

  const handleBackToCalendar = () => {
    setShowTimeSlots(false);
    setSelectedTime(null);
    setViewMode('month');
  };

  // Generar días del mes actual con la correcta alineación para los días de la semana
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Crear un array con los días del mes correctamente posicionados según el día de la semana
    const firstDayOfMonth = monthStart.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    
    // Ajustar para que la semana comience en lunes (0 = lunes, ..., 6 = domingo)
    // Si firstDayOfMonth es 0 (domingo), se convierte a 6 (último día si comenzamos en lunes)
    // Si no, se resta 1 para convertir a nuestro sistema (lunes = 0)
    const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Obtener días del mes anterior para rellenar la primera semana si es necesario
    const prevMonthDays = firstDayIndex > 0 
      ? eachDayOfInterval({ 
          start: new Date(monthStart.getFullYear(), monthStart.getMonth(), 0 - firstDayIndex + 1), 
          end: new Date(monthStart.getFullYear(), monthStart.getMonth(), 0)
        }) 
      : [];
    
    // Obtener días del mes siguiente para rellenar la última semana si es necesario
    const lastDayOfMonth = monthEnd.getDay();
    const nextMonthDaysCount = lastDayOfMonth === 0 ? 0 : 7 - (lastDayOfMonth === 0 ? 7 : lastDayOfMonth);
    const nextMonthDays = nextMonthDaysCount > 0 
      ? eachDayOfInterval({
          start: new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, 1),
          end: new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, nextMonthDaysCount)
        })
      : [];
    
    // Combinar días anteriores, actuales y siguientes
    return [...prevMonthDays, ...daysInMonth, ...nextMonthDays];
  };

  // Verificar si un día tiene eventos
  const hasEvents = (day: Date) => {
    if (!events || events.length === 0) return false;
    
    // Verificar la fecha sin importar la hora
    return events.some(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day.getDate() && 
             eventDate.getMonth() === day.getMonth() && 
             eventDate.getFullYear() === day.getFullYear();
    });
  };

  // Contar eventos por día para mostrar hasta 3 puntos
  const countDayEvents = (day: Date) => {
    if (!events || events.length === 0) return 0;
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day.getDate() && 
             eventDate.getMonth() === day.getMonth() && 
             eventDate.getFullYear() === day.getFullYear();
    }).length;
  };

  // Función mejorada para organizar eventos por hora
  const getEventsByHour = () => {
    if (!selectedDate || !dayEvents) {
      console.log("No hay fecha seleccionada o eventos para organizar por hora");
      return {};
    }
    
    console.log(`Organizando ${dayEvents.length} eventos por hora`);
    const eventsByHour: Record<string, Event[]> = {};
    
    // Inicializar todas las horas del día
    for (let hour = startTime; hour < endTime; hour++) {
      eventsByHour[hour] = [];
    }
    
    // Si no hay eventos, devolver el objeto vacío
    if (dayEvents.length === 0) {
      return eventsByHour;
    }
    
    // Asignar cada evento a las horas que abarca
    dayEvents.forEach(event => {
      // Verificar que las fechas son válidas
      if (!(event.start instanceof Date) || isNaN(event.start.getTime()) ||
          !(event.end instanceof Date) || isNaN(event.end.getTime())) {
        console.error("Evento inválido en getEventsByHour:", event);
        return;
      }
      
      // Determinar rango de horas para este evento en este día específico
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      const eventStartStr = format(event.start, 'yyyy-MM-dd');
      const eventEndStr = format(event.end, 'yyyy-MM-dd');
      
      // Calcular hora de inicio para este día
      let startHour = event.start.getHours();
      if (eventStartStr < selectedDateStr) {
        // Si el evento comienza en un día anterior, usar la primera hora del día
        startHour = 0;
      }
      
      // Calcular hora de fin para este día
      let endHour = event.end.getHours() + (event.end.getMinutes() > 0 ? 1 : 0);
      if (eventEndStr > selectedDateStr) {
        // Si el evento termina en un día posterior, usar la última hora del día
        endHour = 23;
      }
      
      // Ajustar al rango de horas visible
      startHour = Math.max(startHour, startTime);
      endHour = Math.min(endHour, endTime);
      
      console.log(`Evento "${event.title}" asignado a horas ${startHour}-${endHour}`);
      
      // Agregar el evento a cada hora que abarca
      for (let hour = startHour; hour < endHour; hour++) {
        if (!eventsByHour[hour]) {
          eventsByHour[hour] = [];
        }
        
        // Evitar duplicados
        if (!eventsByHour[hour].some(e => e.id === event.id)) {
          eventsByHour[hour].push(event);
        }
      }
    });
    
    // Informar sobre los eventos organizados
    Object.keys(eventsByHour).forEach(hour => {
      if (eventsByHour[Number(hour)].length > 0) {
        console.log(`Hora ${hour}: ${eventsByHour[Number(hour)].length} eventos`);
      }
    });
    
    return eventsByHour;
  };

  const toggleViewMode = () => {
    if (viewMode === 'month') {
      setViewMode('day');
      if (!selectedDate) {
        // Si no hay fecha seleccionada en el cambio a vista diaria, usar fecha actual
        setSelectedDate(new Date());
        fetchAvailability(new Date());
      }
    } else {
      setViewMode('month');
    }
  };

  // Crear nuevo evento
  const handleCreateEvent = () => {
    setDialogMode('create');
    setSelectedEvent(null);
    setShowDialog(true);
  };

  // Editar evento existente
  const handleEditEvent = (event: Event) => {
    setDialogMode('edit');
    setSelectedEvent(event);
    setShowDialog(true);
  };

  // Eliminar evento
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`http://localhost:3095/api/calendar/events?businessId=${businessId}&event_id=${selectedEvent.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar el evento');
      }
      
      toast({
        title: 'Evento eliminado',
        description: 'El evento ha sido eliminado correctamente',
      });
      
      // Recargar eventos
      if (selectedDate) {
        // Eliminar inmediatamente del estado local
        if (selectedEvent.id) {
          setDayEvents(prevEvents => prevEvents.filter(event => event.id !== selectedEvent.id));
          setEvents(prevEvents => prevEvents.filter(event => event.id !== selectedEvent.id));
        }
        
        // Esperar un momento y luego refrescar desde la API para asegurar que Google Calendar se haya actualizado
        setTimeout(() => {
          fetchAvailability(selectedDate);
          // También refrescar el mes para actualizar indicadores
          fetchMonthEvents(currentMonth);
        }, 1000);
      }
      
      setShowDeleteAlert(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('Error al eliminar evento:', error);
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al eliminar el evento',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Abrir modal de confirmación para eliminar
  const confirmDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteAlert(true);
  };

  // Manejar guardar/actualizar evento
  const handleEventSaved = (eventData: any) => {
    setShowDialog(false);
    setSelectedEvent(null);
    
    // Recargar calendario
    if (selectedDate) {
      // Forzar recarga de eventos para el día seleccionado
      console.log("Evento guardado, recargando eventos para el día:", format(selectedDate, 'yyyy-MM-dd'));
      // Limpiar datos actuales para forzar recarga completa
      setDayEvents([]);
      setEvents([]);
      // Esperar un momento antes de recargar para asegurar que Google Calendar se haya actualizado
      setTimeout(() => {
        fetchAvailability(selectedDate);
        // También refrescar el mes para actualizar indicadores
        fetchMonthEvents(currentMonth);
      }, 1000);
    } else {
      fetchMonthEvents(currentMonth);
    }
  };

  // Renderizar vista de mes
  const renderMonthView = () => (
    <div className="space-y-4 px-2 pt-2">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={handlePrevMonth}
          size="icon"
          className="h-9 w-9"
          disabled={isLoadingMonth}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold capitalize">
          {isLoadingMonth ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Cargando...</span>
            </div>
          ) : (
            format(currentMonth, 'MMMM yyyy', { locale: es })
          )}
        </h2>
        <Button
          variant="outline"
          onClick={handleNextMonth}
          size="icon"
          className="h-9 w-9"
          disabled={isLoadingMonth}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {statusMessage.type === 'error' && (
        <Alert variant="destructive" className="mb-3 py-2">
          <AlertCircle className="h-3 w-3" />
          <AlertTitle className="text-xs">Error</AlertTitle>
          <AlertDescription className="text-xs">{statusMessage.message}</AlertDescription>
        </Alert>
      )}
      
      {statusMessage.type === 'info' && (
        <Alert className="mb-3 py-2">
          <Clock className="h-3 w-3" />
          <AlertTitle className="text-xs">Información</AlertTitle>
          <AlertDescription className="text-xs">{statusMessage.message}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <div key={day} className="text-center font-medium text-xs py-1 text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {getDaysInMonth().map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isCurrentDay = isToday(day);
          const dayHasEvents = hasEvents(day);
          const eventsCount = countDayEvents(day);
          const dayEnabled = isDayEnabled(day);
          
          return (
            <Button
              key={i}
              variant={isSelected ? "default" : isCurrentDay ? "outline" : "ghost"}
              className={cn(
                "h-14 w-full p-0 flex flex-col justify-center items-center aria-selected:opacity-100",
                {
                  "text-muted-foreground": !isCurrentMonth,
                  "opacity-50": !dayEnabled && isCurrentMonth, // Agregar opacidad si el día no está habilitado
                  "hover:bg-muted hover:text-foreground": isCurrentMonth && dayEnabled, // Solo hover si está habilitado
                  "bg-primary text-primary-foreground": isSelected,
                  "border border-primary": isCurrentDay && !isSelected
                }
              )}
              disabled={!isCurrentMonth || !dayEnabled} // Deshabilitar el botón si el día no está habilitado
              onClick={() => isCurrentMonth && dayEnabled && handleSelectDate(day)}
            >
              <time dateTime={format(day, 'yyyy-MM-dd')} className="text-base font-medium">
                  {format(day, 'd')}
                </time>
                
              {isCurrentMonth && dayHasEvents && (
                <div className="flex justify-center mt-2 gap-1">
                  {Array.from({ length: Math.min(eventsCount, 3) }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  ))}
                  {eventsCount > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{eventsCount - 3}</span>
                  )}
                </div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );

  // Renderizar vista de día
  const renderDayView = () => {
    if (!selectedDate) {
      // Si no hay fecha seleccionada, mostrar mensaje
      return (
        <Card className="border-0 shadow-none">
          <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleBackToCalendar}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
              <CardTitle className="text-base font-medium">
                Vista diaria
              </CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 text-sm px-2"
              onClick={toggleViewMode}
            >
              Ver mes
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Selecciona un día del calendario para ver sus eventos.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Comprueba si hay eventos específicos para este día
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Buscar eventos en datos globales como fallback
    if (dayEvents.length === 0 && events.length > 0) {
      const matchingEvents = events.filter(event => {
        const eventDate = format(new Date(event.start), 'yyyy-MM-dd');
        return eventDate === formattedSelectedDate;
      });
      
      if (matchingEvents.length > 0) {
        setDayEvents(matchingEvents);
      }
    }

    const eventsByHour = getEventsByHour();
    
    // Verificar si el día está habilitado según los horarios de atención
    const isDayEnabledForAppointments = isDayEnabled(selectedDate);
    
    return (
      <Card className="border-0 shadow-none flex flex-col h-full">
        <CardHeader className="px-4 py-2 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="h-8 px-2 mr-1" onClick={handleBackToCalendar}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 mr-1 p-0"
              onClick={handlePrevDay}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-sm font-medium mx-2">
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 ml-1 p-0"
              onClick={handleNextDay}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            {canManageEvents && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setDialogMode('create');
                  setSelectedEvent(null);
                  setShowDialog(true);
                }}
                className="h-8 text-xs px-2"
                disabled={!isDayEnabledForAppointments} // Deshabilitar creación si el día no está habilitado
              >
                Crear Evento
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 text-xs px-2"
              onClick={toggleViewMode}
            >
              Ver mes
            </Button>
          </div>
        </CardHeader>
        
        {/* Mensaje si el día no está habilitado para citas */}
        {!isDayEnabledForAppointments && (
          <Alert variant="destructive" className="mx-4 my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Día no disponible</AlertTitle>
            <AlertDescription>Este día no está habilitado para agendar citas según los horarios de atención configurados.</AlertDescription>
          </Alert>
        )}
        
        <div className="flex-1 overflow-y-auto p-2 mt-4 mb-8" style={{maxHeight: '45vh'}}>
          <div className="grid grid-cols-[60px_1fr] gap-2">
            {(() => {
              if (!selectedDate || !businessHours) {
                // Fallback: mostrar todas las horas si no hay horarios configurados
                return Array.from({ length: endTime - startTime }).map((_, i) => {
                  const hour = startTime + i;
                  const hourString = hour.toString().padStart(2, '0') + ':00';
                  return (
                    <React.Fragment key={hour}>
                      <div className="py-2 text-right pr-2 text-muted-foreground text-sm sticky left-0">
                        {hourString}
                      </div>
                      <div className="border-t py-2 relative min-h-[60px]" />
                    </React.Fragment>
                  );
                });
              }
              // Obtener el día de la semana
              const dayOfWeek = format(selectedDate, 'EEEE', { locale: es }).toLowerCase();
              const dayKey = getDayKey(dayOfWeek);
              if (!dayKey || !businessHours[dayKey].enabled) return null;
              // Mostrar solo los intervalos habilitados
              return businessHours[dayKey].timeSlots.map((slot, idx) => {
                const fromHour = parseInt(slot.from.split(':')[0], 10);
                const toHour = parseInt(slot.to.split(':')[0], 10);
                // Mostrar hasta la última hora antes del cierre
                return Array.from({ length: toHour - fromHour + 1 }).map((_, i) => {
                  const hour = fromHour + i;
                  if (hour >= toHour) return null; // No mostrar la hora exacta de cierre
                  const hourString = hour.toString().padStart(2, '0') + ':00';
                  return (
                    <React.Fragment key={hour + '-' + idx}>
                      <div className="py-2 text-right pr-2 text-muted-foreground text-sm sticky left-0">
                        {hourString}
                      </div>
                      <div className="border-t py-2 relative min-h-[60px]">
                        {/* Renderizar eventos empalmados en columnas */}
                        {eventsByHour[hour] && eventsByHour[hour].length > 0 && (
                          <div className="flex h-full gap-1">
                            {eventsByHour[hour].map((event, eventIdx) => {
                              // Extraer nombre y teléfono de los campos directos o del título/description
                              const name = event.customer_name || event.name || (event.title && event.title.replace(/^Cita agendada por WhatsApp para /, '')) || '';
                              const phone = event.phone || (event.title && event.title.match(/\d{7,}/) ? event.title.match(/\d{7,}/)![0] : '');
                              return (
                                <div
                                  key={event.id + '-' + eventIdx}
                                  className="bg-primary/10 border border-primary/20 rounded p-1 overflow-hidden text-xs group cursor-pointer"
                                  style={{
                                    width: `${100 / eventsByHour[hour].length}%`,
                                    minWidth: 0,
                                    zIndex: 10
                                  }}
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <div className="font-semibold">{event.title}</div>
                                  {name && (
                                    <div className="text-xs">{name}</div>
                                  )}
                                  {phone && (
                                    <div className="text-xs text-muted-foreground">{phone}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                });
              });
            })()}
          </div>
        </div>
      </Card>
    );
  };

  // Renderizar vista de horarios
  const renderTimeSlotsView = () => (
    <Card>
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
        <Button variant="ghost" size="sm" onClick={handleBackToCalendar}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <CardTitle className="text-md font-medium">
          {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
        </CardTitle>
        {isLoadingSlots && (
          <div className="text-muted-foreground text-sm flex items-center">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Cargando...
          </div>
        )}
      </CardHeader>
      <CardContent className="py-4">
        {isLoadingSlots ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Cargando horarios disponibles...</p>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>No hay horarios configurados para este día.</p>
            <p className="text-sm">Selecciona otro día o contacta para más información.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedDate && "Horarios disponibles para " + format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}:
            </p>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : slot.available ? "outline" : "ghost"}
                  size="sm"
                  className={cn("w-full", {
                    "opacity-50 cursor-not-allowed": !slot.available,
                    "bg-primary text-primary-foreground": selectedTime === slot.time
                  })}
                  disabled={!slot.available}
                  onClick={() => slot.available && handleSelectTime(slot.time)}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </>
        )}

        {statusMessage.type === 'error' && (
          <div className="mt-4 p-2 border border-red-200 rounded bg-red-50 text-red-600 text-sm">
            <AlertCircle className="h-3 w-3 inline mr-1" />
            {statusMessage.message}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {viewMode === 'month' ? renderMonthView() : renderDayView()}
      
      {/* Modal de creación/edición de eventos */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Crear nuevo evento' : 'Editar evento'}</DialogTitle>
          </DialogHeader>
          <EventForm
            businessId={businessId}
            event={selectedEvent}
            onClose={() => setShowDialog(false)}
            onSuccess={handleEventSaved}
            isLoading={isSaving}
            selectedDate={selectedDate || new Date()}
          />
        </DialogContent>
      </Dialog>
      
      {/* Alerta de confirmación para eliminar */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el evento "{selectedEvent?.title}" del calendario y no puede deshacerse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteEvent();
              }}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 