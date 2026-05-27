'use client'

import Link from 'next/link'
import type { Generation } from '@/lib/hudforge-generation'
import { formatGenerationStatus } from '@/lib/hudforge-client'

type StudioStubProps = {
  generation: Generation
  hasPriorGenerations: boolean
}

export function StudioStub({ generation, hasPriorGenerations }: StudioStubProps) {
  return (
    <section className="rune-card p-6 sm:p-8">
      <p className="section-kicker">Preview ready</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Studio dashboard ships in Step 4</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
        Your generation finished successfully. The full studio preview with phone/desktop tabs, PNG strip, and iteration chat is coming next.
      </p>

      <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <p className="text-lg font-semibold text-white">{generation.title}</p>
        <p className="mt-2 text-sm text-slate-400">{generation.optimized_spec?.intent_summary ?? generation.prompt}</p>
        <p className="mt-3 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
          {formatGenerationStatus(generation.status)}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard?new=1" className="forge-button forge-button--primary">
          Start another
        </Link>
        {hasPriorGenerations ? (
          <Link href="/dashboard" className="forge-button forge-button--secondary">
            Back to studio
          </Link>
        ) : null}
      </div>
    </section>
  )
}
