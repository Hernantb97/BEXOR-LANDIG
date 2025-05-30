import type { Metadata } from "next"
import ConfigPanel from "@/components/config-panel"

export const metadata: Metadata = {
  title: "Settings | WhatsApp Business Dashboard",
  description: "Configure your WhatsApp Business settings",
}

export default function SettingsPage() {
  return <ConfigPanel />
}

