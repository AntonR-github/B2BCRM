import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-6">
        <span className="text-white font-bold text-lg">Admin</span>
        <Link href="/admin" className="text-slate-400 hover:text-white text-base">Sites</Link>
        <Link href="/admin/users" className="text-slate-400 hover:text-white text-base">Users</Link>
        <Link href="/dashboard" className="ml-auto text-slate-400 hover:text-white text-base">← Back to CRM</Link>
      </header>
      <main className="p-8">{children}</main>
    </div>
  )
}
