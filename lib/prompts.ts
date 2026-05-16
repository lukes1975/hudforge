// Optimized AI prompts for Roblox UI generation
// Enhanced for 8 UI types and 7 styles with Roblox-specific constraints

export type RobloxUiType =
  | 'button'
  | 'healthBar'
  | 'inventory'
  | 'shop'
  | 'leaderboard'
  | 'dialog'
  | 'menu'
  | 'hud'
  | 'skill'
  | 'notification'
  | 'minimap'

export type RobloxUiStyle =
  | 'fantasy'
  | 'sciFi'
  | 'cartoon'
  | 'minimal'
  | 'neon'
  | 'medieval'
  | 'futuristic'

export interface PromptAnalysis {
  uiType: RobloxUiType
  style: RobloxUiStyle
  tokens: string[]
}

const TYPE_MATCHERS: Array<{ uiType: RobloxUiType; patterns: RegExp[] }> = [
  { uiType: 'button', patterns: [/\bbutton\b/i, /\bcta\b/i, /click|tap|press|action/i, /\bplay\b/i, /\bclaim\b/i, /\bpurchase\b/i] },
  { uiType: 'healthBar', patterns: [/\bhealth\b/i, /\bhp\b/i, /\blife bar\b/i, /\bprogress\b/i, /\bvitality\b/i, /\bstamina\b/i] },
  { uiType: 'inventory', patterns: [/\binventory\b/i, /\bbackpack\b/i, /\bslots?\b/i, /\bitems?\b/i, /\bgear\b/i, /\bbag\b/i] },
  { uiType: 'shop', patterns: [/\bshop\b/i, /\bstore\b/i, /\bmarket\b/i, /\bbuy\b/i, /\btransaction\b/i, /\bvendor\b/i] },
  { uiType: 'leaderboard', patterns: [/\bleaderboard\b/i, /\bscores?\b/i, /\brankings?\b/i, /\bhigh score\b/i, /\bstandings\b/i] },
  { uiType: 'dialog', patterns: [/\bdialog(?:ue)?\b/i, /\bquest\b/i, /\bnpc\b/i, /\bmessage\b/i, /\btalk\b/i, /\bconversation\b/i] },
  { uiType: 'menu', patterns: [/\bmenu\b/i, /\bsettings\b/i, /\bpause\b/i, /\bpanel\b/i, /\boptions\b/i, /\bconfiguration\b/i] },
  { uiType: 'hud', patterns: [/\bhud\b/i, /\bheads? up display\b/i, /\boverlay\b/i, /\bui\b/i, /\binterface\b/i] },
  { uiType: 'skill', patterns: [/\bskill\b/i, /\bability\b/i, /\bpower\b/i, /\bspell\b/i, /\btalent\b/i, /\bupgrade\b/i] },
  { uiType: 'notification', patterns: [/\bnotification\b/i, /\balert\b/i, /\bpop[ -]?up\b/i, /\bmessage\b/i, /\btoast\b/i, /\bannouncement\b/i] },
  { uiType: 'minimap', patterns: [/\bminimap\b/i, /\bradar\b/i, /\bmap\b/i, /\boverview\b/i, /\bcompass\b/i, /\bnavigation\b/i] },
]

const STYLE_MATCHERS: Array<{ style: RobloxUiStyle; patterns: RegExp[] }> = [
  { style: 'medieval', patterns: [/\bmedieval\b/i, /\bstone\b/i, /\bknight\b/i, /\bcastle\b/i, /\bwrought iron\b/i, /\bheraldic\b/i] },
  { style: 'fantasy', patterns: [/\bfantasy\b/i, /\bmagic\b/i, /\brune\b/i, /\bcrystal\b/i, /\bdragon\b/i, /\belven\b/i] },
  { style: 'neon', patterns: [/\bneon\b/i, /\bglow\b/i, /\bsynth\b/i, /\bretro\b/i, /\b80s\b/i, /\barcade\b/i, /\bcyberpunk\b/i] },
  { style: 'sciFi', patterns: [/\bsci[- ]?fi\b/i, /\bcyber\b/i, /\bspace\b/i, /\btech\b/i, /\bfuturistic\b/i, /\bdigital\b/i] },
  { style: 'cartoon', patterns: [/\bcartoon\b/i, /\btoy\b/i, /\bplayful\b/i, /\bbubbly\b/i, /\bbright\b/i, /\bcomic\b/i, /\bfun\b/i] },
  { style: 'minimal', patterns: [/\bminimal\b/i, /\bclean\b/i, /\bflat\b/i, /\bsimple\b/i, /\belegant\b/i, /\bmodern\b/i, /\bsleek\b/i] },
  { style: 'futuristic', patterns: [/\bfuturistic\b/i, /\badvanced\b/i, /\bsleek\b/i, /\bholographic\b/i, /\bglowing\b/i, /\bmetallic\b/i] },
]

export function analyzeRobloxPrompt(prompt: string, requestedStyle?: string): PromptAnalysis {
  const tokens = prompt
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

  const uiType = TYPE_MATCHERS.find(({ patterns }) => patterns.some((pattern) => pattern.test(prompt)))?.uiType ?? 'hud'
  const inferredStyle =
    STYLE_MATCHERS.find(({ patterns }) => patterns.some((pattern) => pattern.test(prompt)))?.style ?? 'futuristic'
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
  const constraints = getRobloxConstraints()

  // Build prompt variations for better generation
  const variations = [
    `Roblox game ${uiTypePhrase}, ${stylePhrase}. ${constraints}`,
    `${uiTypePhrase} for a Roblox game in ${stylePhrase} style. ${constraints}`,
    `${stylePhrase} ${uiTypePhrase} designed for Roblox. ${constraints}`,
    `Game UI element: ${uiTypePhrase} in ${stylePhrase} aesthetic. ${constraints}`,
  ]

  // Rotate variations based on prompt hash to get diversity
  const hash = simpleHash(prompt)
  const chosenVariation = variations[hash % variations.length]

  return `${chosenVariation} User request: "${prompt}".`
}

export function getUiTypePhrase(uiType: RobloxUiType): string {
  switch (uiType) {
    case 'button':
      return 'call‑to‑action button with clear affordance, subtle hover states, game‑ready proportions'
    case 'healthBar':
      return 'health bar HUD widget with fill animation, status indicators, dramatic impact'
    case 'inventory':
      return 'inventory grid panel with item slots, organization, clear affordances'
    case 'shop':
      return 'shop panel with product cards, price tags, purchase buttons, currency display'
    case 'leaderboard':
      return 'leaderboard panel with player rows, score columns, ranking badges'
    case 'dialog':
      return 'dialogue panel with speaker area, text box, optional portrait, choice buttons'
    case 'menu':
      return 'menu panel with navigation options, settings toggles, visual hierarchy'
    case 'hud':
      return 'HUD panel with stat indicators, contextual information, non‑intrusive placement'
    case 'skill':
      return 'skill icon or panel with ability visualization, cooldown indicator, upgrade paths'
    case 'notification':
      return 'notification toast or badge with alert level, concise message, dismiss action'
    case 'minimap':
      return 'minimap widget with terrain outline, player marker, points of interest'
    default:
      return 'polished Roblox UI element with clear silhouettes and game‑ready proportions'
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
  if (normalized === 'futuristic') return 'futuristic'
  return 'futuristic'
}

function getStylePhrase(style: RobloxUiStyle): string {
  switch (style) {
    case 'fantasy':
      return 'fantasy style with gold trim, gemstone accents, soft magical highlights, ornate decorative details, aged parchment textures'
    case 'sciFi':
      return 'sci‑fi style with metal surfaces, cyan lighting, precise bevels, holographic elements, industrial UI panels'
    case 'cartoon':
      return 'cartoon style with chunky shapes, bright contrast, friendly proportions, bold outlines, vibrant colors'
    case 'minimal':
      return 'minimal style with clean geometry, subtle depth, restrained colors, generous whitespace, elegant typography'
    case 'neon':
      return 'neon arcade style with luminous edges, dark inner panels, high contrast, glowing gradients, retro‑futuristic vibe'
    case 'medieval':
      return 'medieval style with carved stone, worn metal, parchment accents, heraldic symbols, rustic textures'
    case 'futuristic':
      return 'futuristic style with sleek surfaces, holographic displays, glowing accents, advanced materials, streamlined forms'
    default:
      return 'polished modern Roblox UI style with dimensional panels and clear silhouettes'
  }
}

function getRobloxConstraints(): string {
  return [
    'Transparent PNG, isolated UI element, alpha background, no scene, no characters, no watermark.',
    'Crisp vector‑like edges, readable iconography, balanced padding, game‑ready mobile proportions.',
    'Do not include tiny unreadable text; use simple placeholder shapes where text would appear.',
    'Optimized for Roblox Studio import: 512x512 canvas, PNG‑24 with alpha, minimal artifacts.',
    'UI must be functional, visually cohesive, and instantly recognizable in a game context.',
  ].join(' ')
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// Export for testing
export const exportedForTesting = {
  TYPE_MATCHERS,
  STYLE_MATCHERS,
  getRobloxConstraints,
}