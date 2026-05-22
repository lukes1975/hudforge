import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/generate(.*)',
  '/projects(.*)',
  '/settings(.*)',
  '/billing(.*)',
  '/api/generate/optimize(.*)',
  '/api/generate/assets(.*)',
  '/api/generate/export(.*)',
  '/api/generations(.*)',
  '/api/usage/event(.*)',
  '/api/settings(.*)',
  '/api/billing/status(.*)',
])

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
