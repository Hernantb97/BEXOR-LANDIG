import fs from 'fs';
import path from 'path';

/**
 * Lee un archivo markdown basado en el slug y devuelve su contenido
 * @param slug El slug del artículo
 * @returns El contenido del markdown como string o null si no existe
 */
export function getMarkdownContent(slug: string): string | null {
  try {
    const filePath = path.join(process.cwd(), 'app/blog/articulos', `${slug}.md`);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.warn(`No se encontró el archivo markdown para el slug: ${slug}`);
      return null;
    }
    
    // Leer el contenido del archivo
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  } catch (error) {
    console.error(`Error al leer el archivo markdown para el slug: ${slug}`, error);
    return null;
  }
}

/**
 * Convierte markdown a HTML. Como esta es una función básica, 
 * simplemente devuelve el contenido del markdown que ya está en formato HTML.
 * En una implementación real, usarías una biblioteca como marked o remark.
 */
export function markdownToHtml(markdownContent: string): string {
  // En una implementación real, aquí convertirías el markdown a HTML
  // usando bibliotecas como marked, remark, etc.
  // Para este ejemplo simplificado, asumimos que el contenido ya está en formato HTML
  return markdownContent;
}

/**
 * Extrae los metadatos (título, fecha, etc.) del contenido markdown
 * En una implementación real, se analizaría el frontmatter
 * Como simplificación, utilizamos solo el título y asumimos valores predeterminados para el resto
 */
export function extractMetadata(markdownContent: string) {
  // Extraer el título (primera línea que comienza con # )
  const titleMatch = markdownContent.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Artículo sin título';
  
  // Para simplificar, devolvemos metadatos predeterminados
  return {
    title,
    date: "10 de junio de 2024",
    readTime: "10 min de lectura",
    author: "BEXOR AI",
    authorRole: "Inteligencia Artificial para Ventas",
    authorImage: "/placeholder.svg?height=80&width=80",
    authorBio: "BEXOR AI es una inteligencia artificial especializada en ventas y atención al cliente, diseñada para optimizar procesos comerciales y mejorar la experiencia de usuario.",
    category: "Inteligencia Artificial",
    tags: ["IA", "Ventas", "Automatización"],
    image: "/placeholder.svg?height=400&width=800",
  };
} 