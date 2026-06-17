import { prisma } from './prisma'

export async function validateApiKey(apiKey: string) {
  if (!apiKey) return null
  return prisma.site.findUnique({ where: { apiKey } })
}

export function getApiKey(request: Request): string {
  return request.headers.get('x-api-key') ?? ''
}
