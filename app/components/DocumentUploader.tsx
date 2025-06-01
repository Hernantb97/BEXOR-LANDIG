'use client';

import React, { useState, useRef } from 'react';

interface DocumentUploaderProps {
  vectorStoreId?: string;
  businessId?: string;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ vectorStoreId, businessId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
    files?: { fileName: string; success: boolean; error?: string }[];
  } | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!files.length) {
      setUploadStatus({
        success: false,
        message: 'Por favor, selecciona al menos un archivo'
      });
      return;
    }
    
    if (!businessId) {
      setUploadStatus({
        success: false,
        message: 'Error: business_id es obligatorio'
      });
      return;
    }
    
    setUploading(true);
    setUploadStatus(null);
    setDebugInfo(null);
    
    // ⭐ ENFOQUE DIRECTO SIN MIDDLEWARE ⭐
    try {
      // Crear FormData
      const formData = new FormData();
      
      // Agregar archivos
      files.forEach(file => {
        formData.append('file', file);
      });
      
      // Agregar business_id - IMPORTANTE USAR EL FORMATO EXACTO QUE ESPERA EL BACKEND
      formData.append('business_id', businessId);
      
      if (vectorStoreId) {
        formData.append('vector_store_id', vectorStoreId);
      }
      
      // Log para depuración
      console.log(`[Debug] Enviando business_id: "${businessId}"`);
      console.log(`[Debug] Tipo de business_id: ${typeof businessId}`);
      console.log(`[Debug] Keys en FormData: ${[...formData.keys()]}`);
      
      // Primero, enviamos a nuestro endpoint de depuración
      const debugResponse = await fetch('/api/debug-formdata', {
        method: 'POST',
        body: formData
      });
      
      const debugData = await debugResponse.json();
      setDebugInfo(debugData);
      
      // Crear un nuevo FormData para la solicitud real
      const uploadFormData = new FormData();
      
      // Agregar archivos de nuevo
      files.forEach(file => {
        uploadFormData.append('file', file);
      });
      
      // Agregar business_id - Mantenemos exactamente el mismo formato
      uploadFormData.append('business_id', businessId);
      
      if (vectorStoreId) {
        uploadFormData.append('vector_store_id', vectorStoreId);
      }
      
      // Enviamos directamente al backend
      const response = await fetch('http://localhost:3096/api/openai/upload-file', {
        method: 'POST',
        body: uploadFormData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploadStatus({
          success: true,
          message: result.message || 'Archivos subidos correctamente',
          files: result.results
        });
        // Limpiar el campo de archivos
        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadStatus({
          success: false,
          message: result.error || 'Error al subir archivos',
          files: result.results
        });
      }
    } catch (error: any) {
      setUploadStatus({
        success: false,
        message: error.message || 'Error inesperado al subir archivos'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Gestión de Documentos</h2>
      <p className="text-gray-500 mb-6">
        Sube archivos para que el asistente los consulte y use como referencia
      </p>
      
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg bg-gray-50 mb-4">
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500 py-2 px-3 
              border border-gray-300 rounded-md shadow-sm 
              focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-2 text-xs text-gray-500">
            PDF, DOCX, TXT, CSV (máx. 20MB)
          </p>
        </div>
        
        {files.length > 0 && (
          <div className="mb-4">
            <p className="font-medium mb-2">Archivos seleccionados:</p>
            <ul className="text-sm">
              {files.map((file, index) => (
                <li key={`selected-file-${index}`} className="py-1">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {!businessId && (
          <div className="mb-4 p-4 rounded-md bg-yellow-50 text-yellow-700">
            <p className="font-medium">Advertencia: No se detectó ID de negocio</p>
            <p className="text-sm">El ID de negocio es obligatorio para subir archivos.</p>
          </div>
        )}
        
        {uploadStatus && (
          <div className={`mb-4 p-4 rounded-md ${uploadStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="font-medium">{uploadStatus.message}</p>
            
            {uploadStatus.files && uploadStatus.files.length > 0 && (
              <ul className="mt-2 text-sm">
                {uploadStatus.files.map((file, index) => (
                  <li key={`status-file-${index}`} className={file.success ? 'text-green-600' : 'text-red-600'}>
                    {file.fileName}: {file.success ? 'Subido correctamente' : file.error || 'Error'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {debugInfo && (
          <div className="mb-4 p-4 rounded-md bg-blue-50 text-blue-700 overflow-auto max-h-40">
            <p className="font-medium">Información de Depuración:</p>
            <pre className="text-xs mt-2">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        
        <div className="text-center">
          <button
            type="submit"
            disabled={uploading || files.length === 0 || !businessId}
            className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {uploading ? 'Subiendo...' : 'Subir a OpenAI'}
          </button>
          
          {vectorStoreId && (
            <p className="mt-4 text-sm text-gray-500">
              Los archivos se subirán al Vector Store: {vectorStoreId}
            </p>
          )}
          
          {businessId && (
            <p className="mt-2 text-sm text-gray-500">
              Business ID: {businessId}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default DocumentUploader; 