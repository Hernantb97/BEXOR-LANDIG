"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useTheme } from "next-themes"

interface SidebarProps {
  items: {
    title: string
    href: string
    icon?: React.ReactNode
    active?: boolean
  }[]
  onClose?: () => void
}

export function Sidebar({ items, onClose }: SidebarProps) {
  const { theme } = useTheme()
  const pathname = usePathname()
  
  // Justo antes del return, asegúrate de que el ítem de settings esté presente
  const hasSettings = items.some(item => item.href === '/dashboard/settings');
  const settingsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
  // Asegura que todos los items tengan la propiedad 'active'
  const normalizedItems = items.map(item => ({ ...item, active: item.active }));
  const sidebarItems = hasSettings ? normalizedItems : [
    ...normalizedItems,
    { title: 'Ajustes', href: '/dashboard/settings', icon: settingsIcon, active: false }
  ];
  
  return (
    <div className="flex h-full flex-col bg-background p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <img
            src={theme === "dark" ? "/logobalanco/blancotransparte.png" : "/logo longin/BEXO (8).png"}
            alt="BEXOR Logo"
            className="h-8 w-auto mr-2"
          />
          <h2 className="text-2xl font-bold">BEXOR</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="space-y-1 flex-1">
        {sidebarItems.map((item) => {
          // Determinar si el ítem está activo basado en la URL actual
          const isActive = item.active || 
                          (pathname && pathname === item.href) || 
                          (pathname && item.href !== '/' && pathname.startsWith(item.href));
          
          // Forzar color del ícono de la tuerca/configuración
          let icon = item.icon;
          if (item.href.includes('config') || item.href.includes('settings')) {
            if (React.isValidElement(item.icon)) {
              // Type assertion para evitar errores de acceso a className
              const iconProps = (typeof item.icon.props === 'object' && item.icon.props !== null ? item.icon.props : {}) as { className?: string };
              icon = React.cloneElement(item.icon as React.ReactElement<any>, {
                className: cn(
                  iconProps.className || '',
                  isActive ? 'text-white' : 'text-[#2e3c53]'
                )
              });
            }
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              {icon}
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="border-t pt-4 mt-auto">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">OP</span>
          </div>
          <div>
            <p className="text-sm font-medium">Operador</p>
            <p className="text-xs text-muted-foreground">En línea</p>
          </div>
        </div>
      </div>
    </div>
  )
}

