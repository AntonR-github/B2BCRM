'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function approveReview(reviewId: string, siteId: string) {
  await prisma.review.update({ where: { id: reviewId }, data: { approved: true } })
  revalidatePath(`/sites/${siteId}/reviews`)
}

export async function deleteReview(reviewId: string, siteId: string) {
  await prisma.review.delete({ where: { id: reviewId } })
  revalidatePath(`/sites/${siteId}/reviews`)
}
