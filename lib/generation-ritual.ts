import type { GenerationStatus } from './hudforge-generation'

export type RitualMacroStepId = 'optimize' | 'assets' | 'preview' | 'export'

export const ritualMacroSteps: Array<{ id: RitualMacroStepId; label: string }> = [
  { id: 'optimize', label: 'Optimize' },
  { id: 'assets', label: 'Assets' },
  { id: 'preview', label: 'Preview' },
  { id: 'export', label: 'Export' },
]

const macroOrder: RitualMacroStepId[] = ['optimize', 'assets', 'preview', 'export']

const statusToMacro: Record<GenerationStatus, RitualMacroStepId> = {
  idle: 'optimize',
  optimizing: 'optimize',
  optimized: 'optimize',
  generating_assets: 'assets',
  assets_ready: 'assets',
  preview_ready: 'preview',
  exporting: 'export',
  exported: 'export',
  failed: 'optimize',
}

export function getActiveRitualMacroStep(status: GenerationStatus): RitualMacroStepId {
  return statusToMacro[status] ?? 'optimize'
}

export function getRitualMacroStepState(
  status: GenerationStatus,
  stepId: RitualMacroStepId,
): 'waiting' | 'active' | 'done' {
  if (status === 'failed') return stepId === 'optimize' ? 'active' : 'waiting'

  const active = getActiveRitualMacroStep(status)
  const activeIndex = macroOrder.indexOf(active)
  const stepIndex = macroOrder.indexOf(stepId)

  if (stepIndex < activeIndex) return 'done'
  if (stepIndex === activeIndex) {
    if (status === 'exported' && stepId === 'export') return 'done'
    if (status === 'preview_ready' && stepId === 'preview') return 'done'
    if (status === 'assets_ready' && stepId === 'assets') return 'done'
    if (status === 'optimized' && stepId === 'optimize') return 'done'
    return 'active'
  }
  return 'waiting'
}

export function getRitualStatusLine(status: GenerationStatus, selectedLabels: string, prompt: string): string {
  const trimmed = prompt.trim()
  const subject = selectedLabels || 'your UI pack'

  switch (status) {
    case 'optimizing':
    case 'optimized':
      return `Optimizing ${subject}…`
    case 'generating_assets':
    case 'assets_ready':
      return `Generating assets for ${subject}…`
    case 'preview_ready':
      return `Preview ready for ${subject}.`
    case 'exporting':
    case 'exported':
      return `Packaging export for ${subject}…`
    case 'failed':
      return `Generation failed for ${trimmed.slice(0, 72) || subject}.`
    default:
      return `Building ${subject}…`
  }
}

export function parseAssetProgressRatio(assetProgress: string | null): number | null {
  if (!assetProgress) return null
  const match = assetProgress.match(/(\d+)\s*\/\s*(\d+)/)
  if (!match) return null
  const completed = Number(match[1])
  const total = Number(match[2])
  if (!Number.isFinite(completed) || !Number.isFinite(total) || total <= 0) return null
  return Math.min(1, completed / total)
}

export function truncatePromptEcho(prompt: string, maxLength = 120): string {
  const trimmed = prompt.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1)}…`
}
