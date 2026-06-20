'use client'
import { useState } from 'react'
import { triggerRevalidate } from '@/app/actions/revalidate'

export function RevalidateButton({ siteId }: { siteId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleClick() {
    setState('loading')
    const result = await triggerRevalidate(siteId)
    setState(result.ok ? 'ok' : 'error')
    setMessage(result.message)
    setTimeout(() => setState('idle'), 3000)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={state === 'loading'}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={`w-4 h-4 ${state === 'loading' ? 'animate-spin' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        {state === 'loading' ? 'Refreshing…' : 'Refresh site'}
      </button>
      {state !== 'idle' && state !== 'loading' && (
        <span className={`text-sm ${state === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </span>
      )}
    </div>
  )
}
