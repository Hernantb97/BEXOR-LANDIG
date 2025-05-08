"use client"

import { use } from "react"
import { blogPosts, categories } from "../../blogData"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tag, Clock, ArrowRight } from "lucide-react"

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = use(params)
  const categoryObj = categories.find(cat => cat.slug === categorySlug)
  const filteredPosts = blogPosts.filter(post => post.category.toLowerCase().replace(/\s+/g, "-") === categorySlug)

  return (
    <main className="min-h-screen bg-white pt-24">
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" className="mb-6 text-primary hover:text-primary/80">
              Volver al blog
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">
            Categoría: {categoryObj ? categoryObj.name : categorySlug}
          </h1>
          {filteredPosts.length === 0 ? (
            <p className="text-gray-500">No hay artículos en esta categoría.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredPosts.map(post => (
                <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                  <div className="h-48 overflow-hidden">
                    <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover transition-transform hover:scale-105" />
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
                          <img src={post.authorImage || "/placeholder.svg"} alt={post.author} className="w-full h-full object-cover" />
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
          )}
        </div>
      </section>
    </main>
  )
} 