import { auth } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const url = await uploadImage(file)
  return NextResponse.json({ url })
}
