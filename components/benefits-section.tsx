"use client"

import { motion } from "framer-motion"
import { Clock, Users, TrendingUp, DollarSign } from "lucide-react"

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <Clock className="h-12 w-12 text-white" />,
      title: "Clientes atendidos más rápido",
      description: "Hasta 80% de reducción en tiempo de respuesta",
      color: "bg-primary",
    },
    {
      icon: <Users className="h-12 w-12 text-white" />,
      title: "Menos carga para tu equipo",
      description: "Hasta 35% menos de interacciones que requieren atención humana",
      color: "bg-blue-400",
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-white" />,
      title: "Más conversaciones que venden",
      description: "Hasta 11% de aumento en contactos que terminan en venta",
      color: "bg-primary",
    },
    {
      icon: <DollarSign className="h-12 w-12 text-white" />,
      title: "Costo mucho más bajo",
      description: "Un asistente AI trabaja 24/7 sin descansos ni vacaciones",
      color: "bg-blue-400",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
            Las ventajas de un asistente AI
          </h2>
          <p className="text-lg text-gray-700">
            Un asistente de inteligencia artificial no solo reduce costos, sino que mejora la experiencia 
            de tus clientes y potencia tus ventas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
            >
              <div className={`${benefit.color} p-6 flex justify-center`}>
                <div className="rounded-full bg-white/20 p-4">
                  {benefit.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-primary">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 