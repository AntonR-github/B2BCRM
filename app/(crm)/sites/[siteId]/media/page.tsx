import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { listImages } from '@/lib/cloudinary'
import { MediaGrid } from '@/components/media-grid'
import { MediaUploadButton } from '@/components/media-upload-button'

export default async function MediaPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { name: true, slug: true },
  })
  if (!site) notFound()

  const images = await listImages(site.slug)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Media — {site.name}</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-sm">{images.length} file{images.length !== 1 ? 's' : ''}</span>
          <MediaUploadButton siteSlug={site.slug} />
        </div>
      </div>

      <MediaGrid items={images} siteSlug={site.slug} />
    </div>
  )
}
