"use client"

import { useState, useEffect } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import CalendarManagementPanel from '@/components/calendar-management-panel'
import { DEFAULT_BUSINESS_ID, API_BASE_URL } from '@/components/config'
import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarPage() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  
  useEffect(() => {
    const getBusinessId = async () => {
      setIsLoading(true)
      try {
        // Obtener el user_id de la sesión
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const userId = session.user.id
          // Usar el endpoint recomendado para obtener el business_id
          const res = await fetch(`${API_BASE_URL}/api/my-business?user_id=${userId}`)
          if (res.ok) {
            const { business } = await res.json()
            if (business && business.id) {
              setBusinessId(business.id)
            } else {
              toast({
                title: "Error",
                description: "No se encontró un negocio asociado a tu usuario. Por favor, crea un negocio antes de continuar.",
                variant: "destructive"
              })
              setBusinessId(null)
            }
          } else {
            toast({
              title: "Error",
              description: "No se pudo obtener el negocio asociado. Intenta recargar la página.",
              variant: "destructive"
            })
            setBusinessId(null)
          }
        } else {
          toast({
            title: "Error",
            description: "No hay sesión activa. Inicia sesión para continuar.",
            variant: "destructive"
          })
          setBusinessId(null)
        }
      } catch (error) {
        console.error("Error al obtener ID del negocio:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del negocio",
          variant: "destructive"
        })
        setBusinessId(null)
      } finally {
        setIsLoading(false)
      }
    }
    getBusinessId()
  }, [toast])
  
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="space-y-6">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-6 w-[350px]" />
          <div className="space-y-2">
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      {businessId ? (
        <CalendarManagementPanel businessId={businessId} />
      ) : (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">No se pudo cargar la configuración del negocio</h2>
          <p className="text-muted-foreground">
            Por favor, intenta refrescar la página o contacta con soporte si el problema persiste.
          </p>
        </div>
      )}
    </div>
  )
} 