"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import GeometricBackground from "./geometric-background"
import AiChat from "./ai-chat"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, CheckCircle, ArrowRight } from "lucide-react"
import { BotConfig } from "./bot-configurator"
import PartnersLogoCarousel from "./partners-logo-carousel"

export default function HeroSection() {
  const [showChat, setShowChat] = useState(false)
  const [botConfig, setBotConfig] = useState<BotConfig>({
    name: "Asistente AI de BEXOR",
    instructions: "Eres un asistente de ventas amable y eficiente que ayuda a los clientes interesados en productos y servicios de BEXOR. Debes ser cordial, profesional y dar respuestas concisas."
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const chatSectionRef = useRef<HTMLDivElement>(null)

  const handleSaveConfig = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => {
        // Mostrar chat automáticamente después de guardar configuración
        setShowChat(true);
        setSaved(false);
      }, 1000);
    }, 600);
  };

  const scrollToDemo = () => {
    // Hacer scroll al formulario de demostración
    const demoForm = document.querySelector('.demo-form');
    if (demoForm) {
      demoForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

            {/* Card para la configuración o el chat */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full bg-white rounded-xl shadow-2xl overflow-hidden relative demo-form"
              style={{ zIndex: 20, height: showChat ? '500px' : 'auto', minHeight: '420px' }}
            >
              {!showChat ? (
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center text-primary">
                    <Settings className="h-5 w-5 mr-2" />
                    Personaliza tu asistente de ventas
                  </h3>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="bot-name" className="text-sm font-medium">
                        Nombre del asistente
                      </label>
                      <Input
                        id="bot-name"
                        placeholder="Ej: Ana, el Asistente de Ventas"
                        value={botConfig.name}
                        onChange={(e) => setBotConfig({ ...botConfig, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="bot-instructions" className="text-sm font-medium">
                        Instrucciones para el asistente
                      </label>
                      <Textarea
                        id="bot-instructions"
                        placeholder="Ej: Eres Ana, una experta en ventas de seguros. Debes ser amable y dar respuestas cortas y precisas."
                        className="min-h-[130px] resize-none"
                        value={botConfig.instructions}
                        onChange={(e) => setBotConfig({ ...botConfig, instructions: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Describe cómo debe comportarse tu asistente, qué conocimientos debe tener y cómo debe interactuar con los clientes.
                      </p>
                    </div>
                    <Button 
                      onClick={handleSaveConfig} 
                      disabled={isSaving || saved}
                      className="w-full mt-2"
                    >
                      {saved ? (
                        <span className="flex items-center justify-center w-full">
                          <CheckCircle className="h-4 w-4 mr-1" /> Cambios aplicados
                        </span>
                      ) : isSaving ? (
                        <span className="flex items-center justify-center w-full">
                          Aplicando configuración...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center w-full">
                          Probar asistente <ArrowRight className="h-4 w-4 ml-2" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="bg-primary/5 py-2 px-4 border-b flex justify-between items-center">
                    <h3 className="text-sm font-medium text-primary">
                      {botConfig.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowChat(false)}
                      className="h-8 text-xs"
                    >
                      Volver a configurar
                    </Button>
                  </div>
                  <div className="flex-1 h-[calc(100%-40px)]">
                    <AiChat 
                      botConfig={botConfig} 
                      className="h-full w-full"
                      showHeader={false}
                      initialMessage={`Hola, soy ${botConfig.name}. ¿En qué puedo ayudarte hoy?`}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
