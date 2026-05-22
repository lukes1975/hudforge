'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BrandMark } from '@/components/BrandMark'
import { navItems } from '@/lib/marketing-content'

export function MarketingHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    panelRef.current?.querySelector<HTMLAnchorElement>('a, button')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        buttonRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="forge-header">
      <div className={`forge-header__bar ${isScrolled ? 'forge-header__bar--scrolled' : ''}`}>
        <Link href="/" className="forge-brand" aria-label="HUDForge home" onClick={closeMenu}>
          <BrandMark />
          <span>
            <span className="forge-brand__name">HUDForge</span>
            <span className="forge-brand__meta">Roblox UI Forge</span>
          </span>
        </Link>

        <nav className="forge-nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
            return (
              <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className="forge-nav__link">
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="forge-header__actions">
          <Link href="/sign-in" className="forge-header__signin">
            Sign In
          </Link>
          <Link href="/generate" className="forge-button forge-button--primary forge-button--small">
            Generate UI
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className="forge-menu-button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-marketing-navigation"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`forge-mobile ${menuOpen ? 'forge-mobile--open' : ''}`} aria-hidden={!menuOpen}>
        <button type="button" className="forge-mobile__backdrop" onClick={closeMenu} aria-label="Close navigation menu" />
        <div ref={panelRef} id="mobile-marketing-navigation" className="forge-mobile__panel" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="flex items-center justify-between gap-4">
            <span className="data-label">Navigation</span>
            <button type="button" className="forge-mobile__close" onClick={closeMenu}>
              Close
            </button>
          </div>
          <nav className="mt-8 grid gap-3" aria-label="Mobile navigation links">
            <Link href="/" className="forge-mobile__link" onClick={closeMenu}>
              Home
            </Link>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="forge-mobile__link" onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid gap-3 pt-8">
            <Link href="/sign-up" className="forge-button forge-button--secondary" onClick={closeMenu}>
              Create Account
            </Link>
            <Link href="/generate" className="forge-button forge-button--primary" onClick={closeMenu}>
              Generate UI
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
