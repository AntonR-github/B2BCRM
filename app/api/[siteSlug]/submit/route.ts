import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  const { siteSlug } = await params
  const site = await prisma.site.findUnique({ where: { slug: siteSlug }, select: { id: true } })
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  const body = await request.json()
  const { name, email, phone, message } = body

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  await prisma.formSubmission.create({
    data: { siteId: site.id, name, email, phone: phone || null, message },
  })

  return NextResponse.json({ ok: true })
}
