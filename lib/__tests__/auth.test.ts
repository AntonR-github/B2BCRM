import { describe, it, expect, vi } from 'vitest'

// Mock next-auth and related modules before importing lib/auth
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn(),
}))

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(),
}))

vi.mock('../prisma', () => ({
  prisma: {},
}))

import { hashPassword, verifyPassword } from '../auth'

describe('password helpers', () => {
  it('hashes a password and verifies it correctly', async () => {
    const hash = await hashPassword('secret123')
    expect(hash).not.toBe('secret123')
    const valid = await verifyPassword('secret123', hash)
    expect(valid).toBe(true)
  })

  it('rejects wrong password', async () => {
    const hash = await hashPassword('secret123')
    const valid = await verifyPassword('wrong', hash)
    expect(valid).toBe(false)
  })
})
