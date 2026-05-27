'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { AppNavLinks } from '@/components/app/AppNavLinks'
import { SidebarCreditsCard } from '@/components/app/SidebarCreditsCard'

const STORAGE_KEY = 'hudforge-sidebar-collapsed'

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === '1')
    } catch {
      // Ignore storage errors in restricted contexts.
    }
    setReady(true)
  }, [])

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        // Ignore storage errors.
      }
      return next
    })
  }

  return (
    <aside
      className={`app-sidebar hidden lg:flex ${collapsed ? 'app-sidebar--collapsed' : ''} ${ready ? 'app-sidebar--ready' : ''}`}
      aria-label="Workspace sidebar"
    >
      <div className="app-sidebar__inner">
        <div className="app-sidebar__brand-row">
          <Link href="/dashboard" className="app-sidebar__brand" title="HUDForge">
            <span className="app-sidebar__brand-mark" aria-hidden="true">
              H
            </span>
            <span className="app-sidebar__brand-text">HUDForge</span>
          </Link>
        </div>

        <Suspense fallback={<nav className="app-sidebar__nav-skeleton" aria-hidden="true" />}>
          <AppNavLinks variant="sidebar" collapsed={collapsed} />
        </Suspense>

        <div className="app-sidebar__footer">
          <SidebarCreditsCard collapsed={collapsed} />
          <button
            type="button"
            className="app-sidebar__toggle"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <CollapseIcon collapsed={collapsed} />
            <span className="app-sidebar__toggle-text">{collapsed ? 'Expand' : 'Collapse'}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {collapsed ? (
        <path d="M7.5 5 12.5 10 7.5 15" />
      ) : (
        <path d="M12.5 5 7.5 10 12.5 15" />
      )}
    </svg>
  )
}
