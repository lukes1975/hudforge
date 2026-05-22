import Link from 'next/link'
import { SignUp } from '@clerk/nextjs'

const hasClerkPublishableKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export default function SignUpPage() {
  if (!hasClerkPublishableKey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-6 py-16 text-white">
        <div className="w-full max-w-xl rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Clerk setup incomplete</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Add your Clerk publishable key to continue.</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            The sign-up flow is scaffolded, but Clerk is not fully connected yet because the required publishable key
            is still missing.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/" className="primary-cta px-6 text-base font-semibold">
              Back to landing page
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-6 py-16 text-white">
      <SignUp path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
    </main>
  )
}
