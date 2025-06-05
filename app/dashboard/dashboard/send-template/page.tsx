'use client'

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '@/components/config';
import { supabase, getBusinessId } from '@/lib/supabase';

export default function SendTemplatePage() {
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [variables, setVariables] = useState("");
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
    const numbers = phoneNumbers
      .split(/[\n, ]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    try {
      const res = await fetch(`${API_BASE_URL}/api/send-template-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumbers: numbers,
          templateId,
          variables: variables ? JSON.parse(variables) : [],
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
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Envío masivo de plantilla WhatsApp</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Números de WhatsApp</label>
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            placeholder="Ej: 5212221234567, 5213339876543 o uno por línea"
            value={phoneNumbers}
            onChange={(e) => setPhoneNumbers(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">ID o nombre de la plantilla</label>
          <input
            className="w-full border rounded p-2"
            type="text"
            placeholder="mi_plantilla_aprobada"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Variables de la plantilla (JSON array)</label>
          <input
            className="w-full border rounded p-2 font-mono"
            type="text"
            placeholder='["Juan", "10:00 AM", "Lunes"]'
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
          />
          <span className="text-xs text-gray-500">Ejemplo: ["Juan", "10:00 AM", "Lunes"]</span>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar Plantilla"}
        </button>
        {result && <div className="mt-4 text-center font-semibold">{result}</div>}
      </form>
    </div>
  );
} 