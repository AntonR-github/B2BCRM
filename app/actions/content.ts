'use server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function saveTextFields(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const siteId = formData.get('siteId') as string
  const page   = formData.get('page') as string | null

  const fields = await prisma.textField.findMany({
    where: { siteId, ...(page ? { page } : {}) },
  })

  await Promise.all(
    fields.map(field => {
      const value = (formData.get(field.key) as string) ?? ''
      return prisma.textField.update({ where: { id: field.id }, data: { value } })
    })
  )

  revalidatePath(`/sites/${siteId}/content`)

  // Ping the site to bust ISR cache
  const site = await prisma.site.findUnique({ where: { id: siteId } })
  if (site?.revalidateUrl) {
    await fetch(`${site.revalidateUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: site.revalidateSecret, path: '/' }),
    }).catch(() => {})
  }
}
