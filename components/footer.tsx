import Link from "next/link"
import { Facebook, Instagram, Mail, Phone } from "lucide-react"
import GeometricBackground from "./geometric-background"

export default function Footer() {
  return (
    <footer id="contacto" className="bg-primary text-white py-12 relative overflow-hidden">
      {/* Fondo geométrico */}
      <GeometricBackground variant="light" density="low" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">BEXOR</h3>
            <p className="text-white/80">Agentes de Inteligencia Artificial Especializados en Ventas</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/politica-privacidad" className="text-white/80 hover:text-white transition-colors">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos-condiciones" className="text-white/80 hover:text-white transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/80 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-white/80" />
                <a href="tel:+15557891179" className="text-white/80 hover:text-white transition-colors">
                  +1 (555) 789-1179
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-white/80" />
                <a href="mailto:info@bexor.mx" className="text-white/80 hover:text-white transition-colors">
                  info@bexor.mx
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61576226966479"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/bexor.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; {new Date().getFullYear()} BEXOR. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
