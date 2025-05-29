"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings, MessageCircle, Bell, Shield, Users, ArrowLeft, Loader2, Check, Save, Upload, FileUp, AlertTriangle, FileText, Plus, X, Edit, PlusCircle, Trash, Calendar } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface BusinessConfig {
  vector_store_id?: string;
  [key: string]: any;
}

// Definir interface para el FileItem
interface FileItem {
  id: string;
  object: string;
  created_at: number;
  status: string;
  filename: string;
  purpose: string;
  bytes: number;
}

// Definir interface para las props de DocumentFilesList
interface DocumentFilesListProps {
  vectorStoreId?: string;
  businessId?: string;
  onFileDeleted?: () => void;
}

// Interface para las palabras clave de notificación
interface KeywordNotification {
  id: string;
  keyword: string;
  enabled: boolean;
  // Campos alternativos que podrían venir del backend
  text?: string;
  value?: string;
  palabra?: string;
  [key: string]: any; // Permitir cualquier otra propiedad
}

// Botón para copiar instrucciones
function CopyInstructionsButton() {
  const handleCopy = () => {
    const el = document.getElementById('calendar-instructions-block');
    const idEl = document.getElementById('business-id-copy');
    if (!el) return;
    let text = el.innerText;
    if (idEl && idEl.innerText && idEl.innerText !== '—') {
      text += `\nID del Negocio: ${idEl.innerText}`;
    }
    navigator.clipboard.writeText(text);
  };
  return (
    <button
      type="button"
      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium shadow"
      onClick={handleCopy}
    >
      Copiar instrucciones
    </button>
  );
}

export default function ConfigPanel() {
  const [loading, setLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [assistantName, setAssistantName] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [vectorStoreId, setVectorStoreId] = useState("")
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  
  // Estados para palabras clave de notificación
  const [keywords, setKeywords] = useState<KeywordNotification[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null)
  const [editingKeywordValue, setEditingKeywordValue] = useState("")
  const [loadingKeywords, setLoadingKeywords] = useState(false)
  const [savingKeyword, setSavingKeyword] = useState(false)
  
  const { toast } = useToast()
  const router = useRouter()

  // Cargar la configuración actual del asistente al montar el componente
  useEffect(() => {
    const fetchBusinessIdAndVectorStore = async () => {
      try {
        // Obtener el user_id del usuario autenticado
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userId = session.user.id;
          // Llamar al nuevo endpoint para obtener el negocio asociado
          const response = await fetch(`http://localhost:3095/api/my-business?user_id=${userId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.business && data.business.id) {
              setBusinessConfig({ id: data.business.id, name: data.business.name });
              // Ahora obtener el vector_store_id asociado a ese negocio
              const configResp = await fetch(`http://localhost:3095/api/business/config?business_id=${data.business.id}`);
              if (configResp.ok) {
                const configData = await configResp.json();
                if (configData.vector_store_id) {
                  setVectorStoreId(configData.vector_store_id);
                } else {
                  setVectorStoreId("");
                }
              } else {
                setVectorStoreId("");
              }
            } else {
              toast({
                title: "Error",
                description: "No se encontró un negocio asociado a tu usuario.",
                variant: "destructive"
              });
              setLoading(false);
              return;
            }
          } else if (response.status === 404) {
            toast({
              title: "Error",
              description: "No tienes una empresa asociada. Contacta a soporte.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          } else {
            toast({
              title: "Error",
              description: "Error al consultar el negocio asociado.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
        } else {
          toast({
            title: "Error",
            description: "No hay sesión activa. Inicia sesión para continuar.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al obtener el ID del negocio. Intenta recargar la página.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
    };
    fetchBusinessIdAndVectorStore();
  }, [toast]);

  // Efecto para cargar la configuración del asistente cuando businessConfig esté disponible
  useEffect(() => {
    const fetchAssistantConfig = async () => {
      if (!businessConfig?.id) return;
      try {
        const res = await fetch(`/api/business/config?business_id=${businessConfig.id}`);
        if (res.ok) {
          const config = await res.json();
          setAssistantName(config.assistant_name || "");
          setSystemPrompt(config.assistant_instructions || "");
        }
      } catch (err) {
        // Puedes mostrar un toast de error si quieres
      }
    };
    fetchAssistantConfig();
  }, [businessConfig]);

  // Efecto separado para cargar las palabras clave cuando businessConfig esté disponible
  useEffect(() => {
    // Solo cargar palabras clave si tenemos un businessId
    if (businessConfig?.id) {
      loadKeywordNotifications()
    }
  }, [businessConfig])

  // Cargar palabras clave de notificación
  const loadKeywordNotifications = async () => {
    try {
      setLoadingKeywords(true)
      
      // Obtener el businessId para filtrar las palabras clave
      const businessId = businessConfig?.id;
      
      if (!businessId) {
        console.error('No se pudo determinar el ID del negocio para cargar palabras clave')
        setKeywords([])
        return
      }
      
      console.log(`Cargando palabras clave para el negocio: ${businessId}`)
      
      // Llamada real a la API para cargar las palabras clave
      const response = await fetch(`/api/notifications/keywords-all?business_id=${businessId}`)
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('Respuesta cruda:', responseText);
        
        try {
          // Solo intentar parsear como JSON si parece JSON válido
          if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
            const data = JSON.parse(responseText);
            console.log('Respuesta de palabras clave (parseada):', data);
            
            // Verificar si hay datos de palabras clave en cualquier formato
            if (data && Array.isArray(data.keywords)) {
              console.log('Palabras clave cargadas correctamente como arreglo:', data.keywords);
              if (data.keywords.length > 0) {
                console.log('Estructura del primer objeto de palabra clave:', data.keywords[0]);
              }
              setKeywords(data.keywords);
            } else if (data && data.success && Array.isArray(data.keywords)) {
              console.log('Palabras clave cargadas con éxito:', data.keywords);
              if (data.keywords.length > 0) {
                console.log('Estructura del primer objeto de palabra clave:', data.keywords[0]);
              }
              setKeywords(data.keywords);
            } else if (data && Array.isArray(data)) {
              // Si la respuesta directamente es un array
              console.log('Palabras clave cargadas directamente como array:', data);
              if (data.length > 0) {
                console.log('Estructura del primer objeto de palabra clave:', data[0]);
              }
              setKeywords(data);
            } else {
              console.error('Formato de respuesta inesperado:', data);
              
              // TEMPORAL: Usar datos de ejemplo para probar la UI
              console.log('Usando datos de ejemplo para probar la UI');
              const dummyKeywords = [
                { id: '1', keyword: 'urgente', enabled: true },
                { id: '2', keyword: 'importante', enabled: true },
                { id: '3', keyword: 'presupuesto', enabled: false },
                { id: '4', keyword: 'contrato', enabled: true }
              ];
              setKeywords(dummyKeywords);
              
              toast({
                title: "Aviso",
                description: "Usando datos de ejemplo - La API devolvió un formato inesperado",
                variant: "default"
              });
            }
          } else {
            console.error('La respuesta no es un JSON válido:', responseText);
            
            // TEMPORAL: Usar datos de ejemplo para probar la UI
            console.log('Usando datos de ejemplo para probar la UI');
            const dummyKeywords = [
              { id: '1', keyword: 'urgente', enabled: true },
              { id: '2', keyword: 'importante', enabled: true },
              { id: '3', keyword: 'presupuesto', enabled: false },
              { id: '4', keyword: 'contrato', enabled: true }
            ];
            setKeywords(dummyKeywords);
            
            toast({
              title: "Aviso",
              description: "Usando datos de ejemplo - La respuesta del servidor no es válida",
              variant: "default"
            });
          }
        } catch (parseError) {
          console.error('Error al parsear respuesta:', parseError);
          
          // TEMPORAL: Usar datos de ejemplo para probar la UI
          console.log('Usando datos de ejemplo para probar la UI');
          const dummyKeywords = [
            { id: '1', keyword: 'urgente', enabled: true },
            { id: '2', keyword: 'importante', enabled: true },
            { id: '3', keyword: 'presupuesto', enabled: false },
            { id: '4', keyword: 'contrato', enabled: true }
          ];
          setKeywords(dummyKeywords);
          
          toast({
            title: "Error",
            description: "Error al procesar la respuesta del servidor. Usando datos de ejemplo.",
            variant: "destructive"
          });
        }
      } else {
        console.error('Error en la respuesta:', response.status);
        
        // TEMPORAL: Usar datos de ejemplo para probar la UI
        console.log('Usando datos de ejemplo para probar la UI');
        const dummyKeywords = [
          { id: '1', keyword: 'urgente', enabled: true },
          { id: '2', keyword: 'importante', enabled: true },
          { id: '3', keyword: 'presupuesto', enabled: false },
          { id: '4', keyword: 'contrato', enabled: true }
        ];
        setKeywords(dummyKeywords);
        
        toast({
          title: "Error",
          description: "No se pudieron cargar las palabras clave. Usando datos de ejemplo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error al cargar palabras clave:', error);
      
      // TEMPORAL: Usar datos de ejemplo para probar la UI
      console.log('Usando datos de ejemplo para probar la UI');
      const dummyKeywords = [
        { id: '1', keyword: 'urgente', enabled: true },
        { id: '2', keyword: 'importante', enabled: true },
        { id: '3', keyword: 'presupuesto', enabled: false },
        { id: '4', keyword: 'contrato', enabled: true }
      ];
      setKeywords(dummyKeywords);
      
      toast({
        title: "Error",
        description: "Error al cargar palabras clave. Usando datos de ejemplo.",
        variant: "destructive"
      });
    } finally {
      setLoadingKeywords(false)
    }
  }
  
  // Añadir una nueva palabra clave
  const addKeyword = async () => {
    if (!newKeyword.trim()) {
      toast({
        title: "Error",
        description: "La palabra clave no puede estar vacía",
        variant: "destructive"
      })
      return
    }
    
    try {
      setSavingKeyword(true)
      
      // Obtener el businessId para la palabra clave
      const businessId = businessConfig?.id;
      
      if (!businessId) {
        toast({
          title: "Error",
          description: "No se pudo determinar el ID del negocio",
          variant: "destructive"
        })
        return;
      }
      
      // Llamada real a la API para guardar
      const response = await fetch('/api/notifications/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyword: newKeyword.trim(),
          business_id: businessId,
          enabled: true 
        })
      })
      
      const data = await response.json();
      
      if (data.success && data.keyword) {
        // Añadir la palabra clave al estado
        setKeywords(prev => [...prev, data.keyword])
        setNewKeyword("")
        
        toast({
          title: "Palabra clave añadida",
          description: "La palabra clave se ha añadido con éxito",
          variant: "default",
          className: "bg-green-500 text-white"
        })
      } else {
        console.error('Error al añadir palabra clave:', data.error)
        toast({
          title: "Error",
          description: data.error || "No se pudo añadir la palabra clave",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al añadir palabra clave:', error)
      toast({
        title: "Error",
        description: "No se pudo añadir la palabra clave",
        variant: "destructive"
      })
    } finally {
      setSavingKeyword(false)
    }
  }
  
  // Actualizar el estado de habilitación de una palabra clave
  const toggleKeywordEnabled = async (id: string, currentEnabled: boolean) => {
    try {
      // Actualizar optimistamente el estado local
      const updatedKeywords = keywords.map(kw => 
        kw.id === id ? { ...kw, enabled: !currentEnabled } : kw
      )
      
      setKeywords(updatedKeywords)
      
      // Llamada real a la API para actualizar
      const response = await fetch(`/api/notifications/keywords?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled })
      })
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error al actualizar estado:', data.error)
        // Revertir el cambio en caso de error
        setKeywords(keywords)
        
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar el estado de la palabra clave",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al actualizar estado de palabra clave:', error)
      
      // Revertir el cambio en caso de error
      setKeywords(keywords)
      
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la palabra clave",
        variant: "destructive"
      })
    }
  }
  
  // Iniciar edición de una palabra clave
  const startEditingKeyword = (id: string, value: string) => {
    setEditingKeywordId(id)
    setEditingKeywordValue(value)
  }
  
  // Guardar la edición de una palabra clave
  const saveKeywordEdit = async (id: string) => {
    if (!editingKeywordValue.trim()) {
      toast({
        title: "Error",
        description: "La palabra clave no puede estar vacía",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Actualizar optimistamente el estado local
      const updatedKeywords = keywords.map(kw => 
        kw.id === id ? { ...kw, keyword: editingKeywordValue.trim() } : kw
      )
      
      setKeywords(updatedKeywords)
      setEditingKeywordId(null)
      setEditingKeywordValue("")
      
      // Llamada real a la API para actualizar
      const response = await fetch(`/api/notifications/keywords?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: editingKeywordValue.trim() })
      })
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Palabra clave actualizada",
          description: "La palabra clave se ha actualizado con éxito",
          variant: "default",
          className: "bg-green-500 text-white"
        })
      } else {
        console.error('Error al actualizar palabra clave:', data.error)
        // Recargar palabras clave en caso de error
        loadKeywordNotifications()
        
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar la palabra clave",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al actualizar palabra clave:', error)
      // Recargar palabras clave en caso de error
      loadKeywordNotifications()
      
      toast({
        title: "Error",
        description: "No se pudo actualizar la palabra clave",
        variant: "destructive"
      })
    }
  }
  
  // Eliminar una palabra clave
  const deleteKeyword = async (id: string) => {
    try {
      // Actualizar optimistamente el estado local
      setKeywords(keywords.filter(kw => kw.id !== id))
      
      // Llamada real a la API para eliminar
      const response = await fetch(`/api/notifications/keywords?id=${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Palabra clave eliminada",
          description: "La palabra clave se ha eliminado con éxito",
          variant: "default",
          className: "bg-green-500 text-white"
        })
      } else {
        console.error('Error al eliminar palabra clave:', data.error)
        // Recargar las palabras clave en caso de error
        loadKeywordNotifications()
        
        toast({
          title: "Error",
          description: data.error || "No se pudo eliminar la palabra clave",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al eliminar palabra clave:', error)
      
      // Recargar las palabras clave en caso de error
      loadKeywordNotifications()
      
      toast({
        title: "Error",
        description: "No se pudo eliminar la palabra clave",
        variant: "destructive"
      })
    }
  }
  
  // Cancelar la edición
  const cancelKeywordEdit = () => {
    setEditingKeywordId(null)
    setEditingKeywordValue("")
  }

  // Guardar la configuración del asistente con retroalimentación mejorada
  const saveAssistantConfig = async () => {
    try {
      setLoading(true)
      setSaveSuccess(false)
      console.log('Iniciando guardado de configuración del asistente...')
      
      // Verificamos que tenemos el ID del negocio
      if (!businessConfig?.id) {
        console.error('No se pudo determinar el ID del negocio para guardar')
        toast({
          title: "Error",
          description: "No se pudo determinar el ID del negocio",
          variant: "destructive"
        })
        setLoading(false)
        return
      }
      
      // Preparar los datos del asistente para enviar al backend
      const datosAsistente = {
        name: assistantName,
        instructions: systemPrompt,
        vector_store_id: vectorStoreId
      }
      
      console.log(`Guardando datos del asistente para el negocio ${businessConfig.id}:`, datosAsistente)
      
      // Usamos el nuevo endpoint para actualizar el asistente en OpenAI y en la base de datos
      const response = await fetch('/api/openai/update-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: businessConfig.id,
          assistant_data: datosAsistente
        })
      })

      const resultado = await response.json()
      console.log('Respuesta de actualización:', resultado)
      
      if (resultado.success) {
        console.log('Actualización exitosa del asistente')
        setSaveSuccess(true)
        
        // Mostrar mensaje apropiado seguín si se actualizó en OpenAI o solo localmente
        if (resultado.openai_update) {
          console.log('Asistente actualizado en OpenAI y BD local')
          toast({
            title: "Configuración Guardada",
            description: "Asistente actualizado correctamente en OpenAI y base de datos",
            variant: "default",
            className: "bg-green-500 text-white"
          })
        } else {
          console.log('Asistente actualizado solo en BD local')
          toast({
            title: "Configuración Guardada Localmente",
            description: "Asistente actualizado solo en base de datos local",
            variant: "default",
            className: "bg-blue-500 text-white"
          })
        }
        
        // Actualizar la UI con los datos del asistente recibidos
        if (resultado.assistant) {
          console.log('Actualizando UI con datos del asistente recibidos:', resultado.assistant)
          setAssistantName(resultado.assistant.name || "")
          setSystemPrompt(resultado.assistant.instructions || "")
          if (resultado.assistant.vector_store_id) {
            setVectorStoreId(resultado.assistant.vector_store_id)
          }
        }
      } else {
        console.error("Error al guardar:", resultado.error)
        toast({
          title: "Error",
          description: resultado.error || "No se pudo guardar la configuración",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al comunicarse con el servidor",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      // Desactivar la indicación de éxito después de 3 segundos
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    }
  }

  // Manejar la carga de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files))
      setUploadError(null)
    }
  }

  const uploadFiles = async () => {
    if (!vectorStoreId) {
      setUploadError("Se requiere un ID de Vector Store válido para subir archivos")
      return
    }

    if (uploadedFiles.length === 0) {
      setUploadError("Por favor, selecciona al menos un archivo para subir")
      return
    }
    
    // Verificar que tenemos ID de negocio
    if (!businessConfig?.id) {
      setUploadError("Se requiere el ID del negocio para subir archivos")
      toast({
        title: "Error",
        description: "No se pudo determinar el ID del negocio",
        variant: "destructive"
      })
      return
    }

    try {
      setUploading(true)
      setUploadError(null)
      setUploadSuccess(false)
      
      console.log("Preparando archivos para subir:", uploadedFiles.map(f => f.name))
      console.log("Vector Store ID:", vectorStoreId)
      console.log("Business ID:", businessConfig.id)
      
      const formData = new FormData()
      uploadedFiles.forEach(file => {
        formData.append('files', file)
        console.log(`Añadido archivo a FormData: ${file.name}, tamaño: ${file.size} bytes`)
      })
      formData.append('vector_store_id', vectorStoreId)
      formData.append('business_id', businessConfig.id)
      
      console.log("Enviando solicitud para subir archivos...")
      
      try {
        // Usamos el nuevo endpoint para subir archivos a OpenAI
        const response = await fetch('/api/openai/upload-files', {
          method: 'POST',
          body: formData
        })

        console.log("Respuesta HTTP:", response.status, response.statusText)
        
        // Intentar leer el cuerpo de la respuesta
        let data
        try {
          data = await response.json()
          console.log("Datos de respuesta:", data)
        } catch (jsonError) {
          console.error("Error al parsear la respuesta JSON:", jsonError)
          throw new Error(`Error al procesar la respuesta: ${response.statusText}`)
        }
        
        if (data.success) {
          setUploadSuccess(true)
          setUploadedFiles([])
          
          // Mostrar mensaje apropiado seguín si se subiu00f3 a OpenAI o solo localmente
          if (data.openai_upload) {
            toast({
              title: "Archivos Subidos",
              description: "Los documentos se han subido correctamente a OpenAI",
              variant: "default",
              className: "bg-green-500 text-white"
            })
          } else {
            toast({
              title: "Archivos Almacenados Localmente",
              description: "Los archivos se han guardado localmente (sin conexiu00f3n a OpenAI)",
              variant: "default",
              className: "bg-blue-500 text-white"
            })
          }
        } else {
          console.error("Error al subir:", data.error)
          setUploadError(data.error || "No se pudieron subir los archivos")
          toast({
            title: "Error",
            description: data.error || "No se pudieron subir los archivos",
            variant: "destructive"
          })
        }
      } catch (fetchError: any) {
        console.error("Error en la solicitud fetch:", fetchError)
        setUploadError(`Error de red: ${fetchError.message}`)
        toast({
          title: "Error de Red",
          description: `No se pudo conectar con el servidor: ${fetchError.message}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setUploadError("Ocurriu00f3 un error al comunicarse con el servidor")
      toast({
        title: "Error",
        description: "Ocurriu00f3 un error al comunicarse con el servidor",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      // Desactivar la indicaciu00f3n de u00e9xito despuu00e9s de 3 segundos
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-3xl font-semibold">Configuración del Sistema</h1>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Regresar al Dashboard
        </Button>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center">
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>OpenAI</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            <span>Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Google Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span>Seguridad</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Configuración de OpenAI */}
        <TabsContent value="general">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Columna izquierda: Formulario */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Asistente</CardTitle>
                <CardDescription>
                  Configura la información básica y comportamiento de tu asistente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assistantName">Nombre del Asistente</Label>
                  <Input
                    id="assistantName"
                    placeholder="Ej: Asistente de Ventas"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">Instrucciones del Sistema</Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="Instrucciones detalladas sobre cómo debe comportarse el asistente..."
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="min-h-[250px]"
                    disabled={loading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Define la personalidad, conocimientos y límites del asistente. Sé específico.
                  </p>
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={saveAssistantConfig}
                      disabled={loading}
                      className={saveSuccess ? "bg-green-500 hover:bg-green-600" : ""}
                      size="lg"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </span>
                      ) : saveSuccess ? (
                        <span className="flex items-center">
                          <Check className="mr-2 h-4 w-4" />
                          ¡Guardado con éxito!
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Configuración
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Columna derecha: Instrucciones Google Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Instrucciones Google Calendar</CardTitle>
                <div className="mb-2 mt-2 p-2 bg-blue-100 text-blue-800 rounded text-sm font-semibold text-center">
                  Copia y pega esto en las instrucciones del asistente para que pueda consultar y generar citas una vez activado Google Calendar
                </div>
                <div className="flex justify-end mb-2">
                  <CopyInstructionsButton />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div id="calendar-instructions-block">
                    <ol className="list-decimal list-inside mb-2">
                      <li>Cuando un usuario pregunte por disponibilidad, usa <b>get_calendar_info</b> con la fecha mencionada.</li>
                      <li>Si el usuario quiere agendar una cita, primero verifica disponibilidad con <b>get_calendar_info</b> y luego usa <b>schedule_appointment</b>.</li>
                      <li>Si el usuario pregunta por sus citas, usa <b>find_customer_appointments</b>.</li>
                      <li>Si el usuario quiere cancelar una cita, usa <b>delete_calendar_event</b>.</li>
                    </ol>
                    <div className="mb-2">
                      <b>Importante:</b>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Siempre confirma los detalles antes de agendar (fecha, hora, nombre).</li>
                        <li>Usa el formato correcto para fechas (YYYY-MM-DD) y horas (HH:MM).</li>
                        <li>Para agendar citas, <b>SIEMPRE</b> usa el número de teléfono del usuario que está haciendo la consulta.</li>
                        <li><b>NO</b> inventes horarios disponibles. <b>SIEMPRE</b> consulta primero con get_calendar_info.</li>
                        <li>TODAS las fechas y horas se manejan en la zona horaria de Ciudad de México (America/Mexico_City).</li>
                        <li>Cuando el usuario mencione fechas relativas como "mañana", "pasado mañana", o "la próxima semana", debes calcularlas correctamente basándote en la fecha actual en México.</li>
                        <li><b>SIEMPRE</b> verifica los días de la semana correctamente. Si hoy es 20 de mayo de 2025 (martes), entonces "mañana" es 21 de mayo de 2025 (miércoles).</li>
                        <li>Antes de ofrecer un horario, verifica que sea válido para el día de la semana correcto según la fecha.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-700 flex items-center gap-2">
                    <span className="font-semibold">ID del Negocio:</span>
                    <span id="business-id-copy" className="font-mono select-all text-base">{businessConfig?.id || '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={saveAssistantConfig}
              disabled={loading}
              className={saveSuccess ? "bg-green-500 hover:bg-green-600" : ""}
              size="lg"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </span>
              ) : saveSuccess ? (
                <span className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  ¡Guardado con éxito!
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Configuración
                </span>
              )}
            </Button>
          </div>
        </TabsContent>
        
        {/* Nueva pestaña de Documentos */}
        <TabsContent value="documents">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subir Documentos</CardTitle>
                <CardDescription>
                  Sube archivos para que el asistente los consulte y use como referencia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-gray-50">
                  <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Sube archivos para que el asistente pueda consultarlos</p>
                  <p className="text-xs text-gray-400 mb-3">PDF, DOCX, TXT, CSV (máx. 20MB)</p>
                  
                  {!vectorStoreId && (
                    <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-md w-full max-w-sm mb-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                      <p className="text-sm text-amber-700">
                        Se requiere un ID de Vector Store válido para subir archivos.
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Por favor, especifique un ID en la sección de Datos del Asistente.
                      </p>
                    </div>
                  )}
                  
                  {vectorStoreId && (
                    <>
                      <Input
                        type="file"
                        id="file-upload-documentos"
                        className="hidden"
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.docx,.txt,.csv"
                        disabled={uploading}
                      />
                      <div className="flex flex-col gap-3 w-full max-w-sm">
                        <Label
                          htmlFor="file-upload-documentos"
                          className="cursor-pointer bg-white border border-gray-300 rounded-md py-2 px-4 flex items-center justify-center text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Seleccionar archivos
                        </Label>
                        
                        {uploadedFiles.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">{uploadedFiles.length} archivo(s) seleccionado(s):</p>
                            <ul className="text-xs text-gray-500 space-y-1 max-h-20 overflow-auto">
                              {uploadedFiles.map((file, index) => (
                                <li key={`file-${file.name}-${index}`}>{file.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <Button 
                          onClick={uploadFiles} 
                          disabled={uploading || uploadedFiles.length === 0}
                          className={uploadSuccess ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {uploading ? (
                            <span className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Subiendo...
                            </span>
                          ) : uploadSuccess ? (
                            <span className="flex items-center">
                              <Check className="mr-2 h-4 w-4" />
                              ¡Subido con éxito!
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Upload className="mr-2 h-4 w-4" />
                              Subir a OpenAI
                            </span>
                          )}
                        </Button>
                        
                        {uploadError && (
                          <div className="text-red-500 text-xs mt-1">
                            {uploadError}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {vectorStoreId && (
                    <div className="text-xs text-blue-600 mt-3">
                      Los archivos se subirán al Vector Store: <span className="font-medium">{vectorStoreId}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Los documentos subidos se guardarán en el Vector Store especificado y estarán disponibles para su consulta por el asistente.
                </p>
              </CardContent>
            </Card>
            
            {/* Lista de archivos existentes */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos Existentes</CardTitle>
                <CardDescription>
                  Gestiona los documentos que ya has subido al Vector Store
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vectorStoreId ? (
                  <DocumentFilesList 
                    vectorStoreId={vectorStoreId}
                    businessId={businessConfig?.id}
                    onFileDeleted={() => toast({
                      title: "Archivo eliminado",
                      description: "El documento ha sido eliminado correctamente",
                      variant: "default",
                      className: "bg-green-500 text-white"
                    })}
                  />
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm text-amber-700">
                      Se requiere un ID de Vector Store válido para ver los documentos.
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Configura el Vector Store ID en la sección OpenAI.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Modificación de la pestaña de Notificaciones */}
        <TabsContent value="notifications">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Notificaciones</CardTitle>
                <CardDescription>
                  Configura qué notificaciones recibir y cómo recibirlas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="push-notifications">Notificaciones Push</Label>
                  <Switch id="push-notifications" />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                  <Switch id="email-notifications" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Palabras Clave para Notificaciones</CardTitle>
                <CardDescription>
                  Define palabras clave que activarán notificaciones y cambios en el dashboard cuando aparezcan en las conversaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Nueva palabra clave"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    disabled={savingKeyword}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    onClick={addKeyword}
                    disabled={!newKeyword.trim() || savingKeyword}
                  >
                    {savingKeyword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="h-4 w-4 mr-1" />
                    )}
                    Añadir
                  </Button>
                </div>
                
                {loadingKeywords ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-gray-500">Cargando palabras clave...</span>
                  </div>
                ) : keywords.length === 0 ? (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-center">
                    <p>No hay palabras clave configuradas</p>
                    <p className="text-sm mt-1">Añade palabras clave para activar notificaciones automáticas</p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Palabra Clave</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {keywords.map((keyword, index) => (
                            <tr key={`keyword-${keyword.id || index}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                {editingKeywordId === keyword.id ? (
                                  <Input
                                    value={editingKeywordValue}
                                    onChange={(e) => setEditingKeywordValue(e.target.value)}
                                    className="max-w-[180px]"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        saveKeywordEdit(keyword.id);
                                      }
                                      if (e.key === 'Escape') {
                                        e.preventDefault();
                                        cancelKeywordEdit();
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="text-base font-medium text-gray-900 break-words max-w-[180px]">
                                    {/* Renderizar el texto de la palabra clave usando cualquier propiedad disponible */}
                                    {typeof keyword === 'string' 
                                      ? keyword 
                                      : keyword.keyword || keyword.text || keyword.value || keyword.palabra || 
                                        (keyword.id ? `Palabra clave ${index+1}` : JSON.stringify(keyword))}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Switch 
                                  checked={keyword.enabled} 
                                  onCheckedChange={() => toggleKeywordEnabled(keyword.id, keyword.enabled)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {editingKeywordId === keyword.id ? (
                                  <div className="space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => saveKeywordEdit(keyword.id)}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={cancelKeywordEdit}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEditingKeyword(keyword.id, keyword.keyword)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => deleteKeyword(keyword.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-gray-500 mt-4">
                  Las palabras clave definidas activarán notificaciones automáticas cuando aparezcan en las conversaciones. 
                  También moverán a los clientes a la columna de prioridad en el dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Nueva pestaña para Google Calendar */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Configuración de Google Calendar</CardTitle>
              <CardDescription>
                Configura la integración con Google Calendar para gestionar las citas de tu negocio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button variant="default" onClick={() => router.push('/dashboard/config/calendar')}>
                  <Calendar className="mr-2 h-4 w-4" /> Configurar Google Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>
                Administra la seguridad de tu cuenta y negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña Actual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button className="w-full">Actualizar Contraseña</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra usuarios y permisos de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Próximamente: Administración de usuarios y permisos del sistema.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente para mostrar y gestionar archivos existentes
function DocumentFilesList({ vectorStoreId, businessId, onFileDeleted }: DocumentFilesListProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadFiles = async () => {
    if (!vectorStoreId) {
      setError("Se necesita un ID de Vector Store para cargar archivos")
      return
    }
    
    if (!businessId) {
      setError("Se necesita un ID de negocio para cargar archivos")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Utilizamos el nuevo endpoint para obtener la lista de archivos
      const response = await fetch(`/api/openai/list-files?vector_store_id=${vectorStoreId}&business_id=${businessId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFiles(data.files || [])
          
          // Mostrar mensaje si los datos son locales (sin conexiu00f3n a OpenAI)
          if (!data.openai_connected && data.files.length > 0) {
            toast({
              title: "Aviso",
              description: "Mostrando archivo almacenados localmente (sin conexiu00f3n a OpenAI)",
              variant: "default"
            })
          }
        } else {
          console.error("Error al cargar archivos:", data.error)
          setError(data.error || "No se pudieron cargar los archivos")
          toast({
            title: "Error",
            description: data.error || "No se pudieron cargar los archivos",
            variant: "destructive"
          })
        }
      } else {
        console.error("Error en la respuesta:", response.status)
        setError(`Error HTTP: ${response.status}`)
        toast({
          title: "Error",
          description: `Error al cargar archivos: ${response.statusText}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      setError("Ocurriu00f3 un error al comunicarse con el servidor")
      toast({
        title: "Error",
        description: "Ocurriu00f3 un error al comunicarse con el servidor",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Funciou00f3n para eliminar un archivo
  const deleteFile = async (fileId: string) => {
    if (!vectorStoreId) {
      toast({
        title: "Error",
        description: "No se pudo determinar el Vector Store ID",
        variant: "destructive"
      })
      return
    }
    
    if (!businessId) {
      toast({
        title: "Error",
        description: "No se pudo determinar el ID del negocio",
        variant: "destructive"
      })
      return
    }
    
    setLoading(true)
    
    try {
      // Usamos el nuevo endpoint para eliminar archivos
      const response = await fetch('/api/openai/delete-file', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vector_store_id: vectorStoreId,
          file_id: fileId,
          business_id: businessId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Mostrar mensaje apropiado segu00fan si se eliminu00f3 de OpenAI o solo localmente
        if (data.openai_delete) {
          toast({
            title: "Archivo eliminado correctamente",
            description: "El archivo ha sido eliminado de OpenAI y la base de datos",
            variant: "default",
            className: "bg-green-500 text-white"
          });
        } else {
          toast({
            title: "Archivo eliminado localmente",
            description: "El archivo ha sido eliminado de la base de datos local (sin conexiu00f3n a OpenAI)",
            variant: "default",
            className: "bg-blue-500 text-white"
          });
        }
        
        // Actualizar la lista despuu00e9s de eliminar
        loadFiles();
        if (onFileDeleted) onFileDeleted();
      } else {
        toast({
          title: "Error al eliminar archivo",
          description: data.error || "No se pudo eliminar el archivo",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Error al eliminar archivo",
        description: err.message || "Error de conexiu00f3n",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar archivos al montar el componente
  useEffect(() => {
    if (vectorStoreId) {
      loadFiles();
    }
  }, [vectorStoreId, businessId]);
  
  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Archivos disponibles</h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={loadFiles}
          disabled={loading}
          className="flex items-center"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileText className="h-4 w-4 mr-1" />}
          {loading ? "Cargando..." : "Actualizar"}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : files.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-5 rounded text-center">
          <p>No hay documentos subidos en este Vector Store.</p>
          <p className="text-sm mt-1">Sube archivos usando el formulario superior.</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto max-w-full max-h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={`file-${file.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-base font-medium text-gray-900 break-words max-w-[180px]" title={file.filename}>
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteFile(file.id)}
                        disabled={loading}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}