'use server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function saveSiteSeo(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const siteId = formData.get('siteId') as string
  const data = {
    metaTitle:       (formData.get('metaTitle')       as string) || null,
    metaDescription: (formData.get('metaDescription') as string) || null,
    ogImage:         (formData.get('ogImage')         as string) || null,
    schemaLogo:      (formData.get('schemaLogo')      as string) || null,
    schemaSameAs:    (formData.get('schemaSameAs')    as string) || null,
  }

  await prisma.siteSEO.upsert({
    where: { siteId },
    create: { siteId, ...data },
    update: data,
  })

  revalidatePath(`/sites/${siteId}/seo`)

  // Ping the site's revalidation endpoint so the layout metadata refreshes
  const site = await prisma.site.findUnique({ where: { id: siteId } })
  if (site?.revalidateUrl) {
    await fetch(`${site.revalidateUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: site.revalidateSecret, path: '/' }),
    }).catch(() => {})
  }
}
