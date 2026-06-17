'use server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function saveSiteSeo(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const siteId = formData.get('siteId') as string
  const data = {
    metaTitle: (formData.get('metaTitle') as string) || null,
    metaDescription: (formData.get('metaDescription') as string) || null,
    ogImage: (formData.get('ogImage') as string) || null,
  }

  await prisma.siteSEO.upsert({
    where: { siteId },
    create: { siteId, ...data },
    update: data,
  })

  revalidatePath(`/sites/${siteId}/seo`)
}
