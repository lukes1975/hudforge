import * as Sentry from '@sentry/nextjs'

const isDevelopment = process.env.NODE_ENV === 'development'
const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment,
  sendDefaultPii: true,
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,
  enableLogs: true,
})
