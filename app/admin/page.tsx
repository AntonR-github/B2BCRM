import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { deleteSite } from '@/app/actions/admin'

export default async function AdminPage() {
  const sites = await prisma.site.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Sites</h1>
        <Link
          href="/admin/sites/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-base"
        >
          + Add Site
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {sites.map((site) => (
          <div
            key={site.id}
            className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 flex items-center justify-between"
          >
            <div>
              <p className="text-white text-base font-medium">{site.name}</p>
              <p className="text-slate-500 text-sm font-mono mt-1">/api/{site.slug}/...</p>
              <p className="text-slate-600 text-xs mt-1">API Key: {site.apiKey}</p>
            </div>
            <div className="flex gap-4 items-center">
              <Link
                href={`/admin/sites/${site.id}`}
                className="text-slate-400 hover:text-white text-base"
              >
                Manage fields →
              </Link>
              <form action={deleteSite.bind(null, site.id)}>
                <button type="submit" className="text-red-400 hover:text-red-300 text-sm">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
