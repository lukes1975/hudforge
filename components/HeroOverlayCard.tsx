type OverlayCardProps = {
  title: string
  eyebrow: string
  tone?: 'cyan' | 'violet' | 'slate'
  className?: string
  children: React.ReactNode
}

export function HeroOverlayCard({ title, eyebrow, tone = 'slate', className = '', children }: OverlayCardProps) {
  return (
    <article className={`hero-overlay-card hero-overlay-card--${tone} ${className}`.trim()}>
      <div className="hero-overlay-card__eyebrow">{eyebrow}</div>
      <h3 className="hero-overlay-card__title">{title}</h3>
      <div className="hero-overlay-card__body">{children}</div>
    </article>
  )
}
