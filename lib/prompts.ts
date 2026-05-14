export type RobloxUiType =
  | 'button'
  | 'healthBar'
  | 'inventory'
  | 'shop'
  | 'leaderboard'
  | 'dialog'
  | 'menu'
  | 'hud'

export type RobloxUiStyle =
  | 'fantasy'
  | 'sciFi'
  | 'cartoon'
  | 'minimal'
  | 'neon'
  | 'medieval'
  | 'default'

export interface PromptAnalysis {
  uiType: RobloxUiType
  style: RobloxUiStyle
  tokens: string[]
}

const TYPE_MATCHERS: Array<{ uiType: RobloxUiType; patterns: RegExp[] }> = [
  { uiType: 'healthBar', patterns: [/\bhealth\b/i, /\bhp\b/i, /\blife bar\b/i, /\bprogress\b/i] },
  { uiType: 'inventory', patterns: [/\binventory\b/i, /\bbackpack\b/i, /\bslots?\b/i, /\bitems?\b/i] },
  { uiType: 'shop', patterns: [/\bshop\b/i, /\bstore\b/i, /\bmarket\b/i, /\bbuy\b/i] },
  { uiType: 'leaderboard', patterns: [/\bleaderboard\b/i, /\bscores?\b/i, /\brankings?\b/i] },
  { uiType: 'dialog', patterns: [/\bdialog(?:ue)?\b/i, /\bquest\b/i, /\bnpc\b/i, /\bmessage\b/i] },
  { uiType: 'menu', patterns: [/\bmenu\b/i, /\bsettings\b/i, /\bpause\b/i, /\bpanel\b/i] },
  { uiType: 'button', patterns: [/\bbutton\b/i, /\bcta\b/i, /\bplay\b/i, /\bclaim\b/i] },
]

const STYLE_MATCHERS: Array<{ style: RobloxUiStyle; patterns: RegExp[] }> = [
  { style: 'fantasy', patterns: [/\bfantasy\b/i, /\bmagic\b/i, /\brune\b/i, /\bcrystal\b/i] },
  { style: 'sciFi', patterns: [/\bsci[- ]?fi\b/i, /\bcyber\b/i, /\bspace\b/i, /\bfuturistic\b/i] },
  { style: 'cartoon', patterns: [/\bcartoon\b/i, /\btoy\b/i, /\bplayful\b/i, /\bbubbly\b/i] },
  { style: 'minimal', patterns: [/\bminimal\b/i, /\bclean\b/i, /\bflat\b/i] },
  { style: 'neon', patterns: [/\bneon\b/i, /\bglow\b/i, /\bsynth\b/i] },
  { style: 'medieval', patterns: [/\bmedieval\b/i, /\bstone\b/i, /\bknight\b/i, /\bcastle\b/i] },
]

export function analyzeRobloxPrompt(prompt: string, requestedStyle?: string): PromptAnalysis {
  const tokens = prompt
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

  const uiType = TYPE_MATCHERS.find(({ patterns }) => patterns.some((pattern) => pattern.test(prompt)))?.uiType ?? 'hud'
  const inferredStyle =
    STYLE_MATCHERS.find(({ patterns }) => patterns.some((pattern) => pattern.test(prompt)))?.style ?? 'default'
  const normalizedRequestedStyle = normalizeStyle(requestedStyle)

  return {
    uiType,
    style: normalizedRequestedStyle ?? inferredStyle,
    tokens,
  }
}

export function buildRobloxImagePrompt(prompt: string, style?: string): string {
  const analysis = analyzeRobloxPrompt(prompt, style)
  const stylePhrase = getStylePhrase(analysis.style)
  const uiTypePhrase = getUiTypePhrase(analysis.uiType)

  return [
    `Roblox game ${uiTypePhrase} asset, ${stylePhrase}.`,
    `User request: ${prompt}.`,
    'Transparent PNG, isolated UI element, alpha background, no scene, no characters, no watermark.',
    'Crisp vector-like edges, readable iconography, balanced padding, game-ready mobile proportions.',
    'Do not include tiny unreadable text; use simple placeholder shapes where text would appear.',
  ].join(' ')
}

export function getUiTypePhrase(uiType: RobloxUiType): string {
  switch (uiType) {
    case 'button':
      return 'call-to-action button'
    case 'healthBar':
      return 'health bar HUD widget'
    case 'inventory':
      return 'inventory grid panel'
    case 'shop':
      return 'shop panel'
    case 'leaderboard':
      return 'leaderboard panel'
    case 'dialog':
      return 'dialogue panel'
    case 'menu':
      return 'menu panel'
    case 'hud':
      return 'HUD panel'
  }
}

function normalizeStyle(style?: string): RobloxUiStyle | undefined {
  if (!style) return undefined

  const normalized = style.toLowerCase().replace(/[^a-z]/g, '')
  if (normalized === 'scifi' || normalized === 'cyberpunk' || normalized === 'futuristic') return 'sciFi'
  if (normalized === 'fantasy' || normalized === 'magic') return 'fantasy'
  if (normalized === 'cartoon' || normalized === 'playful') return 'cartoon'
  if (normalized === 'minimal' || normalized === 'clean') return 'minimal'
  if (normalized === 'neon' || normalized === 'glow') return 'neon'
  if (normalized === 'medieval') return 'medieval'
  return 'default'
}

function getStylePhrase(style: RobloxUiStyle): string {
  switch (style) {
    case 'fantasy':
      return 'fantasy style with gold trim, gemstone accents, soft magical highlights'
    case 'sciFi':
      return 'sci-fi style with metal surfaces, cyan lighting, precise bevels'
    case 'cartoon':
      return 'cartoon style with chunky shapes, bright contrast, friendly proportions'
    case 'minimal':
      return 'minimal style with clean geometry, subtle depth, restrained colors'
    case 'neon':
      return 'neon arcade style with luminous edges, dark inner panels, high contrast'
    case 'medieval':
      return 'medieval style with carved stone, worn metal, parchment accents'
    case 'default':
      return 'polished modern Roblox UI style with dimensional panels and clear silhouettes'
  }
}
