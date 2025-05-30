import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-primary hover:text-primary/80">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Términos y Condiciones</h1>
          <p className="text-gray-500 mb-8">Última actualización: 3 de mayo de 2025</p>

          <div className="prose prose-lg max-w-none">
            <p>
              Estos términos regulan el uso de los servicios ofrecidos por BEXOR. Al usar nuestra plataforma, aceptas lo
              siguiente:
            </p>

            <h2>1. Descripción del servicio</h2>
            <p>BEXOR provee agentes de inteligencia artificial integrados a WhatsApp, incluyendo:</p>

            <ul>
              <li>Instalación de bot personalizado.</li>
              <li>Acceso a CRM con análisis de leads.</li>
              <li>Entrenamiento y configuración de IA especializada.</li>
              <li>Notificaciones automáticas vía email.</li>
            </ul>

            <h2>2. Pagos</h2>
            <ul>
              <li>
                <strong>Suscripción mensual:</strong> USD $99.
              </li>
              <li>
                <strong>Pasarela de pago:</strong> Todos los pagos se realizan mediante Stripe. BEXOR no almacena ni
                tiene acceso a tus datos bancarios.
              </li>
            </ul>

            <p>
              Stripe es una plataforma de pagos con certificación PCI DSS Nivel 1, el más alto nivel de seguridad en la
              industria de pagos.
            </p>

            <h2>3. Política de reembolso</h2>
            <p>
              Ofrecemos un reembolso total si cancelas tu suscripción dentro de los primeros 10 días desde el inicio del
              servicio. Escríbenos a{" "}
              <a href="mailto:ventas@bexor.com" className="text-secondary hover:underline">
                ventas@bexor.com
              </a>{" "}
              para iniciar el proceso.
            </p>

            <h2>4. Condiciones de uso</h2>
            <ul>
              <li>No se permite utilizar nuestros servicios con fines ilícitos.</li>
              <li>Nos reservamos el derecho de suspender cuentas que violen nuestras políticas.</li>
              <li>El CRM debe ser utilizado solo por el personal autorizado de tu empresa.</li>
            </ul>

            <div className="bg-gray-100 p-6 rounded-lg mt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-2xl mr-2">🍪</span> Aviso de Cookies
              </h3>
              <p>Este sitio web utiliza cookies para:</p>
              <ul>
                <li>Guardar preferencias del usuario.</li>
                <li>Analizar tráfico y comportamiento.</li>
                <li>Enviar comunicaciones personalizadas de marketing.</li>
              </ul>
              <p className="mt-4">
                Al usar nuestro sitio, aceptas el uso de cookies conforme a esta política. Puedes desactivarlas desde la
                configuración de tu navegador, aunque esto puede afectar el funcionamiento del sitio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
