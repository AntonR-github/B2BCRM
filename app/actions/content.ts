'use server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function saveTextFields(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const siteId = formData.get('siteId') as string
  const fields = await prisma.textField.findMany({ where: { siteId } })

  await Promise.all(
    fields.map((field) => {
      const value = (formData.get(field.key) as string) ?? ''
      return prisma.textField.update({
        where: { id: field.id },
        data: { value },
      })
    })
  )

  revalidatePath(`/sites/${siteId}/content`)
}
