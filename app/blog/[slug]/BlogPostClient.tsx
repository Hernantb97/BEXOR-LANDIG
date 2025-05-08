"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, User, Tag, Facebook, Twitter, Linkedin, Copy, ChevronRight } from "lucide-react"

export default function BlogPostClient({ slug, content, data }: { slug: string, content: string, data: any }) {
  // Puedes ajustar los nombres de las propiedades según tu frontmatter
  return (
    <main className="min-h-screen bg-white pt-24">
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary">
              Inicio
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
            {data?.category && (
              <>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link
                  href={`/blog/categoria/${data.category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="hover:text-primary"
                >
                  {data.category}
                </Link>
              </>
            )}
          </div>

          {/* Back button */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-6 text-primary hover:text-primary/80">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al blog
            </Button>
          </Link>

          {/* Post header */}
          <div className="mb-8">
            {data?.category && (
              <div className="flex items-center mb-4">
                <Tag className="h-4 w-4 text-secondary mr-2" />
                <Link
                  href={`/blog/categoria/${data.category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm text-secondary font-medium hover:underline"
                >
                  {data.category}
                </Link>
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-primary">{data?.title || slug}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
              {data?.date && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{
                    typeof data.date === 'string'
                      ? data.date
                      : data.date instanceof Date
                        ? data.date.toLocaleDateString()
                        : String(data.date)
                  }</span>
                </div>
              )}
              {data?.readTime && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{data.readTime}</span>
                </div>
              )}
              {data?.author && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{data.author}</span>
                </div>
              )}
            </div>
          </div>

          {/* Featured image */}
          {data?.image && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
              <img src={data.image} alt={data.title} className="w-full h-auto" />
            </div>
          )}

          {/* Social sharing */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-3">Compartir:</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8 p-0">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span className="sr-only">Compartir en Facebook</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8 p-0">
                  <Twitter className="h-4 w-4 text-sky-500" />
                  <span className="sr-only">Compartir en Twitter</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8 p-0">
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  <span className="sr-only">Compartir en LinkedIn</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-8 h-8 p-0">
                  <Copy className="h-4 w-4 text-gray-600" />
                  <span className="sr-only">Copiar enlace</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.isArray(data?.tags) && data.tags.map((tag: string, index: number) => (
                <Link
                  key={index}
                  href={`/blog/tag/${tag.toLowerCase()}`}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Post content */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-secondary prose-blockquote:border-l-secondary prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-md"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Author bio */}
          {data?.author && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-gray-50 rounded-xl p-6">
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={data.authorImage || "/placeholder.svg"}
                    alt={data.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary mb-1">{data.author}</h3>
                  <p className="text-sm text-gray-500 mb-3">{data.authorRole}</p>
                  <p className="text-gray-700">{data.authorBio}</p>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-primary rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">¿Listo para automatizar tus ventas?</h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Implementa un agente de IA especializado en ventas y transforma tu negocio hoy mismo
              </p>
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-white"
                onClick={() => window.open(
                  "https://wa.me/15557033313?text=" +
                    encodeURIComponent(
                      "Hola me gustaría agendar una cita para conocer más de talles de BEXOR."
                    ),
                  "_blank"
                )}
              >
                Haz una cita
              </Button>
            </div>
          </div>
        </div>
      </article>
    </main>
  )
} 