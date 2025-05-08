"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, X, Loader2, Settings } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import BotConfigurator, { BotConfig } from "./bot-configurator";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  initialGreeting?: string;
  showOnlineIndicator?: boolean;
  delayedAppearance?: boolean;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export default function ChatWidget({
  initialGreeting = "👋 ¿En qué puedo ayudarte hoy?",
  showOnlineIndicator = true,
  delayedAppearance = true,
  position = "bottom-right"
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [visible, setVisible] = useState(!delayedAppearance);
  const [showPromo, setShowPromo] = useState(false);
  const [botConfig, setBotConfig] = useState<BotConfig>({
    name: "Asistente AI de BEXOR",
    instructions: "Eres un asistente de ventas amable y eficiente que ayuda a los clientes interesados en productos y servicios de BEXOR. Debes ser cordial, profesional y dar respuestas concisas."
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Delayed appearance effect
  useEffect(() => {
    if (delayedAppearance) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [delayedAppearance]);

  // Create a thread when the component mounts
  useEffect(() => {
    const createThread = async () => {
      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            action: "createThread",
            config: botConfig 
          }),
        });
        
        if (!response.ok) throw new Error('Failed to create thread');
        
        const data = await response.json();
        setThreadId(data.threadId);
      } catch (error) {
        console.error("Error creating thread:", error);
      }
    };

    if (!threadId) {
      createThread();
    }
  }, [threadId, botConfig]);

  // Set initial greeting when thread is created
  useEffect(() => {
    if (threadId && initialGreeting && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: initialGreeting
      }]);
    }
  }, [threadId, initialGreeting, messages.length]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isOpen]);

  // Prevent scroll events from bubbling
  useEffect(() => {
    const handleWheel = (e: Event) => {
      e.stopPropagation();
    };
    
    const container = contentRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel);
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [contentRef.current]);

  // Show promo bubble shortly after mount
  useEffect(() => {
    const promoTimer = setTimeout(() => setShowPromo(true), 15000);
    const hideTimer = setTimeout(() => setShowPromo(false), 25000);
    return () => { clearTimeout(promoTimer); clearTimeout(hideTimer); };
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!input.trim() || !threadId || isLoading) return;
    
    // Add user message to the state
    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
          message: input,
          action: "sendMessage",
          config: botConfig
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      
      if (data.response) {
        const assistantMessage = {
          role: "assistant" as const,
          content: data.response,
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  };

  const toggleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleConfigChange = (newConfig: BotConfig) => {
    setBotConfig(newConfig);
    // Crear un nuevo thread cuando cambia la configuración
    setThreadId(null);
    setMessages([]);
    setShowConfigurator(false);
  };

  // Helper to determine position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'top-right':
        return 'top-8 right-8';
      case 'top-left':
        return 'top-8 left-8';
      case 'bottom-right':
      default:
        return 'bottom-8 right-8';
    }
  };

  if (!visible) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            {showConfigurator ? (
              <div className="w-80 sm:w-96">
                <BotConfigurator 
                  initialConfig={botConfig}
                  onConfigChange={handleConfigChange}
                  onClose={() => setShowConfigurator(false)}
                />
              </div>
            ) : (
              <Card className="w-80 sm:w-96 shadow-xl h-[450px] flex flex-col border-2 border-primary/20 overflow-hidden">
                <CardHeader className="p-3 border-b flex flex-row items-center justify-between bg-primary/5 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {showOnlineIndicator && (
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                    <h3 className="font-medium text-primary">{botConfig.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 absolute right-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfigurator(true)}
                      className="h-7 w-7"
                      title="Personalizar asistente"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleChat}
                      className="h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent ref={contentRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                      <div>
                        <p className="mb-2">Prueba a tu agente</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-2 text-sm ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-lg p-2 bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="border-t p-2 flex-shrink-0">
                  <form ref={formRef} onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Input
                      placeholder="Escribe tu mensaje..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={isLoading}
                      className="flex-1 h-9"
                    />
                    <Button 
                      type="button" 
                      size="icon" 
                      className="h-9 w-9" 
                      disabled={isLoading}
                      onClick={handleSendClick}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo bubble above icon */}
      {showPromo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          className="mb-2 bg-white text-primary px-3 py-2 rounded-lg shadow-md text-sm"
        >
          ¡Hola Haz una cita para activar tu asistente!
        </motion.div>
      )}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delayedAppearance ? 1 : 0, duration: 0.3 }}
      >
        <Button
          size="icon"
          className="h-16 w-16 rounded-full shadow-xl bg-green-600 hover:bg-green-700 relative"
          onClick={() => window.open(
            "https://wa.me/15557033313?text=" +
              encodeURIComponent(
                "Hola me gustaría agendar una cita para conocer más de talles de BEXOR."
              ),
            "_blank"
          )}
        >
          <SiWhatsapp className="h-7 w-7 text-white" />
        </Button>
      </motion.div>
    </div>
  );
} 