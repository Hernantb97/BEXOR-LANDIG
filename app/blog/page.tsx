"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Tag, Clock, ArrowRight, BookOpen } from "lucide-react"
import { blogPosts, categories } from "./blogData"

export default function BlogPage() {
  // Featured blog post: base data + authorRole derived from category
  const featuredRaw =
    blogPosts.find((post) => post.slug === "como-ia-revoluciona-ventas-whatsapp") ||
    blogPosts[0];
  const featuredPost = {
    ...featuredRaw,
    authorRole: `${featuredRaw.category} para Ventas`,
  };

  // Popular posts
  const popularPosts = [
    {
      title: "10 métricas clave para evaluar el rendimiento de tu bot de ventas",
      date: "12 de abril de 2023",
      slug: "metricas-clave-rendimiento-bot-ventas",
    },
    {
      title: "¿Por qué WhatsApp es el canal ideal para ventas B2C?",
      date: "28 de marzo de 2023",
      slug: "whatsapp-canal-ideal-ventas-b2c",
    },
    {
      title: "Cómo crear un embudo de ventas efectivo con IA",
      date: "5 de febrero de 2023",
      slug: "crear-embudo-ventas-efectivo-ia",
    },
  ]

  return (
    <main className="min-h-screen bg-background pt-24">
      {/* Hero section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog de BEXOR</h1>
            <p className="text-xl text-white/90 mb-8">
              Artículos, guías y recursos sobre ventas automatizadas e inteligencia artificial
            </p>

            {/* Search bar */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Buscar artículos..."
                className="w-full px-5 py-3 pr-12 rounded-lg bg-muted/10 backdrop-blur-sm border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured post */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-primary">Artículo destacado</h2>

          <div className="bg-card rounded-xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="h-64 md:h-auto overflow-hidden">
                <img
                  src={featuredPost.image || "/placeholder.svg"}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-4">
                    <Tag className="h-4 w-4 text-secondary mr-2" />
                    <span className="text-sm text-secondary font-medium">{featuredPost.category}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-primary hover:text-secondary transition-colors">
                    <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                  </h3>
                  <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                </div>

                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <img
                        src={featuredPost.authorImage || "/placeholder.svg"}
                        alt={featuredPost.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-primary">{featuredPost.author}</p>
                      <p className="text-sm text-gray-500">{featuredPost.authorRole}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{featuredPost.readTime}</span>
                      <span className="mx-2">•</span>
                      <span>{featuredPost.date}</span>
                    </div>
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <Button variant="ghost" className="text-secondary hover:text-secondary/80 p-0">
                        Leer más <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main column */}
            <div className="lg:w-2/3">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-primary">Artículos recientes</h2>

              <div className="grid md:grid-cols-2 gap-8">
                {blogPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-card rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <Tag className="h-4 w-4 text-secondary mr-2" />
                        <span className="text-xs text-secondary font-medium">{post.category}</span>
                      </div>

                      <h2 className="text-xl font-bold mb-2 text-primary hover:text-secondary transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                            <img
                              src={post.authorImage || "/placeholder.svg"}
                              alt={post.author}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-sm text-gray-700">{post.author}</span>
                        </div>

                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <Button className="bg-primary hover:bg-primary/90 text-white">Ver más artículos</Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* Categories */}
              <div className="bg-card rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 text-primary">Categorías</h3>
                <ul className="space-y-2">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <Link
                        href={`/blog/categoria/${category.slug}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-700 hover:text-primary">{category.name}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular posts */}
              <div className="bg-card rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 text-primary">Artículos populares</h3>
                <ul className="space-y-4">
                  {popularPosts.map((post, index) => (
                    <li key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <Link href={`/blog/${post.slug}`} className="group">
                        <h4 className="font-medium text-gray-800 group-hover:text-secondary transition-colors mb-1">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-500">{post.date}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div className="bg-primary rounded-xl shadow-md p-6 text-white">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-6 w-6 mr-2" />
                  <h3 className="text-xl font-bold">Newsletter</h3>
                </div>
                <p className="mb-4">
                  Suscríbete para recibir los últimos artículos y recursos sobre ventas automatizadas e IA.
                </p>
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="w-full px-4 py-2 rounded-lg bg-muted/10 backdrop-blur-sm border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary mb-3"
                />
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">Suscribirme</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">¿Listo para automatizar tus ventas?</h2>
            <p className="text-lg text-gray-700 mb-8">
              Implementa un agente de IA especializado en ventas y transforma tu negocio hoy mismo
            </p>
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
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
      </section>
    </main>
  )
}
