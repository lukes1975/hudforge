import type { UiType } from './hudforge-generation'

/** Max UI types selectable in one generation pack (v1). */
export const MAX_UI_TYPE_SELECTIONS = 3

export type WorkspaceUiTypeId =
  | 'shop_ui'
  | 'inventory'
  | 'currency_hud'
  | 'energy_bar'
  | 'rebirth'
  | 'daily_quest'
  | 'hotbar'
  | 'hud_overlay'
  | 'avatar'
  | 'character_select'
  | 'profile_card'
  | 'quest_board'
  | 'index_collection'
  | 'achievements'
  | 'battle_pass'
  | 'trading_ui'
  | 'gacha_spin'
  | 'afk_rewards'
  | 'leaderboard'
  | 'settings_menu'
  | 'dialog_modal'
  | 'loading_screen'
  | 'map_ui'
  | 'teleport_menu'
  | 'tutorial_overlay'
  | 'admin_panel'
  | 'chat_ui'
  | 'notification_toast'

export type WorkspaceUiTypeTier = 'viral' | 'overflow'

export interface WorkspaceUiTypeDefinition {
  id: WorkspaceUiTypeId
  label: string
  tier: WorkspaceUiTypeTier
  /** Backend optimizer type used until dedicated types ship. */
  backendType: UiType
  /** Short intent injected into the generation prompt. */
  promptHint: string
  /** Asset name treated as the hero frame when this type is first selected. */
  heroAssetName: string
}

const definitions: WorkspaceUiTypeDefinition[] = [
  { id: 'shop_ui', label: 'Shop UI', tier: 'viral', backendType: 'shop_ui', promptHint: 'simulator shop UI with buy buttons and game pass panels', heroAssetName: 'main_frame' },
  { id: 'inventory', label: 'Inventory', tier: 'viral', backendType: 'inventory', promptHint: 'inventory grid with item slots and equip actions', heroAssetName: 'main_frame' },
  { id: 'currency_hud', label: 'Currency HUD', tier: 'viral', backendType: 'hud', promptHint: 'always-on currency strip with coins, gems, and bold outlined numbers', heroAssetName: 'currency_icon' },
  { id: 'energy_bar', label: 'Energy Bar', tier: 'viral', backendType: 'hud', promptHint: 'stamina or energy bar with fill state and power label', heroAssetName: 'background_panel' },
  { id: 'rebirth', label: 'Rebirth', tier: 'viral', backendType: 'main_menu', promptHint: 'rebirth panel with multiplier stats and confirm button', heroAssetName: 'main_frame' },
  { id: 'daily_quest', label: 'Daily Quest', tier: 'viral', backendType: 'reward_screen', promptHint: 'daily quest board with streak rewards and claim buttons', heroAssetName: 'main_frame' },
  { id: 'hotbar', label: 'Hotbar', tier: 'viral', backendType: 'inventory', promptHint: 'numbered hotbar slots for tools and equipped items', heroAssetName: 'primary_button' },
  { id: 'hud_overlay', label: 'HUD Overlay', tier: 'viral', backendType: 'hud', promptHint: 'top HUD overlay with status chips and friend boost strip', heroAssetName: 'background_panel' },
  { id: 'avatar', label: 'Avatar', tier: 'overflow', backendType: 'hud', promptHint: 'avatar profile card with portrait frame and stat rows', heroAssetName: 'main_frame' },
  { id: 'character_select', label: 'Character', tier: 'overflow', backendType: 'main_menu', promptHint: 'character select screen with preview and confirm CTA', heroAssetName: 'main_frame' },
  { id: 'profile_card', label: 'Profile Card', tier: 'overflow', backendType: 'hud', promptHint: 'player profile card with badges and level row', heroAssetName: 'main_frame' },
  { id: 'quest_board', label: 'Quest Board', tier: 'overflow', backendType: 'reward_screen', promptHint: 'quest board with objectives and progress rows', heroAssetName: 'main_frame' },
  { id: 'index_collection', label: 'Index', tier: 'overflow', backendType: 'inventory', promptHint: 'collection index with discovered and locked entries', heroAssetName: 'main_frame' },
  { id: 'achievements', label: 'Achievements', tier: 'overflow', backendType: 'reward_screen', promptHint: 'achievements panel with badge grid and claim states', heroAssetName: 'main_frame' },
  { id: 'battle_pass', label: 'Battle Pass', tier: 'overflow', backendType: 'reward_screen', promptHint: 'battle pass track with tier rewards and premium lane', heroAssetName: 'main_frame' },
  { id: 'trading_ui', label: 'Trading UI', tier: 'overflow', backendType: 'shop_ui', promptHint: 'trading window with offer slots and confirm trade button', heroAssetName: 'main_frame' },
  { id: 'gacha_spin', label: 'Gacha Spin', tier: 'overflow', backendType: 'reward_screen', promptHint: 'gacha or spin wheel reward UI with rarity glow', heroAssetName: 'main_frame' },
  { id: 'afk_rewards', label: 'AFK Rewards', tier: 'overflow', backendType: 'reward_screen', promptHint: 'AFK reward popup with timer and claim button', heroAssetName: 'main_frame' },
  { id: 'leaderboard', label: 'Leaderboard', tier: 'overflow', backendType: 'hud', promptHint: 'leaderboard panel with ranked rows and player highlight', heroAssetName: 'main_frame' },
  { id: 'settings_menu', label: 'Settings', tier: 'overflow', backendType: 'main_menu', promptHint: 'settings menu with toggles and close button', heroAssetName: 'main_frame' },
  { id: 'dialog_modal', label: 'Dialog', tier: 'overflow', backendType: 'main_menu', promptHint: 'modal dialog with title, body copy, and action buttons', heroAssetName: 'main_frame' },
  { id: 'loading_screen', label: 'Loading Screen', tier: 'overflow', backendType: 'main_menu', promptHint: 'loading screen with progress bar and tips panel', heroAssetName: 'background_panel' },
  { id: 'map_ui', label: 'Map UI', tier: 'overflow', backendType: 'hud', promptHint: 'world map overlay with zone markers and teleport pins', heroAssetName: 'main_frame' },
  { id: 'teleport_menu', label: 'Teleport Menu', tier: 'overflow', backendType: 'main_menu', promptHint: 'teleport menu with destination list and travel button', heroAssetName: 'main_frame' },
  { id: 'tutorial_overlay', label: 'Tutorial', tier: 'overflow', backendType: 'hud', promptHint: 'tutorial overlay with arrow callouts and next step button', heroAssetName: 'background_panel' },
  { id: 'admin_panel', label: 'Admin Panel', tier: 'overflow', backendType: 'main_menu', promptHint: 'admin panel with utility buttons and status rows', heroAssetName: 'main_frame' },
  { id: 'chat_ui', label: 'Chat UI', tier: 'overflow', backendType: 'hud', promptHint: 'in-game chat panel with message list and input bar', heroAssetName: 'main_frame' },
  { id: 'notification_toast', label: 'Notifications', tier: 'overflow', backendType: 'hud', promptHint: 'notification toast stack with rarity-colored frames', heroAssetName: 'background_panel' },
]

const definitionMap = new Map(definitions.map((definition) => [definition.id, definition]))

export const workspaceUiTypeDefinitions = definitions

export function getWorkspaceUiTypeDefinition(id: WorkspaceUiTypeId): WorkspaceUiTypeDefinition {
  const definition = definitionMap.get(id)
  if (!definition) throw new Error(`Unknown workspace UI type: ${id}`)
  return definition
}

export function getViralWorkspaceUiTypes(): WorkspaceUiTypeDefinition[] {
  return definitions.filter((definition) => definition.tier === 'viral')
}

export function getOverflowWorkspaceUiTypes(): WorkspaceUiTypeDefinition[] {
  return definitions.filter((definition) => definition.tier === 'overflow')
}

export function isWorkspaceUiTypeId(value: string): value is WorkspaceUiTypeId {
  return definitionMap.has(value as WorkspaceUiTypeId)
}

export function toggleWorkspaceUiTypeSelection(
  current: WorkspaceUiTypeId[],
  nextId: WorkspaceUiTypeId,
  maxSelections = MAX_UI_TYPE_SELECTIONS,
): WorkspaceUiTypeId[] {
  if (current.includes(nextId)) {
    return current.filter((id) => id !== nextId)
  }

  if (current.length >= maxSelections) {
    return current
  }

  return [...current, nextId]
}

export function resolvePrimaryBackendUiType(selected: WorkspaceUiTypeId[]): UiType {
  const first = selected[0]
  if (!first) return 'shop_ui'
  return getWorkspaceUiTypeDefinition(first).backendType
}

export function resolveHeroUiType(selected: WorkspaceUiTypeId[]): WorkspaceUiTypeId | null {
  return selected[0] ?? null
}

export function buildSelectedUiTypesPromptAugmentation(selected: WorkspaceUiTypeId[]): string {
  if (selected.length === 0) return ''

  const lines = selected.map((id) => {
    const definition = getWorkspaceUiTypeDefinition(id)
    return `- ${definition.label}: ${definition.promptHint}`
  })

  return `\n\nInclude these Roblox UI surfaces in one cohesive pack:\n${lines.join('\n')}`
}

export function buildGenerationSelectionMetadata(selected: WorkspaceUiTypeId[]) {
  const primary = resolvePrimaryBackendUiType(selected)
  const hero = resolveHeroUiType(selected)

  return {
    primary_backend_ui_type: primary,
    selected_ui_types: selected,
    hero_ui_type: hero,
    hero_asset_name: hero ? getWorkspaceUiTypeDefinition(hero).heroAssetName : 'main_frame',
  }
}

export function formatWorkspaceUiTypeLabels(selected: WorkspaceUiTypeId[]): string {
  if (selected.length === 0) return 'No UI types selected'
  return selected.map((id) => getWorkspaceUiTypeDefinition(id).label).join(', ')
}
