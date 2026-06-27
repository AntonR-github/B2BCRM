import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminTabs } from '@/components/admin-tabs'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="flex flex-col h-full">
      <AdminTabs />
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
