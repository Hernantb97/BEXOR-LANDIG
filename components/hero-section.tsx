"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import GeometricBackground from "./geometric-background"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, CheckCircle, ArrowRight } from "lucide-react"
import { BotConfig } from "./bot-configurator"
import PartnersLogoCarousel from "./partners-logo-carousel"

export default function HeroSection() {
  const [showChat, setShowChat] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', telefono: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const chatSectionRef = useRef<HTMLDivElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSent(false);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await fetch(`${apiBaseUrl}/api/contact-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        setForm({ nombre: '', apellido: '', correo: '', telefono: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Error al enviar.');
      }
    } catch {
      setError('Error al enviar.');
    } finally {
      setSending(false);
    }
  };

  const scrollToDemo = () => {};

  return (
    <section className="relative py-24 md:py-28 lg:py-32 overflow-hidden bg-primary/95 min-h-[80vh]">
      {/* Fondo geométrico - z-index ajustado para estar detrás */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/80"></div>
        <GeometricBackground variant="light" density="medium" className="opacity-80" />
      </div>

      {/* Contenedor principal con z-index más alto */}
      <div className="container mx-auto px-4 relative" style={{ zIndex: 10 }}>
        <div className="flex flex-col lg:flex-row items-start justify-between gap-14">
          {/* Encabezado y descripción - Alineados a la izquierda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white lg:max-w-2xl text-left lg:pt-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Tu nuevo vendedor AI por WhatsApp
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Activa tu agente de IA personalizado. Automatiza ventas, responde clientes y obtén reportes en tiempo real.
            </p>
            <div className="mb-8">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto mb-4"
                onClick={() => window.open(
                  "https://wa.me/15557033313?text=" +
                    encodeURIComponent(
                      "Hola me gustaría agendar una cita para conocer más de talles de BEXOR."
                    ),
                  "_blank"
                )}
              >
                Haz una cita
              </Button>
            </div>
            
            <p className="text-white/80 mt-4 mb-6 text-left max-w-lg">
              {showChat 
                ? "Interactúa con el asistente para ver cómo funcionaría para tus clientes"
                : "Personaliza tu asistente y pruébalo en tiempo real"}
            </p>
            
            {/* Logo carousel added here */}
            <div className="mt-10 mb-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="border-t border-white/20 pt-6"
              >
                <p className="text-white/80 text-sm mb-3 font-medium">Tecnología impulsada por:</p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-sm">
                  <PartnersLogoCarousel />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Columna derecha: Botón + Card */}
          <div className="w-full lg:w-[500px] flex flex-col mt-4 lg:mt-0">
            {/* Botón de prueba gratuita encima del cuadro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all w-full"
                onClick={scrollToDemo}
              >
                Prueba y configura gratis aquí
              </Button>
            </motion.div>

            {/* Card para el formulario de contacto */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full bg-white rounded-xl shadow-2xl overflow-hidden relative demo-form"
              style={{ zIndex: 20, minHeight: '420px' }}
            >
              <form className="p-6 space-y-5" onSubmit={handleSubmit}>
                <h3 className="text-xl font-semibold mb-4 flex items-center text-primary">
                  <Settings className="h-5 w-5 mr-2" />
                  Solicita información personalizada
                </h3>
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium">Nombre</label>
                  <Input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="apellido" className="text-sm font-medium">Apellido</label>
                  <Input id="apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="correo" className="text-sm font-medium">Correo electrónico</label>
                  <Input id="correo" name="correo" type="email" value={form.correo} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="telefono" className="text-sm font-medium">Teléfono</label>
                  <Input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} required />
                </div>
                <Button type="submit" className="w-full mt-2" disabled={sending}>
                  {sending ? 'Enviando...' : 'Enviar solicitud'}
                </Button>
                {sent && <p className="text-green-600 text-sm mt-2 flex items-center"><CheckCircle className="h-4 w-4 mr-1" />¡Solicitud enviada correctamente!</p>}
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
