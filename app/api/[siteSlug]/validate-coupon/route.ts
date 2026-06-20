import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  const { siteSlug } = await params
  const { code } = await req.json()

  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const site = await prisma.site.findUnique({ where: { slug: siteSlug } })
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  const coupon = await prisma.coupon.findUnique({
    where: { siteId_code: { siteId: site.id, code: code.toUpperCase().trim() } },
  })

  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: 'קוד קופון לא תקין' }, { status: 400 })
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: 'קוד הקופון פג תוקף' }, { status: 400 })
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: 'קוד הקופון הגיע למגבלת השימוש' }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    type: coupon.type,
    value: coupon.value,
    code: coupon.code,
  })
}
