import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { saveSiteSeo } from '@/app/actions/seo'
import { SeoPanel } from '@/components/seo-panel'

export default async function SeoPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { siteSeo: true },
  })
  if (!site) notFound()

  return (
    <form action={saveSiteSeo}>
      <input type="hidden" name="siteId" value={siteId} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">SEO — {site.name}</h1>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-base font-medium"
        >
          Save SEO
        </button>
      </div>
      <div className="max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400 text-base mb-5">
          These are the default SEO values for <strong className="text-white">{site.name}</strong>. Individual blog posts can override them.
        </p>
        <SeoPanel
          defaultMetaTitle={site.siteSeo?.metaTitle}
          defaultMetaDescription={site.siteSeo?.metaDescription}
          defaultOgImage={site.siteSeo?.ogImage}
        />
      </div>
    </form>
  )
}
