"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

// Define el esquema de validación simplificado
const eventFormSchema = z.object({
  title: z.string().min(2, {
    message: "El título debe tener al menos 2 caracteres.",
  }),
  startTime: z.string({
    required_error: "Se requiere hora de inicio.",
  }),
  duration: z.string({
    required_error: "Se requiere seleccionar una duración.",
  }),
  clientName: z.string().min(2, {
    message: "El nombre del cliente debe tener al menos 2 caracteres.",
  }),
  clientPhone: z.string().min(8, {
    message: "El número de teléfono debe tener al menos 8 dígitos.",
  }).regex(/^\d+$/, {
    message: "El número de teléfono debe contener solo dígitos."
  })
})

type EventFormValues = z.infer<typeof eventFormSchema>

// Opciones de duración disponibles
const durationOptions = [
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1 hora y 30 minutos" },
  { value: "120", label: "2 horas" },
];

// Componente de formulario de eventos simplificado
export default function EventForm({
  businessId,
  event,
  onClose,
  onSuccess,
  isLoading = false,
  selectedDate
}: {
  businessId: string;
  event?: any;
  onClose: () => void;
  onSuccess: (eventData: any) => void;
  isLoading?: boolean;
  selectedDate: Date;
}) {
  // Determinar si es edición o creación
  const isEditing = !!event?.id;
  
  // Detectar duración en minutos para eventos existentes
  const getDurationFromEvent = (event: any): string => {
    if (!event) return "60"; // 1 hora por defecto
    
    try {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      
      // Devolver la duración en minutos como string, o el valor más cercano de las opciones disponibles
      const validDurations = durationOptions.map(option => parseInt(option.value));
      const closestDuration = validDurations.reduce((prev, curr) => 
        Math.abs(curr - durationMinutes) < Math.abs(prev - durationMinutes) ? curr : prev
      );
      
      return closestDuration.toString();
    } catch (error) {
      console.error("Error calculando duración:", error);
      return "60"; // Valor por defecto si hay error
    }
  };
  
  // Configurar valores predeterminados del formulario
  const getDefaultValues = () => {
    if (event) {
      const startDate = new Date(event.start);
      
      return {
        title: event.title || "",
        startTime: format(startDate, "HH:mm"),
        duration: getDurationFromEvent(event),
        clientName: event.description?.match(/Nombre: (.+?)(?:\n|$)/)?.[1] || "",
        clientPhone: event.description?.match(/Teléfono: (.+?)(?:\n|$)/)?.[1] || "",
      }
    }
    
    // Valores por defecto para nuevo evento
    return {
      title: "",
      startTime: "09:00",
      duration: "60", // 1 hora por defecto
      clientName: "",
      clientPhone: "",
    }
  }
  
  // Inicializar el formulario con react-hook-form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: getDefaultValues(),
  })
  
  // Enviar el formulario
  const onSubmit = async (data: EventFormValues) => {
    try {
      // Construir objetos de fecha completos
      const startDateTime = new Date(selectedDate);
      const [startHour, startMinute] = data.startTime.split(":").map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      // Calcular fecha/hora de fin según la duración seleccionada (en minutos)
      const durationMinutes = parseInt(data.duration);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
      
      // Construir la descripción con nombre y teléfono del cliente
      const description = `Nombre: ${data.clientName}\nTeléfono: ${data.clientPhone}`;
      
      // Preparar datos para la API
      const eventData = {
        businessId: businessId,
        date: startDateTime.toISOString().slice(0, 10), // YYYY-MM-DD
        time: data.startTime, // HH:mm
        phone: data.clientPhone,
        title: data.title,
        // Puedes agregar otros campos si el backend los soporta
      };
      
      // Endpoint y método según sea crear o actualizar
      const endpoint = "http://localhost:3095/api/calendar/events";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing 
        ? { ...eventData, event_id: event.id }
        : eventData;
      
      console.log("Enviando evento a la API:", payload);
      
      // Llamar a la API
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log("Respuesta de la API:", result);
      
      if (!result.success) {
        throw new Error(result.error || "Error al guardar el evento");
      }
      
      toast({
        title: isEditing ? "Evento actualizado" : "Evento creado",
        description: `El evento "${data.title}" ha sido ${isEditing ? "actualizado" : "creado"} correctamente.`,
      });
      
      onSuccess(result.event);
    } catch (error: any) {
      console.error("Error al guardar evento:", error);
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al guardar el evento",
        variant: "destructive",
      });
    }
  }
  
  return (
    <div className="max-h-[85vh] overflow-y-auto px-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-sm text-muted-foreground mb-4">
            Fecha seleccionada: <span className="font-semibold">{format(selectedDate, "EEEE, d MMMM yyyy", { locale: es })}</span>
          </div>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título del evento</FormLabel>
                <FormControl>
                  <Input placeholder="Reunión con cliente..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de inicio</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 48 }, (_, i) => {
                      const hour = Math.floor(i / 2);
                      const minute = (i % 2) * 30;
                      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                      return (
                        <SelectItem key={i} value={timeString}>
                          {timeString}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar duración" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="clientPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono del cliente</FormLabel>
                <FormControl>
                  <Input placeholder="5551234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Actualizar" : "Crear"} evento
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 