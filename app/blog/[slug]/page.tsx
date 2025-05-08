import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
// @ts-ignore
import BlogPostClient from "./BlogPostClient";
import { blogPosts } from "../blogData";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "app/blog/articulos", `${slug}.md`);
  let content = "";
  let data: any = {};

  try {
    const file = fs.readFileSync(filePath, "utf8");
    const { content: mdContent, data: frontmatter } = matter(file);
    // Always await the result to ensure content is a string
    content = await (typeof marked.parse === 'function' ? marked.parse(mdContent) : marked(mdContent));
    // Merge frontmatter and override with cover image from blogData mapping
    data = { ...frontmatter };
    const mapped = blogPosts.find((post) => post.slug === slug);
    if (mapped) {
      data.image = mapped.image;
      // Optionally override author details
      data.authorImage = mapped.authorImage;
      data.authorRole = `${mapped.category} para Ventas`;
    }
  } catch (e) {
    content = "<p>No se encontró el archivo markdown para este artículo.</p>";
  }

  return <BlogPostClient slug={slug} content={content} data={data} />;
}
