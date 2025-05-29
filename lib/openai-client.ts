/**
 * Cliente para interactuar con la API de OpenAI
 * Proporciona la capacidad de usar un mock en entorno de desarrollo
 */

import { mockOpenAIFetch } from '@/mock-openai';

// Verificar el entorno
const isDevelopment = process.env.NODE_ENV === 'development';
// Solo usar mock si está explícitamente activado
const useMock = isDevelopment && process.env.USE_OPENAI_MOCK === 'true';

console.log(`[OpenAI Client] Modo mock: ${useMock ? 'ACTIVADO' : 'DESACTIVADO'}`);

/**
 * Realiza una solicitud a la API de OpenAI, usando un mock si está configurado
 * @param url URL de la API
 * @param options Opciones de fetch
 * @returns Respuesta de la API
 */
export async function openAIFetch(url: string, options: any): Promise<Response> {
  // Log completo de URL y método para debugging
  console.log(`[OpenAI Client] Solicitud a: ${url} [Método: ${options.method}]`);
  
  // Si estamos usando mock en desarrollo
  if (useMock) {
    console.log(`[OpenAI Client] Usando mock para: ${url}`);
    return mockOpenAIFetch(url, options) as unknown as Response;
  }

  // Caso real - usar la API de OpenAI
  try {
    console.log(`[OpenAI Client] Solicitud real a: ${url}`);
    // Asegurarse de que las claves API se manejen correctamente
    const apiKey = options.headers['Authorization']?.split(' ')[1];
    if (apiKey) {
      const maskedKey = apiKey.substring(0, 10) + '...';
      console.log(`[OpenAI Client] Usando API key: ${maskedKey}`);
    } else {
      console.warn('[OpenAI Client] ADVERTENCIA: No se encontró la API key en los headers');
    }
    
    console.log(`[OpenAI Client] Headers completos: ${JSON.stringify(options.headers)}`);
    
    return await fetch(url, options);
  } catch (error) {
    console.error(`[OpenAI Client] Error en solicitud a ${url}:`, error);
    throw error;
  }
} 