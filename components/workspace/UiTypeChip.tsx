'use client'

import type { ButtonHTMLAttributes } from 'react'

type UiTypeChipProps = {
  label: string
  selected?: boolean
  disabled?: boolean
  motion?: boolean
  size?: 'sm' | 'md'
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type' | 'aria-pressed' | 'className'>

export function UiTypeChip({
  label,
  selected = false,
  disabled = false,
  motion = false,
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: UiTypeChipProps) {
  const sizeClass = size === 'sm' ? 'workspace-chip--sm' : 'workspace-chip--md'

  return (
    <button
      type={type}
      disabled={disabled}
      aria-pressed={selected}
      className={`workspace-chip ${sizeClass} ${selected ? 'workspace-chip--selected' : ''} ${motion ? 'workspace-chip--motion' : ''} ${disabled ? 'workspace-chip--disabled' : ''} ${className}`.trim()}
      {...props}
    >
      <span className="workspace-chip__label">{label}</span>
    </button>
  )
}
