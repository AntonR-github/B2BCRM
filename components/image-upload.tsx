'use client'
import { useState } from 'react'
import Image from 'next/image'

export function ImageUpload({
  name,
  label,
  defaultValue,
  siteSlug,
}: {
  name: string
  label: string
  defaultValue?: string | null
  siteSlug?: string
}) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    if (siteSlug) fd.append('siteSlug', siteSlug)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUrl(data.url)
    setUploading(false)
  }

  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">{label}</label>
      <input type="hidden" name={name} value={url} />
      {url ? (
        <div className="flex items-start gap-4">
          {url.startsWith('http') ? (
            <Image
              src={url}
              alt="uploaded"
              width={160}
              height={100}
              className="rounded-lg object-cover shrink-0"
              unoptimized
            />
          ) : (
            <div className="w-40 h-24 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <span className="text-slate-500 text-xs text-center px-2">Local path — upload to preview</span>
            </div>
          )}
          <div className="flex flex-col gap-2 pt-1">
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              {uploading ? 'Uploading...' : 'Replace image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
            <button
              type="button"
              onClick={() => setUrl('')}
              className="text-sm text-red-400 hover:text-red-300 text-left"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="flex items-center justify-center w-full border-2 border-dashed border-slate-700 rounded-xl py-8 cursor-pointer hover:border-indigo-500 transition-colors">
          <span className="text-slate-400 text-base">
            {uploading ? 'Uploading...' : 'Click to upload image'}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      )}
    </div>
  )
}
