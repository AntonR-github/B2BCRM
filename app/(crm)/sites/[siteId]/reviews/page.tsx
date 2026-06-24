import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { approveReview, deleteReview } from '@/app/actions/reviews'

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      name: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true } } },
      },
    },
  })
  if (!site) notFound()

  const pending = site.reviews.filter(r => !r.approved).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">Reviews — {site.name}</h1>
        {pending > 0 && (
          <span className="bg-yellow-600 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full">
            {pending} pending
          </span>
        )}
      </div>

      {site.reviews.length === 0 ? (
        <p className="text-slate-400 text-base">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-4 max-w-3xl">
          {site.reviews.map((r) => (
            <div
              key={r.id}
              className={`rounded-xl border p-5 ${
                r.approved
                  ? 'border-slate-800 bg-slate-900/50'
                  : 'border-yellow-800 bg-yellow-950/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    {!r.approved && (
                      <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/40 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                    {r.approved && (
                      <span className="text-xs font-semibold text-green-400 bg-green-900/40 px-2 py-0.5 rounded-full">
                        Approved
                      </span>
                    )}
                    <span className="text-white font-semibold text-base">{r.name}</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {r.product.name} · {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </p>
                </div>
                <span className="text-slate-500 text-sm flex-shrink-0">
                  {new Date(r.createdAt).toLocaleDateString('he-IL', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                  })}
                </span>
              </div>

              <p className="text-slate-300 text-base whitespace-pre-wrap">{r.text}</p>

              <div className="flex gap-4 mt-4">
                {!r.approved && (
                  <form action={approveReview.bind(null, r.id, siteId)}>
                    <button type="submit" className="text-sm text-green-400 hover:text-green-300 font-medium">
                      Approve
                    </button>
                  </form>
                )}
                <form action={deleteReview.bind(null, r.id, siteId)}>
                  <button type="submit" className="text-sm text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
