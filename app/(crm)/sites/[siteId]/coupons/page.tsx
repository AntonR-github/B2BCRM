import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CouponsClient } from '@/components/coupons-client'

export default async function CouponsPage({
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

  const coupons = await prisma.coupon.findMany({
    where: { siteId },
    orderBy: { createdAt: 'desc' },
  })

  return <CouponsClient coupons={coupons} siteId={siteId} siteName={site.name} />
}
