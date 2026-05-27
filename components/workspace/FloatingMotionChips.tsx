'use client'

import { useMemo } from 'react'
import { getViralWorkspaceUiTypes } from '@/lib/ui-type-registry'

export function FloatingMotionChips() {
  const labels = useMemo(() => {
    const viral = getViralWorkspaceUiTypes().map((definition) => definition.label)
    return [...viral, '···']
  }, [])

  return (
    <div className="chat-forge__motion-chips" aria-hidden="true">
      {labels.map((label, index) => (
        <span
          key={`${label}-${index}`}
          className="chat-forge__motion-chip"
          style={{ animationDelay: `${(index % 5) * 0.65}s` }}
        >
          {label}
        </span>
      ))}
    </div>
  )
}
