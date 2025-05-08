"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function SubscriptionSection() {
  const features = [
    {
      title: "Instalación del bot",
      description: "Configuración completa en tu WhatsApp Business",
      included: true,
    },
    {
      title: "1 Agente Inteligente personalizable",
      description: "Adaptado a tu negocio y objetivos de venta",
      included: true,
    },
    {
      title: "Tokens de OpenAI",
      description: "Potencia tu bot con la mejor tecnología AI",
      included: true,
    },
    {
      title: "CRM personalizado",
      description: "Gestiona tus leads y ventas en un solo lugar",
      included: true,
    },
    {
      title: "Asistencia y actualizaciones",
      description: "Soporte continuo y mejoras automáticas",
      included: true,
    },
    {
      title: "Entrenamiento del bot",
      description: "Optimización continua para mejores resultados",
      included: true,
    },
    {
      title: "Notificaciones automáticas por correo",
      description: "Mantente informado de cada avance en tus ventas",
      included: true,
    },
    {
      title: "Crédito de mensajes de WhatsApp",
      description: <>Incluye $10 USD en crédito inicial para envío de mensajes a través de WhatsApp Business API (una sola vez, para iniciar). Los mensajes enviados mediante la API oficial de Meta tienen un costo por conversación. <Link href="https://developers.facebook.com/docs/whatsapp/pricing/?locale=es_ES" target="_blank" className="text-blue-400 hover:underline">Consulta aquí las tarifas oficiales de Meta</Link> para más información.</>,
      included: "dash",
    },
  ]

  // Imágenes del software
  const screenshots = [
    {
      src: "/Screenshot 2025-05-04 at 14.36.47.png",
      alt: "Interfaz del software de chat",
      title: "Interfaz del chat",
      description: "Gestiona conversaciones de forma eficiente"
    },
    {
      src: "/Screenshot 2025-05-04 at 14.37.08.png",
      alt: "Dashboard de analíticas",
      title: "Dashboard de Análisis",
      description: "Monitorea el rendimiento de tus mensajes"
    },
    {
      src: "/Screenshot 2025-05-04 at 14.38.00.png",
      alt: "Análisis detallado de mensajes",
      title: "Análisis Detallado",
      description: "Examina métricas importantes de tus conversaciones"
    },
  ]

  return (
    <section id="precios" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">¿Qué incluye la suscripción?</h2>
          <p className="text-lg text-gray-700">
            Obtienes un paquete completo para automatizar tus ventas
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Tabla de características - Lado izquierdo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-3/5 bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 bg-primary text-white">
              <h3 className="text-2xl font-bold">Plan Completo</h3>
            </div>

            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 text-lg font-semibold text-primary">Característica</th>
                    <th className="text-left py-4 text-lg font-semibold text-primary">Descripción</th>
                    <th className="w-20 text-center py-4 text-lg font-semibold text-primary">Incluido</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 font-medium text-gray-800">{feature.title}</td>
                      <td className="py-4 text-gray-600">{feature.description}</td>
                      <td className="py-4 text-center">
                        {feature.included === true ? (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                        ) : feature.included === "dash" ? (
                          <div className="inline-flex items-center justify-center w-8 h-8">
                            <span className="h-0.5 w-5 bg-gray-400"></span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                            <span className="h-5 w-5 text-red-600">—</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Capturas de pantalla - Lado derecho */}
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-2/5 flex flex-col gap-4"
          >
            <h3 className="text-xl font-bold text-primary mb-2">Conoce la experiencia de usuario</h3>
            
            {screenshots.map((screenshot, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="relative h-[180px] w-full">
                  <Image
                    src={screenshot.src}
                    alt={screenshot.alt}
                    fill
                    style={{ objectFit: "cover", objectPosition: "top" }}
                    className="rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-primary">{screenshot.title}</h4>
                  <p className="text-sm text-gray-600">{screenshot.description}</p>
                </div>
              </motion.div>
            ))}
            
            <div className="mt-auto pt-4">
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                onClick={() => window.open(
                  "https://wa.me/15557033313?text=" +
                    encodeURIComponent(
                      "Hola me gustaría agendar una cita para conocer más de talles de BEXOR."
                    ),
                  "_blank"
                )}
              >
                Contratar Asistente
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
