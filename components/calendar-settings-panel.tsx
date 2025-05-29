"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Check, Calendar, AlertCircle, Loader2, RefreshCcw, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import CalendarAvailabilitySelector from "@/components/calendar-availability-selector"
import BusinessScheduleEditor from "@/components/business-schedule"
import { supabase } from "@/lib/supabase"

export default function CalendarSettingsPanel() {
  const router = useRouter()
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isEnabled, setIsEnabled] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [refreshLoading, setRefreshLoading] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<{
    type: "default" | "destructive" | null;
    message: string | null;
  }>({ type: null, message: null })
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0)
  const [activeView, setActiveView] = useState<'availability' | 'schedules'>('availability')
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [businessIdError, setBusinessIdError] = useState<string | null>(null)

  // Obtener businessId al montar
  useEffect(() => {
    const fetchBusinessId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userId = session.user.id;
          // Usar el endpoint centralizado para obtener el businessId
          const res = await fetch(`/api/my-business?user_id=${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.id) {
              setBusinessId(data.id);
            } else if (data.business && data.business.id) {
              setBusinessId(data.business.id);
            } else {
              setBusinessIdError("No se encontró un negocio asociado a tu usuario.");
            }
          } else {
            setBusinessIdError("No se pudo obtener el negocio asociado. Intenta recargar la página.");
          }
        } else {
          setBusinessIdError("No hay sesión activa. Inicia sesión para continuar.");
        }
      } catch (error) {
        setBusinessIdError("Error al obtener el ID del negocio. Intenta recargar la página.");
      }
    };
    fetchBusinessId();
  }, []);

  const checkConnectionStatus = useCallback(async () => {
    console.log("Verificando estado de conexión con Google Calendar...")
    setIsLoading(true)
    try {
      // Usar el nuevo endpoint específico para verificar estado de Calendar
      const response = await fetch(`http://localhost:3095/api/calendar/status?business_id=${businessId}&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        console.log("Error en el endpoint de status, recurriendo al método alternativo")
        // Si el endpoint status no está disponible, usar el método original
        const configResponse = await fetch(`/api/business/config?t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!configResponse.ok) {
          throw new Error('Error al obtener configuración')
        }
        
        const configData = await configResponse.json()
        console.log("Datos recibidos de la API de configuración:", JSON.stringify(configData, null, 2))
        
        // Si tiene refresh token, está conectado
        setIsConnected(!!configData.google_calendar_refresh_token)
        setIsEnabled(configData.google_calendar_enabled || false)
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('calendar_connected', String(!!configData.google_calendar_refresh_token))
        localStorage.setItem('calendar_enabled', String(configData.google_calendar_enabled || false))
        
        // Mensaje según el estado
        if (configData.google_calendar_refresh_token) {
          setStatusMessage({ 
            type: 'default', 
            message: 'Conectado a Google Calendar. ' + 
                    (configData.google_calendar_enabled ? 'Integración activada.' : 'Integración desactivada.')
          })
        } else {
          setStatusMessage({
            type: 'destructive',
            message: 'No se ha detectado conexión con Google Calendar.'
          })
        }
        
        return
      }
      
      const data = await response.json()
      console.log("Estado de conexión de Calendar:", JSON.stringify(data, null, 2))
      
      if (data.success) {
        // Actualizar estados según la respuesta
        setIsConnected(data.connected)
        setIsEnabled(data.enabled)
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('calendar_connected', String(data.connected))
        localStorage.setItem('calendar_enabled', String(data.enabled))
        
        // Reiniciar contador de intentos
        setConnectionAttempts(0)
        
        // Mostrar mensaje apropiado
        if (data.connected) {
          setStatusMessage({ 
            type: 'default', 
            message: data.message || 'Conectado con Google Calendar.' 
          })
        } else {
          setStatusMessage({
            type: 'destructive',
            message: data.message || 'No hay conexión con Google Calendar.'
          })
        }
      } else {
        // Error en la solicitud
        throw new Error(data.error || 'Error al verificar estado')
      }
    } catch (error: any) {
      console.error('Error al comprobar estado de conexión:', error)
      
      // Verificar localStorage como último recurso
      const savedConnected = localStorage.getItem('calendar_connected') === 'true'
      const savedEnabled = localStorage.getItem('calendar_enabled') === 'true'
      
      if (savedConnected) {
        console.log("Usando datos de localStorage como respaldo")
        setIsConnected(true)
        setIsEnabled(savedEnabled)
        
        setStatusMessage({
          type: 'default',
          message: 'Conectado a Google Calendar (datos recuperados de caché local).'
        })
      } else {
        setIsConnected(false)
        setIsEnabled(false)
        
        setStatusMessage({
          type: 'destructive',
          message: `Error al comprobar estado: ${error.message || 'Error desconocido'}`
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [businessId])

  // Comprobar estado de la conexión al cargar
  useEffect(() => {
    // Comprobar si hay mensaje de éxito o error en la URL
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success') === 'true'
    const error = urlParams.get('error')

    if (success) {
      console.log('Detectada redirección exitosa de Google OAuth')
      setStatusMessage({
        type: 'default',
        message: 'Conectado correctamente con Google Calendar'
      })
      
      // Actualizamos los estados pero no guardamos en localStorage
      // ya que esto se hará cuando obtengamos la configuración real de la API
      setIsConnected(true)
      setIsEnabled(true)
      
      // Eliminamos los parámetros de URL sin causar una recarga
      window.history.replaceState({}, '', window.location.pathname)
    } else if (error) {
      console.log('Detectado error en la redirección de Google OAuth:', error)
      setStatusMessage({
        type: 'destructive',
        message: decodeURIComponent(error)
      })
      
      // Eliminamos los parámetros de URL sin causar una recarga
      window.history.replaceState({}, '', window.location.pathname)
    }
    
    // Iniciar comprobación del estado de la conexión
    checkConnectionStatus()
    
    // Programar verificaciones periódicas solo cuando está conectado
    // para evitar múltiples consultas cuando no está conectado
    if (isConnected) {
      const interval = setInterval(() => {
        console.log('Realizando verificación periódica de estado...')
        checkConnectionStatus()
      }, 60000) // Verificar cada minuto
      
      return () => clearInterval(interval)
    }
  }, [checkConnectionStatus, isConnected])

  const handleRefreshStatus = async () => {
    setRefreshLoading(true)
    await checkConnectionStatus()
    setRefreshLoading(false)
    
    toast({
      title: "Estado actualizado",
      description: "Se ha actualizado el estado de la conexión."
    })
  }

  const handleConnect = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:3095/api/calendar/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: businessId
        })
      })
      
      if (!response.ok) {
        throw new Error('Error al iniciar autenticación')
      }
      
      const data = await response.json()
      console.log("Respuesta de auth:", data)
      
      if (data.authUrl) {
        // Limpiar cualquier error previo
        setStatusMessage({ type: null, message: null })
        // Redirigir a la URL de autenticación de Google
        window.location.href = data.authUrl
      }
    } catch (error: any) {
      console.error('Error al iniciar conexión:', error)
      setStatusMessage({
        type: 'destructive',
        message: error.message || 'Error al iniciar conexión'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/calendar/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_id: businessId
        })
      })
      
      if (!response.ok) {
        throw new Error('Error al desconectar')
      }
      
      // Limpiar el estado local y localStorage
      setIsConnected(false)
      setIsEnabled(false)
      localStorage.removeItem('calendar_connected')
      localStorage.removeItem('calendar_enabled')
      setConnectionAttempts(0)
      
      toast({
        title: "Desconectado",
        description: "Se ha desconectado correctamente de Google Calendar.",
      })
    } catch (error: any) {
      console.error('Error al desconectar:', error)
      setStatusMessage({
        type: 'destructive',
        message: error.message || 'Error al desconectar'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleEnabled = async () => {
    try {
      setIsLoading(true)
      const newStatus = !isEnabled
      
      const response = await fetch('/api/calendar/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_id: businessId,
          enabled: newStatus
        })
      })
      
      if (!response.ok) {
        throw new Error('Error al actualizar estado')
      }
      
      setIsEnabled(newStatus)
      
      // Actualizar en localStorage
      localStorage.setItem('calendar_enabled', String(newStatus))
      
      toast({
        title: newStatus ? "Activado" : "Desactivado",
        description: `La integración con Google Calendar ha sido ${newStatus ? 'activada' : 'desactivada'}.`,
      })
    } catch (error: any) {
      console.error('Error al cambiar estado:', error)
      setStatusMessage({
        type: 'destructive',
        message: error.message || 'Error al cambiar estado'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar el panel de carga mientras se verifica la conexión
  if (businessIdError) {
    return (
      <div className="container">
        <div className="flex justify-center items-center h-[70vh]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{businessIdError}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!businessId) {
    return (
      <div className="container">
        <div className="flex justify-center items-center h-[70vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Obteniendo ID del negocio...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <ArrowLeft 
            className="h-5 w-5 mr-2 cursor-pointer" 
            onClick={() => router.push('/dashboard/config')}
          />
          Configuración de Google Calendar
        </CardTitle>
        <CardDescription>
          Conecta tu cuenta de Google Calendar para sincronizar citas automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Estado de Conexión */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">Estado de Conexión</h3>
              {isConnected && (
                <div className="inline-flex items-center text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                  <Check className="h-3 w-3 mr-1" />
                  Conectado
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center p-2 text-xs">
                <Loader2 className="h-3 w-3 animate-spin text-primary mr-2" />
                <span>Cargando...</span>
              </div>
            ) : (
              <>
                {isConnected ? (
                  <div className="flex items-center justify-between border rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-1 rounded-full">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Google Calendar conectado</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="calendar-enabled" className="text-xs mr-2">
                          <span className="font-medium">Activar</span>
                        </Label>
                        <Switch 
                          id="calendar-enabled" 
                          checked={isEnabled}
                          onCheckedChange={handleToggleEnabled}
                          disabled={refreshLoading || !isConnected}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleDisconnect}
                        disabled={refreshLoading}
                        className="h-6 text-xs px-2"
                      >
                        Desconectar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={handleRefreshStatus}
                        disabled={refreshLoading}
                      >
                        {refreshLoading ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <RefreshCcw className="h-3 w-3 mr-1" />
                            Actualizar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div className="text-xs">Conecta tu cuenta de Google Calendar</div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={handleConnect}
                      disabled={isLoading}
                      className="h-6 text-xs px-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Conectando...
                        </>
                      ) : (
                        'Conectar'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Selector de vista y título*/}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">
                {activeView === 'availability' ? 'Vista Previa de Disponibilidad' : 'Horarios de Atención'}
              </h3>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground mr-2">
                {isConnected ? (isEnabled ? 'Activo' : 'Desactivado') : 'Sin conexión'}
                </div>
                <div className="border rounded-lg overflow-hidden flex">
                  <Button 
                    variant={activeView === 'availability' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveView('availability')}
                    className="h-7 px-2 rounded-none text-xs"
                  >
                    <Calendar className="h-3 w-3 mr-1.5" />
                    Disponibilidad
                  </Button>
                  <Button 
                    variant={activeView === 'schedules' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveView('schedules')}
                    className="h-7 px-2 rounded-none text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1.5" />
                    Horarios
                  </Button>
                </div>
              </div>
            </div>
            <div className="border rounded-lg">
              <div className="overflow-y-auto" style={{ height: 'calc(100vh - 240px)', minHeight: '500px' }}>
                {activeView === 'availability' ? (
                <CalendarAvailabilitySelector 
                  businessId={businessId || ''} 
                  startTime={9}
                  endTime={18}
                  timeSlotDuration={30}
                />
                ) : (
                  <BusinessScheduleEditor 
                    businessId={businessId || ''}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 