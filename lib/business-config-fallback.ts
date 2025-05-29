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
    openai_api_key: process.env.OPENAI_API_KEY || "***REMOVED***proj-mofAT5Vu4hmL1NmOBjQiK18v8vuAqe8ETJX7ZJSIjigdlp7CEokUax15RsyD4sIrN2TFdJpGv5T3BlbkFJn0WFt5zfZ07BD3n2hpvTdZIJbfexIMPHpez1qDPaM0Al_BJ0D8fbcH0-FZ1OKjTVFv6IR5yh4A",
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