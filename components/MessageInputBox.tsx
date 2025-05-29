import React, { useState, useRef, FormEvent, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { sendMessageToWhatsApp } from '../lib/api-client';

interface MessageInputBoxProps {
  conversationId: string;
  onMessageSent?: () => void;
}

export function MessageInputBox({ conversationId, onMessageSent }: MessageInputBoxProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const file = e.target.files[0];
      console.log(`📎 Archivo seleccionado: ${file.name} (${file.size} bytes)`);

      // Verificar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten imágenes (JPG, PNG, GIF)');
        setIsLoading(false);
        return;
      }

      /* Comentado: se elimina funcionalidad de envío de imágenes
      // Usando la nueva función específica para imágenes
      const result = await uploadAndSendImageToWhatsApp(
        conversationId,
        file,
        message.trim() || undefined // Usar el texto como caption si existe
      );

      console.log('✅ Imagen enviada correctamente:', result);
      */
      
      // Notificar al usuario que esta función está deshabilitada
      setError('El envío de imágenes está temporalmente deshabilitado');
      
      // Limpiar el mensaje y input de archivo
      setMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onMessageSent?.();
    } catch (error: any) {
      console.error('❌ Error al enviar imagen:', error);
      setError(`Error al enviar imagen: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log(`📤 Enviando mensaje de texto a WhatsApp: "${message}" para conversación: ${conversationId}`);
      
      const result = await sendMessageToWhatsApp(conversationId, message);
      console.log('✅ Mensaje enviado correctamente:', result);
      
      setMessage('');
      onMessageSent?.();
    } catch (error: any) {
      console.error('❌ Error al enviar mensaje:', error);
      setError(`Error al enviar mensaje: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border-t">
      {error && (
        <div className="mb-2 text-sm text-red-500 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="min-h-[60px] resize-none pr-10"
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 flex space-x-1">
            {/* Se elimina el botón de imagen hasta que esté lista la configuración
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleFileButtonClick}
              disabled={isLoading}
              title="Adjuntar imagen"
            >
              <span className="text-sm">📷</span>
            </Button>
            */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={isLoading}
            />
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={!message.trim() || isLoading}
          className="flex-shrink-0"
        >
          {isLoading ? (
            <span className="animate-pulse">Enviando...</span>
          ) : (
            <>
              <span className="mr-2">📤</span>
              Enviar
            </>
          )}
        </Button>
      </form>
    </div>
  );
} 