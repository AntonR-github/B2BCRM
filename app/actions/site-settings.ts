'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

export async function updatePayperCategories(siteId: string, categories: string[]) {
  await prisma.site.update({ where: { id: siteId }, data: { payperCategories: categories } })
  revalidatePath(`/sites/${siteId}/settings`)
}

export async function regeneratePayperSecret(siteId: string) {
  const secret = randomBytes(20).toString('base64url')
  await prisma.site.update({ where: { id: siteId }, data: { payperWebhookSecret: secret } })
  revalidatePath(`/sites/${siteId}/settings`)
  return secret
}

export async function updatePayperSecret(siteId: string, secret: string) {
  await prisma.site.update({ where: { id: siteId }, data: { payperWebhookSecret: secret } })
  revalidatePath(`/sites/${siteId}/settings`)
}
