"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"

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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Schema para validación del formulario
const eventFormSchema = z.object({
  summary: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres",
  }),
  description: z.string().optional(),
  location: z.string().optional(),
  attendeesString: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface CalendarEventFormProps {
  businessId: string;
  startDate: Date;
  endDate: Date;
  onSuccess?: (eventData: any) => void;
  onCancel?: () => void;
}

export default function CalendarEventForm({
  businessId,
  startDate,
  endDate,
  onSuccess,
  onCancel
}: CalendarEventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Valores por defecto
  const defaultValues: Partial<EventFormValues> = {
    summary: "",
    description: "",
    location: "",
    attendeesString: "",
  }

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  })

  const onSubmit = async (data: EventFormValues) => {
    if (!businessId || !startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Faltan datos necesarios para crear el evento",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convertir string de emails separados por comas a array
      const attendees = data.attendeesString 
        ? data.attendeesString.split(',').map(email => email.trim()).filter(email => email)
        : [];

      const response = await fetch('http://localhost:3095/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: businessId,
          summary: data.summary,
          description: data.description || "",
          location: data.location || "",
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          attendees: attendees,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el evento');
      }

      const eventData = await response.json();

      toast({
        title: "Evento creado",
        description: "El evento ha sido creado exitosamente en Google Calendar",
      });

      if (onSuccess) {
        onSuccess(eventData.event);
      }
    } catch (error: any) {
      console.error("Error al crear evento:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear el evento en Google Calendar",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear nuevo evento</CardTitle>
        <CardDescription>
          Complete los detalles para el evento en Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título*</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del evento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del evento (opcional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ubicación (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attendeesString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participantes</FormLabel>
                  <FormControl>
                    <Input placeholder="Emails separados por comas (opcional)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Ej: ejemplo@email.com, otro@email.com
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear evento"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 