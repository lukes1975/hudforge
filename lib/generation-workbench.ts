import { hudforgeStyles, hudforgeUiTypes, type GenerationStatus } from './hudforge-generation'
import { analyzeRobloxPrompt } from './prompts'

export const generatorSamplePrompts = [
  'Create a neon anime simulator shop UI with coins, gems, buy buttons, and a close button. Make it mobile-friendly.',
  'Design a mobile inventory UI for pets, items, rarity badges, and equip buttons.',
  'Build a sci-fi HUD with health, coins, gems, XP, and a quest tracker.',
  'Create a premium reward screen with claim button, streak bonus, and soft glow.',
] as const

export const generationUiTypeOptions = [
  { label: 'Shop UI', value: 'shop_ui' },
  { label: 'HUD', value: 'hud' },
  { label: 'Inventory', value: 'inventory' },
  { label: 'Main Menu', value: 'main_menu' },
  { label: 'Reward Screen', value: 'reward_screen' },
] as const satisfies ReadonlyArray<{ label: string; value: (typeof hudforgeUiTypes)[number] }>

export const generationStyleOptions = [
  { label: 'Neon', value: 'neon' },
  { label: 'Cartoon', value: 'cartoon' },
  { label: 'Sci-fi', value: 'sci_fi' },
  { label: 'Anime', value: 'anime' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Premium', value: 'premium' },
] as const satisfies ReadonlyArray<{ label: string; value: (typeof hudforgeStyles)[number] }>

const TERMINAL_STATUSES: GenerationStatus[] = ['exported', 'failed']

export function isTerminalGenerationStatus(status: GenerationStatus) {
  return TERMINAL_STATUSES.includes(status)
}

const TITLE_STOP_WORDS = new Set(['a', 'an', 'and', 'build', 'create', 'design', 'for', 'game', 'make', 'my', 'of', 'the'])

export function buildPromptDownloadFilename(prompt: string, style?: string) {
  const promptTokens = analyzeRobloxPrompt(prompt, style).tokens.filter((token) => !TITLE_STOP_WORDS.has(token)).slice(0, 5)
  const safe = promptTokens.join('-')
  const suffix = style ? `-${sanitizeSlug(style)}` : ''

  if (!safe) {
    return 'hudforge-generation.luau'
  }

  return `hudforge-${safe}${suffix}.luau`
}

export function buildRegenerationPrompt(prompt: string, editNotes: string) {
  const cleanPrompt = prompt.trim()
  const cleanEditNotes = editNotes.trim()

  if (!cleanEditNotes) {
    return cleanPrompt
  }

  return `${cleanPrompt}\n\nRefine this generation with these edits: ${cleanEditNotes}`
}

function sanitizeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
