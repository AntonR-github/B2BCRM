'use server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function toHandle(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function parseFeatures(raw: string): string[] {
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

export async function createProduct(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const siteId      = formData.get('siteId') as string
  const name        = formData.get('name') as string
  const handle      = (formData.get('handle') as string)?.trim() || toHandle(name)
  const price       = parseFloat(formData.get('price') as string)
  const description = (formData.get('description') as string) || null
  const badge       = (formData.get('badge') as string) || null
  const image       = (formData.get('image') as string) || null
  const payperSku   = (formData.get('payperSku') as string) || null
  const cardFeatures = parseFeatures(formData.get('cardFeatures') as string ?? '')
  const features    = parseFeatures(formData.get('features') as string ?? '')

  const count = await prisma.product.count({ where: { siteId } })

  await prisma.product.create({
    data: { siteId, name, handle, price, description, badge, image, payperSku, cardFeatures, features, order: count },
  })

  revalidatePath(`/sites/${siteId}/products`)
}

export async function updateProduct(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const id          = formData.get('id') as string
  const siteId      = formData.get('siteId') as string
  const name        = formData.get('name') as string
  const handle      = (formData.get('handle') as string)?.trim() || toHandle(name)
  const price       = parseFloat(formData.get('price') as string)
  const description = (formData.get('description') as string) || null
  const badge       = (formData.get('badge') as string) || null
  const image       = (formData.get('image') as string) || null
  const payperSku   = (formData.get('payperSku') as string) || null
  const cardFeatures = parseFeatures(formData.get('cardFeatures') as string ?? '')
  const features    = parseFeatures(formData.get('features') as string ?? '')
  const active      = formData.get('active') === 'true'

  await prisma.product.update({
    where: { id },
    data: { name, handle, price, description, badge, image, payperSku, cardFeatures, features, active },
  })

  revalidatePath(`/sites/${siteId}/products`)
}

export async function toggleProductActive(id: string, siteId: string, active: boolean) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  await prisma.product.update({ where: { id }, data: { active } })
  revalidatePath(`/sites/${siteId}/products`)
}

export async function deleteProduct(id: string, siteId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  await prisma.product.delete({ where: { id } })
  revalidatePath(`/sites/${siteId}/products`)
}
