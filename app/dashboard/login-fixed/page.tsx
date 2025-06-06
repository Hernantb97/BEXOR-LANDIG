'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { testWithFixed, supabaseFixed } from '@/lib/supabase-fixed'

// Definir una interfaz para el tipo de error que devuelve Supabase
interface SupabaseError {
  message?: string;
  [key: string]: any;
}

export default function LoginFixed() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await testWithFixed(email, password)
      
      if (result.success) {
        setSuccess('Inicio de sesión exitoso. Redirigiendo...')
        
        // Get and store business_id if possible
        const { data: { user } } = await supabaseFixed.auth.getUser()
        
        if (user) {
          const { data: profiles } = await supabaseFixed
            .from('profiles')
            .select('business_id')
            .eq('id', user.id)
            .single()
            
          if (profiles?.business_id) {
            localStorage.setItem('businessId', profiles.business_id)
            console.log('ID de negocio guardado:', profiles.business_id)
          }
        }
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        const errorMessage = (result.error as SupabaseError)?.message || 'Credenciales inválidas'
        setError(`Error: ${errorMessage}`)
      }
    } catch (err) {
      setError(`Error inesperado: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Inicio de sesión (Versión actualizada)</h1>
          <p className="mt-2 text-sm text-gray-600">
            Esta página usa la API key actualizada de Supabase
          </p>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
            {success}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 