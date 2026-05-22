import { AppShell } from '@/components/app/AppShell'
import { BillingPanel } from '@/components/app/BillingPanel'

export default function BillingPage() {
  return (
    <AppShell title="Billing" description="Credit and plan readiness for generation usage. Lemon Squeezy stays in mock mode until provider credentials are configured.">
      <BillingPanel />
    </AppShell>
  )
}
