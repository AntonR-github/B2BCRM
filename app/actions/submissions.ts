'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function markRead(id: string, siteId: string) {
  await prisma.formSubmission.update({ where: { id }, data: { read: true } })
  revalidatePath(`/sites/${siteId}/submissions`)
}

export async function deleteSubmission(id: string, siteId: string) {
  await prisma.formSubmission.delete({ where: { id } })
  revalidatePath(`/sites/${siteId}/submissions`)
}
