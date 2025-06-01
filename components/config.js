/**
 * Configuración global para la aplicación
 */

// Configuración para variables de entorno en Next.js
// Usa el prefijo NEXT_PUBLIC_ para exponerlas al cliente

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3095';
// Agrega aquí otras variables que necesites exportar

// Configuraciones principales para la aplicación

// URLs base para APIs
export const API_BASE_URL_OLD = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3095';

// URL para la API de WhatsApp - Configurada según ambiente
// En desarrollo: Proxy local (localhost:3096)
// En producción: URL directa de Render
const isDevelopment = process.env.NODE_ENV !== 'production';
export const WHATSAPP_BOT_URL = 'https://whatsapp-bot-if6z.onrender.com';

export const DEFAULT_BUSINESS_ID = process.env.NEXT_PUBLIC_DEFAULT_BUSINESS_ID || '2d385aa5-40e0-4ec9-9360-19281bc605e4';
export const BOT_API_BASE_URL = WHATSAPP_BOT_URL;

// Configuración para modo de datos
export const USE_MOCK_DATA = false; // Usar datos reales

// Configuración específica para WhatsApp
export const DISABLE_WHATSAPP_SIMULATION = true; // Deshabilitar simulación de envío a WhatsApp
export const SHOW_SIMULATION_WARNINGS = true; // Mostrar advertencias claras cuando los mensajes son simulados

// Log para depuración
console.log(`🌐 WhatsApp Bot URL configurada: ${WHATSAPP_BOT_URL} (${isDevelopment ? 'desarrollo' : 'producción'})`);

// Exportar como objeto por defecto para facilitar importación
export default {
  API_BASE_URL,
  BOT_API_BASE_URL,
  DEFAULT_BUSINESS_ID,
  WHATSAPP_BOT_URL,
  
  // Configuraciones para análisis
  shouldCaptureAnalytics: true,
  
  // Configuraciones para el panel
  defaultDashboardTab: 'all',
  
  // Otras configuraciones
  APP_NAME: 'Dashboard WhatsApp',
  VERSION: '1.0.0',
  USE_MOCK_DATA,
  DISABLE_WHATSAPP_SIMULATION,
  SHOW_SIMULATION_WARNINGS
}; 