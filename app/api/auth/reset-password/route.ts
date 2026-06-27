import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const record = await prisma.passwordReset.findUnique({ where: { token } })
  if (!record || record.expires < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  const hashed = await hashPassword(password)
  await prisma.user.update({ where: { email: record.email }, data: { password: hashed } })
  await prisma.passwordReset.delete({ where: { token } })

  return NextResponse.json({ ok: true })
}
