import { auth } from '@/lib/auth'
import { deleteImage } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { siteSlug, fileName } = await request.json()
  if (!siteSlug || !fileName) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  await deleteImage(siteSlug, fileName)
  return NextResponse.json({ ok: true })
}
