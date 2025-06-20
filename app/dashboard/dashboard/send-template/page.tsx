'use client'

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/components/config';
import { supabase, getBusinessId } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SendTemplatePage() {
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [variables, setVariables] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<'image' | 'video' | ''>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  useEffect(() => {
    async function fetchBusinessId() {
      setLoadingBusiness(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        setBusinessId(null);
        setLoadingBusiness(false);
        return;
      }
      const biz = await getBusinessId(userId);
      setBusinessId(biz?.businessId || null);
      setLoadingBusiness(false);
    }
    fetchBusinessId();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    if ((mediaUrl && !mediaType) || (!mediaUrl && mediaType)) {
      setResult("Error: Para enviar multimedia, debe proporcionar tanto la URL como el tipo de medio.");
      setLoading(false);
      return;
    }

    const numbers = phoneNumbers
      .split(/[\n, ]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    try {
      const recipients = numbers.map(phoneNumber => {
        const recipient: {
          phoneNumber: string;
          templateParams: any[];
          mediaUrl?: string;
          mediaType?: 'image' | 'video';
        } = {
          phoneNumber,
          templateParams: variables ? JSON.parse(variables) : []
        };

        if (mediaUrl && mediaType) {
          recipient.mediaUrl = mediaUrl;
          recipient.mediaType = mediaType;
        }
        
        return recipient;
      });

      const res = await fetch(`${API_BASE_URL}/api/send-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          recipients,
          businessId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult("¡Plantillas enviadas correctamente!");
      } else {
        setResult("Error: " + (data.error || JSON.stringify(data.details)));
      }
    } catch (err: any) {
      setResult("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingBusiness) {
    return <div className="max-w-xl mx-auto py-10">Cargando datos del negocio...</div>;
  }
  if (!businessId) {
    return <div className="max-w-xl mx-auto py-10 text-red-600">No se pudo obtener el negocio asociado al usuario logeado.</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl">
        <Link href="/dashboard/dashboard" className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Envío Masivo de Plantillas de WhatsApp</CardTitle>
            <CardDescription>
              Envíe plantillas de mensajes personalizadas a múltiples contactos a la vez.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="phoneNumbers">Números de WhatsApp</Label>
                <Textarea
                  id="phoneNumbers"
                  rows={3}
                  placeholder="Ej: 5212221234567, 5213339876543 o uno por línea"
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="templateId">ID o nombre de la plantilla</Label>
                <Input
                  id="templateId"
                  type="text"
                  placeholder="mi_plantilla_aprobada"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="mediaUrl">URL del medio</Label>
                  <Input
                    id="mediaUrl"
                    type="text"
                    placeholder="https://fss.gupshup.io/img.jpg"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tipo de Medio</Label>
                  <ToggleGroup 
                    type="single" 
                    value={mediaType} 
                    onValueChange={(value: 'image' | 'video' | '') => {
                      setMediaType(value);
                    }}
                    className="justify-start pt-2"
                  >
                    <ToggleGroupItem value="image">image</ToggleGroupItem>
                    <ToggleGroupItem value="video">video</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
              <div>
                <Label htmlFor="variables">Variables de la plantilla (JSON array)</Label>
                <Input
                  id="variables"
                  className="font-mono"
                  type="text"
                  placeholder='["Juan", "10:00 AM", "Lunes"]'
                  value={variables}
                  onChange={(e) => setVariables(e.target.value)}
                />
                <span className="text-xs text-gray-500">Ejemplo: ["Juan", "10:00 AM", "Lunes"]</span>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Enviando..." : "Enviar Plantilla"}
              </Button>
              {result && <div className="mt-4 text-center font-semibold">{result}</div>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 