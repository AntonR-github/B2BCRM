import { createSite } from '@/app/actions/admin'

export default function NewSitePage() {
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-white mb-6">Add New Site</h1>
      <form action={createSite} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Site Name</label>
          <input
            name="name"
            required
            placeholder="e.g. Acme Corp"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Slug</label>
          <input
            name="slug"
            required
            placeholder="e.g. acme-corp"
            pattern="[a-z0-9-]+"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-base font-mono focus:outline-none focus:border-indigo-500"
          />
          <p className="text-slate-500 text-sm mt-1">Lowercase letters, numbers, and hyphens only.</p>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Client Site URL (for revalidation)</label>
          <input
            name="revalidateUrl"
            type="url"
            placeholder="e.g. https://acme-corp.vercel.app"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
          />
          <p className="text-slate-500 text-sm mt-1">Optional. Used to trigger instant content updates on publish.</p>
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-base font-medium"
        >
          Create Site
        </button>
      </form>
    </div>
  )
}
