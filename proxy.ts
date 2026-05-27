import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { getE2EAuthBypassHeaderName, getE2EAuthBypassUserId } from '@/lib/hudforge-auth'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/projects(.*)',
  '/settings(.*)',
  '/billing(.*)',
  '/api/generate/optimize(.*)',
  '/api/generate/assets(.*)',
  '/api/generate/assets/poll(.*)',
  '/api/generate/assets/status(.*)',
  '/api/generate/export(.*)',
  '/api/generations(.*)',
  '/api/projects(.*)',
  '/api/usage/event(.*)',
  '/api/settings(.*)',
  '/api/billing/status(.*)',
  '/api/billing/checkout(.*)',
  '/api/billing/topup(.*)',
  '/api/billing/portal(.*)',
])

/** Merged with Clerk defaults (includes unsafe-inline for Next.js + Clerk host from publishable key). */
const hudforgeCspDirectives = {
  'connect-src': [
    'https://*.supabase.co',
    'https://api.lemonsqueezy.com',
    'https://openrouter.ai',
    'https://fal.ai',
    'https://*.fal.ai',
    'https://*.ingest.sentry.io',
    'https://*.sentry.io',
  ],
  'img-src': ['data:', 'blob:', 'https://*.fal.ai'],
  'frame-src': ['https://*.lemonsqueezy.com'],
  'object-src': ["'none'"],
  'frame-ancestors': ["'none'"],
}

export default clerkMiddleware(
  (auth, request) => {
    if (isProtectedRoute(request)) {
      const bypassUserId = getE2EAuthBypassUserId(request.headers.get(getE2EAuthBypassHeaderName()))
      if (bypassUserId) return

      auth.protect()
    }
  },
  {
    contentSecurityPolicy: {
      directives: hudforgeCspDirectives,
    },
  },
)

export const config = {
  matcher: [
    '/((?!monitoring|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
