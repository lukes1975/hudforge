import { AppShell } from '@/components/app/AppShell'

export default function BillingPage() {
  return (
    <AppShell title="Billing" description="Credit and plan readiness for generation usage. Lemon Squeezy stays in mock mode until provider credentials are configured.">
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          ['Free', '25 mock credits', 'Current local foundation plan'],
          ['Starter', 'More exports', 'Checkout-ready placeholder'],
          ['Pro', 'Team workflow', 'Future paid conversion path'],
        ].map(([plan, credits, detail]) => (
          <article key={plan} className="rune-card p-6">
            <p className="section-kicker">{plan}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{credits}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
          </article>
        ))}
      </div>
    </AppShell>
  )
}
