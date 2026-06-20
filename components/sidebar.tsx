'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface Site {
  id: string
  name: string
  slug: string
  revalidateUrl: string | null
}

export function Sidebar({
  sites,
  userEmail,
  isAdmin,
}: {
  sites: Site[]
  userEmail: string
  isAdmin: boolean
}) {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col min-h-screen">
      <div className="px-4 py-4 border-b border-slate-800">
        <span className="text-xs text-slate-400 uppercase tracking-widest">My Sites</span>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {sites.map((site) => {
          const isActive = pathname.startsWith(`/sites/${site.id}`)
          return (
            <Link
              key={site.id}
              href={`/sites/${site.id}/blogs`}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-base transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              🌐 {site.name}
            </Link>
          )
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base text-slate-400 hover:text-white hover:bg-slate-800 mt-4 border-t border-slate-800 pt-4"
          >
            ⚙️ Admin
          </Link>
        )}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <p className="text-slate-500 text-sm truncate mb-2">{userEmail}</p>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-red-400 text-sm hover:text-red-300"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
