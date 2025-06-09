"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function FinalCta() {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Listo en 48 horas. Tu nuevo vendedor AI está esperando.
          </h2>
          <Button
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
            onClick={() => window.open(
              "https://wa.me/15557891179?text=" +
                encodeURIComponent(
                  "Hola, quiero agendar una cita para conocer más de BEXOR"
                ),
              "_blank"
            )}
          >
            Contratar Asistente
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
