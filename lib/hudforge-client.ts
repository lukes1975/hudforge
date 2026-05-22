import type { BillingState, GenerationStatus, GenerationStyle, UiType } from './hudforge-generation'

const uiTypeLabels: Record<UiType, string> = {
  shop_ui: 'Shop UI',
  hud: 'HUD',
  inventory: 'Inventory',
  main_menu: 'Main Menu',
  reward_screen: 'Reward Screen',
}

const styleLabels: Record<GenerationStyle, string> = {
  neon: 'Neon',
  cartoon: 'Cartoon',
  sci_fi: 'Sci-fi',
  anime: 'Anime',
  minimal: 'Minimal',
  premium: 'Premium',
}

const statusLabels: Record<GenerationStatus, string> = {
  idle: 'Idle',
  optimizing: 'Optimizing',
  optimized: 'Optimized',
  generating_assets: 'Generating assets',
  assets_ready: 'Assets ready',
  preview_ready: 'Preview ready',
  exporting: 'Exporting',
  exported: 'Exported',
  failed: 'Failed',
}

const billingStateLabels: Record<BillingState, string> = {
  free: 'Free',
  trial: 'Trial',
  active_paid: 'Active paid',
  past_due: 'Past due',
  canceled: 'Canceled',
  unknown_mock: 'Mock mode',
}

export function formatUiType(uiType: UiType) {
  return uiTypeLabels[uiType]
}

export function formatGenerationStyle(style: GenerationStyle) {
  return styleLabels[style]
}

export function formatGenerationStatus(status: GenerationStatus) {
  return statusLabels[status]
}

export function formatBillingState(state: BillingState) {
  return billingStateLabels[state]
}

export function formatGenerationTimestamp(value: string) {
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) return 'Unknown date'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export function buildGenerationExportSummary(fileCount: number, hasExport: boolean) {
  if (!hasExport) return 'No export package yet'
  return `${fileCount} package files ready`
}
