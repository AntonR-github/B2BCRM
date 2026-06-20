import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  const { siteSlug } = await params

  const site = await prisma.site.findUnique({ where: { slug: siteSlug } })
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  const products = await prisma.product.findMany({
    where: { siteId: site.id, active: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      handle: true,
      name: true,
      price: true,
      description: true,
      badge: true,
      image: true,
      payperSku: true,
      cardFeatures: true,
      features: true,
    },
  })

  return NextResponse.json(products, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
