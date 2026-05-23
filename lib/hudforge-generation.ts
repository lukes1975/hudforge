import { analyzeRobloxPrompt } from './prompts'

export const generationStatuses = [
  'idle',
  'optimizing',
  'optimized',
  'generating_assets',
  'assets_ready',
  'preview_ready',
  'exporting',
  'exported',
  'failed',
] as const

export const hudforgeUiTypes = ['shop_ui', 'hud', 'inventory', 'main_menu', 'reward_screen'] as const
export const hudforgeStyles = ['neon', 'cartoon', 'sci_fi', 'anime', 'minimal', 'premium'] as const

export type GenerationStatus = (typeof generationStatuses)[number]
export type HudforgeGenerationStatus = GenerationStatus
export type UiType = (typeof hudforgeUiTypes)[number]
export type HudforgeUiType = UiType
export type HudforgeUiKind = 'shop' | 'inventory' | 'hud' | 'menu' | 'reward' | 'healthBar' | 'leaderboard' | 'dialog' | 'button' | 'skill' | 'notification' | 'minimap'
export type GenerationStyle = (typeof hudforgeStyles)[number]
export type HudforgeStyle = GenerationStyle | 'futuristic' | 'sciFi' | 'fantasy' | 'medieval'
export type RobloxInstanceClass = 'Frame' | 'ImageLabel' | 'TextButton' | 'TextLabel'
export type AssetUse = 'panel' | 'button' | 'icon' | 'background'
export type AssetProvider = 'fal' | 'mock'
export type ExportFormat = 'zip' | 'lua' | 'manifest' | 'json_payload'

export interface UserProfile { id: string; email?: string; name?: string; created_at?: string }
export interface UserSettings { default_export_format: 'zip' | 'lua' | 'manifest'; mobile_first: boolean; default_ui_type: UiType; default_style: GenerationStyle; save_history: boolean }
export interface ProviderStatus { llm: 'openrouter_gemini' | 'gemini' | 'mock'; assets: AssetProvider | 'missing_fal_key'; billing: 'lemon_squeezy' | 'mock' }
export interface LayoutVector { x_scale: number; x_offset: number; y_scale: number; y_offset: number }
export interface LayoutNode { id: string; type: RobloxInstanceClass; name: string; asset_ref: string | null; position: LayoutVector; size: LayoutVector; z_index: number; text: string | null; children: LayoutNode[] }
export interface LayoutSpec { canvas: { target: 'mobile' | 'desktop'; width: number; height: number; safe_area: boolean }; nodes: LayoutNode[] }
export interface ImagePromptSpec { prompt: string; negative_prompt: string; transparent: boolean; intended_use: AssetUse }
export interface LuaInstanceSpec { id: string; class_name: RobloxInstanceClass; name: string; parent: string; asset_ref: string | null; text: string | null; position: LayoutVector; size: LayoutVector; z_index: number }
export interface LuaSpec { screen_gui_name: string; root_instances: LuaInstanceSpec[] }
export interface OptimizedGenerationSpec { generation_id: string; ui_type: UiType; style: GenerationStyle; intent_summary: string; asset_list: ['main_frame', 'primary_button', 'secondary_button', 'currency_icon', 'background_panel']; layout_spec: LayoutSpec; image_prompts: Record<string, ImagePromptSpec>; lua_spec: LuaSpec; constraints: { mobile_friendly: boolean; roblox_native: boolean; transparent_assets_preferred: boolean; deterministic_export_required: boolean } }
export interface GeneratedAsset { id: string; name: string; type: AssetUse; url: string; width: number; height: number; transparent: boolean; provider: AssetProvider; prompt_used: string }
export interface AssetBundle { generation_id: string; status: 'assets_ready'; assets: GeneratedAsset[]; errors: string[] }
export interface ExportPackageFile { path: 'manifest.json' | 'layout.json' | 'code/MainUI.lua' | 'assets/assets.json' | 'README_IMPORT.md'; content_type: 'application/json' | 'text/x-lua' | 'text/markdown'; content?: string }
export interface ExportPackageManifest { generation_id: string; format: 'zip' | 'json_payload'; files: ExportPackageFile[] }
export interface ExportResponse { generation_id: string; status: 'exported'; package: ExportPackageManifest; download_url: string | null; limitations: string[] }
export interface ExportPackagePayload extends ExportResponse { filename: string; files: Required<ExportPackageFile>[] }
export interface BillingPlan { id: 'free' | 'starter' | 'pro'; name: string; price_gbp_monthly: number; credits: number; cta: string }
export type BillingState = 'free' | 'trial' | 'active_paid' | 'past_due' | 'canceled' | 'unknown_mock'
export interface BillingStatus { state: BillingState; current_plan: BillingPlan; credits_included: number; credits_used: number; credits_remaining: number; checkout_ready: boolean; customer_portal_ready: boolean; provider: 'lemon_squeezy' | 'mock' }
export type UsageEventName = 'generation_started' | 'prompt_optimized' | 'assets_generated' | 'preview_loaded' | 'export_clicked' | 'generation_failed' | 'settings_updated' | 'credit_debited' | 'credit_refunded'
export interface UsageEvent { name: UsageEventName; generation_id?: string; generationId?: string; metadata?: Record<string, string | number | boolean> }
export type HudforgeUsageEvent = UsageEvent
export interface Generation { id: string; user_id: string; title: string; prompt: string; ui_type: UiType; style: GenerationStyle; status: GenerationStatus; created_at: string; updated_at: string; optimized_spec?: OptimizedGenerationSpec; asset_bundle?: AssetBundle; export_package?: ExportPackagePayload; error?: string }
export interface OptimizeGenerationInput { prompt: string; ui_type?: string; uiType?: string; style?: string; user_settings?: Partial<UserSettings> }
export interface AssetGenerationInput { generation_id?: string; generationId?: string }
export interface ExportGenerationInput { generation_id?: string; generationId?: string }
export interface CreditLedgerEntry { id: string; user_id: string; delta: number; balance_after: number; reason: 'initial_free_grant' | 'generation_optimize' | 'asset_generation' | 'asset_generation_refund' | 'manual_adjustment'; generation_id?: string | null; metadata?: Record<string, unknown>; created_at: string }

const INITIAL_FREE_CREDITS = 25
const OPTIMIZE_CREDIT_COST = 1
const ASSET_CREDIT_COST = 5

const defaultSettings: UserSettings = { default_export_format: 'zip', mobile_first: true, default_ui_type: 'shop_ui', default_style: 'neon', save_history: true }
const freePlan: BillingPlan = { id: 'free', name: 'Free', price_gbp_monthly: 0, credits: INITIAL_FREE_CREDITS, cta: 'Current plan' }

type FalAssetProvider = (spec: OptimizedGenerationSpec) => Promise<AssetBundle>
export interface OptimizerProviderInput { generation_id: string; prompt: string; ui_type: UiType; style: GenerationStyle; user_settings: UserSettings }
type OptimizerProvider = (input: OptimizerProviderInput) => Promise<OptimizedGenerationSpec>

export class HudforgeServiceError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: string) { super(message) }
}

export interface HudforgeRepository {
  upsertGeneration(generation: Generation): Promise<Generation>
  getGeneration(userId: string, generationId: string): Promise<Generation | null>
  listGenerations(userId: string): Promise<Generation[]>
  getSettings(userId: string): Promise<UserSettings | null>
  upsertSettings(userId: string, settings: UserSettings): Promise<UserSettings>
  recordUsageEvent(userId: string, event: UsageEvent): Promise<void>
  ensureInitialCredits(userId: string, credits: number): Promise<void>
  getCreditBalance(userId: string): Promise<number>
  addCreditLedgerEntry(userId: string, delta: number, reason: CreditLedgerEntry['reason'], generationId?: string, metadata?: Record<string, unknown>): Promise<CreditLedgerEntry>
  listCreditLedger(userId: string): Promise<CreditLedgerEntry[]>
}

export function createRepositoryBackedHudforgeService(repository: HudforgeRepository, deps: { assetProvider?: FalAssetProvider; optimizerProvider?: OptimizerProvider } = {}) {
  const assetProvider = deps.assetProvider ?? generateFalAssetsForSpec
  const optimizerProvider = deps.optimizerProvider ?? createDefaultOptimizerProvider()

  return {
    async createOptimizedGeneration(userId: string, input: OptimizeGenerationInput): Promise<Generation> {
      await ensureCredits(repository, userId)
      await debitCredits(repository, userId, OPTIMIZE_CREDIT_COST, 'generation_optimize')
      const { prompt, ui_type, style, user_settings } = validatePromptInput(input)
      const now = new Date().toISOString()
      const id = `gen_${stableId(`${userId}:${prompt}:${ui_type}:${style}:${now}`).slice(0, 12)}`
      const optimized_spec = await optimizerProvider({ generation_id: id, prompt, ui_type, style, user_settings })
      const generation: Generation = { id, user_id: userId, title: buildTitle(prompt, ui_type), prompt, ui_type, style, status: 'optimized', created_at: now, updated_at: now, optimized_spec }
      await repository.upsertGeneration(generation)
      await repository.recordUsageEvent(userId, { name: 'generation_started', generation_id: id })
      await repository.recordUsageEvent(userId, { name: 'prompt_optimized', generation_id: id })
      return generation
    },

    async createAssetsForGeneration(userId: string, generationId: string): Promise<Generation> {
      await ensureCredits(repository, userId)
      await debitCredits(repository, userId, ASSET_CREDIT_COST, 'asset_generation', generationId)
      const generation = await requireGenerationFromRepo(repository, userId, generationId)
      if (!generation.optimized_spec) throw new HudforgeServiceError('Generation must be optimized before assets are created', 409, 'layout_missing')
      try {
        const asset_bundle = await assetProvider(generation.optimized_spec)
        const updated = await updateGeneration(repository, generation, { status: 'assets_ready', asset_bundle })
        await repository.recordUsageEvent(userId, { name: 'assets_generated', generation_id: generation.id })
        await repository.recordUsageEvent(userId, { name: 'preview_loaded', generation_id: generation.id })
        return updated
      } catch (error) {
        await repository.addCreditLedgerEntry(userId, ASSET_CREDIT_COST, 'asset_generation_refund', generationId, { reason: error instanceof Error ? error.message : 'asset generation failed' })
        await updateGeneration(repository, generation, { status: 'failed', error: error instanceof Error ? error.message : 'Asset generation failed' })
        await repository.recordUsageEvent(userId, { name: 'generation_failed', generation_id: generation.id, metadata: { stage: 'assets' } })
        throw error
      }
    },

    async createExportForGeneration(userId: string, generationId: string): Promise<Generation> {
      const generation = await requireGenerationFromRepo(repository, userId, generationId)
      if (!generation.optimized_spec) throw new HudforgeServiceError('Generation must be optimized before export', 409, 'layout_missing')
      const export_package = buildExportPackage(generation.optimized_spec, generation.asset_bundle)
      const updated = await updateGeneration(repository, generation, { status: 'exported', export_package })
      await repository.recordUsageEvent(userId, { name: 'export_clicked', generation_id: generation.id })
      return updated
    },

    async listGenerations(userId: string) { return repository.listGenerations(userId) },
    async getSettings(userId: string) { return (await repository.getSettings(userId)) ?? defaultSettings },
    async updateSettings(userId: string, input: Partial<UserSettings>) { const settings = normalizeSettingsInput(input); await repository.upsertSettings(userId, settings); await repository.recordUsageEvent(userId, { name: 'settings_updated' }); return settings },
    async recordUsageEvent(userId: string, event: UsageEvent) { await repository.recordUsageEvent(userId, event) },
    async getBillingStatus(userId: string) { return getBillingStatusFromRepository(repository, userId) },
  }
}

export function memoryHudforgeRepository(options: { initialCredits?: number } = {}): HudforgeRepository {
  const generations = new Map<string, Generation>()
  const settingsByUser = new Map<string, UserSettings>()
  const usageEvents: Array<UsageEvent & { user_id: string; created_at: string }> = []
  const ledger: CreditLedgerEntry[] = []
  const initialCredits = options.initialCredits ?? INITIAL_FREE_CREDITS
  return {
    async upsertGeneration(generation) { generations.set(generation.id, generation); return generation },
    async getGeneration(userId, generationId) { const generation = generations.get(generationId); return generation?.user_id === userId ? generation : null },
    async listGenerations(userId) { return Array.from(generations.values()).filter((generation) => generation.user_id === userId).sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)) },
    async getSettings(userId) { return settingsByUser.get(userId) ?? null },
    async upsertSettings(userId, settings) { settingsByUser.set(userId, settings); return settings },
    async recordUsageEvent(userId, event) { usageEvents.push({ ...event, user_id: userId, created_at: new Date().toISOString() }) },
    async ensureInitialCredits(userId, credits) { if (!ledger.some((entry) => entry.user_id === userId && entry.reason === 'initial_free_grant')) await this.addCreditLedgerEntry(userId, options.initialCredits ?? credits, 'initial_free_grant') },
    async getCreditBalance(userId) { await this.ensureInitialCredits(userId, initialCredits); return ledger.filter((entry) => entry.user_id === userId).reduce((total, entry) => total + entry.delta, 0) },
    async addCreditLedgerEntry(userId, delta, reason, generationId, metadata) { const balanceBefore = ledger.filter((entry) => entry.user_id === userId).reduce((total, entry) => total + entry.delta, 0); const entry: CreditLedgerEntry = { id: `cle_${stableId(`${userId}:${reason}:${Date.now()}:${Math.random()}`).slice(0, 12)}`, user_id: userId, delta, balance_after: balanceBefore + delta, reason, generation_id: generationId ?? null, metadata, created_at: new Date().toISOString() }; ledger.push(entry); return entry },
    async listCreditLedger(userId) { await this.ensureInitialCredits(userId, initialCredits); return ledger.filter((entry) => entry.user_id === userId).sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)) },
  }
}

export function supabaseHudforgeRepository(): HudforgeRepository {
  async function client() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new HudforgeServiceError('Supabase persistence is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503, 'supabase_not_configured')
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(url, key, { auth: { persistSession: false } })
  }
  async function ensureProfile(supabase: Awaited<ReturnType<typeof client>>, userId: string) {
    const { error } = await supabase.from('hudforge_profiles').upsert({ user_id: userId }, { onConflict: 'user_id' })
    if (error) throw dbError(error, 'Failed to ensure profile')
  }
  return {
    async upsertGeneration(generation) { const supabase = await client(); await ensureProfile(supabase, generation.user_id); const { error } = await supabase.from('hudforge_generations').upsert(toGenerationRow(generation)); if (error) throw dbError(error, 'Failed to persist generation'); return generation },
    async getGeneration(userId, generationId) { const supabase = await client(); const { data, error } = await supabase.from('hudforge_generations').select('*').eq('user_id', userId).eq('id', generationId).maybeSingle(); if (error) throw dbError(error, 'Failed to load generation'); return data ? fromGenerationRow(data) : null },
    async listGenerations(userId) { const supabase = await client(); const { data, error } = await supabase.from('hudforge_generations').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); if (error) throw dbError(error, 'Failed to list generations'); return (data ?? []).map(fromGenerationRow) },
    async getSettings(userId) { const supabase = await client(); const { data, error } = await supabase.from('hudforge_user_settings').select('settings').eq('user_id', userId).maybeSingle(); if (error) throw dbError(error, 'Failed to load settings'); return data?.settings ? normalizeSettingsInput(data.settings as Partial<UserSettings>) : null },
    async upsertSettings(userId, settings) { const supabase = await client(); await ensureProfile(supabase, userId); const { error } = await supabase.from('hudforge_user_settings').upsert({ user_id: userId, settings, updated_at: new Date().toISOString() }); if (error) throw dbError(error, 'Failed to persist settings'); return settings },
    async recordUsageEvent(userId, event) { const supabase = await client(); await ensureProfile(supabase, userId); const { error } = await supabase.from('hudforge_usage_events').insert({ user_id: userId, event_name: event.name, generation_id: event.generation_id ?? event.generationId ?? null, metadata: event.metadata ?? {} }); if (error) throw dbError(error, 'Failed to record usage event') },
    async ensureInitialCredits(userId, credits) { const supabase = await client(); await ensureProfile(supabase, userId); const { data, error } = await supabase.from('hudforge_credit_ledger').select('id').eq('user_id', userId).eq('reason', 'initial_free_grant').limit(1); if (error) throw dbError(error, 'Failed to inspect credit ledger'); if (!data?.length) await this.addCreditLedgerEntry(userId, credits, 'initial_free_grant') },
    async getCreditBalance(userId) { await this.ensureInitialCredits(userId, INITIAL_FREE_CREDITS); const supabase = await client(); const { data, error } = await supabase.from('hudforge_credit_ledger').select('delta').eq('user_id', userId); if (error) throw dbError(error, 'Failed to load credit balance'); return (data ?? []).reduce((total, row: { delta: number }) => total + row.delta, 0) },
    async addCreditLedgerEntry(userId, delta, reason, generationId, metadata) { const supabase = await client(); await ensureProfile(supabase, userId); const { data: rows, error: balanceError } = await supabase.from('hudforge_credit_ledger').select('delta').eq('user_id', userId); if (balanceError) throw dbError(balanceError, 'Failed to load credit balance'); const balanceAfter = (rows ?? []).reduce((total, row: { delta: number }) => total + row.delta, 0) + delta; const row = { user_id: userId, delta, balance_after: balanceAfter, reason, generation_id: generationId ?? null, metadata: metadata ?? {} }; const { data, error } = await supabase.from('hudforge_credit_ledger').insert(row).select('*').single(); if (error) throw dbError(error, 'Failed to write credit ledger'); return data as CreditLedgerEntry },
    async listCreditLedger(userId) { await this.ensureInitialCredits(userId, INITIAL_FREE_CREDITS); const supabase = await client(); const { data, error } = await supabase.from('hudforge_credit_ledger').select('*').eq('user_id', userId).order('created_at', { ascending: true }); if (error) throw dbError(error, 'Failed to list credit ledger'); return (data ?? []) as CreditLedgerEntry[] },
  }
}

const defaultRepository = process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseHudforgeRepository() : memoryHudforgeRepository()
const defaultService = createRepositoryBackedHudforgeService(defaultRepository)

export function validatePromptInput(input: OptimizeGenerationInput): { prompt: string; ui_type: UiType; style: GenerationStyle; user_settings: UserSettings } { const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : ''; const ui_type = normalizeUiType(input.ui_type ?? input.uiType); const style = normalizeGenerationStyle(input.style); const user_settings = normalizeSettingsInput(input.user_settings); if (!prompt) throw new HudforgeServiceError('Prompt required', 400, 'prompt_required'); if (prompt.length > 900) throw new HudforgeServiceError('Prompt must be 900 characters or fewer', 400, 'prompt_too_long'); return { prompt, ui_type, style, user_settings } }
export function optimizePromptForRobloxUi(input: OptimizeGenerationInput): OptimizedGenerationSpec { const { prompt, ui_type, style, user_settings } = validatePromptInput(input); const generation_id = `gen_${stableId(`${prompt}:${ui_type}:${style}`).slice(0, 12)}`; return buildOptimizedSpec(generation_id, prompt, ui_type, style, user_settings) }
export const createOptimizedGeneration = (userId: string, input: OptimizeGenerationInput) => defaultService.createOptimizedGeneration(userId, input)
export const createAssetsForGeneration = (userId: string, generationId: string) => defaultService.createAssetsForGeneration(userId, generationId)
export const createExportForGeneration = (userId: string, generationId: string) => defaultService.createExportForGeneration(userId, generationId)
export const listGenerations = (userId: string) => defaultService.listGenerations(userId)
export const getSettings = (userId: string) => defaultService.getSettings(userId)
export const updateSettings = (userId: string, input: Partial<UserSettings>) => defaultService.updateSettings(userId, input)
export const recordUsageEvent = (userId: string, event: UsageEvent) => defaultService.recordUsageEvent(userId, event)
export const getBillingStatus = (userId: string) => defaultService.getBillingStatus(userId)

export function generateMockAssets(spec: OptimizedGenerationSpec): GeneratedAsset[] { return Object.entries(spec.image_prompts).map(([name, imagePrompt]) => ({ id: `${name}_${stableId(`${spec.generation_id}:${name}`).slice(0, 8)}`, name, type: imagePrompt.intended_use, url: buildMockSvgDataUrl(spec, name, imagePrompt.intended_use), width: imagePrompt.intended_use === 'background' ? 1024 : 512, height: imagePrompt.intended_use === 'background' ? 1024 : 512, transparent: imagePrompt.transparent, provider: 'mock', prompt_used: imagePrompt.prompt })) }

export async function generateFalAssetsForSpec(spec: OptimizedGenerationSpec): Promise<AssetBundle> {
  const falKey = process.env.FAL_KEY
  if (!falKey) throw new HudforgeServiceError('FAL_KEY is missing. Real asset generation is required; mock fallback is disabled for authenticated generation.', 503, 'fal_not_configured')
  const assets: GeneratedAsset[] = []
  for (const [name, imagePrompt] of Object.entries(spec.image_prompts)) {
    assets.push(await generateSingleFalAsset(falKey, spec, name, imagePrompt))
  }
  return { generation_id: spec.generation_id, status: 'assets_ready', assets, errors: [] }
}

async function generateSingleFalAsset(falKey: string, spec: OptimizedGenerationSpec, name: string, imagePrompt: ImagePromptSpec): Promise<GeneratedAsset> {
  const model = process.env.FAL_MODEL || process.env.FAL_IMAGE_MODEL || 'fal-ai/flux/dev'
  const prompt = buildFalAssetPrompt(spec, name, imagePrompt)
  const submitResponse = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers: { Authorization: `Key ${falKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, negative_prompt: imagePrompt.negative_prompt, image_size: imagePrompt.intended_use === 'background' ? 'landscape_16_9' : 'square_hd', num_images: 1, enable_safety_checker: true }) })
  if (!submitResponse.ok) throw new HudforgeServiceError(`fal.ai request failed for ${name} with status ${submitResponse.status}`, 502, 'fal_request_failed')
  const queuePayload = (await submitResponse.json()) as { response_url?: string; error?: string }
  if (!queuePayload.response_url) throw new HudforgeServiceError(`fal.ai did not return a response URL for ${name}`, 502, 'fal_response_url_missing')
  const result = await waitForFalResult(queuePayload.response_url, falKey, name)
  const image = result.images?.[0] ?? result.data?.images?.[0] ?? result.image
  if (!image?.url) throw new HudforgeServiceError(`fal.ai returned no image URL for ${name}`, 502, 'fal_image_missing')
  return { id: `${name}_${stableId(`${spec.generation_id}:${name}:${image.url}`).slice(0, 8)}`, name, type: imagePrompt.intended_use, url: image.url, width: imagePrompt.intended_use === 'background' ? 1344 : 1024, height: imagePrompt.intended_use === 'background' ? 768 : 1024, transparent: imagePrompt.transparent, provider: 'fal', prompt_used: prompt }
}

async function waitForFalResult(responseUrl: string, falKey: string, name: string) { for (let attempt = 0; attempt < 90; attempt += 1) { if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 2000)); const response = await fetch(responseUrl, { headers: { Authorization: `Key ${falKey}` } }); if (response.ok) return (await response.json()) as { images?: Array<{ url?: string }>; image?: { url?: string }; data?: { images?: Array<{ url?: string }> } }; const body = await response.text(); if (response.status === 400 && body.toLowerCase().includes('still in progress')) continue; throw new HudforgeServiceError(`fal.ai polling failed for ${name} with status ${response.status}`, 502, 'fal_poll_failed') } throw new HudforgeServiceError(`Timed out waiting for fal.ai asset generation for ${name}`, 504, 'fal_timeout') }
function buildFalAssetPrompt(spec: OptimizedGenerationSpec, name: string, imagePrompt: ImagePromptSpec) { return [`Roblox game UI production asset: ${name}.`, imagePrompt.prompt, `UI type: ${spec.ui_type}. Style: ${spec.style}.`, 'Clean game-world visual language, strong readable silhouette, no watermark, no tiny unreadable text, no random characters, no photorealism.', 'Designed as part of one coherent UI kit: main frame, button style, currency icon, panel/background, close/settings button.', imagePrompt.transparent ? 'Transparent PNG-style asset, isolated UI element, clean alpha edges.' : 'Backdrop/panel texture suitable for a browser preview and Roblox ScreenGui composition.'].join(' ') }


export function createDefaultOptimizerProvider(): OptimizerProvider {
  const openRouterKey = process.env.OPENROUTER_API_KEY
  if (openRouterKey) return createOpenRouterGeminiOptimizer({ apiKey: openRouterKey })
  return async ({ generation_id, prompt, ui_type, style, user_settings }) => buildOptimizedSpec(generation_id, prompt, ui_type, style, user_settings)
}

export function createOpenRouterGeminiOptimizer(options: { apiKey?: string; model?: string; fetchImpl?: typeof fetch } = {}): OptimizerProvider {
  const apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY
  const model = options.model ?? process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash'
  const fetchImpl = options.fetchImpl ?? fetch
  if (!apiKey) throw new HudforgeServiceError('OPENROUTER_API_KEY is missing. Real Gemini optimizer is not configured.', 503, 'openrouter_not_configured')

  return async (input) => {
    const response = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.hudforge.app',
        'X-Title': 'HUDForge',
      },
      body: JSON.stringify({
        model,
        temperature: 0.25,
        max_tokens: 2400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildOptimizerSystemPrompt() },
          { role: 'user', content: buildOptimizerUserPrompt(input) },
        ],
      }),
    })

    if (!response.ok) {
      const body = await safeResponseText(response)
      throw new HudforgeServiceError(`OpenRouter optimizer failed with status ${response.status}: ${body.slice(0, 220)}`, 502, 'openrouter_request_failed')
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } }
    const content = payload.choices?.[0]?.message?.content
    if (!content) throw new HudforgeServiceError(payload.error?.message ?? 'OpenRouter returned no optimizer content', 502, 'openrouter_empty_response')
    return parseOpenRouterOptimizedSpec(content, {
      generation_id: input.generation_id,
      prompt: input.prompt,
      ui_type: input.ui_type,
      style: input.style,
      mobile_first: input.user_settings.mobile_first,
    })
  }
}

export function parseOpenRouterOptimizedSpec(text: string, context: { generation_id: string; prompt: string; ui_type: UiType; style: GenerationStyle; mobile_first: boolean }): OptimizedGenerationSpec {
  const parsed = unwrapOptimizerPayload(parseJsonObjectFromText(text))
  const fallbackSettings = normalizeSettingsInput({ mobile_first: context.mobile_first, default_ui_type: context.ui_type, default_style: context.style })
  const fallback = buildOptimizedSpec(context.generation_id, context.prompt, context.ui_type, context.style, fallbackSettings)
  const imagePromptsValue = parsed.image_prompts ?? parsed.imagePrompts ?? (parsed.assets as Record<string, unknown> | undefined)?.image_prompts ?? (parsed.assets as Record<string, unknown> | undefined)?.imagePrompts
  const layoutSpecValue = (parsed.layout_spec ?? parsed.layoutSpec) as { nodes?: unknown; canvas?: unknown } | undefined
  const imagePrompts = normalizeProviderImagePrompts(imagePromptsValue, fallback)
  const layoutNodes = normalizeProviderLayoutNodes(layoutSpecValue?.nodes, fallback.layout_spec.nodes)
  const canvas = normalizeProviderCanvas(layoutSpecValue?.canvas, fallback.layout_spec.canvas)
  const rootInstances = flattenNodesForLua(layoutNodes, 'ScreenGui')
  return {
    generation_id: context.generation_id,
    ui_type: context.ui_type,
    style: context.style,
    intent_summary: typeof parsed.intent_summary === 'string' && parsed.intent_summary.trim().length > 20 ? parsed.intent_summary.trim().slice(0, 240) : fallback.intent_summary,
    asset_list: ['main_frame', 'primary_button', 'secondary_button', 'currency_icon', 'background_panel'],
    layout_spec: { canvas, nodes: layoutNodes },
    image_prompts: imagePrompts,
    lua_spec: { screen_gui_name: 'HUDForgeGeneratedUI', root_instances: rootInstances },
    constraints: { mobile_friendly: true, roblox_native: true, transparent_assets_preferred: true, deterministic_export_required: true },
  }
}

function parseJsonObjectFromText(text: string): Record<string, unknown> {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1]
  const candidate = fenced ?? trimmed.slice(trimmed.indexOf('{'), trimmed.lastIndexOf('}') + 1)
  try {
    const parsed = JSON.parse(candidate)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    return parsed as Record<string, unknown>
  } catch (error) {
    throw new HudforgeServiceError(`OpenRouter optimizer returned invalid JSON: ${error instanceof Error ? error.message : 'parse failed'}`, 502, 'openrouter_invalid_json')
  }
}


function unwrapOptimizerPayload(parsed: Record<string, unknown>): Record<string, unknown> {
  for (const key of ['spec', 'ui_spec', 'uiSpec', 'hudforge_spec', 'hudforgeSpec']) {
    const value = parsed[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  }
  return parsed
}

function normalizeProviderImagePrompts(value: unknown, fallback: OptimizedGenerationSpec): OptimizedGenerationSpec['image_prompts'] {
  if (!value || typeof value !== 'object') throw new HudforgeServiceError('OpenRouter optimizer JSON is missing image_prompts object', 502, 'openrouter_invalid_schema')
  const source = Array.isArray(value) ? Object.fromEntries(value.map((row) => [normalizeAssetPromptKey(typeof row?.name === 'string' ? row.name : typeof row?.id === 'string' ? row.id : typeof row?.node_id === 'string' ? row.node_id : typeof row?.asset_ref === 'string' ? row.asset_ref : ''), row]).filter(([key]) => key)) : Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, row]) => [normalizeAssetPromptKey(key), row]))
  const required = ['main_frame', 'primary_button', 'secondary_button', 'currency_icon', 'background_panel'] as const
  const normalized = {} as OptimizedGenerationSpec['image_prompts']
  for (const key of required) {
    const row = source[key] ?? source[normalizeAssetPromptKey(key)]
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new HudforgeServiceError(`OpenRouter optimizer JSON is missing image prompt: ${key}`, 502, 'openrouter_invalid_schema')
    const prompt = (row as Record<string, unknown>).prompt
    if (typeof prompt !== 'string' || prompt.trim().length < 16) throw new HudforgeServiceError(`OpenRouter optimizer image prompt is too weak: ${key}`, 502, 'openrouter_invalid_schema')
    const fallbackPrompt = fallback.image_prompts[key]
    const intendedUse = (row as Record<string, unknown>).intended_use
    normalized[key] = {
      prompt: prompt.trim().slice(0, 700),
      negative_prompt: typeof (row as Record<string, unknown>).negative_prompt === 'string' ? ((row as Record<string, unknown>).negative_prompt as string).trim().slice(0, 240) : fallbackPrompt.negative_prompt,
      transparent: typeof (row as Record<string, unknown>).transparent === 'boolean' ? ((row as Record<string, unknown>).transparent as boolean) : fallbackPrompt.transparent,
      intended_use: intendedUse === 'panel' || intendedUse === 'button' || intendedUse === 'icon' || intendedUse === 'background' ? intendedUse : fallbackPrompt.intended_use,
    }
  }
  return normalized
}

function normalizeAssetPromptKey(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') }
function normalizeProviderCanvas(value: unknown, fallback: LayoutSpec['canvas']): LayoutSpec['canvas'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback
  const row = value as Record<string, unknown>
  const target = row.target === 'desktop' ? 'desktop' : row.target === 'mobile' ? 'mobile' : fallback.target
  return {
    target,
    width: typeof row.width === 'number' && row.width >= 320 && row.width <= 1920 ? Math.round(row.width) : fallback.width,
    height: typeof row.height === 'number' && row.height >= 320 && row.height <= 1920 ? Math.round(row.height) : fallback.height,
    safe_area: typeof row.safe_area === 'boolean' ? row.safe_area : true,
  }
}

function normalizeProviderLayoutNodes(value: unknown, fallback: LayoutNode[]): LayoutNode[] {
  if (!Array.isArray(value) || value.length === 0) return fallback
  return value.slice(0, 24).map((node, index) => normalizeProviderLayoutNode(node, fallback[index] ?? fallback[0], index))
}

function normalizeProviderLayoutNode(value: unknown, fallback: LayoutNode, index: number): LayoutNode {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback
  const row = value as Record<string, unknown>
  const type = row.type === 'Frame' || row.type === 'ImageLabel' || row.type === 'TextButton' || row.type === 'TextLabel' ? row.type : fallback.type
  const id = sanitizeNodeId(typeof row.id === 'string' ? row.id : fallback.id || `node_${index}`)
  const childrenValue = row.children
  return {
    id,
    type,
    name: sanitizeRobloxName(typeof row.name === 'string' ? row.name : fallback.name || id),
    asset_ref: typeof row.asset_ref === 'string' && row.asset_ref.trim() ? row.asset_ref.trim() : null,
    position: normalizeVector(row.position, fallback.position),
    size: normalizeVector(row.size, fallback.size),
    z_index: typeof row.z_index === 'number' ? Math.max(1, Math.min(20, Math.round(row.z_index))) : fallback.z_index,
    text: typeof row.text === 'string' ? row.text.slice(0, 80) : null,
    children: Array.isArray(childrenValue) ? childrenValue.slice(0, 16).map((child, childIndex) => normalizeProviderLayoutNode(child, fallback.children[childIndex] ?? fallback, childIndex)) : [],
  }
}

function normalizeVector(value: unknown, fallback: LayoutVector): LayoutVector {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback
  const row = value as Record<string, unknown>
  return {
    x_scale: typeof row.x_scale === 'number' ? clamp(row.x_scale, -2, 2) : fallback.x_scale,
    x_offset: typeof row.x_offset === 'number' ? Math.round(clamp(row.x_offset, -2000, 2000)) : fallback.x_offset,
    y_scale: typeof row.y_scale === 'number' ? clamp(row.y_scale, -2, 2) : fallback.y_scale,
    y_offset: typeof row.y_offset === 'number' ? Math.round(clamp(row.y_offset, -2000, 2000)) : fallback.y_offset,
  }
}

function buildOptimizerSystemPrompt() {
  return 'You are HUDForge, a Roblox UI production optimizer. Return only valid JSON. Produce a deterministic layout spec and five image prompts. No prose, no markdown unless the API forces it.'
}

function buildOptimizerUserPrompt(input: OptimizerProviderInput) {
  return JSON.stringify({
    task: 'Create a Roblox UI generation spec. Return JSON with intent_summary, layout_spec.canvas, layout_spec.nodes, and image_prompts for exactly main_frame, primary_button, secondary_button, currency_icon, background_panel.',
    constraints: ['Roblox ScreenGui friendly', 'mobile safe area', 'no baked text in generated image prompts except icon-free labels', 'all final code will be generated deterministically by HUDForge'],
    allowed_node_types: ['Frame', 'ImageLabel', 'TextButton', 'TextLabel'],
    allowed_asset_uses: ['panel', 'button', 'icon', 'background'],
    prompt: input.prompt,
    ui_type: input.ui_type,
    style: input.style,
    mobile_first: input.user_settings.mobile_first,
  })
}

async function safeResponseText(response: Response) {
  try { return await response.text() } catch { return '' }
}

function sanitizeNodeId(value: string) { return value.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'node' }
function sanitizeRobloxName(value: string) { return toRobloxIdentifier(value).slice(0, 64) }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }

async function ensureCredits(repository: HudforgeRepository, userId: string) { await repository.ensureInitialCredits(userId, INITIAL_FREE_CREDITS) }
async function debitCredits(repository: HudforgeRepository, userId: string, amount: number, reason: CreditLedgerEntry['reason'], generationId?: string) { const balance = await repository.getCreditBalance(userId); if (balance < amount) throw new HudforgeServiceError(`Insufficient credits. Required ${amount}, available ${balance}.`, 402, 'insufficient_credits'); await repository.addCreditLedgerEntry(userId, -amount, reason, generationId) }
async function requireGenerationFromRepo(repository: HudforgeRepository, userId: string, generationId: string) { const generation = await repository.getGeneration(userId, generationId); if (!generation) throw new HudforgeServiceError('Generation not found', 404, 'generation_not_found'); return generation }
async function updateGeneration(repository: HudforgeRepository, generation: Generation, updates: Partial<Generation>) { const updated = { ...generation, ...updates, updated_at: new Date().toISOString() }; return repository.upsertGeneration(updated) }
async function getBillingStatusFromRepository(repository: HudforgeRepository, userId: string): Promise<BillingStatus> { const balance = await repository.getCreditBalance(userId); const ledger = await repository.listCreditLedger(userId); const credits_used = Math.abs(ledger.filter((entry) => entry.delta < 0).reduce((total, entry) => total + entry.delta, 0)); const checkout_ready = Boolean(process.env.LEMON_SQUEEZY_API_KEY && process.env.LEMON_SQUEEZY_STORE_ID); return { state: checkout_ready ? 'free' : 'unknown_mock', current_plan: freePlan, credits_included: freePlan.credits, credits_used, credits_remaining: balance, checkout_ready, customer_portal_ready: checkout_ready, provider: checkout_ready ? 'lemon_squeezy' : 'mock' } }
export function getProviderStatus(): ProviderStatus { return { llm: process.env.OPENROUTER_API_KEY ? 'openrouter_gemini' : process.env.GEMINI_API_KEY ? 'gemini' : 'mock', assets: process.env.FAL_KEY ? 'fal' : 'missing_fal_key', billing: process.env.LEMON_SQUEEZY_API_KEY ? 'lemon_squeezy' : 'mock' } }
export function assertGenerationStatus(status: string): asserts status is GenerationStatus { if (!generationStatuses.includes(status as GenerationStatus)) throw new HudforgeServiceError(`Unsupported generation status: ${status}`, 400, 'invalid_status') }
export function exportLayoutToLuau(spec: OptimizedGenerationSpec): string { const lines = [`-- HUDForge export: ${escapeLuauString(spec.intent_summary)}`, `-- UI type: ${spec.ui_type}`, `-- Style: ${spec.style}`, '-- Asset refs are listed in assets/assets.json. Replace rbxassetid://0 with uploaded Roblox asset IDs.', 'local ScreenGui = Instance.new("ScreenGui")', `ScreenGui.Name = "${escapeLuauString(spec.lua_spec.screen_gui_name)}"`, 'ScreenGui.ResetOnSpawn = false', 'ScreenGui.IgnoreGuiInset = true', 'ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling', '']; for (const instance of spec.lua_spec.root_instances) appendInstanceLuau(lines, instance); lines.push('return ScreenGui', ''); return lines.join('\n') }

function buildOptimizedSpec(generation_id: string, prompt: string, ui_type: UiType, style: GenerationStyle, user_settings: UserSettings): OptimizedGenerationSpec { const title = buildTitle(prompt, ui_type); const canvasTarget = user_settings.mobile_first ? 'mobile' : 'desktop'; const nodes = buildLayoutNodes(ui_type, title); const rootInstances = flattenNodesForLua(nodes, 'ScreenGui'); const basePrompt = `${style.replace('_', ' ')} Roblox ${ui_type.replace('_', ' ')} for: ${prompt}. Clean transparent game UI components, Roblox-native layout, editable labels, mobile safe area.`; return { generation_id, ui_type, style, intent_summary: `Create a ${style.replace('_', ' ')} ${ui_type.replace('_', ' ')} that is mobile-friendly, previewable, and exportable to Roblox Studio.`, asset_list: ['main_frame', 'primary_button', 'secondary_button', 'currency_icon', 'background_panel'], layout_spec: { canvas: { target: canvasTarget, width: canvasTarget === 'mobile' ? 390 : 1280, height: canvasTarget === 'mobile' ? 844 : 720, safe_area: true }, nodes }, image_prompts: { main_frame: { prompt: `${basePrompt} Main transparent panel frame with subtle border glow.`, negative_prompt: 'tiny unreadable text, watermark, logo, clutter', transparent: true, intended_use: 'panel' }, primary_button: { prompt: `${basePrompt} Primary buy/action button, rounded, clear state, no baked text.`, negative_prompt: 'text, watermark, photorealism, messy edges', transparent: true, intended_use: 'button' }, secondary_button: { prompt: `${basePrompt} Secondary close/settings button, compact X/button state, no baked text.`, negative_prompt: 'text, watermark, noisy background', transparent: true, intended_use: 'button' }, currency_icon: { prompt: `${basePrompt} Currency icon suitable for coins/gems display.`, negative_prompt: 'watermark, text, blurry', transparent: true, intended_use: 'icon' }, background_panel: { prompt: `${basePrompt} Soft game UI backdrop panel texture for preview context.`, negative_prompt: 'watermark, text, characters, busy scenery', transparent: false, intended_use: 'background' } }, lua_spec: { screen_gui_name: 'HUDForgeGeneratedUI', root_instances: rootInstances }, constraints: { mobile_friendly: true, roblox_native: true, transparent_assets_preferred: true, deterministic_export_required: true } } }
function buildLayoutNodes(ui_type: UiType, title: string): LayoutNode[] { const mainText = ui_type === 'shop_ui' ? 'Featured Items' : ui_type === 'inventory' ? 'Inventory' : ui_type === 'reward_screen' ? 'Reward Unlocked' : ui_type === 'main_menu' ? 'Main Menu' : 'Player HUD'; const actionText = ui_type === 'shop_ui' ? 'BUY' : ui_type === 'inventory' ? 'EQUIP' : ui_type === 'reward_screen' ? 'CLAIM' : ui_type === 'main_menu' ? 'PLAY' : 'BOOST'; return [{ id: 'background_panel', type: 'ImageLabel', name: 'BackgroundPanel', asset_ref: 'background_panel', position: { x_scale: 0, x_offset: 0, y_scale: 0, y_offset: 0 }, size: { x_scale: 1, x_offset: 0, y_scale: 1, y_offset: 0 }, z_index: 1, text: null, children: [] }, { id: 'main_frame', type: 'Frame', name: 'MainFrame', asset_ref: 'main_frame', position: { x_scale: 0.5, x_offset: -175, y_scale: 0.5, y_offset: -245 }, size: { x_scale: 0, x_offset: 350, y_scale: 0, y_offset: 490 }, z_index: 2, text: null, children: [{ id: 'title_label', type: 'TextLabel', name: 'TitleLabel', asset_ref: null, position: { x_scale: 0, x_offset: 24, y_scale: 0, y_offset: 20 }, size: { x_scale: 1, x_offset: -48, y_scale: 0, y_offset: 48 }, z_index: 3, text: title, children: [] }, { id: 'currency_icon', type: 'ImageLabel', name: 'CurrencyIcon', asset_ref: 'currency_icon', position: { x_scale: 0, x_offset: 28, y_scale: 0, y_offset: 92 }, size: { x_scale: 0, x_offset: 48, y_scale: 0, y_offset: 48 }, z_index: 3, text: null, children: [] }, { id: 'summary_label', type: 'TextLabel', name: 'SummaryLabel', asset_ref: null, position: { x_scale: 0, x_offset: 88, y_scale: 0, y_offset: 92 }, size: { x_scale: 1, x_offset: -116, y_scale: 0, y_offset: 48 }, z_index: 3, text: mainText, children: [] }, { id: 'primary_button', type: 'TextButton', name: 'PrimaryButton', asset_ref: 'primary_button', position: { x_scale: 0.5, x_offset: -124, y_scale: 1, y_offset: -92 }, size: { x_scale: 0, x_offset: 248, y_scale: 0, y_offset: 54 }, z_index: 4, text: actionText, children: [] }, { id: 'secondary_button', type: 'TextButton', name: 'CloseButton', asset_ref: 'secondary_button', position: { x_scale: 1, x_offset: -58, y_scale: 0, y_offset: 18 }, size: { x_scale: 0, x_offset: 38, y_scale: 0, y_offset: 38 }, z_index: 5, text: 'X', children: [] }] }] }
function flattenNodesForLua(nodes: LayoutNode[], parent: string): LuaInstanceSpec[] { return nodes.flatMap((node) => [{ id: node.id, class_name: node.type, name: node.name, parent, asset_ref: node.asset_ref, text: node.text, position: node.position, size: node.size, z_index: node.z_index }, ...flattenNodesForLua(node.children, node.name)]) }
function appendInstanceLuau(lines: string[], instance: LuaInstanceSpec) { const variableName = toRobloxIdentifier(instance.name); const parentName = instance.parent === 'ScreenGui' ? 'ScreenGui' : toRobloxIdentifier(instance.parent); lines.push(`local ${variableName} = Instance.new("${instance.class_name}")`, `${variableName}.Name = "${escapeLuauString(instance.name)}"`, `${variableName}.Position = UDim2.new(${instance.position.x_scale}, ${instance.position.x_offset}, ${instance.position.y_scale}, ${instance.position.y_offset})`, `${variableName}.Size = UDim2.new(${instance.size.x_scale}, ${instance.size.x_offset}, ${instance.size.y_scale}, ${instance.size.y_offset})`, `${variableName}.ZIndex = ${instance.z_index}`); if (instance.class_name === 'ImageLabel') { lines.push(`${variableName}.BackgroundTransparency = 1`, `${variableName}.Image = "rbxassetid://0" -- manifest asset_ref: ${escapeLuauString(instance.asset_ref ?? 'none')}`) } else { lines.push(`${variableName}.BackgroundColor3 = Color3.fromRGB(16, 24, 39)`, `${variableName}.BorderSizePixel = 0`) } if (instance.text && (instance.class_name === 'TextLabel' || instance.class_name === 'TextButton')) lines.push(`${variableName}.Font = Enum.Font.GothamBold`, `${variableName}.Text = "${escapeLuauString(instance.text)}"`, `${variableName}.TextColor3 = Color3.fromRGB(255, 255, 255)`, `${variableName}.TextScaled = true`, `${variableName}.BackgroundTransparency = ${instance.class_name === 'TextLabel' ? 1 : 0}`); lines.push(`${variableName}.Parent = ${parentName}`, '') }
function buildExportPackage(spec: OptimizedGenerationSpec, assetBundle?: AssetBundle): ExportPackagePayload { const lua = exportLayoutToLuau(spec); const manifest = { product: 'HUDForge', generation_id: spec.generation_id, generated_at: new Date().toISOString(), ui_type: spec.ui_type, style: spec.style, entrypoint: 'code/MainUI.lua', files: ['manifest.json', 'layout.json', 'code/MainUI.lua', 'assets/assets.json', 'README_IMPORT.md'] }; const files: Required<ExportPackageFile>[] = [{ path: 'manifest.json', content_type: 'application/json', content: JSON.stringify(manifest, null, 2) }, { path: 'layout.json', content_type: 'application/json', content: JSON.stringify(spec.layout_spec, null, 2) }, { path: 'code/MainUI.lua', content_type: 'text/x-lua', content: lua }, { path: 'assets/assets.json', content_type: 'application/json', content: JSON.stringify({ assets: assetBundle?.assets ?? [], asset_refs: spec.asset_list }, null, 2) }, { path: 'README_IMPORT.md', content_type: 'text/markdown', content: buildImportReadme(spec) }]; return { generation_id: spec.generation_id, status: 'exported', package: { generation_id: spec.generation_id, format: 'json_payload', files: files.map(({ path, content_type }) => ({ path, content_type })) }, download_url: null, limitations: ['json_payload is implemented now; ZIP archive wrapping is next. Asset URLs must be uploaded/imported into Roblox and substituted for rbxassetid://0 refs.'], filename: `${slugify(spec.ui_type)}-${slugify(spec.style)}-${spec.generation_id}.json`, files } }
function buildImportReadme(spec: OptimizedGenerationSpec) { return `# HUDForge Roblox Studio Import\n\n1. Open Roblox Studio.\n2. Create a LocalScript or ModuleScript where you want to instantiate the UI.\n3. Paste \`code/MainUI.lua\` and run/require it to create \`${spec.lua_spec.screen_gui_name}\`.\n4. Upload generated assets to Roblox and replace each \`rbxassetid://0\` in \`MainUI.lua\` using \`assets/assets.json\` as the asset reference map.\n5. Parent the returned ScreenGui to \`Players.LocalPlayer.PlayerGui\` for runtime use.\n\nThis export is deterministic from \`layout.json\`; edit layout first, then regenerate Lua for consistent structure.\n` }
function normalizeSettingsInput(input?: Partial<UserSettings>): UserSettings { return { default_export_format: input?.default_export_format === 'lua' || input?.default_export_format === 'manifest' ? input.default_export_format : 'zip', mobile_first: typeof input?.mobile_first === 'boolean' ? input.mobile_first : true, default_ui_type: normalizeUiType(input?.default_ui_type), default_style: normalizeGenerationStyle(input?.default_style), save_history: typeof input?.save_history === 'boolean' ? input.save_history : true } }
function normalizeUiType(value?: string): UiType { if (value === 'shop' || value === 'shop_ui') return 'shop_ui'; if (value === 'menu' || value === 'main_menu') return 'main_menu'; if (value === 'reward' || value === 'reward_screen') return 'reward_screen'; if (value === 'hud' || value === 'inventory') return value; return 'shop_ui' }
function normalizeGenerationStyle(value?: string): GenerationStyle { if (value === 'sciFi' || value === 'sci-fi' || value === 'sci_fi' || value === 'cyberpunk') return 'sci_fi'; if (value === 'futuristic' || value === 'premium') return 'premium'; if (value === 'fantasy' || value === 'anime') return 'anime'; if (value === 'neon' || value === 'cartoon' || value === 'minimal') return value; return 'neon' }
function paletteForStyle(style: GenerationStyle) { const palettes: Record<GenerationStyle, { background: string; panel: string; accent: string; text: string }> = { neon: { background: '#090A1A', panel: '#15122B', accent: '#B46CFF', text: '#F3E8FF' }, cartoon: { background: '#102033', panel: '#23415E', accent: '#FFCD4D', text: '#FFFFFF' }, sci_fi: { background: '#08111F', panel: '#132033', accent: '#5BE7FF', text: '#EAF7FF' }, anime: { background: '#16091F', panel: '#281237', accent: '#FF79C6', text: '#FFF4FB' }, minimal: { background: '#0B1020', panel: '#1F2937', accent: '#CBD5E1', text: '#F8FAFC' }, premium: { background: '#09090B', panel: '#18181B', accent: '#D4AF37', text: '#FAFAFA' } }; return palettes[style] }
function buildTitle(prompt: string, uiType: UiType) { const analysis = analyzeRobloxPrompt(prompt, uiType); const tokens = analysis.tokens.filter((token) => !['a', 'an', 'the', 'for', 'with', 'make', 'create', 'build', 'design', 'ui'].includes(token)).slice(0, 3); const fallback = uiType.replace('_', ' '); const title = tokens.length ? tokens.map((token) => token[0].toUpperCase() + token.slice(1)).join(' ') : fallback; return `${title} ${uiType === 'hud' ? 'HUD' : 'UI'}` }
function buildMockSvgDataUrl(spec: OptimizedGenerationSpec, name: string, use: AssetUse) { const palette = paletteForStyle(spec.style); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="112" fill="${palette.background}"/><rect x="144" y="208" width="736" height="608" rx="68" fill="${palette.panel}" stroke="${palette.accent}" stroke-width="16"/><circle cx="512" cy="512" r="144" fill="${palette.accent}" opacity="0.74"/><text x="512" y="896" text-anchor="middle" fill="${palette.text}" font-family="Arial" font-size="54" font-weight="700">${escapeXml(name.toUpperCase())}</text><text x="512" y="130" text-anchor="middle" fill="${palette.text}" font-family="Arial" font-size="36" font-weight="700">${escapeXml(use.toUpperCase())}</text></svg>`; return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` }
function toGenerationRow(generation: Generation) { return { id: generation.id, user_id: generation.user_id, title: generation.title, prompt: generation.prompt, ui_type: generation.ui_type, style: generation.style, status: generation.status, optimized_spec: generation.optimized_spec ?? null, asset_bundle: generation.asset_bundle ?? null, export_package: generation.export_package ?? null, error: generation.error ?? null, created_at: generation.created_at, updated_at: generation.updated_at } }
function fromGenerationRow(row: Record<string, unknown>): Generation { return { id: row.id as string, user_id: row.user_id as string, title: row.title as string, prompt: row.prompt as string, ui_type: row.ui_type as UiType, style: row.style as GenerationStyle, status: row.status as GenerationStatus, optimized_spec: (row.optimized_spec ?? undefined) as OptimizedGenerationSpec | undefined, asset_bundle: (row.asset_bundle ?? undefined) as AssetBundle | undefined, export_package: (row.export_package ?? undefined) as ExportPackagePayload | undefined, error: (row.error ?? undefined) as string | undefined, created_at: row.created_at as string, updated_at: row.updated_at as string } }
function dbError(error: { message?: string }, message: string) { return new HudforgeServiceError(`${message}: ${error.message ?? 'database error'}`, 500, 'database_error') }
function stableId(value: string) { let hash = 2166136261; for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619) } return (hash >>> 0).toString(36) }
function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'hudforge-generation' }
function toRobloxIdentifier(value: string) { const identifier = value.replace(/[^a-zA-Z0-9]+/g, ' ').split(' ').filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(''); return /^[A-Za-z]/.test(identifier) ? identifier : `Hudforge${identifier || 'UI'}` }
function escapeLuauString(value: string) { return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ') }
function escapeXml(value: string) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }
