'use server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createCoupon(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const siteId    = formData.get('siteId') as string
  const code      = (formData.get('code') as string).toUpperCase().trim()
  const type      = formData.get('type') as string
  const value     = parseFloat(formData.get('value') as string)
  const maxUses   = formData.get('maxUses') ? parseInt(formData.get('maxUses') as string) : null
  const expiresAt = formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string) : null

  await prisma.coupon.create({
    data: { siteId, code, type, value, maxUses, expiresAt },
  })

  revalidatePath(`/sites/${siteId}/coupons`)
}

export async function toggleCoupon(id: string, siteId: string, active: boolean) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  await prisma.coupon.update({ where: { id }, data: { active } })
  revalidatePath(`/sites/${siteId}/coupons`)
}

export async function deleteCoupon(id: string, siteId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  await prisma.coupon.delete({ where: { id } })
  revalidatePath(`/sites/${siteId}/coupons`)
}
