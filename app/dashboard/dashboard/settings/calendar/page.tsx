import type { Metadata } from "next"
import CalendarSettingsPanel from "@/components/calendar-settings-panel"

export const metadata: Metadata = {
  title: "Google Calendar | WhatsApp Business Dashboard",
  description: "Configure your Google Calendar integration for appointment scheduling",
}

export default function CalendarSettingsPage() {
  return (
    <div style={{ minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto' }}>
      <CalendarSettingsPanel />
    </div>
  )
} 