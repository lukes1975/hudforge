import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-16">
      <section className="rune-card max-w-lg p-8 text-center">
        <p className="section-kicker">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          That route does not exist or may have moved. Head back to HUDForge and continue building.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="forge-button forge-button--primary">
            Back to home
          </Link>
          <Link href="/dashboard" className="forge-button forge-button--secondary">
            Open dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}
