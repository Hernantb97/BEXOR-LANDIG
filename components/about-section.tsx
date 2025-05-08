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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">¿Qué es BEXOR y cómo funciona?</h2>
          <p className="text-lg text-gray-700">
            BEXOR es una empresa especializada en agentes de inteligencia artificial adaptables a distintos objetivos de negocio. Nuestro software se integra con proveedores oficiales de la API de WhatsApp, brindando una plataforma segura para automatizar la atención al cliente, gestionar campañas, monitorear conversaciones y analizar el rendimiento desde un solo lugar.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`flex items-start mb-12 ${index % 2 === 0 ? "md:ml-0" : "md:ml-[100px]"}`}
            >
              <div className="flex-shrink-0 mr-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 flex-grow">
                <div className="flex items-start">
                  <div className="mr-4">{step.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">{step.title}</h3>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    {step.buttonText && (
                      <div className="space-y-2">
                        {step.cancelText && (
                          <p className="text-sm text-gray-500 italic mb-2">{step.cancelText}</p>
                        )}
                        <Button
                          className="bg-secondary hover:bg-secondary/90 text-white"
                          onClick={() => window.open(step.buttonLink, "_blank")}
                        >
                          {step.buttonText}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
