'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { BrandMark } from '@/components/BrandMark'

const navItems = [
  ['Features', '#features'],
  ['Workflow', '#workflow'],
  ['Examples', '#showcase'],
  ['Pricing', '#pricing'],
] as const

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18)
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
      menuButtonRef.current?.focus()
      return
    }

    panelRef.current?.querySelector<HTMLAnchorElement>('a, button')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="header-root">
      <div className={`header-shell ${isScrolled ? 'header-shell--scrolled' : ''}`}>
        <a href="#top" className="header-brand" aria-label="HUDForge home">
          <BrandMark />
          <div>
            <div className="header-brand__name">HUDForge</div>
            <div className="header-brand__meta">Roblox UI operating system</div>
          </div>
        </a>

        <nav className="header-nav" aria-label="Primary">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} className="header-nav__link">
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/sign-up" className="primary-cta primary-cta--header px-5 text-sm font-semibold">
            Get started
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation-panel"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-nav ${menuOpen ? 'mobile-nav--open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-nav__backdrop" onClick={closeMenu} />
        <div ref={panelRef} id="mobile-navigation-panel" role="dialog" aria-modal="true" className="mobile-nav__panel">
          <div className="mobile-nav__header">
            <div className="mobile-nav__eyebrow">HUDForge navigation</div>
            <button type="button" className="mobile-nav__close" onClick={closeMenu} aria-label="Close navigation menu">
              Close
            </button>
          </div>
          <nav className="mobile-nav__links" aria-label="Mobile">
            {navItems.map(([label, href], index) => (
              <a key={href} href={href} className="mobile-nav__link" onClick={closeMenu} style={{ animationDelay: `${index * 60}ms` }}>
                <span className="mobile-nav__index">0{index + 1}</span>
                <span>{label}</span>
              </a>
            ))}
          </nav>
          <Link href="/sign-up" className="primary-cta mt-8 w-full text-base font-semibold" onClick={closeMenu}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
