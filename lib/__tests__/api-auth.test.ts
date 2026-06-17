import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  prisma: {
    site: {
      findUnique: vi.fn(),
    },
  },
}))

import { validateApiKey } from '../api-auth'
import { prisma } from '../prisma'

describe('validateApiKey', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the site when API key is valid', async () => {
    const mockSite = { id: '1', slug: 'test-site', name: 'Test' }
    vi.mocked(prisma.site.findUnique).mockResolvedValue(mockSite as any)

    const result = await validateApiKey('valid-key')
    expect(result).toEqual(mockSite)
    expect(prisma.site.findUnique).toHaveBeenCalledWith({
      where: { apiKey: 'valid-key' },
    })
  })

  it('returns null when API key is invalid', async () => {
    vi.mocked(prisma.site.findUnique).mockResolvedValue(null)
    const result = await validateApiKey('bad-key')
    expect(result).toBeNull()
  })

  it('returns null when no key provided', async () => {
    const result = await validateApiKey('')
    expect(result).toBeNull()
    expect(prisma.site.findUnique).not.toHaveBeenCalled()
  })
})
