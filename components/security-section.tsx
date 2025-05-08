"use client"

import { motion } from "framer-motion"
import { Shield, Lock, CheckCircle } from "lucide-react"

export default function SecuritySection() {
  return (
    <section className="py-16 bg-gray-50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Seguridad y transparencia</h2>
          <p className="text-lg text-gray-700">
            Tu información y pagos están protegidos con la tecnología más avanzada
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Stripe */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center text-center"
          >
            <div className="h-16 flex items-center justify-center mb-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Stripe-logo-I4FfUIAulduuc75rDnqF6JiDYTV8ND.png"
                alt="Stripe"
                className="h-10 object-contain"
              />
            </div>
            <div className="flex items-center mb-3 text-primary">
              <Lock className="h-5 w-5 mr-2" />
              <h3 className="text-lg font-semibold">Pagos seguros</h3>
            </div>
            <p className="text-gray-600">Pagos 100% seguros con Stripe. Encriptación y cumplimiento PCI Nivel 1.</p>
          </motion.div>

          {/* Supabase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center text-center"
          >
            <div className="h-16 flex items-center justify-center mb-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Supabase_Logo-XeNLRgg8Zm9Dxf52qeuSdkmTonO8fT.png"
                alt="Supabase"
                className="h-10 object-contain"
              />
            </div>
            <div className="flex items-center mb-3 text-primary">
              <Shield className="h-5 w-5 mr-2" />
              <h3 className="text-lg font-semibold">Datos protegidos</h3>
            </div>
            <p className="text-gray-600">Datos protegidos con infraestructura segura de Supabase.</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
