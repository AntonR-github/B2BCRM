import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { createTextField, deleteTextField } from '@/app/actions/admin'

export default async function AdminSitePage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { textFields: { orderBy: { order: 'asc' } } },
  })
  if (!site) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">{site.name} — Text Fields</h1>
      <p className="text-slate-400 text-base mb-6">
        Define which sections of this site the client can edit.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {site.textFields.map((field) => (
          <div
            key={field.id}
            className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 flex justify-between items-center"
          >
            <div>
              <p className="text-white text-base font-medium">{field.label}</p>
              <p className="text-slate-500 text-sm font-mono">{field.key} · {field.type}</p>
            </div>
            <form action={deleteTextField.bind(null, field.id, siteId)}>
              <button type="submit" className="text-red-400 hover:text-red-300 text-sm">Remove</button>
            </form>
          </div>
        ))}
        {site.textFields.length === 0 && (
          <p className="text-slate-500 text-base">No fields defined yet.</p>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Add Field</h2>
        <form action={createTextField} className="flex flex-col gap-4">
          <input type="hidden" name="siteId" value={siteId} />
          <div>
            <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Field Key</label>
            <input
              name="key"
              required
              placeholder="e.g. hero_title"
              pattern="[a-z0-9_]+"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-base font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Label (shown to client)</label>
            <input
              name="label"
              required
              placeholder="e.g. Hero Title"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Type</label>
            <select
              name="type"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
            >
              <option value="TEXT">Text (single line)</option>
              <option value="TEXTAREA">Textarea (multi-line)</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-base font-medium"
          >
            Add Field
          </button>
        </form>
      </div>
    </div>
  )
}
