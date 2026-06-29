'use client'
import BlogGenerator from '@/jsx/xvape-blog-generator.jsx'

interface Site {
  id: string
  name: string
  slug: string
}

export function BlogGeneratorClient({ sites }: { sites: Site[] }) {
  return <BlogGenerator sites={sites} />
}
