import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { name: true },
  })
  if (!site) notFound()

  const [
    unreadSubmissions,
    pendingOrders,
    paidOrders,
    draftPosts,
    recentOrders,
    recentSubmissions,
  ] = await Promise.all([
    prisma.formSubmission.count({ where: { siteId, read: false } }),
    prisma.order.count({ where: { siteId, status: 'pending' } }),
    prisma.order.count({ where: { siteId, status: 'paid' } }),
    prisma.blogPost.count({ where: { siteId, status: 'DRAFT' } }),
    prisma.order.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.formSubmission.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const stats = [
    { label: 'Unread submissions', value: unreadSubmissions, href: `submissions`, urgent: unreadSubmissions > 0 },
    { label: 'Pending orders',     value: pendingOrders,     href: `orders`,      urgent: pendingOrders > 0 },
    { label: 'Paid orders',        value: paidOrders,        href: `orders`,      urgent: false },
    { label: 'Draft blog posts',   value: draftPosts,        href: `blogs`,       urgent: false },
  ]

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-white">Dashboard — {site.name}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`rounded-xl border p-5 flex flex-col gap-2 transition-colors hover:border-slate-600 ${
              s.urgent ? 'border-indigo-700 bg-indigo-950/30' : 'border-slate-800 bg-slate-900'
            }`}
          >
            <span className={`text-4xl font-black ${s.urgent ? 'text-indigo-400' : 'text-white'}`}>
              {s.value}
            </span>
            <span className="text-sm text-slate-400">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent orders */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Orders</h2>
            <Link href="orders" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-slate-500 text-sm">No orders yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-white font-medium truncate">{o.customerName}</span>
                    <span className="text-slate-500 font-mono text-xs">{o.id}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      o.status === 'paid' ? 'bg-green-900/40 text-green-400' :
                      o.status === 'pending' ? 'bg-yellow-900/40 text-yellow-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>{o.status}</span>
                    <span className="text-white font-semibold">₪{o.total.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent submissions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Submissions</h2>
            <Link href="submissions" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>
          {recentSubmissions.length === 0 ? (
            <p className="text-slate-500 text-sm">No submissions yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentSubmissions.map((s) => (
                <div key={s.id} className="flex items-start justify-between text-sm gap-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      {!s.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                      <span className="text-white font-medium truncate">{s.name}</span>
                    </div>
                    <span className="text-slate-500 truncate">{s.message.slice(0, 60)}{s.message.length > 60 ? '…' : ''}</span>
                  </div>
                  <span className="text-slate-600 text-xs shrink-0">
                    {new Date(s.createdAt).toLocaleDateString('he-IL')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
