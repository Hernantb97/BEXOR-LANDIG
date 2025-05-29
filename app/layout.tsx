import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import LayoutWithConditionalHeaderFooter from "@/components/LayoutWithConditionalHeaderFooter"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BEXOR - Agentes de Inteligencia Artificial Especializados en Ventas",
  description:
    "Automatiza tus ventas por WhatsApp con un Agente de Inteligencia Artificial especializado en convertir. Activa tu bot personalizado en menos de 48 horas.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script id="prevent-scroll" strategy="beforeInteractive">
          {`
            // Prevent automatic scroll restoration
            if ('scrollRestoration' in history) {
              history.scrollRestoration = 'manual';
            }
            
            // Ensure page starts at the top
            window.onload = function() {
              window.scrollTo(0, 0);
            };
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LayoutWithConditionalHeaderFooter>
            {children}
          </LayoutWithConditionalHeaderFooter>
        </ThemeProvider>
      </body>
    </html>
  )
}
