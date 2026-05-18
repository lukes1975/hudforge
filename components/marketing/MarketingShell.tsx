import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import type { ReactNode } from 'react'

export function MarketingShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen overflow-hidden bg-[color:var(--background)] text-white">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  )
}
