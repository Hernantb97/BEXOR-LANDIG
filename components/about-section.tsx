"use client"

import { motion } from "framer-motion"
import { CheckCircle, Settings, User, Database } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutSection() {
  const steps = [
    {
      icon: <CheckCircle className="h-12 w-12 text-secondary" />,
      title: "Paga tu suscripción mensual",
      description: "Para comenzar a automatizar tus ventas",
      buttonText: "Contratar Asistente",
      buttonLink: "https://wa.me/15557033313?text=" +
        encodeURIComponent(
          "Hola me gustaría agendar una cita para conocer más de talles de BEXOR."
        ),
      cancelText: "(Puedes cancelar la suscripción cuando quieras)"
    },
    {
      icon: <User className="h-12 w-12 text-secondary" />,
      title: "Un asistente se contacta contigo",
      description: "Te guiamos en todo el proceso de configuración",
    },
    {
      icon: <Settings className="h-12 w-12 text-secondary" />,
      title: "Personalizamos tu bot",
      description: "Adaptamos el agente AI a tu negocio y objetivos",
    },
    {
      icon: <Database className="h-12 w-12 text-secondary" />,
      title: "Accede a tu CRM con todo listo",
      description: "Comienza a gestionar tus ventas automáticamente",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Contrata BEXOR ahora</h2>
          <p className="text-lg text-gray-700">Delegar nunca fue tan inteligente</p>
        </motion.div>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-12"
          >
            <div className="bg-primary rounded-xl p-8 shadow-lg hover:shadow-xl transition-all flex-grow flex flex-col items-center text-center border-0">
              <h3 className="text-2xl font-semibold mb-2 text-white">Agenda una cita</h3>
              <p className="text-white mb-6">Contáctanos por WhatsApp aquí</p>
              <Button
                className="bg-[#25D366] hover:bg-[#1ebe5d] text-white text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all w-full max-w-xs font-bold"
                onClick={() => window.open(
                  "https://wa.me/15557891179?text=" +
                    encodeURIComponent(
                      "Hola, quiero agendar una cita para conocer más de BEXOR"
                    ),
                  "_blank"
                )}
              >
                Agenda tu cita
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
