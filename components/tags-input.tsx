'use client'
import { useState, KeyboardEvent } from 'react'

export function TagsInput({ defaultValue }: { defaultValue?: string[] }) {
  const [tags, setTags] = useState<string[]>(defaultValue ?? [])
  const [input, setInput] = useState('')

  function add() {
    const tag = input.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && !tags.includes(tag)) setTags([...tags, tag])
    setInput('')
  }

  function remove(tag: string) {
    setTags(tags.filter(t => t !== tag))
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && tags.length) remove(tags[tags.length - 1])
  }

  return (
    <div>
      <input type="hidden" name="tags" value={tags.join(',')} />
      <div className="flex flex-wrap gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 min-h-[44px] focus-within:border-indigo-500">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 bg-indigo-900 text-indigo-300 text-sm px-2 py-0.5 rounded-md">
            #{tag}
            <button type="button" onClick={() => remove(tag)} className="text-indigo-400 hover:text-white leading-none">×</button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={tags.length === 0 ? 'Type a tag and press Enter...' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-white text-sm focus:outline-none"
        />
      </div>
      <p className="text-slate-500 text-xs mt-1">Press Enter or comma to add a tag</p>
    </div>
  )
}
