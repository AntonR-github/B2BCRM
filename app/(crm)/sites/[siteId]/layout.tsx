import { SiteTabs } from '@/components/site-tabs'

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  return (
    <div className="flex flex-col h-full">
      <SiteTabs siteId={siteId} />
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
