"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import React from "react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon?: React.ReactNode
  }[]
}

export default function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
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
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {icon}
            {item.title}
          </Link>
        );
      })}
    </nav>
  )
} 