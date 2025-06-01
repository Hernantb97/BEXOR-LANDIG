/**
 * Configuración local de fallback para cuando no podemos acceder a la base de datos
 * debido a restricciones de seguridad (RLS).
 */

export const businessConfigFallback = {
  // Configuración para Hernán Tenorio
  "2d385aa5-40e0-4ec9-9360-19281bc605e4": {
    id: "2d385aa5-40e0-4ec9-9360-19281bc605e4",
    business_id: "2d385aa5-40e0-4ec9-9360-19281bc605e4",
    business_name: "Hernán Tenorio",
    vector_store_id: "vs_67be1490f4448191908b08fbf4c4d508",
    openai_assistant_id: "asst_bdJlX30wF1qQH3Lf8ZoiptVx",
    openai_api_key: process.env.OPENAI_API_KEY,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

/**
 * Obtener configuración de fallback por ID
 */
export function getBusinessConfigFallback(businessId: string) {
  return businessConfigFallback[businessId as keyof typeof businessConfigFallback];
} 