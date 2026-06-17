import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { saveTextFields } from '@/app/actions/content'

export default async function ContentPage({
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

  if (site.textFields.length === 0) {
    return (
      <p className="text-slate-400 text-base">
        No editable content fields defined for this site yet.
      </p>
    )
  }

  return (
    <form action={saveTextFields}>
      <input type="hidden" name="siteId" value={siteId} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Content — {site.name}</h1>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-base font-medium"
        >
          Save Changes
        </button>
      </div>
      <div className="flex flex-col gap-5">
        {site.textFields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">
              {field.label}
            </label>
            {field.type === 'TEXTAREA' ? (
              <textarea
                name={field.key}
                defaultValue={field.value}
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500 resize-none"
              />
            ) : (
              <input
                name={field.key}
                defaultValue={field.value}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>
        ))}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-base font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </form>
  )
}
