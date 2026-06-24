import { redirect } from 'next/navigation'

export default async function SiteRootPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  redirect(`/sites/${siteId}/dashboard`)
}