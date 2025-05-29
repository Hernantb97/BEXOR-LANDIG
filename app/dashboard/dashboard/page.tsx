import type { Metadata } from "next/types"
import MinimalChatInterface from "@/components/minimal-chat-interface"
import AuthGuard from "@/components/AuthGuard"

export const metadata: Metadata = {
  title: "WhatsApp Business Dashboard",
  description: "Minimal WhatsApp Business Dashboard",
}

export default function DashboardPage() {
  // Aquí podrías obtener el userId y userEmail del contexto de autenticación si es necesario
  // Por ahora, renderizamos el panel protegido
  return (
    <AuthGuard>
      <MinimalChatInterface />
    </AuthGuard>
  )
}

