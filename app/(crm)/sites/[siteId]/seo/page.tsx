import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { saveSiteSeo } from '@/app/actions/seo'
import { SeoPanel } from '@/components/seo-panel'
import { RevalidateButton } from '@/components/revalidate-button'

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
        <div className="flex items-center gap-3">
          <RevalidateButton siteId={siteId} />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-base font-medium"
          >
            Save SEO
          </button>
        </div>
      </div>
      <div className="max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-6">
        <SeoPanel
          defaultMetaTitle={site.siteSeo?.metaTitle}
          defaultMetaDescription={site.siteSeo?.metaDescription}
          defaultOgImage={site.siteSeo?.ogImage}
          defaultSchemaLogo={site.siteSeo?.schemaLogo}
          defaultSchemaSameAs={site.siteSeo?.schemaSameAs}
        />
      </div>
    </form>
  )
}
