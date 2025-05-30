import { 
  MessageSquare,
  FileText,
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
    <div className="flex flex-col space-y-8">
      <div className="w-full flex justify-center">
        <SidebarNav
          className="w-full max-w-4xl justify-center lg:flex-row flex-row space-x-2 lg:space-x-4 lg:space-y-0"
          items={[
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
              title: "Google Calendar",
              href: "/dashboard/settings/calendar",
              icon: <Calendar className="h-4 w-4" />
            },
            {
              title: "Seguridad",
              href: "/dashboard/settings/security",
              icon: <Shield className="h-4 w-4" />
            }
          ]}
        />
      </div>
      <div className="flex-1 w-full max-w-4xl mx-auto">{children}</div>
    </div>
  );
} 