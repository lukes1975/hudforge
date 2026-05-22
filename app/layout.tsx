import type { Metadata } from 'next'
import { Analytics } from '@/components/Analytics'
import { ClerkProvider } from '@clerk/nextjs'
import { headers } from 'next/headers'
import { Geist_Mono, Inter, Space_Grotesk } from 'next/font/google'
import { getE2EAuthBypassHeaderName, getE2EAuthBypassUserId } from '@/lib/hudforge-auth'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'HUDForge - Cinematic Roblox UI, Faster',
  description:
    'HUDForge helps Roblox builders generate polished HUDs, menus, and UI systems with transparent PNGs, structured Luau hierarchies, and a premium game-menu aesthetic.',
  icons: {
    icon: [
      { url: '/brand/favicon.ico' },
      { url: '/brand/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const requestHeaders = await headers()
  const e2eBypassUserId = getE2EAuthBypassUserId(requestHeaders.get(getE2EAuthBypassHeaderName()))
  const content = (
    <>
      {children}
      <Analytics />
    </>
  )

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[color:var(--background)] text-white">
        {e2eBypassUserId ? content : <ClerkProvider>{content}</ClerkProvider>}
      </body>
    </html>
  )
}
