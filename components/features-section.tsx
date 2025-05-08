"use client"

import { motion } from "framer-motion"
import { Settings2, ListFilter, Bell, BarChart3, PauseCircle, FileDown } from "lucide-react"
import GeometricBackground from "./geometric-background"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Settings2 className="h-12 w-12 text-secondary" />,
      title: "Bot 100% personalizable",
      description: "Configura el nombre, personalidad y objetivos de tu agente AI",
    },
    {
      icon: <ListFilter className="h-12 w-12 text-secondary" />,
      title: "CRM que clasifica leads automáticamente",
      description: "Organiza tus prospectos según su interés y etapa de compra",
    },
    {
      icon: <Bell className="h-12 w-12 text-secondary" />,
      title: "Notificaciones por correo",
      description: "Recibe alertas cuando un lead avanza en el embudo de ventas",
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-secondary" />,
      title: "Panel de rendimiento",
      description: "Analiza resultados por día, semana, mes o año",
    },
    {
      icon: <PauseCircle className="h-12 w-12 text-secondary" />,
      title: "Control total del bot",
      description: "Pausa o activa tu agente AI fácilmente según tus necesidades",
    },
    {
      icon: <FileDown className="h-12 w-12 text-secondary" />,
      title: "Resúmenes descargables",
      description: "Exporta informes detallados de tus resultados de ventas",
    },
  ]

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Fondo geométrico */}
      <GeometricBackground variant="primary" density="low" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Características destacadas</h2>
          <p className="text-lg text-gray-700">
            Nuestro sistema está diseñado para maximizar tus ventas con el mínimo esfuerzo
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center text-center relative z-10"
            >
              <div className="mb-6 p-4 bg-primary/5 rounded-full">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-primary">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
