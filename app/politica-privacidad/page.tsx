import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-primary hover:text-primary/80">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Política de Privacidad</h1>
          <p className="text-gray-500 mb-8">Última actualización: 3 de mayo de 2025</p>

          <div className="prose prose-lg max-w-none">
            <p>
              En BEXOR, valoramos y protegemos la privacidad de nuestros usuarios. Esta Política de Privacidad describe
              cómo recopilamos, utilizamos y protegemos la información personal que nos proporcionas al utilizar
              nuestros servicios.
            </p>

            <h2>1. Información que recopilamos</h2>
            <p>Recopilamos la siguiente información cuando interactúas con nuestros servicios:</p>

            <ul>
              <li>
                <strong>Datos personales:</strong> nombre, correo electrónico, teléfono y datos necesarios para
                personalizar tu cuenta.
              </li>
              <li>
                <strong>Datos de pago:</strong> los pagos se procesan a través de Stripe, una plataforma certificada con
                el más alto estándar de seguridad de la industria (PCI DSS nivel 1). Nosotros no almacenamos
                directamente tus datos bancarios.
              </li>
              <li>
                <strong>Datos de uso:</strong> comportamiento en la plataforma y uso del chatbot/CRM.
              </li>
              <li>
                <strong>Cookies y tecnologías similares:</strong> para mejorar tu experiencia y realizar análisis.
              </li>
            </ul>

            <h2>2. Uso de la información</h2>
            <p>Utilizamos la información para:</p>

            <ul>
              <li>Brindar y mejorar nuestros servicios.</li>
              <li>Personalizar tu experiencia con nuestros agentes de IA.</li>
              <li>Procesar pagos de forma segura mediante Stripe.</li>
              <li>Enviarte comunicaciones administrativas y de marketing.</li>
              <li>Generar reportes de análisis para mejora continua.</li>
            </ul>

            <h2>3. Seguridad de los datos</h2>
            <ul>
              <li>
                <strong>Almacenamiento:</strong> utilizamos Supabase para almacenar datos. Supabase emplea encriptación
                en tránsito (TLS) y en reposo (AES-256).
              </li>
              <li>
                <strong>Accesos restringidos:</strong> el acceso está protegido mediante políticas avanzadas (Row Level
                Security).
              </li>
              <li>
                <strong>Pagos seguros:</strong> Stripe protege la información financiera mediante tecnologías avanzadas
                y no compartimos esta información con terceros.
              </li>
            </ul>

            <p>Para más información sobre la seguridad de Supabase y Stripe, visita sus sitios oficiales.</p>

            <h2>4. Derechos del usuario</h2>
            <p>Puedes:</p>

            <ul>
              <li>Acceder, modificar o eliminar tu información personal.</li>
              <li>Retirar tu consentimiento.</li>
              <li>Oponerte al tratamiento con fines de marketing.</li>
            </ul>

            <p>
              Para ejercer tus derechos, escríbenos a:{" "}
              <a href="mailto:ventas@bexor.com" className="text-secondary hover:underline">
                ventas@bexor.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
