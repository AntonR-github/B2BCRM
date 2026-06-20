'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MediaUploadButton({ siteSlug }: { siteSlug: string }) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('siteSlug', siteSlug)
    await fetch('/api/upload', { method: 'POST', body: fd })
    setUploading(false)
    e.target.value = ''
    router.refresh()
  }

  return (
    <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-base font-medium cursor-pointer transition-colors">
      {uploading ? 'Uploading…' : '+ Upload image'}
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
    </label>
  )
}
