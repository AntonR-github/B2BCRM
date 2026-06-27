import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AccountForm } from './AccountForm'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="max-w-xl p-6">
      <h1 className="text-2xl font-bold text-white mb-6">My Account</h1>
      <AccountForm currentEmail={session.user.email ?? ''} role={session.user.role} />
    </div>
  )
}
