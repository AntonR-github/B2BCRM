'use server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function triggerRevalidate(siteId: string): Promise<{ ok: boolean; message: string }> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const site = await prisma.site.findUnique({ where: { id: siteId } })
  if (!site?.revalidateUrl) {
    return { ok: false, message: 'No revalidate URL configured for this site' }
  }

  try {
    await fetch(`${site.revalidateUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: site.revalidateSecret, path: '/' }),
    })
    return { ok: true, message: 'Site cache cleared' }
  } catch {
    return { ok: false, message: 'Failed to reach the site' }
  }
}
