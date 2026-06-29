import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { BlogGeneratorClient } from './BlogGeneratorClient'

export default async function BlogGeneratorPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const sites = await prisma.site.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })

  return <BlogGeneratorClient sites={sites} />
}
