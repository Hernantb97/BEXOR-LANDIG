"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Settings, CheckCircle } from "lucide-react";

export interface BotConfig {
  name: string;
  instructions: string;
}

interface BotConfiguratorProps {
  initialConfig: BotConfig;
  onConfigChange: (config: BotConfig) => void;
  onClose: () => void;
}

export default function BotConfigurator({ 
  initialConfig, 
  onConfigChange, 
  onClose 
}: BotConfiguratorProps) {
  const [config, setConfig] = useState<BotConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simular una pequeña demora para mejor UX
    setTimeout(() => {
      onConfigChange(config);
      setIsSaving(false);
      setSaved(true);
      
      // Cerrar después de mostrar confirmación
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 600);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="flex items-center text-primary">
          <Settings className="h-5 w-5 mr-2" />
          Personaliza tu bot de ventas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <label htmlFor="bot-name" className="text-sm font-medium">
            Nombre del asistente
          </label>
          <Input
            id="bot-name"
            placeholder="Ej: Ana, el Asistente de Ventas"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="bot-instructions" className="text-sm font-medium">
            Instrucciones para el asistente
          </label>
          <Textarea
            id="bot-instructions"
            placeholder="Ej: Eres Ana, una experta en ventas de seguros. Debes ser amable y dar respuestas cortas y precisas."
            className="min-h-[150px] resize-none"
            value={config.instructions}
            onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Describe cómo debe comportarse tu asistente, qué conocimientos debe tener y cómo debe interactuar con los clientes.
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || saved}
          className="relative"
        >
          {saved ? (
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" /> Guardado
            </span>
          ) : (
            "Guardar configuración"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 