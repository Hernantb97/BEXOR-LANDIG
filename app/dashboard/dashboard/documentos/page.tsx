'use client';

import { useState, useEffect } from 'react';
import DocumentUploader from "@/app/components/DocumentUploader";
import VectorStoreFiles from "@/app/components/VectorStoreFiles";
import DashboardLayout from "@/components/dashboard-layout";

export default function DocumentosPage() {
  const [businessConfig, setBusinessConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cargar la configuración del negocio
  useEffect(() => {
    const fetchBusinessConfig = async () => {
      try {
        const response = await fetch('/api/business/config');
        const data = await response.json();
        
        if (data.success) {
          setBusinessConfig(data.config);
        }
      } catch (error) {
        console.error('Error al cargar configuración del negocio:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinessConfig();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Gestión de Documentos</h1>
        <p className="text-gray-600 mb-8">
          Desde esta sección puedes subir y administrar los documentos que el asistente utilizará como referencia.
        </p>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : businessConfig ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Uploader de documentos */}
            <DocumentUploader 
              vectorStoreId={businessConfig.vector_store_id}
              businessId={businessConfig.id}
            />
            
            {/* Listado de archivos subidos */}
            <VectorStoreFiles 
              vectorStoreId={businessConfig.vector_store_id}
              businessId={businessConfig.id}
            />
          </div>
        ) : (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
            <p>No se pudo cargar la configuración del negocio. Por favor, intenta de nuevo más tarde.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 