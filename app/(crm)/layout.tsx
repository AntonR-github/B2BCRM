import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/sidebar'

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const sites = await prisma.site.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, slug: true },
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar
        sites={sites}
        userEmail={session.user?.email ?? ''}
        isAdmin={session.user.role === 'ADMIN'}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
