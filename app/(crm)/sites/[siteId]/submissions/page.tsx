import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { markRead, deleteSubmission } from '@/app/actions/submissions'

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { name: true, submissions: { orderBy: { createdAt: 'desc' } } },
  })
  if (!site) notFound()

  const unread = site.submissions.filter(s => !s.read).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">Submissions — {site.name}</h1>
        {unread > 0 && (
          <span className="bg-indigo-600 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full">
            {unread} new
          </span>
        )}
      </div>

      {site.submissions.length === 0 ? (
        <p className="text-slate-400 text-base">No submissions yet.</p>
      ) : (
        <div className="flex flex-col gap-4 max-w-3xl">
          {site.submissions.map((s) => (
            <div
              key={s.id}
              className={`rounded-xl border p-5 ${
                s.read
                  ? 'border-slate-800 bg-slate-900/50'
                  : 'border-indigo-800 bg-indigo-950/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    {!s.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                    )}
                    <span className="text-white font-semibold text-base">{s.name}</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-slate-400 text-sm">
                    <a href={`mailto:${s.email}`} className="hover:text-white">{s.email}</a>
                    {s.phone && <span>{s.phone}</span>}
                  </div>
                </div>
                <span className="text-slate-500 text-sm flex-shrink-0">
                  {new Date(s.createdAt).toLocaleDateString('he-IL', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-slate-300 text-base whitespace-pre-wrap">{s.message}</p>

              <div className="flex gap-3 mt-4">
                {!s.read && (
                  <form action={markRead.bind(null, s.id, siteId)}>
                    <button
                      type="submit"
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      Mark as read
                    </button>
                  </form>
                )}
                <form action={deleteSubmission.bind(null, s.id, siteId)}>
                  <button
                    type="submit"
                    className="text-sm text-red-400 hover:text-red-300"
                  >
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
