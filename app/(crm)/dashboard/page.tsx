import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const first = await prisma.site.findFirst({ orderBy: { createdAt: 'asc' } })
  if (first) redirect(`/sites/${first.id}/blogs`)
  return (
    <div className="p-10 text-slate-400 text-lg">
      No sites yet. Ask your administrator to add a site.
    </div>
  )
}
