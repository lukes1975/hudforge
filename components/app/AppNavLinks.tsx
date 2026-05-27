'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export const appNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon, kind: 'dashboard' as const },
  { href: '/dashboard?new=1', label: 'New UI', icon: NewUiIcon, kind: 'new-ui' as const },
  { href: '/projects', label: 'Projects', icon: ProjectsIcon, kind: 'route' as const },
  { href: '/settings', label: 'Settings', icon: SettingsIcon, kind: 'route' as const },
  { href: '/billing', label: 'Billing', icon: BillingIcon, kind: 'route' as const },
] as const

type AppNavLinksProps = {
  variant?: 'sidebar' | 'mobile'
  collapsed?: boolean
}

export function AppNavLinks({ variant = 'sidebar', collapsed = false }: AppNavLinksProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isNewProject = pathname === '/dashboard' && (searchParams.get('new') === '1' || searchParams.get('new') === 'true')

  if (variant === 'mobile') {
    return (
      <nav className="flex flex-wrap gap-2 lg:hidden" aria-label="Workspace navigation">
        {appNavItems.map((item) => {
          const active = isActiveNavItem(pathname, item, isNewProject)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition ${
                active ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100' : 'border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className={`app-sidebar-nav ${collapsed ? 'app-sidebar-nav--collapsed' : ''}`} aria-label="Workspace navigation">
      {appNavItems.map((item) => {
        const active = isActiveNavItem(pathname, item, isNewProject)
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-current={active ? 'page' : undefined}
            className={`app-sidebar-nav__link ${active ? 'app-sidebar-nav__link--active' : ''}`}
          >
            <item.icon className="app-sidebar-nav__icon" />
            <span className="app-sidebar-nav__label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function isActiveNavItem(
  pathname: string,
  item: (typeof appNavItems)[number],
  isNewProject: boolean,
) {
  if (item.kind === 'dashboard') {
    return pathname === '/dashboard' && !isNewProject
  }

  if (item.kind === 'new-ui') {
    return pathname === '/dashboard' && isNewProject
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" />
    </svg>
  )
}

function NewUiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  )
}

function ProjectsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3.5 6.5 10 3.5l6.5 3v8.5L10 18.5l-6.5-3V6.5Z" />
      <path d="M10 3.5v15M3.5 6.5 10 9.5l6.5-3" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="10" cy="10" r="2.75" />
      <path d="M10 2.5v1.8M10 15.7v1.8M17.5 10h-1.8M4.3 10H2.5M15.1 4.9l-1.3 1.3M6.2 13.8l-1.3 1.3M15.1 15.1l-1.3-1.3M6.2 6.2 4.9 4.9" />
    </svg>
  )
}

function BillingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
      <path d="M2.5 8.5h15" />
      <path d="M6 13h3.5" />
    </svg>
  )
}
