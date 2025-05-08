"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem("cookiesAccepted")
    if (!hasAccepted) {
      // Show cookie banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true")
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p className="text-gray-700">
                Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Al continuar navegando, aceptas
                nuestra política de cookies.
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setIsVisible(false)} className="border-gray-300 text-gray-700">
                Rechazar
              </Button>
              <Button onClick={acceptCookies} className="bg-primary hover:bg-primary/90 text-white">
                Aceptar
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
