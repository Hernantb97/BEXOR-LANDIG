"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Calendar as CalendarIcon, Plus, Check, ArrowLeft } from "lucide-react"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import CalendarAvailabilitySelector from "@/components/calendar-availability-selector"
import BusinessScheduleEditor from "@/components/business-schedule-editor"
import { useRouter } from 'next/navigation'

// Componente para el botón de conexión con Google Calendar
function GoogleCalendarConnectButton({ businessId }: { businessId: string }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Verificar si ya está conectado
    const checkConnection = async () => {
      try {
        const response = await fetch(`http://localhost:3095/api/calendar/status?business_id=${businessId}&t=${Date.now()}`);
        const data = await response.json();
        
        if (data.success) {
          setIsConnected(data.connected);
          setLastUpdated(data.last_updated);
        }
      } catch (error) {
        console.error('Error verificando estado de conexión:', error);
      }
    };
    
    checkConnection();
  }, [businessId]);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      const response = await fetch('http://localhost:3095/api/calendar/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: businessId
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al iniciar la conexión');
      }
      
      const data = await response.json();
      
      if (data.authUrl) {
        // Abrir ventana de autenticación
        const width = 600;
        const height = 700;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.innerHeight / 2 - height / 2;
        
        const authWindow = window.open(
          data.authUrl,
          'Conectar con Google Calendar',
          `width=${width},height=${height},top=${top},left=${left}`
        );
        
        // Verificar cuando se cierra la ventana
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            setIsConnecting(false);
            // Verificar de nuevo el estado
            setTimeout(async () => {
              try {
                const statusResponse = await fetch(`http://localhost:3095/api/calendar/status?business_id=${businessId}&t=${Date.now()}`);
                const statusData = await statusResponse.json();
                
                if (statusData.success && statusData.connected) {
                  setIsConnected(true);
                  setLastUpdated(statusData.last_updated);
                  toast({
                    title: "Conexión exitosa",
                    description: "Tu cuenta de Google Calendar ha sido conectada correctamente.",
                  });
                }
              } catch (error) {
                console.error("Error verificando estado después de autenticación:", error);
              }
            }, 2000);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error en proceso de autenticación:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo iniciar el proceso de conexión con Google Calendar.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting || isConnected}
        variant={isConnected ? "outline" : "default"}
        className="relative"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Conectando...
          </>
        ) : isConnected ? (
          <>
            <Check className="h-4 w-4 mr-2 text-green-500" />
            Conectado
          </>
        ) : (
          <>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Conectar Google Calendar
          </>
        )}
      </Button>
      
      {isConnected && lastUpdated && (
        <span className="text-xs text-muted-foreground">
          Conectado el {new Date(lastUpdated).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

// Componente para crear una nueva cita
function AppointmentForm({ businessId }: { businessId: string }) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    name: '',
    phone: '',
    email: '',
    description: '',
    appointmentType: ''
  });
  const [appointmentTypes, setAppointmentTypes] = useState<any[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    appointmentId?: string;
    date?: string;
    time?: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const res = await fetch(`http://localhost:3095/api/business/appointment-types/${businessId}`);
        const data = await res.json();
        if (data.success) {
          setAppointmentTypes(data.types || data.data || []);
        } else {
          setAppointmentTypes([]);
        }
      } catch (err) {
        setAppointmentTypes([]);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    fetchTypes();
  }, [businessId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3095/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: businessId,
          date: formData.date,
          time: formData.time,
          phone: formData.phone,
          name: formData.name,
          email: formData.email,
          description: formData.description,
          appointmentType: formData.appointmentType
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error creating appointment');
      }

      setResult({
        success: true,
        message: 'Cita creada exitosamente',
        appointmentId: data.event_id,
        date: formData.date,
        time: formData.time
      });

      toast({
        title: "Cita creada",
        description: `Cita programada para el ${new Date(formData.date).toLocaleDateString()} a las ${formData.time}`,
      });

      // Limpiar formulario
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:00',
        name: '',
        phone: '',
        email: '',
        description: '',
        appointmentType: ''
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message
      });

      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-0 mb-16" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <CardHeader>
        <CardTitle>Crear nueva cita</CardTitle>
        <CardDescription>
          Programa una nueva cita en el calendario
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert className={result.success ? "bg-green-50 border-green-200 mb-4" : "bg-red-50 border-red-200 mb-4"}>
            <AlertDescription>
              {result.message}
              {result.success && result.date && result.time && (
                <div className="mt-2 text-sm">
                  Cita programada para el {new Date(result.date).toLocaleDateString()} a las {result.time}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nombre del cliente"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+52 1 123 456 7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="cliente@ejemplo.com"
              />
            </div>
          </div>

          {/* Select de tipo de cita */}
          <div className="space-y-2">
            <Label htmlFor="appointmentType">Tipo de cita</Label>
            <select
              id="appointmentType"
              name="appointmentType"
              value={formData.appointmentType}
              onChange={handleChange}
              required={appointmentTypes.length > 0}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              disabled={isLoadingTypes}
            >
              <option value="">Selecciona un tipo de cita</option>
              {appointmentTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalles de la cita"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando cita...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Crear cita
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Componente para mostrar las citas programadas
function AppointmentsList({ businessId, phoneNumber }: { businessId: string, phoneNumber?: string }) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');
  const { toast } = useToast();

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/appointments/${businessId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Error fetching appointments');
      }
      setAppointments(data.appointments || []);
    } catch (err: any) {
      setError(err.message);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [businessId, phoneNumber]);

  // Filtro de tiempo (usando date)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0,0,0,0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const filteredAppointments = appointments.filter((a: any) => {
    const date = new Date(a.date);
    if (timeFilter === 'today') {
      return date >= startOfToday && date < endOfToday;
    }
    if (timeFilter === 'week') {
      return date >= startOfWeek && date < endOfWeek;
    }
    if (timeFilter === 'month') {
      return date >= startOfMonth && date < endOfMonth;
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citas programadas</CardTitle>
        <CardDescription>
          {phoneNumber 
            ? `Mostrando citas para el teléfono: ${phoneNumber}` 
            : 'Todas las citas programadas'}
        </CardDescription>
        <div className="flex gap-2 mt-4">
          <Button variant={timeFilter === 'all' ? 'outline' : 'ghost'} size="sm" onClick={() => setTimeFilter('all')}>Todas</Button>
          <Button variant={timeFilter === 'today' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('today')}>Hoy</Button>
          <Button variant={timeFilter === 'week' ? 'outline' : 'ghost'} size="sm" onClick={() => setTimeFilter('week')}>Esta semana</Button>
          <Button variant={timeFilter === 'month' ? 'outline' : 'ghost'} size="sm" onClick={() => setTimeFilter('month')}>Este mes</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>No hay citas programadas</p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pb-0" style={{maxHeight: '85vh', marginBottom: 0}}>
            {filteredAppointments
              .slice()
              .sort((a: any, b: any) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB.getTime() - dateA.getTime();
              })
              .map((appointment: any) => {
                return (
                  <Card key={appointment.id} className="p-5 shadow-lg border-2 border-gray-200 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{appointment.appointment_type}</h4>
                        <div className="text-xs font-medium">Cliente: {appointment.customer_name || 'Sin nombre'}</div>
                        {appointment.customer_phone && (
                          <div className="text-xs text-muted-foreground">
                            WhatsApp: <a href={`https://wa.me/${appointment.customer_phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline">{appointment.customer_phone}</a>
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          <p>
                            {new Date(appointment.date).toLocaleDateString()} 
                            {appointment.time && (
                              <span> • {appointment.time}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {/* Botón de cancelar si lo necesitas */}
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para gestionar los tipos de cita
function AppointmentTypesManager({ businessId }: { businessId: string }) {
  const [types, setTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ typeId?: string; name: string; duration: string }>({ name: '', duration: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3095/api/business/appointment-types/${businessId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al obtener tipos de cita');
      setTypes(data.types || data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, [businessId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (type: any) => {
    setForm({ typeId: type.id, name: type.name, duration: String(type.duration) });
  };

  const handleDelete = async (type: any) => {
    if (!window.confirm('¿Eliminar este tipo de cita?')) return;
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:3095/api/business/appointment-types', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, typeId: type.id })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al eliminar tipo de cita');
      toast({ title: 'Eliminado', description: 'Tipo de cita eliminado.' });
      fetchTypes();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.duration.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:3095/api/business/appointment-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          typeId: form.typeId,
          name: form.name,
          duration: Number(form.duration)
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al guardar tipo de cita');
      toast({ title: form.typeId ? 'Actualizado' : 'Creado', description: `Tipo de cita ${form.typeId ? 'actualizado' : 'creado'}.` });
      setForm({ name: '', duration: '' });
      fetchTypes();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-4 mb-6 flex-wrap items-end">
        <div>
          <Label>Nombre</Label>
          <Input name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Consulta" />
        </div>
        <div>
          <Label>Duración (minutos)</Label>
          <Input name="duration" type="number" min={1} value={form.duration} onChange={handleChange} required placeholder="30" />
        </div>
        <Button type="submit" disabled={isSaving} className="h-10">{form.typeId ? 'Actualizar' : 'Agregar'}</Button>
        {form.typeId && (
          <Button type="button" variant="outline" onClick={() => setForm({ name: '', duration: '' })}>Cancelar</Button>
        )}
      </form>
      {isLoading ? (
        <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
      ) : error ? (
        <Alert className="bg-red-50 border-red-200 mb-4"><AlertDescription>{error}</AlertDescription></Alert>
      ) : (
        <div className="space-y-2">
          {types.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No hay tipos de cita registrados.</div>
          ) : (
            <div className="grid gap-2">
              {types.map(type => (
                <Card key={type.id} className="flex flex-row items-center justify-between p-4">
                  <div>
                    <div className="font-medium">{type.name}</div>
                    <div className="text-xs text-muted-foreground">Duración: {type.duration} min</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(type)}>Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(type)}>Eliminar</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente principal de gestión del calendario
export default function CalendarManagementPanel({ businessId }: { businessId: string }) {
  const [phoneFilter, setPhoneFilter] = useState('');
  const [allowOverlapping, setAllowOverlapping] = useState<boolean | null>(null);
  const [maxOverlapping, setMaxOverlapping] = useState(0);
  const [isSavingOverlap, setIsSavingOverlap] = useState(false);
  const { toast } = useToast();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const router = useRouter();
  const [appointmentTypes, setAppointmentTypes] = useState<any[]>([]);
  
  // Obtener allowOverlapping al montar y cuando se guarde
  const fetchAllowOverlapping = useCallback(async () => {
    if (!businessId) return;
    try {
      const response = await fetch(`http://localhost:3095/api/business/hours/${businessId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setAllowOverlapping(Boolean(data.data.allowOverlapping));
        setMaxOverlapping(data.data.maxOverlapping || 0);
      } else {
        setAllowOverlapping(null);
        setMaxOverlapping(0);
      }
    } catch (err) {
      setAllowOverlapping(null);
      setMaxOverlapping(0);
    }
  }, [businessId]);

  useEffect(() => {
    fetchAllowOverlapping();
  }, [fetchAllowOverlapping]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch(`http://localhost:3095/api/business/appointment-types/${businessId}`);
        const data = await res.json();
        if (data.success) {
          setAppointmentTypes(data.types || data.data || []);
        } else {
          setAppointmentTypes([]);
        }
      } catch {
        setAppointmentTypes([]);
      }
    };
    fetchTypes();
  }, [businessId]);

  // Guardado automático de empalme
  const saveOverlappingSettings = async (newAllow: boolean | null, newMax: number) => {
    setIsSavingOverlap(true);
    try {
      // Obtener horarios actuales para no perderlos
      const response = await fetch(`http://localhost:3095/api/business/hours/${businessId}`);
      const data = await response.json();
      const hours = data?.data?.hours || {};
      const payload = {
        businessId,
        hours,
        allowOverlapping: !!newAllow,
        maxOverlapping: newAllow ? newMax : 1
      };
      const saveResp = await fetch('http://localhost:3095/api/business/hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const saveData = await saveResp.json();
      if (!saveData.success) throw new Error(saveData.error || 'Error al guardar empalme');
      toast({ title: 'Configuración guardada', description: 'Empalme de citas actualizado.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo guardar la configuración', variant: 'destructive' });
    } finally {
      setIsSavingOverlap(false);
    }
  };

  // Handlers automáticos
  const handleAllowOverlappingChange = (checked: boolean) => {
    setAllowOverlapping(checked);
    saveOverlappingSettings(checked, maxOverlapping);
  };
  const handleMaxOverlappingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/^0+/, '');
    const value = cleanValue === '' ? 0 : Number(cleanValue);
    setMaxOverlapping(value);
    saveOverlappingSettings(allowOverlapping, value);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 mr-2"
            onClick={() => router.push('/dashboard/config')}
            title="Regresar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestión de Google Calendar</h1>
            <p className="text-muted-foreground">
              Administra tus citas y disponibilidad sincronizadas con Google Calendar
            </p>
          </div>
        </div>
        <GoogleCalendarConnectButton businessId={businessId} />
      </div>
      
      <Tabs defaultValue="availability" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
          <TabsTrigger value="schedules">Horarios de atención</TabsTrigger>
          <TabsTrigger value="appointment-types">Tipo de citas</TabsTrigger>
          <TabsTrigger value="new-appointment">Nueva Cita</TabsTrigger>
          <TabsTrigger value="appointments">Citas Programadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="availability" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Vista previa de disponibilidad</CardTitle>
              <CardDescription>
                Consulta los horarios disponibles y las citas programadas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <CalendarAvailabilitySelector 
                businessId={businessId} 
                startTime={9}
                endTime={18}
                timeSlotDuration={30}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedules" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de horarios de atención</CardTitle>
              <CardDescription>
                Define los días y horarios en los que tu negocio atiende citas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <BusinessScheduleEditor businessId={businessId} onAfterSave={fetchAllowOverlapping} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appointment-types" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Tipo de citas</CardTitle>
              <CardDescription>
                Administra los tipos de cita disponibles para tu negocio (nombre y duración).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <input
                  type="checkbox"
                  id="allow-overlapping"
                  checked={!!allowOverlapping}
                  onChange={e => handleAllowOverlappingChange(e.target.checked)}
                  className="switch"
                  disabled={isSavingOverlap}
                />
                <Label htmlFor="allow-overlapping" className="font-medium">
                  Permitir empalmar citas
                </Label>
                {allowOverlapping && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="max-overlapping" className="text-sm">Máx. empalmes:</Label>
                    <Input
                      id="max-overlapping"
                      type="number"
                      min={1}
                      value={maxOverlapping === 0 ? '' : maxOverlapping}
                      onChange={handleMaxOverlappingChange}
                      onBlur={() => { if (!maxOverlapping || maxOverlapping < 1) setMaxOverlapping(1); }}
                      className="w-20"
                      disabled={isSavingOverlap}
                    />
                    <span className="text-xs text-muted-foreground ml-2">1 = solo una cita, 2 o más permite empalmes</span>
                    {isSavingOverlap && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  </div>
                )}
              </div>
              <AppointmentTypesManager businessId={businessId} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new-appointment" className="mt-0">
          <AppointmentForm businessId={businessId} />
        </TabsContent>
        
        <TabsContent value="appointments" className="mt-0">
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="tel"
                placeholder="Filtrar por teléfono"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit">Buscar</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPhoneFilter('')}
                disabled={!phoneFilter}
              >
                Limpiar
              </Button>
            </form>
          </div>
          <AppointmentsList businessId={businessId} phoneNumber={phoneFilter} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 