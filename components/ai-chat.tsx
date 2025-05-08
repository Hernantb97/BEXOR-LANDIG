"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, Settings, Download } from "lucide-react";
import BotConfigurator, { BotConfig } from "./bot-configurator";

// Types for messages
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface AiChatProps {
  className?: string;
  botConfig?: BotConfig;
  showHeader?: boolean;
  showSettingsButton?: boolean;
  initialMessage?: string;
  placeholder?: string;
  allowExport?: boolean;
}

export default function AiChat({ 
  className, 
  botConfig: externalBotConfig,
  showHeader = true,
  showSettingsButton = true,
  initialMessage,
  placeholder = "Escribe tu mensaje...",
  allowExport = false,
}: AiChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [botConfig, setBotConfig] = useState<BotConfig>(
    externalBotConfig || {
      name: "Asistente AI de BEXOR",
      instructions: "Eres un asistente de ventas amable y eficiente que ayuda a los clientes interesados en productos y servicios de BEXOR. Debes ser cordial, profesional y dar respuestas concisas."
    }
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update internal config when external config changes
  useEffect(() => {
    if (externalBotConfig) {
      setBotConfig(externalBotConfig);
      // Restart thread if config changes
      setThreadId(null);
      setMessages([]);
    }
  }, [externalBotConfig]);

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
    if (threadId && initialMessage && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: initialMessage,
        timestamp: new Date()
      }]);
    }
  }, [threadId, initialMessage, messages.length]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

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
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!input.trim() || !threadId || isLoading) return;
    
    // Add user message to the state
    const userMessage: Message = { 
      role: "user", 
      content: input,
      timestamp: new Date() 
    };
    
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
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: new Date()
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

  const handleConfigChange = (newConfig: BotConfig) => {
    setBotConfig(newConfig);
    // Crear un nuevo thread cuando cambia la configuración
    setThreadId(null);
    setMessages([]);
  };

  const exportChat = () => {
    // Create conversation text
    const chatContent = messages
      .map((msg) => {
        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
        const role = msg.role === 'user' ? 'Usuario' : botConfig.name;
        return `[${time}] ${role}: ${msg.content}`;
      })
      .join('\n\n');
    
    // Create download link
    const element = document.createElement('a');
    const file = new Blob([chatContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`h-full w-full ${className}`}>
      {showConfigurator ? (
        <BotConfigurator 
          initialConfig={botConfig}
          onConfigChange={handleConfigChange}
          onClose={() => setShowConfigurator(false)}
        />
      ) : (
        <Card className="h-full w-full flex flex-col overflow-hidden">
          {showHeader && (
            <CardHeader className="p-3 flex-shrink-0 flex flex-row items-center justify-between bg-primary/5 border-b">
              <div className="w-full text-center relative">
                <CardTitle>{botConfig.name}</CardTitle>
                
                <div className="absolute right-0 top-0 flex items-center gap-2">
                  {allowExport && messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={exportChat}
                      className="h-7 w-7"
                      title="Exportar chat"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {showSettingsButton && !externalBotConfig && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfigurator(true)}
                      className="h-7 w-7"
                      title="Personalizar asistente"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          )}
          <CardContent ref={contentRef} className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                    {message.timestamp && (
                      <div className={`text-xs mt-1 text-right ${
                        message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="border-t p-3 flex-shrink-0">
            <form ref={formRef} onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                placeholder={placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="button" 
                size="icon" 
                disabled={isLoading} 
                onClick={handleSendClick}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 