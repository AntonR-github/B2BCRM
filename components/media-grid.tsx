'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface MediaItem {
  name: string
  url: string
  size?: number
  createdAt?: string
}

export function MediaGrid({ items, siteSlug }: { items: MediaItem[]; siteSlug: string }) {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleDelete(fileName: string) {
    if (!confirm(`Delete ${fileName}?`)) return
    setDeleting(fileName)
    await fetch('/api/media/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteSlug, fileName }),
    })
    setDeleting(null)
    router.refresh()
  }

  if (items.length === 0) {
    return <p className="text-slate-400 text-base">No images uploaded yet.</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <div
          key={item.name}
          className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
        >
          <div className="relative aspect-square">
            <Image
              src={item.url}
              alt={item.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="p-2">
            <p className="text-slate-400 text-xs truncate" title={item.name}>{item.name}</p>
            {item.size && (
              <p className="text-slate-600 text-xs">{(item.size / 1024).toFixed(0)} KB</p>
            )}
          </div>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
            <button
              onClick={() => copyUrl(item.url)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 rounded-lg transition-colors"
            >
              {copied === item.url ? '✓ Copied!' : 'Copy URL'}
            </button>
            <button
              onClick={() => handleDelete(item.name)}
              disabled={deleting === item.name}
              className="w-full bg-red-900 hover:bg-red-800 text-red-300 text-xs py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting === item.name ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
