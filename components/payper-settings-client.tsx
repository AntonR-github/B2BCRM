'use client'
import { useState } from 'react'
import { updatePayperCategories, regeneratePayperSecret, updatePayperSecret } from '@/app/actions/site-settings'

interface Props {
  siteId: string
  siteSlug: string
  payperCategories: string[]
  payperWebhookSecret: string | null
  crmUrl: string
}

export function PayperSettingsClient({ siteId, siteSlug, payperCategories, payperWebhookSecret, crmUrl }: Props) {
  const [categories, setCategories] = useState<string[]>(payperCategories ?? [])
  const [newCategory, setNewCategory] = useState('')
  const [secret, setSecret] = useState(payperWebhookSecret || '')
  const [saving, setSaving] = useState(false)
  const [savingSecret, setSavingSecret] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [copied, setCopied] = useState<'url' | 'secret' | null>(null)

  const webhookUrl = `${crmUrl}/api/${siteSlug}/payper-webhook`

  function copy(text: string, type: 'url' | 'secret') {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  function addCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed || categories.includes(trimmed)) return
    setCategories([...categories, trimmed])
    setNewCategory('')
  }

  function removeCategory(cat: string) {
    setCategories(categories.filter(c => c !== cat))
  }

  async function saveCategories() {
    setSaving(true)
    await updatePayperCategories(siteId, categories)
    setSaving(false)
  }

  async function saveSecret() {
    setSavingSecret(true)
    await updatePayperSecret(siteId, secret)
    setSavingSecret(false)
  }

  async function regenerate() {
    setRegenerating(true)
    const newSecret = await regeneratePayperSecret(siteId)
    setSecret(newSecret)
    setRegenerating(false)
  }

  return (
    <div className="space-y-8">
      {/* Webhook URL */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Webhook URL</h3>
        <p className="text-xs text-slate-500 mb-2">Configure this URL in Payper → API Settings → Webhooks</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={webhookUrl}
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 font-mono"
          />
          <button
            onClick={() => copy(webhookUrl, 'url')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
          >
            {copied === 'url' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Identifier / Secret */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Webhook Identifier</h3>
        <p className="text-xs text-slate-500 mb-2">Paste this into Payper's webhook identifier field so we can validate incoming requests</p>
        <div className="flex gap-2">
          <input
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="Paste existing identifier or generate a new one"
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 font-mono"
          />
          {secret && (
            <button
              onClick={() => copy(secret, 'secret')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
            >
              {copied === 'secret' ? 'Copied!' : 'Copy'}
            </button>
          )}
          <button
            onClick={regenerate}
            disabled={regenerating}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm rounded transition-colors"
          >
            {regenerating ? '...' : 'Generate'}
          </button>
          <button
            onClick={saveSecret}
            disabled={savingSecret || !secret}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
          >
            {savingSecret ? 'Saving...' : 'Save'}
          </button>
        </div>
        {payperWebhookSecret && (
          <div className="mt-3 flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-3 py-2">
            <span className="text-xs text-slate-500 shrink-0">Currently active:</span>
            <span className="text-xs text-slate-300 font-mono truncate">{payperWebhookSecret}</span>
          </div>
        )}
        <p className="text-xs text-slate-500 mt-2">
          Paste the identifier Payper already uses (from your WooCommerce plugin), or Generate a new one and configure it in Payper.
        </p>
      </div>

      {/* Allowed Categories */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Allowed Payper Categories</h3>
        <p className="text-xs text-slate-500 mb-3">
          Only products from these Payper categories will sync to this site.
          Leave empty to accept all categories.
        </p>

        <div className="flex gap-2">
          <input
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            placeholder="e.g. מכשירי אידוי"
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500"
          />
          <button
            onClick={addCategory}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 min-h-[36px]">
          {categories.length === 0 && (
            <span className="text-xs text-slate-500 italic">No categories set — all products will be accepted</span>
          )}
          {categories.map(cat => (
            <span key={cat} className="flex items-center gap-1.5 bg-slate-700 text-slate-200 text-sm px-3 py-1 rounded-full">
              {cat}
              <button onClick={() => removeCategory(cat)} className="text-slate-400 hover:text-red-400 transition-colors">×</button>
            </span>
          ))}
        </div>

        <button
          onClick={saveCategories}
          disabled={saving}
          className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
        >
          {saving ? 'Saving...' : 'Save Categories'}
        </button>
      </div>
    </div>
  )
}
