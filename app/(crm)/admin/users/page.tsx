import { prisma } from '@/lib/prisma'
import { createUser, deleteUser } from '@/app/actions/admin'

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Users</h1>

      <div className="flex flex-col gap-3 mb-8">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 flex justify-between items-center"
          >
            <div>
              <p className="text-white text-base">{user.email}</p>
              <p className="text-slate-500 text-sm mt-1">{user.role}</p>
            </div>
            <form action={deleteUser.bind(null, user.id)}>
              <button type="submit" className="text-red-400 hover:text-red-300 text-sm">Remove</button>
            </form>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Add User</h2>
        <form action={createUser} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Role</label>
            <select
              name="role"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
            >
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-base font-medium"
          >
            Create User
          </button>
        </form>
      </div>
    </div>
  )
}
