'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl border border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-2">Reset password</h1>
        {sent ? (
          <div className="flex flex-col gap-4">
            <p className="text-slate-400">If that email exists, a reset link has been sent. Check your inbox.</p>
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 text-sm">Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
              />
            </div>
            {error && <p className="text-red-400 text-base">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-base font-medium disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <Link href="/login" className="text-slate-400 hover:text-slate-300 text-sm text-center">Back to sign in</Link>
          </form>
        )}
      </div>
    </div>
  )
}
