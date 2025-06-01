'use client';

import React, { useState, useEffect } from 'react';

interface VectorStoreFilesProps {
  vectorStoreId?: string;
  businessId?: string;
}

interface FileItem {
  id: string;
  object: string;
  created_at: number;
  status: string;
  filename: string;
  purpose: string;
  bytes: number;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const VectorStoreFiles: React.FC<VectorStoreFilesProps> = ({ vectorStoreId, businessId }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVectorStoreId, setCurrentVectorStoreId] = useState<string | undefined>(vectorStoreId);
  const [notification, setNotification] = useState({ show: false, message: '', isError: false });

  // Función para cargar los archivos
  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (currentVectorStoreId) params.append('vector_store_id', currentVectorStoreId);
      if (businessId) params.append('business_id', businessId);
      
      const response = await fetch(`/api/assistant/vector-files?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files || []);
        if (data.vectorStoreId && !currentVectorStoreId) {
          setCurrentVectorStoreId(data.vectorStoreId);
        }
      } else {
        setError(data.error || 'Error al cargar archivos');
        setFiles([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar archivos al montar el componente
  useEffect(() => {
    loadFiles();
  }, [vectorStoreId, businessId]);

  // Función para eliminar un archivo
  const deleteFile = async (fileId: string) => {
    if (!currentVectorStoreId) {
      setNotification({
        show: true,
        message: 'No se pudo determinar el Vector Store ID',
        isError: true
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/assistant/vector-files', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vector_store_id: currentVectorStoreId,
          file_id: fileId,
          business_id: businessId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          show: true,
          message: 'Archivo eliminado correctamente',
          isError: false
        });
        // Actualizar la lista después de eliminar
        setFiles(files.filter(file => file.id !== fileId));
      } else {
        setNotification({
          show: true,
          message: data.error || 'Error al eliminar archivo',
          isError: true
        });
      }
    } catch (err: any) {
      setNotification({
        show: true,
        message: err.message || 'Error de conexión',
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Ocultar notificación después de 3 segundos
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Archivos en Vector Store</h2>
        <button 
          onClick={loadFiles}
          disabled={loading}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
          title="Actualizar lista"
        >
          {loading ? "Cargando..." : "↻"}
        </button>
      </div>
      
      {currentVectorStoreId && (
        <p className="text-sm text-gray-500 mb-4">
          Vector Store ID: {currentVectorStoreId}
        </p>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {notification.show && (
        <div className={`px-4 py-3 rounded mb-4 ${notification.isError ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'}`}>
          {notification.message}
        </div>
      )}
      
      {files.length === 0 && !loading && !error ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          No hay archivos en el Vector Store. Sube archivos para que el asistente pueda consultarlos.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Archivo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tamaño</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-base font-medium text-gray-900 break-words max-w-[200px]" title={file.filename}>
                      {file.filename}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="text-gray-400">ID:</span> <span className="font-mono">{file.id.substring(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatFileSize(file.bytes)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${file.status === 'processed' ? 'bg-green-100 text-green-800' : 
                        file.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => deleteFile(file.id)}
                      disabled={loading}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                      title="Eliminar archivo"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VectorStoreFiles; 