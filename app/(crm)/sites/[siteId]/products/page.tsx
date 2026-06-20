import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProductsClient } from '@/components/products-client'

export default async function ProductsPage({
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

  const products = await prisma.product.findMany({
    where: { siteId },
    orderBy: { order: 'asc' },
  })

  return (
    <ProductsClient
      products={products}
      siteId={siteId}
      siteSlug={site.slug}
      siteName={site.name}
    />
  )
}
