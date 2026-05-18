import Link from 'next/link'

const hasClerkPublishableKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export default async function SignInPage() {
  if (!hasClerkPublishableKey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-6 py-16 text-white">
        <div className="w-full max-w-xl rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30">
          <p className="text-sm uppercase text-cyan-300">Clerk setup incomplete</p>
          <h1 className="mt-4 text-3xl font-semibold">Add your Clerk publishable key to continue.</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            The auth flow is scaffolded on the preview branch, but Clerk is not fully connected yet because
            <code className="mx-1 rounded bg-white/10 px-2 py-1 text-sm">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>
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

  const { SignIn } = await import('@clerk/nextjs')

  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-6 py-16 text-white">
      <SignIn path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
    </main>
  )
}
