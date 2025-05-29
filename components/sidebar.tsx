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
        {items.map((item) => {
          // Determinar si el ítem está activo basado en la URL actual
          const isActive = item.active || 
                          (pathname && pathname === item.href) || 
                          (pathname && item.href !== '/' && pathname.startsWith(item.href));
          
          // Forzar color del ícono de la tuerca/configuración
          let icon = item.icon;
          if (item.href.includes('config') || item.href.includes('settings')) {
            if (React.isValidElement(item.icon)) {
              icon = React.cloneElement(item.icon, {
                ...item.icon.props,
                className: cn(
                  item.icon.props?.className || '',
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

