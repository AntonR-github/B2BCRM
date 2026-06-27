'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminTabs() {
  const pathname = usePathname()

  const tabs = [
    { label: '🌐 Sites', href: '/admin', match: (p: string) => p === '/admin' || p.startsWith('/admin/sites') },
    { label: '👥 Users', href: '/admin/users', match: (p: string) => p.startsWith('/admin/users') },
  ]

  return (
    <div className="flex gap-1 p-4 border-b border-slate-800 bg-slate-900">
      {tabs.map((tab) => {
        const isActive = tab.match(pathname)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-5 py-2.5 rounded-lg text-base transition-colors ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
