import { 
  Cog,
  MessageSquare,
  FileText,
  Bell,
  Shield,
  Calendar
} from "lucide-react";

import SidebarNav from "@/components/sidebar-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="lg:w-1/5">
        <SidebarNav items={[
          {
            title: "OpenAI",
            href: "/dashboard/settings",
            icon: <MessageSquare className="h-4 w-4" />
          },
          {
            title: "Documentos",
            href: "/dashboard/settings/documents",
            icon: <FileText className="h-4 w-4" />
          },
          {
            title: "Notificaciones",
            href: "/dashboard/settings/notifications",
            icon: <Bell className="h-4 w-4" />
          },
          {
            title: "Google Calendar",
            href: "/dashboard/settings/calendar",
            icon: <Calendar className="h-4 w-4" />
          },
          {
            title: "Seguridad",
            href: "/dashboard/settings/security",
            icon: <Shield className="h-4 w-4" />
          }
        ]} />
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
} 