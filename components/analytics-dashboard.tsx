"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ArrowUpRight, ArrowDownRight, MessageSquare, Users, Clock, Home, Download } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimeSavedCounter } from "./time-saved-counter"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { PdfReportGenerator } from "./pdf-report-generator"
import { 
  calculateResponseTimes, 
  formatResponseTime, 
  ResponseTimeMetrics,
  calculateConversations,
  ConversationMetrics,
  calculateQualifiedLeads,
  LeadsQualifiedMetrics,
  calculateMessageVolume,
  MessageVolumeMetrics,
  MessageVolumeDataPoint,
  TimeSavedMetrics,
  calculateTimeSaved
} from "@/lib/analytics"
import { getBusinessId } from "@/lib/supabase"
import { ResponseTimeChart } from "./response-time-chart"

// Types for time range
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Mock data for charts
const messageData = [
  { name: "Lun", sent: 40, received: 24 },
  { name: "Mar", sent: 30, received: 28 },
  { name: "Mié", sent: 45, received: 32 },
  { name: "Jue", sent: 50, received: 37 },
  { name: "Vie", sent: 35, received: 30 },
  { name: "Sáb", sent: 25, received: 18 },
  { name: "Dom", sent: 20, received: 15 },
]

// Datos para diferentes períodos de tiempo
const dailyMessageData = messageData
const weeklyMessageData = [
  { name: "Sem 1", sent: 180, received: 120 },
  { name: "Sem 2", sent: 220, received: 150 },
  { name: "Sem 3", sent: 200, received: 140 },
  { name: "Sem 4", sent: 240, received: 160 },
]
const monthlyMessageData = [
  { name: "Ene", sent: 800, received: 500 },
  { name: "Feb", sent: 750, received: 480 },
  { name: "Mar", sent: 900, received: 600 },
  { name: "Abr", sent: 950, received: 650 },
  { name: "May", sent: 1000, received: 700 },
  { name: "Jun", sent: 1100, received: 750 },
]
const yearlyMessageData = [
  { name: "2021", sent: 8500, received: 5500 },
  { name: "2022", sent: 9800, received: 6500 },
  { name: "2023", sent: 12000, received: 8000 },
  { name: "2024", sent: 14500, received: 9500 },
]

export default function AnalyticsDashboard({ className }: { className?: string }) {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily")
  const router = useRouter()
  const { toast } = useToast()
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true)
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(true)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true)
  const [isLoadingLeads, setIsLoadingLeads] = useState<boolean>(true)
  const [isLoadingMessageVolume, setIsLoadingMessageVolume] = useState<boolean>(true)
  const [timeSavedMetrics, setTimeSavedMetrics] = useState<TimeSavedMetrics>({
    hours: 0,
    minutes: 0,
    messageCount: 0
  })
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // State variables for metrics data
  const [responseTimeMetrics, setResponseTimeMetrics] = useState<ResponseTimeMetrics>({
    averageResponseTime: 0,
    percentageChange: 0,
    count: 0
  });
  const [conversationMetrics, setConversationMetrics] = useState<ConversationMetrics>({
    totalCount: 0,
    percentageChange: 0
  });
  const [leadsQualifiedMetrics, setLeadsQualifiedMetrics] = useState<LeadsQualifiedMetrics>({
    totalCount: 0,
    percentageChange: 0
  });
  const [messageVolumeMetrics, setMessageVolumeMetrics] = useState<MessageVolumeMetrics>({
    data: [],
    totalSent: 0,
    totalReceived: 0,
    sentPercentageChange: 0,
    receivedPercentageChange: 0
  });

  // Verificar sesión al cargar la página
  useEffect(() => {
    const verifySession = async () => {
      try {
        setIsVerifyingSession(true)
        // Comprobar si tenemos una sesión activa
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.error('Error de sesión en analytics:', error)
          
          // Comprobar si hay un token de respaldo en localStorage
          const backupToken = localStorage.getItem('supabase_auth_token_backup')
          const backupExpiry = localStorage.getItem('supabase_auth_token_backup_expiry')
          
          if (backupToken && backupExpiry && parseInt(backupExpiry) > Date.now()) {
            console.log('🔄 Intentando restaurar sesión desde token de respaldo')
            
            // Intentar restaurar la sesión
            const { error: restoreError } = await supabase.auth.setSession({
              access_token: backupToken,
              refresh_token: backupToken
            })
            
            if (restoreError) {
              console.error('Error al restaurar sesión:', restoreError)
              
              // Si no se puede restaurar, redirigir a login
              toast({
                title: "Sesión expirada",
                description: "Por favor, inicie sesión nuevamente.",
                variant: "destructive",
              })
              
              router.push('/dashboard/login')
            } else {
              toast({
                title: "Sesión restaurada",
                description: "Su sesión ha sido restaurada correctamente."
              })
            }
          } else {
            // No hay token de respaldo válido, redirigir a login
            toast({
              title: "Sesión expirada",
              description: "Por favor, inicie sesión nuevamente.",
              variant: "destructive",
            })
            
            router.push('/dashboard/login')
          }
        } else {
          console.log('✅ Sesión válida en analytics')
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error)
      } finally {
        setIsVerifyingSession(false)
      }
    }
    
    verifySession()
  }, [router, toast])

  // Cargar datos de analytics según el rango de tiempo seleccionado
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoadingMetrics(true)
        setIsLoadingConversations(true)
        setIsLoadingLeads(true)
        setIsLoadingMessageVolume(true)
        
        // Obtener el business_id del usuario actual
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

        // Calcular tiempos de respuesta para el período seleccionado
        const responseMetrics = await calculateResponseTimes(timeRange, businessId)
        setResponseTimeMetrics(responseMetrics)
        
        // Calcular conversaciones para el período seleccionado
        const convMetrics = await calculateConversations(timeRange, businessId)
        setConversationMetrics(convMetrics)
        
        // Calcular leads calificados para el período seleccionado
        const leadsMetrics = await calculateQualifiedLeads(timeRange, businessId)
        setLeadsQualifiedMetrics(leadsMetrics)
        
        // Calcular volumen de mensajes para el período seleccionado
        const volumeMetrics = await calculateMessageVolume(timeRange, businessId)
        setMessageVolumeMetrics(volumeMetrics)

        // Calcular tiempo ahorrado para el período seleccionado
        const timeSavedMetrics = await calculateTimeSaved(timeRange, businessId)
        setTimeSavedMetrics(timeSavedMetrics)
      } catch (error) {
        console.error('Error al cargar datos de analytics:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos analíticos',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingMetrics(false)
        setIsLoadingConversations(false)
        setIsLoadingLeads(false)
        setIsLoadingMessageVolume(false)
      }
    }
    
    if (!isVerifyingSession) {
      loadAnalyticsData()
    }
  }, [timeRange, isVerifyingSession, toast])

  // Function to format the response time
  const formatResponseTime = (timeInMs: number): string => {
    if (timeInMs < 1000) {
      return `${timeInMs.toFixed(0)}ms`;
    } else if (timeInMs < 60000) {
      return `${(timeInMs / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(timeInMs / 60000);
      const seconds = Math.floor((timeInMs % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  };

  // Formatear el tiempo de respuesta para mostrar
  const formattedResponseTime = formatResponseTime(responseTimeMetrics.averageResponseTime)
  
  // Determinar si el porcentaje de cambio es positivo o negativo
  // Para tiempos de respuesta, negativo es mejor (respondimos más rápido)
  const isResponseTimeImproved = responseTimeMetrics.percentageChange < 0
  
  // Para conversaciones, positivo es mejor (más conversaciones)
  const isConversationsImproved = conversationMetrics.percentageChange > 0
  
  // Para leads calificados, positivo es mejor (más leads calificados)
  const isLeadsImproved = leadsQualifiedMetrics.percentageChange > 0
  
  // Para mensajes, más es mejor (más actividad)
  const isSentImproved = messageVolumeMetrics.sentPercentageChange > 0
  const isReceivedImproved = messageVolumeMetrics.receivedPercentageChange > 0

  return (
    <div className="p-6 space-y-6 animate-fadeIn" ref={dashboardRef}>
      {isVerifyingSession ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full"></div>
          <span className="ml-2 dark:text-white">Verificando sesión...</span>
        </div>
      ) : (
        <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0b1e32] dark:text-white">Dashboard de Análisis</h1>
              <p className="text-muted-foreground dark:text-gray-300">Monitorea el rendimiento de tus mensajes</p>
        </div>
        <div className="flex items-center gap-2">
              <Tabs defaultValue="daily" value={timeRange} onValueChange={(value: string) => setTimeRange(value as TimeRange)} className="bg-white dark:bg-gray-800 rounded-lg">
                <TabsList className="bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger value="daily" className="data-[state=active]:bg-[#2188f3] data-[state=active]:text-white">Diario</TabsTrigger>
                  <TabsTrigger value="weekly" className="data-[state=active]:bg-[#2188f3] data-[state=active]:text-white">Semanal</TabsTrigger>
                  <TabsTrigger value="monthly" className="data-[state=active]:bg-[#2188f3] data-[state=active]:text-white">Mensual</TabsTrigger>
                  <TabsTrigger value="yearly" className="data-[state=active]:bg-[#2188f3] data-[state=active]:text-white">Anual</TabsTrigger>
            </TabsList>
          </Tabs>
              <PdfReportGenerator 
                timeRange={timeRange}
                responseTimeMetrics={responseTimeMetrics}
                conversationMetrics={conversationMetrics}
                leadsQualifiedMetrics={leadsQualifiedMetrics}
                messageVolumeMetrics={messageVolumeMetrics}
                timeSavedMetrics={timeSavedMetrics}
              />
          <Button
            variant="default"
                className="flex items-center gap-2 bg-[#0b1e32] hover:bg-[#102a45] text-white"
                onClick={() => {
                  // Usar redirección directa con parámetros para mantener la sesión
                  window.location.href = '/dashboard?internal=true&from=analytics';
                }}
          >
            <Home className="h-4 w-4" />
            Volver al Chat
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            <Card className="border-0 shadow-sm overflow-hidden dark:bg-gray-800">
              <div className="h-1 bg-[#0b1e32]"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#0b1e32] dark:text-white">Conversaciones Creadas</CardTitle>
                <MessageSquare className="h-4 w-4 text-[#2188f3]" />
          </CardHeader>
          <CardContent>
                {isLoadingConversations ? (
                  <div className="flex items-center h-12">
                    <div className="animate-spin w-4 h-4 border-t-2 border-[#2188f3] border-solid rounded-full mr-2"></div>
                    <span className="text-sm text-muted-foreground dark:text-gray-300">Calculando...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-[#0b1e32] dark:text-white">{conversationMetrics.totalCount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground dark:text-gray-300 flex items-center">
                      {conversationMetrics.percentageChange !== 0 && (
                        <span 
                          className={`flex items-center mr-1 ${
                            isConversationsImproved ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                <ArrowUpRight className="h-3 w-3 mr-1" />
                          {Math.abs(conversationMetrics.percentageChange)}%
              </span>
                      )}
              vs período anterior
            </p>
                  </>
                )}
          </CardContent>
        </Card>
            <Card className="border-0 shadow-sm overflow-hidden dark:bg-gray-800">
              <div className="h-1 bg-[#2188f3]"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#0b1e32] dark:text-white">Tiempo de Respuesta</CardTitle>
                <Clock className="h-4 w-4 text-[#2188f3]" />
          </CardHeader>
          <CardContent>
                {isLoadingMetrics ? (
                  <div className="flex items-center h-12">
                    <div className="animate-spin w-4 h-4 border-t-2 border-[#2188f3] border-solid rounded-full mr-2"></div>
                    <span className="text-sm text-muted-foreground dark:text-gray-300">Calculando...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-[#0b1e32] dark:text-white">{formattedResponseTime}</div>
                    <p className="text-xs text-muted-foreground dark:text-gray-300 mt-1">
                      Basado en {responseTimeMetrics.count} respuestas
                    </p>
                  </>
                )}
          </CardContent>
        </Card>
            <Card className="border-0 shadow-sm overflow-hidden dark:bg-gray-800">
              <div className="h-1 bg-[#0b1e32]"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#0b1e32] dark:text-white">Citas Generadas</CardTitle>
                <Users className="h-4 w-4 text-[#2188f3]" />
          </CardHeader>
          <CardContent>
                {isLoadingLeads ? (
                  <div className="flex items-center h-12">
                    <div className="animate-spin w-4 h-4 border-t-2 border-[#2188f3] border-solid rounded-full mr-2"></div>
                    <span className="text-sm text-muted-foreground dark:text-gray-300">Calculando...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-[#0b1e32] dark:text-white">{leadsQualifiedMetrics.totalCount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground dark:text-gray-300 flex items-center">
                      {leadsQualifiedMetrics.percentageChange !== 0 && (
                        <span 
                          className={`flex items-center mr-1 ${
                            isLeadsImproved ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                <ArrowUpRight className="h-3 w-3 mr-1" />
                          {Math.abs(leadsQualifiedMetrics.percentageChange)}%
              </span>
                      )}
              vs período anterior
            </p>
                  </>
                )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm overflow-hidden dark:bg-gray-800">
              <div className="h-1 bg-[#2188f3]"></div>
          <CardHeader>
                <CardTitle className="text-[#0b1e32] dark:text-white">Volumen de Mensajes</CardTitle>
                <CardDescription className="dark:text-gray-300">Número de mensajes enviados y recibidos</CardDescription>
          </CardHeader>
              <CardContent>
                {isLoadingMessageVolume ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin w-8 h-8 border-t-2 border-[#2188f3] border-solid rounded-full"></div>
                    <span className="ml-2 dark:text-white">Cargando datos de mensajes...</span>
                  </div>
                ) : (
                  <>
                    <div className="h-[300px]">
            <ChartContainer
              config={{
                sent: {
                  label: "Enviados",
                            color: "#0b1e32",
                },
                received: {
                  label: "Recibidos",
                            color: "#2188f3",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={messageVolumeMetrics.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#555" className="dark:opacity-30" />
                            <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="dark:text-gray-200" />
                            <YAxis tick={{ fill: 'currentColor' }} className="dark:text-gray-200" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend wrapperStyle={{ color: 'currentColor' }} className="dark:text-white"/>
                            <Bar dataKey="sent" fill="#0b1e32" name="Enviados" />
                            <Bar dataKey="received" fill="#2188f3" name="Recibidos" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
                    </div>
                    <div className="flex justify-between mt-4 text-sm">
                      <div>
                        <div className="font-medium text-[#0b1e32] dark:text-white">Enviados: {messageVolumeMetrics.totalSent}</div>
                        <div className={`text-xs ${isSentImproved ? 'text-green-500' : 'text-red-500'}`}>
                          <span className="flex items-center">
                            {isSentImproved ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {Math.abs(messageVolumeMetrics.sentPercentageChange)}% vs período anterior
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-[#0b1e32] dark:text-white">Recibidos: {messageVolumeMetrics.totalReceived}</div>
                        <div className={`text-xs ${isReceivedImproved ? 'text-green-500' : 'text-red-500'}`}>
                          <span className="flex items-center">
                            {isReceivedImproved ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {Math.abs(messageVolumeMetrics.receivedPercentageChange)}% vs período anterior
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
          </CardContent>
        </Card>

            {/* Use the TimeSavedCounter with real data instead of ResponseTimeChart */}
            <TimeSavedCounter timeRange={timeRange} className="border-0 shadow-sm" />
      </div>
        </>
      )}
    </div>
  )
}

