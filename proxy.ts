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
  '/api/usage/event(.*)',
  '/api/settings(.*)',
  '/api/billing/status(.*)',
  '/api/billing/checkout(.*)',
  '/api/billing/topup(.*)',
  '/api/billing/portal(.*)',
])

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    const bypassUserId = getE2EAuthBypassUserId(request.headers.get(getE2EAuthBypassHeaderName()))
    if (bypassUserId) return

    auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!monitoring|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
