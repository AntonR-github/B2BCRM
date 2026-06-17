'use server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { hashPassword } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') throw new Error('Forbidden')
}

export async function createSite(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const revalidateUrl = formData.get('revalidateUrl') as string | null
  await prisma.site.create({
    data: {
      name,
      slug,
      apiKey: randomUUID(),
      revalidateSecret: randomUUID(),
      revalidateUrl: revalidateUrl || null,
    },
  })
  revalidatePath('/admin')
  redirect('/admin')
}

export async function deleteSite(siteId: string) {
  await requireAdmin()
  await prisma.site.delete({ where: { id: siteId } })
  revalidatePath('/admin')
  redirect('/admin')
}

export async function createTextField(formData: FormData) {
  await requireAdmin()
  const siteId = formData.get('siteId') as string
  const key = formData.get('key') as string
  const label = formData.get('label') as string
  const type = formData.get('type') as 'TEXT' | 'TEXTAREA'
  const count = await prisma.textField.count({ where: { siteId } })
  await prisma.textField.create({ data: { siteId, key, label, type, order: count } })
  revalidatePath(`/admin/sites/${siteId}`)
}

export async function deleteTextField(fieldId: string, siteId: string) {
  await requireAdmin()
  await prisma.textField.delete({ where: { id: fieldId } })
  revalidatePath(`/admin/sites/${siteId}`)
}

export async function createUser(formData: FormData) {
  await requireAdmin()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as 'ADMIN' | 'EDITOR'
  const hashed = await hashPassword(password)
  await prisma.user.create({ data: { email, password: hashed, role } })
  revalidatePath('/admin/users')
}

export async function deleteUser(userId: string) {
  await requireAdmin()
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/admin/users')
}
