"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import AiChat from "./ai-chat";
import ChatWidget from "./chat-widget";

// Internal Container component instead of importing
const Container = ({ 
  className, 
  children 
}: { 
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div 
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className || ''}`}
    >
      {children}
    </div>
  );
};

export default function AiAssistantSection() {
  // Configuration for the embedded chat
  const botConfig = {
    name: "BEXOR Asistente Inteligente",
    instructions: "Eres un asistente amable y experto de BEXOR. Tu misión es ayudar a los visitantes a conocer los servicios de la empresa, responder preguntas sobre facturación electrónica, y guiar a potenciales clientes en el proceso de adopción de soluciones digitales. Tus respuestas deben ser concisas, precisas y orientadas a convertir visitantes en clientes."
  };

  // Add this to prevent automatic scrolling to this section
  useEffect(() => {
    // Force window to scroll to top on initial load
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  return (
    <section id="ai-assistant" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <Container>
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Prueba Nuestro Asistente Inteligente
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experimenta el poder de la inteligencia artificial al servicio de tu negocio.
            Nuestro asistente virtual puede responder preguntas sobre facturación electrónica
            y ayudarte a descubrir la solución perfecta para tu empresa.
          </p>
        </motion.div>
        
        <motion.div 
          className="max-w-2xl mx-auto h-[500px]"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AiChat 
            className="shadow-xl rounded-xl border-2 border-primary/10" 
            botConfig={botConfig}
            initialMessage="👋 Hola, soy el Asistente Inteligente de BEXOR. Estoy aquí para responder tus preguntas sobre nuestra plataforma de facturación electrónica. ¿En qué puedo ayudarte hoy?"
            allowExport={true}
            placeholder="Escribe tu pregunta aquí..."
          />
        </motion.div>
      </Container>
      
      {/* Floating chat widget with different configuration */}
      <ChatWidget 
        initialGreeting="👋 ¿Necesitas ayuda con tus dudas sobre facturación electrónica? ¡Estoy aquí para ayudarte!"
        showOnlineIndicator={true}
        delayedAppearance={true}
        position="bottom-right"
      />
    </section>
  );
} 