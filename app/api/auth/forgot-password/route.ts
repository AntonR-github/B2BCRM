import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/mailer'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  // Always return success to avoid leaking which emails exist
  if (!user) return NextResponse.json({ ok: true })

  await prisma.passwordReset.deleteMany({ where: { email } })

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordReset.create({ data: { email, token, expires } })

  // Base URL for the reset link. Never derive this from request headers: a forged
  // Host header would poison the link in the victim's email and leak the token.
  // Production must set CRM_URL (fail closed if missing); dev defaults to localhost.
  const baseUrl = process.env.CRM_URL ?? (process.env.NODE_ENV === 'production' ? null : 'http://localhost:3000')
  if (!baseUrl) {
    console.error('[forgot-password] CRM_URL is not set; refusing to send a reset link')
    // Generic OK response so we never reveal config/account state to the caller
    return NextResponse.json({ ok: true })
  }

  await sendPasswordResetEmail(email, token, baseUrl)

  return NextResponse.json({ ok: true })
}
