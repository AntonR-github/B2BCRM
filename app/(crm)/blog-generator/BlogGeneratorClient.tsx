'use client'
import BlogGenerator from '@/jsx/xvape-blog-generator.jsx'

interface Site {
  id: string
  name: string
  slug: string
}

export function BlogGeneratorClient({ sites }: { sites: Site[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <BlogGenerator sites={sites as any} />
}
