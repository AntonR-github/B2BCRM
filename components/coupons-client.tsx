'use client'
import { useState, useTransition } from 'react'
import { createCoupon, toggleCoupon, deleteCoupon } from '@/app/actions/coupons'

type Coupon = {
  id: string
  code: string
  type: string
  value: number
  expiresAt: Date | null
  maxUses: number | null
  usedCount: number
  active: boolean
}

function CouponRow({ coupon, siteId }: { coupon: Coupon; siteId: string }) {
  const [pending, startTransition] = useTransition()
  const discountLabel = coupon.type === 'PERCENT' ? `${coupon.value}%` : `₪${coupon.value}`

  return (
    <div className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
      coupon.active ? 'border-slate-800 bg-slate-900' : 'border-slate-800 bg-slate-950 opacity-60'
    }`}>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white font-mono font-bold text-lg">{coupon.code}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-900/40 text-indigo-300">{discountLabel} off</span>
          {!coupon.active && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-500">disabled</span>}
        </div>
        <div className="flex gap-4 text-xs text-slate-500">
          {coupon.maxUses !== null && <span>Used {coupon.usedCount} / {coupon.maxUses}</span>}
          {coupon.expiresAt && <span>Expires {new Date(coupon.expiresAt).toLocaleDateString('he-IL')}</span>}
          {!coupon.maxUses && !coupon.expiresAt && <span>No limits</span>}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => startTransition(() => toggleCoupon(coupon.id, siteId, !coupon.active))}
          disabled={pending}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors disabled:opacity-50"
        >
          {coupon.active ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete coupon ${coupon.code}?`)) {
              startTransition(() => deleteCoupon(coupon.id, siteId))
            }
          }}
          disabled={pending}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-red-900 text-red-400 hover:bg-red-950 transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export function CouponsClient({ coupons, siteId, siteName }: { coupons: Coupon[]; siteId: string; siteName: string }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Coupons — {siteName}</h1>
        <button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-base font-medium">
          + New Coupon
        </button>
      </div>

      {coupons.length === 0 && !open ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-500">
          No coupons yet. Create one above.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {coupons.map(c => <CouponRow key={c.id} coupon={c} siteId={siteId} />)}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md flex flex-col gap-5">
            <h2 className="text-lg font-bold text-white">New Coupon</h2>
            <form
              action={(fd) => {
                fd.append('siteId', siteId)
                startTransition(async () => {
                  await createCoupon(fd)
                  setOpen(false)
                })
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-slate-400">Code</label>
                <input name="code" required placeholder="SUMMER20" className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-base focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-slate-400">Type</label>
                  <select name="type" className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-base focus:outline-none focus:border-indigo-500">
                    <option value="PERCENT">Percent (%)</option>
                    <option value="FIXED">Fixed (₪)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-slate-400">Value</label>
                  <input name="value" type="number" min="0" step="0.01" required placeholder="10" className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-base focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-slate-400">Max uses (optional)</label>
                  <input name="maxUses" type="number" min="1" placeholder="∞" className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-base focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-slate-400">Expires (optional)</label>
                  <input name="expiresAt" type="date" className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-base focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={pending} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50">
                  {pending ? 'Creating…' : 'Create'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-slate-700 text-slate-300 hover:text-white py-2.5 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
