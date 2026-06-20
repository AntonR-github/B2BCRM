import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { OrderRow } from '@/components/order-row'

export default async function OrdersPage({
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

  const orders = await prisma.order.findMany({
    where: { siteId },
    orderBy: { createdAt: 'desc' },
  })

  const pendingCount = orders.filter(o => o.status === 'pending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Orders — {site.name}</h1>
          {pendingCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-600 text-white">
              {pendingCount} pending
            </span>
          )}
        </div>
        <span className="text-slate-500 text-sm">{orders.length} total</span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-500">
          No orders yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={{
                ...order,
                items: order.items as Array<{ name: string; price: number; qty: number }>,
              }}
              siteId={siteId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
