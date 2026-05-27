import type { GenerationStyle, ImagePromptSpec, OptimizedGenerationSpec } from './hudforge-generation'

export interface StylePalette {
  primary: string
  secondary: string
  accent: string
  background: string
}

export interface StyleProfile {
  style: GenerationStyle
  palette: StylePalette
  art_direction: string
  image_prompt_suffix: string
  premium_tier: boolean
  locked_from_generation_id: string
  locked_at: string
}

export interface HudforgeProject {
  id: string
  user_id: string
  name: string
  style_profile: StyleProfile | null
  locked_at: string | null
  source_generation_id: string | null
  created_at: string
  updated_at: string
}

export const STYLE_PALETTES: Record<GenerationStyle, StylePalette> = {
  neon: { primary: '#00D1FF', secondary: '#7C5CFF', accent: '#FFBB33', background: '#050816' },
  cartoon: { primary: '#52E3FF', secondary: '#FF6B9D', accent: '#FFD166', background: '#1A1F3D' },
  sci_fi: { primary: '#00D1FF', secondary: '#5B8CFF', accent: '#9AE6FF', background: '#050816' },
  anime: { primary: '#7C5CFF', secondary: '#FF6FD8', accent: '#52E3FF', background: '#120A24' },
  minimal: { primary: '#94A3B8', secondary: '#F8FBFF', accent: '#00D1FF', background: '#0B1020' },
  premium: { primary: '#00D1FF', secondary: '#7C5CFF', accent: '#FFBB33', background: '#050816' },
}

export function buildStyleProfileFromSpec(
  spec: OptimizedGenerationSpec,
  generationId: string,
  options: { premiumTier?: boolean; lockedAt?: string } = {},
): StyleProfile {
  const palette = STYLE_PALETTES[spec.style]
  const premiumTier = options.premiumTier ?? false
  const lockedAt = options.lockedAt ?? new Date().toISOString()

  return {
    style: spec.style,
    palette,
    art_direction: spec.intent_summary,
    image_prompt_suffix: buildStyleLockImagePromptSuffix(spec.style, palette, premiumTier),
    premium_tier: premiumTier,
    locked_from_generation_id: generationId,
    locked_at: lockedAt,
  }
}

export function buildStyleLockImagePromptSuffix(style: GenerationStyle, palette: StylePalette, premiumTier: boolean): string {
  const base = [
    `Locked HUDForge style: ${style.replace('_', ' ')}.`,
    `Palette primary ${palette.primary}, secondary ${palette.secondary}, accent ${palette.accent}, background ${palette.background}.`,
    'Match border weight, corner radius, glow intensity, and icon language from the locked UI kit.',
    'Keep all five assets visually coherent as one Roblox game UI system.',
  ]
  if (premiumTier) {
    base.push('Premium style lock: tighter palette adherence, cleaner silhouettes, stronger contrast, and polished game-world finish.')
  }
  return base.join(' ')
}

export function buildStyleLockOptimizerContext(profile: StyleProfile) {
  return {
    style_lock: {
      active: true,
      style: profile.style,
      palette: profile.palette,
      art_direction: profile.art_direction,
      image_prompt_suffix: profile.image_prompt_suffix,
      premium_tier: profile.premium_tier,
    },
    instructions: [
      'This generation belongs to a style-locked project.',
      'Use the locked style and palette for all image_prompts and layout visual direction.',
      'Do not drift to a different art direction or palette.',
      profile.premium_tier
        ? 'Premium style lock: enforce tighter visual consistency across all five assets.'
        : 'Basic style lock: keep palette and component language consistent across all five assets.',
    ],
  }
}

function appendSuffixToImagePrompt(prompt: ImagePromptSpec, suffix: string): ImagePromptSpec {
  const trimmedSuffix = suffix.trim()
  if (!trimmedSuffix || prompt.prompt.includes(trimmedSuffix)) return prompt
  return {
    ...prompt,
    prompt: `${prompt.prompt} ${trimmedSuffix}`.trim(),
  }
}

export function applyStyleProfileToOptimizedSpec(spec: OptimizedGenerationSpec, profile: StyleProfile): OptimizedGenerationSpec {
  const image_prompts = Object.fromEntries(
    Object.entries(spec.image_prompts).map(([key, prompt]) => [key, appendSuffixToImagePrompt(prompt, profile.image_prompt_suffix)]),
  ) as OptimizedGenerationSpec['image_prompts']

  return {
    ...spec,
    style: profile.style,
    intent_summary: `${spec.intent_summary} Locked style: ${profile.style.replace('_', ' ')} with palette ${profile.palette.primary}/${profile.palette.secondary}.`,
    image_prompts,
    style_profile: profile,
  }
}

export function assertGenerationCanBeStyleLocked(status: string) {
  const allowed = new Set(['assets_ready', 'preview_ready', 'exported'])
  if (!allowed.has(status)) {
    throw new Error(`Generation must reach preview before style lock (current: ${status})`)
  }
}
