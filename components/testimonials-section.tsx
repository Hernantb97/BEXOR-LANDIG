"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import GeometricBackground from "./geometric-background"

interface Testimonial {
  name: string
  company: string
  image: string
  text: string
}

export default function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      name: "Laura Ramírez",
      company: "Lontananza Arquitectura y Diseño",
      image: "/WhatsApp Image 2025-05-04 at 8.56.18 PM.jpeg",
      text: "BEXOR ha transformado la manera en que atendemos a nuestros clientes. Como dueña de mi despacho de arquitectura, valoro enormemente que el sistema califique a los clientes potenciales y me permita enfocarme en los proyectos que realmente importan.",
    },
    {
      name: "Miguel Hernández",
      company: "AutoConsulting",
      image: "/WhatsApp Image 2025-05-04 at 8.56.17 PM (1).jpeg",
      text: "Como asesor automotriz, BEXOR se ha convertido en mi asistente virtual indispensable. El bot responde las preguntas frecuentes de los clientes y me conecta solo con aquellos que están realmente interesados en comprar un vehículo.",
    },
    {
      name: "Javier Méndez",
      company: "Méndez Importaciones",
      image: "/WhatsApp Image 2025-05-04 at 8.56.17 PM.jpeg",
      text: "Desde que implementé BEXOR en mi negocio, las ventas han aumentado un 40%. La integración con el CRM me permite dar seguimiento a cada lead y el bot trabaja 24/7 capturando oportunidades que antes perdía.",
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleTestimonials, setVisibleTestimonials] = useState<Testimonial[]>([])
  const [itemsPerView, setItemsPerView] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const endIndex = currentIndex + itemsPerView
    setVisibleTestimonials(testimonials.slice(currentIndex, endIndex))
  }, [currentIndex, itemsPerView])

  const nextSlide = () => {
    if (currentIndex + itemsPerView < testimonials.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      setCurrentIndex(testimonials.length - itemsPerView)
    }
  }

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Lo que dicen nuestros clientes</h2>
          <p className="text-lg text-gray-700">Empresas que ya están automatizando sus ventas con BEXOR</p>
        </motion.div>

        <div className="relative">
          <div className="flex space-x-6 overflow-hidden">
            {visibleTestimonials.map((testimonial, index) => (
              <motion.div
                key={index + currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl p-8 shadow-lg flex-1 min-w-[280px] relative z-10"
              >
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-secondary/20">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full h-12 w-12 z-10 hidden md:flex"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Anterior</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-lg rounded-full h-12 w-12 z-10 hidden md:flex"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Siguiente</span>
          </Button>
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <Button variant="outline" size="icon" className="mr-4" onClick={prevSlide}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextSlide}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
