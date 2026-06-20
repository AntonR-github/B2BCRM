'use server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(id: string, siteId: string, status: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  await prisma.order.update({ where: { id }, data: { status } })
  revalidatePath(`/sites/${siteId}/orders`)
}

export async function updateOrderNote(id: string, siteId: string, shippingNote: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  await prisma.order.update({ where: { id }, data: { shippingNote } })
  revalidatePath(`/sites/${siteId}/orders`)
}
