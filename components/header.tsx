"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isBlogRoute = pathname?.startsWith("/blog")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white shadow-md py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center">
              {isScrolled ? (
                <img
                  src="/BEXO (8) copy.png"
                  alt="BEXOR Logo"
                  className="h-16 w-auto"
                />
              ) : (
                <img
                  src="/blancotransparte copy.png"
                  alt="BEXOR Logo"
                  className="h-16 w-auto"
                />
              )}
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-8">
                <li>
                  <Link 
                    href="/" 
                    className={cn(
                      "font-medium hover:text-secondary transition-colors",
                      isBlogRoute
                        ? "text-secondary"
                        : isScrolled
                        ? "text-gray-700"
                        : "text-white"
                    )}
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog" 
                    className={cn(
                      "font-medium hover:text-secondary transition-colors",
                      isBlogRoute
                        ? "text-secondary"
                        : isScrolled
                        ? "text-gray-700"
                        : "text-white"
                    )}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    href="#contacto" 
                    className={cn(
                      "font-medium hover:text-secondary transition-colors",
                      isBlogRoute
                        ? "text-secondary"
                        : isScrolled
                        ? "text-gray-700"
                        : "text-white"
                    )}
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </nav>
            <a 
              href="http://localhost:3000/login" 
              target="_self"
              className={cn(
                "px-4 py-2 rounded-md font-medium transition-colors",
                isScrolled 
                  ? "bg-primary text-white hover:bg-primary/90" 
                  : "bg-white text-primary hover:bg-white/90"
              )}
            >
              Iniciar sesión
            </a>
          </div>

          <button
            className="md:hidden text-white"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? "text-gray-700" : "text-white"} />
            ) : (
              <Menu className={isScrolled ? "text-gray-700" : "text-white"} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white p-4 shadow-lg">
          <nav className="mb-4">
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/" 
                  className="block font-medium text-gray-700 hover:text-secondary transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="block font-medium text-gray-700 hover:text-secondary transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="#contacto" 
                  className="block font-medium text-gray-700 hover:text-secondary transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </nav>
          <a 
            href="http://localhost:3000/login" 
            target="_self"
            className="block w-full text-center px-4 py-2 rounded-md font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
            onClick={toggleMobileMenu}
          >
            Iniciar sesión
          </a>
        </div>
      )}
    </header>
  )
}
