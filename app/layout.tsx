import type { Metadata } from 'next'
import { Geist_Mono, Inter, Space_Grotesk } from 'next/font/google'
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
  title: 'HUDForge — Cinematic Roblox UI, Faster',
  description:
    'HUDForge helps Roblox builders generate polished HUDs, menus, and UI systems with transparent PNGs, structured Luau hierarchies, and a premium game-menu aesthetic.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[color:var(--background)] text-white">{children}</body>
    </html>
  )
}
