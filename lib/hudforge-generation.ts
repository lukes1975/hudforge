import { createHmac, timingSafeEqual } from 'node:crypto'
import { analyzeRobloxPrompt } from './prompts'
import { resilientFetch, ResilientFetchError } from './fetch-utils'
import {
  applyStyleProfileToOptimizedSpec,
  assertGenerationCanBeStyleLocked,
  buildStyleLockOptimizerContext,
  buildStyleProfileFromSpec,
  type HudforgeProject,
  type StyleProfile,
} from './style-lock'

export type { HudforgeProject, StylePalette, StyleProfile } from './style-lock'
export { STYLE_PALETTES, applyStyleProfileToOptimizedSpec, buildStyleProfileFromSpec } from './style-lock'

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
export interface ProviderStatus { llm: 'openrouter_deepseek' | 'mock'; assets: AssetProvider | 'missing_fal_key'; billing: 'lemon_squeezy' | 'mock' }
export interface LayoutVector { x_scale: number; x_offset: number; y_scale: number; y_offset: number }
export interface LayoutNode { id: string; type: RobloxInstanceClass; name: string; asset_ref: string | null; position: LayoutVector; size: LayoutVector; z_index: number; text: string | null; children: LayoutNode[] }
export interface LayoutSpec { canvas: { target: 'mobile' | 'desktop'; width: number; height: number; safe_area: boolean }; nodes: LayoutNode[] }
export interface ImagePromptSpec { prompt: string; negative_prompt: string; transparent: boolean; intended_use: AssetUse }
export interface LuaInstanceSpec { id: string; class_name: RobloxInstanceClass; name: string; parent: string; asset_ref: string | null; text: string | null; position: LayoutVector; size: LayoutVector; z_index: number }
export interface LuaSpec { screen_gui_name: string; root_instances: LuaInstanceSpec[] }
export interface OptimizedGenerationSpec { generation_id: string; ui_type: UiType; style: GenerationStyle; intent_summary: string; asset_list: ['main_frame', 'primary_button', 'secondary_button', 'currency_icon', 'background_panel']; layout_spec: LayoutSpec; image_prompts: Record<string, ImagePromptSpec>; lua_spec: LuaSpec; constraints: { mobile_friendly: boolean; roblox_native: boolean; transparent_assets_preferred: boolean; deterministic_export_required: boolean }; style_profile?: StyleProfile }
export interface GeneratedAsset { id: string; name: string; type: AssetUse; url: string; width: number; height: number; transparent: boolean; provider: AssetProvider; prompt_used: string; content_type?: 'image/png' }
export interface FalAssetJob { name: string; request_id?: string; response_url: string; status: 'pending' | 'completed' | 'failed'; error?: string }
export type QueueTier = 'standard' | 'priority'
export interface AssetBundle { generation_id: string; status: 'generating' | 'assets_ready' | 'failed'; assets: GeneratedAsset[]; errors: string[]; jobs?: FalAssetJob[]; credits_refunded?: boolean; queue_tier?: QueueTier }
export interface AssetPollResult { completed: GeneratedAsset[]; pending: FalAssetJob[]; failed: Array<{ name: string; error: string }>; done: boolean; generation: Generation }
export interface ExportPackageFile { path: 'manifest.json' | 'layout.json' | 'code/MainUI.lua' | 'assets/assets.json' | 'README_IMPORT.md'; content_type: 'application/json' | 'text/x-lua' | 'text/markdown'; content?: string }
export interface ExportPackageManifest { generation_id: string; format: 'zip' | 'json_payload'; files: ExportPackageFile[] }
export interface ExportResponse { generation_id: string; status: 'exported'; package: ExportPackageManifest; download_url: string | null; limitations: string[] }
export interface ExportPackagePayload extends ExportResponse { filename: string; files: Required<ExportPackageFile>[]; zip_base64?: string; byte_size?: number }
export type BillingPlanId = 'free' | 'starter' | 'pro' | 'dev'
export interface BillingPlanEntitlements { queue: 'standard' | 'priority'; style_tier: 'basic' | 'premium'; max_saved_projects: number; png_export: boolean; luau_export: 'basic' | 'full' }
export interface BillingPlan { id: BillingPlanId; name: string; price_usd_monthly: number; credits: number; cta: string; popular?: boolean; entitlements?: BillingPlanEntitlements }
export type CreditTopUpId = 'topup_250' | 'topup_1000' | 'topup_3000'
export interface CreditTopUpProduct { id: CreditTopUpId; name: string; price_usd: number; credits: number }
export type BillingState = 'free' | 'trial' | 'active_paid' | 'past_due' | 'canceled' | 'unknown_mock'
export interface BillingStatus { state: BillingState; current_plan: BillingPlan; credits_included: number; credits_used: number; credits_remaining: number; checkout_ready: boolean; customer_portal_ready: boolean; provider: 'lemon_squeezy' | 'mock'; topups: CreditTopUpProduct[] }
export interface HudforgeSubscription { id: string; user_id: string; state: BillingState; lemon_squeezy_customer_id?: string | null; lemon_squeezy_subscription_id?: string | null; lemon_squeezy_variant_id?: string | null; plan_id: BillingPlanId; current_period_start?: string | null; current_period_end?: string | null; cancel_at_period_end: boolean; metadata?: Record<string, unknown>; created_at: string; updated_at: string }
export type UsageEventName = 'generation_started' | 'prompt_optimized' | 'assets_generated' | 'preview_loaded' | 'export_clicked' | 'generation_failed' | 'settings_updated' | 'credit_debited' | 'credit_refunded' | 'generation_rate_limited' | 'subscription_synced'
export interface UsageEvent { name: UsageEventName; generation_id?: string; generationId?: string; metadata?: Record<string, string | number | boolean> }
export interface UsageEventRecord extends UsageEvent { user_id: string; created_at: string }
export type HudforgeUsageEvent = UsageEvent
export interface Generation { id: string; user_id: string; title: string; prompt: string; ui_type: UiType; style: GenerationStyle; status: GenerationStatus; created_at: string; updated_at: string; project_id?: string | null; optimized_spec?: OptimizedGenerationSpec; asset_bundle?: AssetBundle; export_package?: ExportPackagePayload; error?: string; metadata?: Record<string, unknown> }
export interface OptimizeGenerationInput { prompt: string; ui_type?: string; uiType?: string; style?: string; user_settings?: Partial<UserSettings>; idempotency_key?: string; project_id?: string }
export interface LockStyleInput { generation_id: string; name?: string; project_id?: string }
export interface AssetGenerationInput { generation_id?: string; generationId?: string }
export interface ExportGenerationInput { generation_id?: string; generationId?: string }
export interface CreditLedgerEntry { id: string; user_id: string; delta: number; balance_after: number; reason: 'initial_free_grant' | 'generation_optimize' | 'asset_generation' | 'asset_generation_refund' | 'manual_adjustment'; generation_id?: string | null; metadata?: Record<string, unknown>; created_at: string }

const INITIAL_FREE_CREDITS = 25
const OPTIMIZE_CREDIT_COST = 1
const ASSET_CREDIT_COST = 5
const OPTIMIZER_ESTIMATED_COST_USD = 0.001
const FAL_ASSET_ESTIMATED_COST_USD = 0.025
const FAL_BUNDLE_ASSET_COUNT = 5
const STANDARD_QUEUE_SUBMIT_GAP_MS = 200
export const DEFAULT_RATE_LIMITS: RateLimitPolicy = { optimizePerHour: 12, assetBundlesPerHour: 4 }
export const PRIORITY_RATE_LIMITS: RateLimitPolicy = { optimizePerHour: 30, assetBundlesPerHour: 12 }

export interface RateLimitPolicy { optimizePerHour: number; assetBundlesPerHour: number }

const defaultSettings: UserSettings = { default_export_format: 'zip', mobile_first: true, default_ui_type: 'shop_ui', default_style: 'neon', save_history: true }
const billingPlans: Record<BillingPlanId, BillingPlan> = {
  free: { id: 'free', name: 'Free', price_usd_monthly: 0, credits: INITIAL_FREE_CREDITS, cta: 'Current plan' },
  starter: { id: 'starter', name: 'Starter', price_usd_monthly: 19, credits: 250, cta: 'Upgrade', entitlements: { queue: 'standard', style_tier: 'basic', max_saved_projects: 10, png_export: true, luau_export: 'basic' } },
  pro: { id: 'pro', name: 'Pro', price_usd_monthly: 49, credits: 1000, cta: 'Upgrade', popular: true, entitlements: { queue: 'priority', style_tier: 'premium', max_saved_projects: 100, png_export: true, luau_export: 'full' } },
  dev: { id: 'dev', name: 'Dev', price_usd_monthly: 200, credits: 2500, cta: 'Upgrade', entitlements: { queue: 'priority', style_tier: 'premium', max_saved_projects: 100, png_export: true, luau_export: 'full' } },
}
export const creditTopUps: CreditTopUpProduct[] = [
  { id: 'topup_250', name: '250 credits', price_usd: 9, credits: 250 },
  { id: 'topup_1000', name: '1,000 credits', price_usd: 29, credits: 1000 },
  { id: 'topup_3000', name: '3,000 credits', price_usd: 69, credits: 3000 },
]
export { billingPlans }
const freePlan = billingPlans.free

type FalAssetProvider = (spec: OptimizedGenerationSpec) => Promise<AssetBundle>
export interface OptimizerProviderInput { generation_id: string; prompt: string; ui_type: UiType; style: GenerationStyle; user_settings: UserSettings; style_profile?: StyleProfile }
type OptimizerProvider = (input: OptimizerProviderInput) => Promise<OptimizedGenerationSpec>

export class HudforgeServiceError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: string, public readonly details?: Record<string, string | number | boolean>) { super(message) }
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
  atomicDebit?(userId: string, amount: number, reason: CreditLedgerEntry['reason'], generationId?: string, metadata?: Record<string, unknown>): Promise<CreditLedgerEntry>
  listCreditLedger(userId: string): Promise<CreditLedgerEntry[]>
  listUsageEvents(userId: string): Promise<UsageEventRecord[]>
  countRecentUsageEvents(userId: string, eventName: UsageEventName, sinceIso: string): Promise<number>
  findGenerationByIdempotencyKey(userId: string, idempotencyKey: string): Promise<Generation | null>
  upsertSubscription(subscription: HudforgeSubscription): Promise<HudforgeSubscription>
  listSubscriptions(userId: string): Promise<HudforgeSubscription[]>
  upsertProject(project: HudforgeProject): Promise<HudforgeProject>
  getProject(userId: string, projectId: string): Promise<HudforgeProject | null>
  listProjects(userId: string): Promise<HudforgeProject[]>
}

export function createRepositoryBackedHudforgeService(repository: HudforgeRepository, deps: { assetProvider?: FalAssetProvider; optimizerProvider?: OptimizerProvider; rateLimits?: Partial<RateLimitPolicy> } = {}) {
  const assetProvider = deps.assetProvider ?? generateFalAssetsForSpec
  const optimizerProvider = deps.optimizerProvider ?? createDefaultOptimizerProvider()
  const rateLimitOverride = deps.rateLimits

  return {
    async createOptimizedGeneration(userId: string, input: OptimizeGenerationInput): Promise<Generation> {
      const idempotencyKey = typeof input.idempotency_key === 'string' ? input.idempotency_key.trim() : ''
      if (idempotencyKey) {
        const existing = await repository.findGenerationByIdempotencyKey(userId, idempotencyKey)
        if (existing) return existing
      }

      const rateLimits = await resolveRateLimits(repository, userId, rateLimitOverride)
      await enforceRateLimit(repository, userId, 'optimizer', rateLimits.optimizePerHour)
      await ensureCredits(repository, userId)
      await debitCredits(repository, userId, OPTIMIZE_CREDIT_COST, 'generation_optimize', undefined, optimizerCostMetadata())
      const { prompt, ui_type, style, user_settings } = validatePromptInput(input)
      const projectId = typeof input.project_id === 'string' ? input.project_id.trim() : ''
      let styleProfile: StyleProfile | null = null
      if (projectId) {
        const project = await repository.getProject(userId, projectId)
        if (!project) throw new HudforgeServiceError('Project not found', 404, 'project_not_found')
        if (!project.style_profile) throw new HudforgeServiceError('Project has no locked style yet', 409, 'style_not_locked')
        styleProfile = project.style_profile
      }
      const effectiveStyle = styleProfile?.style ?? style
      const now = new Date().toISOString()
      const id = `gen_${stableId(`${userId}:${prompt}:${ui_type}:${effectiveStyle}:${now}`).slice(0, 12)}`
      let optimized_spec = await optimizerProvider({
        generation_id: id,
        prompt,
        ui_type,
        style: effectiveStyle,
        user_settings,
        style_profile: styleProfile ?? undefined,
      })
      if (styleProfile) optimized_spec = applyStyleProfileToOptimizedSpec(optimized_spec, styleProfile)
      const generation: Generation = {
        id,
        user_id: userId,
        title: buildTitle(prompt, ui_type),
        prompt,
        ui_type,
        style: effectiveStyle,
        status: 'optimized',
        created_at: now,
        updated_at: now,
        project_id: projectId || null,
        optimized_spec,
        metadata: idempotencyKey ? { idempotency_key: idempotencyKey } : undefined,
      }
      await repository.upsertGeneration(generation)
      await repository.recordUsageEvent(userId, { name: 'generation_started', generation_id: id, metadata: { stage: 'optimizer' } })
      await repository.recordUsageEvent(userId, { name: 'prompt_optimized', generation_id: id, metadata: optimizerCostMetadata() })
      return generation
    },

    async createAssetsForGeneration(userId: string, generationId: string): Promise<Generation> {
      const rateLimits = await resolveRateLimits(repository, userId, rateLimitOverride)
      await enforceRateLimit(repository, userId, 'asset_bundle', rateLimits.assetBundlesPerHour)
      await ensureCredits(repository, userId)
      await debitCredits(repository, userId, ASSET_CREDIT_COST, 'asset_generation', generationId, assetCostMetadata())
      const generation = await requireGenerationFromRepo(repository, userId, generationId)
      if (!generation.optimized_spec) throw new HudforgeServiceError('Generation must be optimized before assets are created', 409, 'layout_missing')
      try {
        const asset_bundle = await assetProvider(generation.optimized_spec)
        const updated = await updateGeneration(repository, generation, { status: 'assets_ready', asset_bundle })
        await repository.recordUsageEvent(userId, { name: 'assets_generated', generation_id: generation.id, metadata: assetCostMetadata() })
        await repository.recordUsageEvent(userId, { name: 'preview_loaded', generation_id: generation.id })
        return updated
      } catch (error) {
        await refundAssetCredits(repository, userId, generationId, generation.asset_bundle, error instanceof Error ? error.message : 'asset generation failed')
        await updateGeneration(repository, generation, { status: 'failed', error: error instanceof Error ? error.message : 'Asset generation failed' })
        await repository.recordUsageEvent(userId, { name: 'generation_failed', generation_id: generation.id, metadata: { stage: 'assets' } })
        throw error
      }
    },

    async submitAssetsForGeneration(userId: string, generationId: string): Promise<Generation> {
      let generation = await requireGenerationFromRepo(repository, userId, generationId)
      if (!generation.optimized_spec) throw new HudforgeServiceError('Generation must be optimized before assets are created', 409, 'layout_missing')
      if (generation.status === 'assets_ready' || generation.status === 'preview_ready' || generation.status === 'exported') return generation
      if (generation.status === 'generating_assets' && generation.asset_bundle?.jobs?.some((job) => job.status === 'pending')) return generation

      const alreadyDebited = await hasAssetGenerationDebit(repository, userId, generationId)
      if (!alreadyDebited) {
        const rateLimits = await resolveRateLimits(repository, userId, rateLimitOverride)
        await enforceRateLimit(repository, userId, 'asset_bundle', rateLimits.assetBundlesPerHour)
        await ensureCredits(repository, userId)
        await debitCredits(repository, userId, ASSET_CREDIT_COST, 'asset_generation', generationId, assetCostMetadata())
      }

      try {
        const queueTier = await getQueueTierForUser(repository, userId)
        const jobs = await submitAllFalJobs(generation.optimized_spec, { queueTier })
        const asset_bundle: AssetBundle = { generation_id: generationId, status: 'generating', assets: [], errors: [], jobs, queue_tier: queueTier }
        generation = await updateGeneration(repository, generation, { status: 'generating_assets', asset_bundle })
        await repository.recordUsageEvent(userId, { name: 'generation_started', generation_id: generationId, metadata: { stage: 'assets', queue_tier: queueTier } })
        return generation
      } catch (error) {
        await refundAssetCredits(repository, userId, generationId, generation.asset_bundle, error instanceof Error ? error.message : 'asset submit failed')
        await updateGeneration(repository, generation, { status: 'failed', error: error instanceof Error ? error.message : 'Asset submit failed' })
        await repository.recordUsageEvent(userId, { name: 'generation_failed', generation_id: generationId, metadata: { stage: 'assets' } })
        throw error
      }
    },

    async pollAssetsForGeneration(userId: string, generationId: string): Promise<AssetPollResult> {
      let generation = await requireGenerationFromRepo(repository, userId, generationId)
      const bundle = generation.asset_bundle
      if (!generation.optimized_spec) throw new HudforgeServiceError('Generation must be optimized before assets are created', 409, 'layout_missing')
      if (generation.status === 'assets_ready' || generation.status === 'preview_ready') {
        return { completed: bundle?.assets ?? [], pending: [], failed: [], done: true, generation }
      }
      if (!bundle?.jobs?.length) throw new HudforgeServiceError('No asset jobs in progress', 409, 'assets_not_submitted')

      const falKey = requireFalKey()
      const completed = [...(bundle.assets ?? [])]
      const pending: FalAssetJob[] = []
      const failed: Array<{ name: string; error: string }> = []
      const updatedJobs: FalAssetJob[] = []

      for (const job of bundle.jobs) {
        if (job.status === 'completed') {
          updatedJobs.push(job)
          continue
        }
        if (job.status === 'failed') {
          failed.push({ name: job.name, error: job.error ?? 'Asset generation failed' })
          updatedJobs.push(job)
          continue
        }

        const pollResult = await pollFalJobOnce(job, generation.optimized_spec, falKey)
        if (pollResult.status === 'completed' && pollResult.asset) {
          updatedJobs.push({ ...job, status: 'completed' })
          completed.push(pollResult.asset)
          continue
        }
        if (pollResult.status === 'failed') {
          const failedJob = { ...job, status: 'failed' as const, error: pollResult.error ?? 'Asset generation failed' }
          updatedJobs.push(failedJob)
          failed.push({ name: job.name, error: failedJob.error })
          continue
        }

        updatedJobs.push(job)
        pending.push(job)
      }

      const allDone = pending.length === 0
      if (allDone && failed.length === 0) {
        const asset_bundle: AssetBundle = { generation_id: generationId, status: 'assets_ready', assets: completed, errors: [] }
        generation = await updateGeneration(repository, generation, { status: 'assets_ready', asset_bundle })
        await repository.recordUsageEvent(userId, { name: 'assets_generated', generation_id: generationId, metadata: assetCostMetadata() })
        await repository.recordUsageEvent(userId, { name: 'preview_loaded', generation_id: generationId })
        return { completed, pending: [], failed: [], done: true, generation }
      }

      if (allDone && failed.length > 0) {
        const errorMessage = `Asset generation failed for ${failed.map((item) => item.name).join(', ')}`
        await refundAssetCredits(repository, userId, generationId, bundle, errorMessage)
        const asset_bundle: AssetBundle = {
          generation_id: generationId,
          status: 'failed',
          assets: completed,
          errors: failed.map((item) => `${item.name}: ${item.error}`),
          jobs: updatedJobs,
          credits_refunded: true,
        }
        generation = await updateGeneration(repository, generation, { status: 'failed', error: errorMessage, asset_bundle })
        await repository.recordUsageEvent(userId, { name: 'generation_failed', generation_id: generationId, metadata: { stage: 'assets', failed_assets: failed.length } })
        return { completed, pending: [], failed, done: true, generation }
      }

      const asset_bundle: AssetBundle = { generation_id: generationId, status: 'generating', assets: completed, errors: [], jobs: updatedJobs }
      generation = await updateGeneration(repository, generation, { status: 'generating_assets', asset_bundle })
      return { completed, pending, failed, done: false, generation }
    },

    async getAssetGenerationStatus(userId: string, generationId: string): Promise<Generation> {
      const generation = await requireGenerationFromRepo(repository, userId, generationId)
      return generation
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
    async listProjects(userId: string) { return repository.listProjects(userId) },
    async lockStyleForGeneration(userId: string, input: LockStyleInput) {
      const generationId = typeof input.generation_id === 'string' ? input.generation_id.trim() : ''
      if (!generationId) throw new HudforgeServiceError('generation_id required', 400, 'generation_id_required')
      const generation = await requireGenerationFromRepo(repository, userId, generationId)
      try {
        assertGenerationCanBeStyleLocked(generation.status)
      } catch (error) {
        throw new HudforgeServiceError(error instanceof Error ? error.message : 'Generation cannot be style locked', 409, 'style_lock_not_allowed')
      }
      if (!generation.optimized_spec) throw new HudforgeServiceError('Generation must be optimized before style lock', 409, 'layout_missing')
      const premiumTier = (await getStyleTierForUser(repository, userId)) === 'premium'
      const styleProfile = buildStyleProfileFromSpec(generation.optimized_spec, generation.id, { premiumTier })
      const now = new Date().toISOString()
      const existingProjectId = typeof input.project_id === 'string' ? input.project_id.trim() : ''
      let project: HudforgeProject
      if (existingProjectId) {
        const existing = await repository.getProject(userId, existingProjectId)
        if (!existing) throw new HudforgeServiceError('Project not found', 404, 'project_not_found')
        project = await repository.upsertProject({
          ...existing,
          style_profile: styleProfile,
          locked_at: now,
          source_generation_id: generation.id,
          updated_at: now,
        })
      } else {
        const id = `proj_${stableId(`${userId}:${generation.id}:${now}`).slice(0, 12)}`
        const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim().slice(0, 80) : `${generation.title} Style Kit`
        project = await repository.upsertProject({
          id,
          user_id: userId,
          name,
          style_profile: styleProfile,
          locked_at: now,
          source_generation_id: generation.id,
          created_at: now,
          updated_at: now,
        })
      }
      const updatedGeneration = await updateGeneration(repository, generation, { project_id: project.id })
      return { project, generation: updatedGeneration }
    },
    async getSettings(userId: string) { return (await repository.getSettings(userId)) ?? defaultSettings },
    async updateSettings(userId: string, input: Partial<UserSettings>) { const settings = normalizeSettingsInput(input); await repository.upsertSettings(userId, settings); await repository.recordUsageEvent(userId, { name: 'settings_updated' }); return settings },
    async recordUsageEvent(userId: string, event: UsageEvent) { await repository.recordUsageEvent(userId, event) },
    async getBillingStatus(userId: string) { return getBillingStatusFromRepository(repository, userId) },
  }
}

export function memoryHudforgeRepository(options: { initialCredits?: number } = {}): HudforgeRepository {
  const generations = new Map<string, Generation>()
  const projects = new Map<string, HudforgeProject>()
  const settingsByUser = new Map<string, UserSettings>()
  const usageEvents: UsageEventRecord[] = []
  const ledger: CreditLedgerEntry[] = []
  const subscriptions = new Map<string, HudforgeSubscription>()
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
    async listUsageEvents(userId) { return usageEvents.filter((event) => event.user_id === userId).sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)) },
    async countRecentUsageEvents(userId, eventName, sinceIso) {
      const since = Date.parse(sinceIso)
      return usageEvents.filter((event) => event.user_id === userId && event.name === eventName && Date.parse(event.created_at) >= since).length
    },
    async findGenerationByIdempotencyKey(userId, idempotencyKey) {
      return Array.from(generations.values()).find((generation) => generation.user_id === userId && generation.metadata?.idempotency_key === idempotencyKey) ?? null
    },
    async upsertSubscription(subscription) { subscriptions.set(subscription.id, subscription); return subscription },
    async listSubscriptions(userId) { return Array.from(subscriptions.values()).filter((subscription) => subscription.user_id === userId).sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)) },
    async upsertProject(project) { projects.set(project.id, project); return project },
    async getProject(userId, projectId) { const project = projects.get(projectId); return project?.user_id === userId ? project : null },
    async listProjects(userId) { return Array.from(projects.values()).filter((project) => project.user_id === userId).sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)) },
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
    async atomicDebit(userId, amount, reason, generationId, metadata) {
      const supabase = await client()
      await ensureProfile(supabase, userId)
      const { data, error } = await supabase.rpc('debit_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_reason: reason,
        p_generation_id: generationId ?? null,
        p_metadata: metadata ?? {},
      })
      if (error) throw mapAtomicDebitError(error, amount)
      const result = (Array.isArray(data) ? data[0] : data) as { new_balance: number; entry_id: string } | null
      if (!result?.entry_id) throw new HudforgeServiceError('Failed to debit credits: missing ledger entry', 500, 'database_error')
      const { data: entry, error: fetchError } = await supabase.from('hudforge_credit_ledger').select('*').eq('id', result.entry_id).single()
      if (fetchError || !entry) throw dbError(fetchError ?? { message: 'ledger entry not found' }, 'Failed to load debited credit ledger entry')
      return entry as CreditLedgerEntry
    },
    async listCreditLedger(userId) { await this.ensureInitialCredits(userId, INITIAL_FREE_CREDITS); const supabase = await client(); const { data, error } = await supabase.from('hudforge_credit_ledger').select('*').eq('user_id', userId).order('created_at', { ascending: true }); if (error) throw dbError(error, 'Failed to list credit ledger'); return (data ?? []) as CreditLedgerEntry[] },
    async listUsageEvents(userId) { const supabase = await client(); const { data, error } = await supabase.from('hudforge_usage_events').select('user_id,event_name,generation_id,metadata,created_at').eq('user_id', userId).order('created_at', { ascending: true }); if (error) throw dbError(error, 'Failed to list usage events'); return (data ?? []).map((row: { user_id: string; event_name: UsageEventName; generation_id?: string | null; metadata?: Record<string, string | number | boolean>; created_at: string }) => ({ user_id: row.user_id, name: row.event_name, generation_id: row.generation_id ?? undefined, metadata: row.metadata ?? {}, created_at: row.created_at })) },
    async countRecentUsageEvents(userId, eventName, sinceIso) {
      const supabase = await client()
      const { count, error } = await supabase.from('hudforge_usage_events').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('event_name', eventName).gte('created_at', sinceIso)
      if (error) throw dbError(error, 'Failed to count usage events')
      return count ?? 0
    },
    async findGenerationByIdempotencyKey(userId, idempotencyKey) {
      const supabase = await client()
      const { data, error } = await supabase.from('hudforge_generations').select('*').eq('user_id', userId).eq('metadata->>idempotency_key', idempotencyKey).maybeSingle()
      if (error) throw dbError(error, 'Failed to find generation by idempotency key')
      return data ? fromGenerationRow(data) : null
    },
    async upsertSubscription(subscription) { const supabase = await client(); await ensureProfile(supabase, subscription.user_id); const existing = subscription.lemon_squeezy_subscription_id ? await supabase.from('hudforge_subscriptions').select('id').eq('lemon_squeezy_subscription_id', subscription.lemon_squeezy_subscription_id).maybeSingle() : { data: null, error: null }; if (existing.error) throw dbError(existing.error, 'Failed to inspect subscription'); const row = toSubscriptionRow(subscription); const query = existing.data?.id ? supabase.from('hudforge_subscriptions').update(row).eq('id', existing.data.id).select('*').single() : supabase.from('hudforge_subscriptions').insert(row).select('*').single(); const { data, error } = await query; if (error) throw dbError(error, 'Failed to persist subscription'); return fromSubscriptionRow(data) },
    async listSubscriptions(userId) { const supabase = await client(); const { data, error } = await supabase.from('hudforge_subscriptions').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); if (error) throw dbError(error, 'Failed to list subscriptions'); return (data ?? []).map(fromSubscriptionRow) },
    async upsertProject(project) { const supabase = await client(); await ensureProfile(supabase, project.user_id); const { error } = await supabase.from('hudforge_projects').upsert(toProjectRow(project)); if (error) throw dbError(error, 'Failed to persist project'); return project },
    async getProject(userId, projectId) { const supabase = await client(); const { data, error } = await supabase.from('hudforge_projects').select('*').eq('user_id', userId).eq('id', projectId).maybeSingle(); if (error) throw dbError(error, 'Failed to load project'); return data ? fromProjectRow(data) : null },
    async listProjects(userId) { const supabase = await client(); const { data, error } = await supabase.from('hudforge_projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); if (error) throw dbError(error, 'Failed to list projects'); return (data ?? []).map(fromProjectRow) },
  }
}

function createDefaultRepository(): HudforgeRepository {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return supabaseHudforgeRepository()
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in production. Cannot use in-memory repository.')
  }
  return memoryHudforgeRepository()
}

// Lazy initialization to avoid eager errors during module reset in tests
let defaultRepositoryInstance: HudforgeRepository | undefined
let defaultServiceInstance: ReturnType<typeof createRepositoryBackedHudforgeService> | undefined

function getDefaultRepository(): HudforgeRepository {
  if (!defaultRepositoryInstance) {
    defaultRepositoryInstance = createDefaultRepository()
  }
  return defaultRepositoryInstance
}

function getDefaultService(): ReturnType<typeof createRepositoryBackedHudforgeService> {
  if (!defaultServiceInstance) {
    defaultServiceInstance = createRepositoryBackedHudforgeService(getDefaultRepository())
  }
  return defaultServiceInstance
}

export function validatePromptInput(input: OptimizeGenerationInput): { prompt: string; ui_type: UiType; style: GenerationStyle; user_settings: UserSettings } { const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : ''; const ui_type = normalizeUiType(input.ui_type ?? input.uiType); const style = normalizeGenerationStyle(input.style); const user_settings = normalizeSettingsInput(input.user_settings); if (!prompt) throw new HudforgeServiceError('Prompt required', 400, 'prompt_required'); if (prompt.length > 900) throw new HudforgeServiceError('Prompt must be 900 characters or fewer', 400, 'prompt_too_long'); return { prompt, ui_type, style, user_settings } }
export function optimizePromptForRobloxUi(input: OptimizeGenerationInput): OptimizedGenerationSpec { const { prompt, ui_type, style, user_settings } = validatePromptInput(input); const generation_id = `gen_${stableId(`${prompt}:${ui_type}:${style}`).slice(0, 12)}`; return buildOptimizedSpec(generation_id, prompt, ui_type, style, user_settings) }
export const createOptimizedGeneration = (userId: string, input: OptimizeGenerationInput) => getDefaultService().createOptimizedGeneration(userId, input)
export const createAssetsForGeneration = (userId: string, generationId: string) => getDefaultService().createAssetsForGeneration(userId, generationId)
export const submitAssetsForGeneration = (userId: string, generationId: string) => getDefaultService().submitAssetsForGeneration(userId, generationId)
export const pollAssetsForGeneration = (userId: string, generationId: string) => getDefaultService().pollAssetsForGeneration(userId, generationId)
export const getAssetGenerationStatus = (userId: string, generationId: string) => getDefaultService().getAssetGenerationStatus(userId, generationId)
export const createExportForGeneration = (userId: string, generationId: string) => getDefaultService().createExportForGeneration(userId, generationId)
export const listGenerations = (userId: string) => getDefaultService().listGenerations(userId)
export const listProjects = (userId: string) => getDefaultService().listProjects(userId)
export const lockStyleForGeneration = (userId: string, input: LockStyleInput) => getDefaultService().lockStyleForGeneration(userId, input)
export const getSettings = (userId: string) => getDefaultService().getSettings(userId)
export const updateSettings = (userId: string, input: Partial<UserSettings>) => getDefaultService().updateSettings(userId, input)
export const recordUsageEvent = (userId: string, event: UsageEvent) => getDefaultService().recordUsageEvent(userId, event)
export const getBillingStatus = (userId: string) => getDefaultService().getBillingStatus(userId)
export const getLemonSqueezyCustomerPortalUrlForUser = (userId: string, options?: LemonSqueezyPortalOptions) => getLemonSqueezyCustomerPortalUrl(getDefaultRepository(), userId, options)

export function generateMockAssets(spec: OptimizedGenerationSpec): GeneratedAsset[] { return Object.entries(spec.image_prompts).map(([name, imagePrompt]) => ({ id: `${name}_${stableId(`${spec.generation_id}:${name}`).slice(0, 8)}`, name, type: imagePrompt.intended_use, url: buildMockSvgDataUrl(spec, name, imagePrompt.intended_use), width: imagePrompt.intended_use === 'background' ? 1024 : 512, height: imagePrompt.intended_use === 'background' ? 1024 : 512, transparent: imagePrompt.transparent, provider: 'mock', prompt_used: imagePrompt.prompt })) }

export async function generateFalAssetsForSpec(spec: OptimizedGenerationSpec): Promise<AssetBundle> {
  const falKey = requireFalKey()
  const jobs = await submitAllFalJobs(spec)
  const assets: GeneratedAsset[] = []
  for (const job of jobs) {
    for (let attempt = 0; attempt < 90; attempt += 1) {
      const pollResult = await pollFalJobOnce(job, spec, falKey)
      if (pollResult.status === 'completed' && pollResult.asset) {
        assets.push(pollResult.asset)
        break
      }
      if (pollResult.status === 'failed') throw new HudforgeServiceError(pollResult.error ?? `fal.ai failed for ${job.name}`, 502, 'fal_poll_failed')
      if (attempt < 89) await new Promise((resolve) => setTimeout(resolve, 2000))
      else throw new HudforgeServiceError(`Timed out waiting for fal.ai asset generation for ${job.name}`, 504, 'fal_timeout')
    }
  }
  return { generation_id: spec.generation_id, status: 'assets_ready', assets, errors: [] }
}

function requireFalKey() {
  const falKey = process.env.FAL_KEY
  if (!falKey) throw new HudforgeServiceError('FAL_KEY is missing. Real asset generation is required; mock fallback is disabled for authenticated generation.', 503, 'fal_not_configured')
  return falKey
}

async function submitSingleFalJob(spec: OptimizedGenerationSpec, name: string, imagePrompt: ImagePromptSpec, falKey: string, model: string, fetchImpl: typeof fetch): Promise<FalAssetJob> {
  const prompt = buildFalAssetPrompt(spec, name, imagePrompt)
  const submitResponse = await resilientFetch(
    `https://queue.fal.run/${model}`,
    {
      method: 'POST',
      headers: { Authorization: `Key ${falKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        negative_prompt: imagePrompt.negative_prompt,
        image_size: imagePrompt.intended_use === 'background' ? 'landscape_16_9' : 'square_hd',
        num_images: 1,
        output_format: 'png',
        enable_safety_checker: true,
      }),
    },
    { timeoutMs: 15_000, maxRetries: 1, fetchImpl }
  )
  if (!submitResponse.ok) {
    const body = await safeResponseText(submitResponse)
    throw new HudforgeServiceError(`fal.ai PNG request failed for ${name} with status ${submitResponse.status}: ${body.slice(0, 180)}`, 502, 'fal_request_failed')
  }
  const queuePayload = (await submitResponse.json()) as { request_id?: string; response_url?: string; error?: string }
  if (queuePayload.error) throw new HudforgeServiceError(`fal.ai rejected ${name}: ${queuePayload.error}`, 502, 'fal_request_failed')
  if (!queuePayload.response_url) throw new HudforgeServiceError(`fal.ai did not return a response URL for ${name}. Check FAL_KEY and model configuration.`, 502, 'fal_response_url_missing')
  return { name, request_id: queuePayload.request_id, response_url: queuePayload.response_url, status: 'pending' as const }
}

export async function submitAllFalJobs(spec: OptimizedGenerationSpec, options: { queueTier?: QueueTier; fetchImpl?: typeof fetch } = {}): Promise<FalAssetJob[]> {
  const falKey = requireFalKey()
  const model = process.env.FAL_MODEL || process.env.FAL_IMAGE_MODEL || 'fal-ai/flux/dev'
  const fetchImpl = options.fetchImpl ?? fetch
  const queueTier = options.queueTier ?? 'standard'
  const entries = Object.entries(spec.image_prompts)

  if (queueTier === 'priority') {
    return Promise.all(entries.map(([name, imagePrompt]) => submitSingleFalJob(spec, name, imagePrompt, falKey, model, fetchImpl)))
  }

  const jobs: FalAssetJob[] = []
  for (let index = 0; index < entries.length; index += 1) {
    const [name, imagePrompt] = entries[index]
    if (index > 0) await new Promise((resolve) => setTimeout(resolve, STANDARD_QUEUE_SUBMIT_GAP_MS))
    jobs.push(await submitSingleFalJob(spec, name, imagePrompt, falKey, model, fetchImpl))
  }
  return jobs
}

type FalPollJobResult = { status: 'pending' } | { status: 'completed'; asset: GeneratedAsset } | { status: 'failed'; error: string }

async function pollFalJobOnce(job: FalAssetJob, spec: OptimizedGenerationSpec, falKey: string): Promise<FalPollJobResult> {
  try {
    const response = await resilientFetch(job.response_url, { headers: { Authorization: `Key ${falKey}` } }, { timeoutMs: 10_000, maxRetries: 0 })
    if (response.ok) {
      const result = (await response.json()) as { images?: Array<{ url?: string }>; image?: { url?: string }; data?: { images?: Array<{ url?: string }> } }
      const asset = parseFalResultToAsset(result, spec, job.name)
      if (!asset) return { status: 'failed', error: `fal.ai returned no image URL for ${job.name}` }
      return { status: 'completed', asset }
    }
    const body = await response.text()
    if (response.status === 400 && body.toLowerCase().includes('still in progress')) return { status: 'pending' }
    return { status: 'failed', error: `fal.ai polling failed for ${job.name} with status ${response.status}` }
  } catch (error) {
    if (error instanceof ResilientFetchError && error.timedOut) return { status: 'pending' }
    return { status: 'failed', error: error instanceof Error ? error.message : `fal.ai polling failed for ${job.name}` }
  }
}

function isLikelyPngAssetUrl(url: string) {
  const lower = url.toLowerCase()
  return lower.includes('.png') || lower.includes('image/png') || lower.includes('format=png') || lower.includes('fal.media') || lower.includes('fal.run')
}

export function parseFalResultToAsset(result: { images?: Array<{ url?: string; content_type?: string }>; image?: { url?: string; content_type?: string }; data?: { images?: Array<{ url?: string; content_type?: string }> } }, spec: OptimizedGenerationSpec, name: string): GeneratedAsset | null {
  const imagePrompt = spec.image_prompts[name]
  if (!imagePrompt) return null
  const image = result.images?.[0] ?? result.data?.images?.[0] ?? result.image
  if (!image?.url) return null
  if (!isLikelyPngAssetUrl(image.url) && image.content_type !== 'image/png') {
    throw new HudforgeServiceError(`fal.ai returned a non-PNG asset URL for ${name}. Expected PNG game HUD output.`, 502, 'fal_not_png')
  }
  const prompt = buildFalAssetPrompt(spec, name, imagePrompt)
  return {
    id: `${name}_${stableId(`${spec.generation_id}:${name}:${image.url}`).slice(0, 8)}`,
    name,
    type: imagePrompt.intended_use,
    url: image.url,
    width: imagePrompt.intended_use === 'background' ? 1344 : 1024,
    height: imagePrompt.intended_use === 'background' ? 768 : 1024,
    transparent: imagePrompt.transparent,
    provider: 'fal',
    prompt_used: prompt,
    content_type: 'image/png',
  }
}


function buildFalAssetPrompt(spec: OptimizedGenerationSpec, name: string, imagePrompt: ImagePromptSpec) {
  return [
    `Roblox game HUD asset (PNG): ${name}.`,
    imagePrompt.prompt,
    `UI type: ${spec.ui_type}. Style: ${spec.style}.`,
    'Crisp game-world HUD asset with strong readable silhouette, high contrast edges, and clean production polish.',
    'Not web SaaS UI, not photorealistic, not cluttered — designed for Roblox ScreenGui ImageLabels.',
    'Designed as part of one coherent UI kit: main frame, button style, currency icon, panel/background, close/settings button.',
    imagePrompt.transparent
      ? 'Transparent PNG, isolated UI element, crisp anti-aliased alpha edges, no background fill, game HUD asset.'
      : 'PNG backdrop/panel texture suitable for Roblox ScreenGui composition and browser preview.',
  ].join(' ')
}


export function createDefaultOptimizerProvider(): OptimizerProvider {
  const openRouterKey = process.env.OPENROUTER_API_KEY
  if (openRouterKey) return createOpenRouterOptimizer({ apiKey: openRouterKey })
  return async ({ generation_id, prompt, ui_type, style, user_settings }) => buildOptimizedSpec(generation_id, prompt, ui_type, style, user_settings)
}

export function createOpenRouterOptimizer(options: { apiKey?: string; model?: string; fetchImpl?: typeof fetch } = {}): OptimizerProvider {
  const apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY
  const model = options.model ?? process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-chat'
  const fetchImpl = options.fetchImpl ?? fetch
  if (!apiKey) throw new HudforgeServiceError('OPENROUTER_API_KEY is missing. Real OpenRouter optimizer is not configured.', 503, 'openrouter_not_configured')

  return async (input) => {
    const response = await resilientFetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
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
      },
      { timeoutMs: 30_000, maxRetries: 2, fetchImpl }
    )

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
  return [
    'You are HUDForge, a Roblox UI production optimizer for game-world interfaces.',
    'Return ONLY valid JSON matching the OptimizedGenerationSpec shape. No prose, no markdown fences, no commentary.',
    '',
    'ROLE: Transform a creator prompt into a production-ready Roblox ScreenGui spec with layout nodes and five image prompts.',
    '',
    'VISUAL DIRECTION FOR image_prompts:',
    '- Design for Roblox game-world UI: readable silhouettes, strong contrast, stylized game art — NOT web SaaS dashboards, NOT photorealistic renders.',
    '- All five assets must feel like one coherent UI kit: main_frame, primary_button, secondary_button, currency_icon, and background_panel share palette, border weight, corner radius language, and style tier.',
    '- Use PNG-style transparent assets where intended (panel, button, icon). background_panel may be opaque.',
    '- Do NOT bake readable text into generated images. Labels belong in layout TextLabel/TextButton nodes, not in image prompts.',
    '- Iconography may be abstract (coin gem, star, chest) but must stay on-theme and legible at small sizes.',
    '- Every image prompt must include a negative_prompt rejecting: watermark, blurry, photorealistic, cluttered, illegible micro-text, random characters, logos, busy scenery.',
    '',
    'LAYOUT RULES:',
    '- Target mobile-safe Roblox ScreenGui composition with safe_area respected.',
    '- Use only Frame, ImageLabel, TextButton, TextLabel node types.',
    '- Position and size nodes with x_scale, x_offset, y_scale, y_offset (UDim2-friendly).',
    '- Keep the node tree deterministic and export-friendly: stable ids, sane z_index ordering, shallow hierarchy.',
    '- Respect the user ui_type (shop_ui, hud, inventory, main_menu, reward_screen) and style (neon, cartoon, sci_fi, anime, minimal, premium).',
    '',
    'REQUIRED OUTPUT KEYS:',
    '- intent_summary: one sentence describing the UI job and visual direction.',
    '- layout_spec.canvas: { target, width, height, safe_area }.',
    '- layout_spec.nodes: array of layout nodes with children.',
    '- image_prompts: exactly five keys — main_frame, primary_button, secondary_button, currency_icon, background_panel.',
    '- Each image_prompt entry: { prompt, negative_prompt, transparent, intended_use } where intended_use is panel|button|icon|background.',
    '',
    'EXPORT CONSTRAINTS:',
    '- HUDForge generates Luau code deterministically server-side. Do NOT output lua_spec, Luau, or Instance.new code.',
    '- Do NOT invent extra assets beyond the five required keys.',
    '- Prompts must be specific enough for fal.ai image generation (16+ chars per prompt).',
  ].join('\n')
}

function buildOptimizerUserPrompt(input: OptimizerProviderInput) {
  const base = {
    task: 'Create a Roblox UI generation spec as JSON only.',
    output_skeleton: {
      intent_summary: 'string',
      layout_spec: {
        canvas: { target: 'mobile|desktop', width: 'number', height: 'number', safe_area: 'boolean' },
        nodes: [{ id: 'string', type: 'Frame|ImageLabel|TextButton|TextLabel', name: 'string', asset_ref: 'string|null', position: { x_scale: 'number', x_offset: 'number', y_scale: 'number', y_offset: 'number' }, size: { x_scale: 'number', x_offset: 'number', y_scale: 'number', y_offset: 'number' }, z_index: 'number', text: 'string|null', children: '[]' }],
      },
      image_prompts: {
        main_frame: { prompt: 'string', negative_prompt: 'string', transparent: true, intended_use: 'panel' },
        primary_button: { prompt: 'string', negative_prompt: 'string', transparent: true, intended_use: 'button' },
        secondary_button: { prompt: 'string', negative_prompt: 'string', transparent: true, intended_use: 'button' },
        currency_icon: { prompt: 'string', negative_prompt: 'string', transparent: true, intended_use: 'icon' },
        background_panel: { prompt: 'string', negative_prompt: 'string', transparent: false, intended_use: 'background' },
      },
    },
    export_constraints: [
      'HUDForge generates Luau deterministically server-side — do NOT output lua_spec or any Luau code.',
      'Return exactly five image_prompt keys: main_frame, primary_button, secondary_button, currency_icon, background_panel.',
      'Layout nodes must be Roblox ScreenGui friendly with mobile safe area.',
      'No baked text in image prompts; editable labels go in layout TextLabel/TextButton nodes.',
    ],
    allowed_node_types: ['Frame', 'ImageLabel', 'TextButton', 'TextLabel'],
    allowed_asset_uses: ['panel', 'button', 'icon', 'background'],
    prompt: input.prompt,
    ui_type: input.ui_type,
    style: input.style,
    mobile_first: input.user_settings.mobile_first,
  }
  if (input.style_profile) return JSON.stringify({ ...base, ...buildStyleLockOptimizerContext(input.style_profile) })
  return JSON.stringify(base)
}

async function safeResponseText(response: Response) {
  try { return await response.text() } catch { return '' }
}

function sanitizeNodeId(value: string) { return value.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'node' }
function sanitizeRobloxName(value: string) { return toRobloxIdentifier(value).slice(0, 64) }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }

async function ensureCredits(repository: HudforgeRepository, userId: string) { await repository.ensureInitialCredits(userId, INITIAL_FREE_CREDITS) }
async function debitCredits(repository: HudforgeRepository, userId: string, amount: number, reason: CreditLedgerEntry['reason'], generationId?: string, metadata?: Record<string, unknown>) {
  if (repository.atomicDebit) {
    await repository.atomicDebit(userId, amount, reason, generationId, metadata)
    return
  }
  const balance = await repository.getCreditBalance(userId)
  if (balance < amount) throw new HudforgeServiceError(`Insufficient credits. Required ${amount}, available ${balance}.`, 402, 'insufficient_credits', { required: amount, available: balance })
  await repository.addCreditLedgerEntry(userId, -amount, reason, generationId, metadata)
}

async function refundAssetCredits(repository: HudforgeRepository, userId: string, generationId: string, bundle: AssetBundle | undefined, reason: string) {
  if (bundle?.credits_refunded) return
  await repository.addCreditLedgerEntry(userId, ASSET_CREDIT_COST, 'asset_generation_refund', generationId, { reason })
}

export async function getStyleTierForUser(repository: HudforgeRepository, userId: string): Promise<'basic' | 'premium'> {
  const subscriptions = await repository.listSubscriptions(userId)
  const activeSubscription = subscriptions.find((subscription) => subscription.state === 'active_paid' || subscription.state === 'trial')
  if (!activeSubscription) return 'basic'
  const plan = billingPlans[activeSubscription.plan_id]
  return plan.entitlements?.style_tier ?? 'basic'
}

export async function getQueueTierForUser(repository: HudforgeRepository, userId: string): Promise<QueueTier> {
  const subscriptions = await repository.listSubscriptions(userId)
  const activeSubscription = subscriptions.find((subscription) => subscription.state === 'active_paid' || subscription.state === 'trial')
  if (!activeSubscription) return 'standard'
  const plan = billingPlans[activeSubscription.plan_id]
  return plan.entitlements?.queue === 'priority' ? 'priority' : 'standard'
}

export async function getRateLimitsForUser(repository: HudforgeRepository, userId: string): Promise<RateLimitPolicy> {
  const queueTier = await getQueueTierForUser(repository, userId)
  return queueTier === 'priority' ? PRIORITY_RATE_LIMITS : DEFAULT_RATE_LIMITS
}

async function resolveRateLimits(repository: HudforgeRepository, userId: string, override?: Partial<RateLimitPolicy>): Promise<RateLimitPolicy> {
  const base = await getRateLimitsForUser(repository, userId)
  return { ...base, ...(override ?? {}) }
}

async function enforceRateLimit(repository: HudforgeRepository, userId: string, stage: 'optimizer' | 'asset_bundle', limit: number) {
  const windowSeconds = 3600
  const safeLimit = Math.max(0, Math.floor(limit))
  const sinceIso = new Date(Date.now() - windowSeconds * 1000).toISOString()
  const eventName: UsageEventName = stage === 'optimizer' ? 'prompt_optimized' : 'assets_generated'
  const count = await repository.countRecentUsageEvents(userId, eventName, sinceIso)
  if (count >= safeLimit) {
    const metadata = { stage, limit: safeLimit, used: count, window_seconds: windowSeconds }
    await repository.recordUsageEvent(userId, { name: 'generation_rate_limited', metadata })
    throw new HudforgeServiceError(`Rate limit reached for ${stage}. Try again later.`, 429, 'rate_limited', metadata)
  }
}
function optimizerCostMetadata(): Record<string, string | number | boolean> { return { provider: process.env.OPENROUTER_API_KEY ? 'openrouter' : 'mock', cost_stage: 'optimizer', estimated_cost_usd: OPTIMIZER_ESTIMATED_COST_USD } }
function assetCostMetadata(): Record<string, string | number | boolean> { return { provider: 'fal', cost_stage: 'asset_bundle', estimated_cost_usd: FAL_ASSET_ESTIMATED_COST_USD * FAL_BUNDLE_ASSET_COUNT, asset_count: FAL_BUNDLE_ASSET_COUNT } }

async function hasAssetGenerationDebit(repository: HudforgeRepository, userId: string, generationId: string) {
  const ledger = await repository.listCreditLedger(userId)
  return ledger.some((entry) => entry.generation_id === generationId && entry.reason === 'asset_generation' && entry.delta < 0)
}

async function requireGenerationFromRepo(repository: HudforgeRepository, userId: string, generationId: string) { const generation = await repository.getGeneration(userId, generationId); if (!generation) throw new HudforgeServiceError('Generation not found', 404, 'generation_not_found'); return generation }
async function updateGeneration(repository: HudforgeRepository, generation: Generation, updates: Partial<Generation>) { const updated = { ...generation, ...updates, updated_at: new Date().toISOString() }; return repository.upsertGeneration(updated) }
async function getBillingStatusFromRepository(repository: HudforgeRepository, userId: string): Promise<BillingStatus> {
  const balance = await repository.getCreditBalance(userId)
  const ledger = await repository.listCreditLedger(userId)
  const subscriptions = await repository.listSubscriptions(userId)
  const activeSubscription = subscriptions.find((subscription) => subscription.state === 'active_paid' || subscription.state === 'trial')
  const latestSubscription = subscriptions[0]
  const resolvedSubscription = activeSubscription ?? latestSubscription
  const current_plan = resolvedSubscription ? billingPlans[resolvedSubscription.plan_id] : freePlan
  const credits_used = Math.abs(ledger.filter((entry) => entry.delta < 0).reduce((total, entry) => total + entry.delta, 0))
  const checkout_ready = isLemonSqueezyConfigured()
  const customer_portal_ready = subscriptions.some((subscription) => Boolean(subscription.lemon_squeezy_customer_id)) && checkout_ready
  const state = resolvedSubscription?.state ?? (checkout_ready ? 'free' : 'unknown_mock')
  return { state, current_plan, credits_included: current_plan.credits, credits_used, credits_remaining: balance, checkout_ready, customer_portal_ready, provider: checkout_ready ? 'lemon_squeezy' : 'mock', topups: creditTopUps }
}

export interface LemonSqueezyCheckoutOptions { apiKey?: string; storeId?: string; variantIds?: Partial<Record<Exclude<BillingPlanId, 'free'>, string>>; siteUrl?: string; fetchImpl?: typeof fetch }
export async function createLemonSqueezyCheckout(userId: string, planId: BillingPlanId, options: LemonSqueezyCheckoutOptions = {}) {
  if (planId === 'free') throw new HudforgeServiceError('Free plan does not require checkout.', 400, 'checkout_not_required')
  const apiKey = options.apiKey ?? process.env.LEMON_SQUEEZY_API_KEY
  const storeId = options.storeId ?? process.env.LEMON_SQUEEZY_STORE_ID
  const variantIds = options.variantIds ?? { starter: process.env.LEMON_SQUEEZY_STARTER_VARIANT_ID, pro: process.env.LEMON_SQUEEZY_PRO_VARIANT_ID, dev: process.env.LEMON_SQUEEZY_DEV_VARIANT_ID }
  const variantId = variantIds[planId]
  if (!apiKey || !storeId || !variantId) throw new HudforgeServiceError('Lemon Squeezy checkout is not configured.', 503, 'lemon_squeezy_not_configured', { plan_id: planId })
  const siteUrl = (options.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.hudforge.app').replace(/\/$/, '')
  const fetchImpl = options.fetchImpl ?? fetch
  const response = await fetchImpl('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: { custom: { user_id: userId, plan_id: planId } },
          product_options: { redirect_url: `${siteUrl}/billing?checkout=success` },
        },
        relationships: { store: { data: { type: 'stores', id: storeId } }, variant: { data: { type: 'variants', id: variantId } } },
      },
    }),
  })
  if (!response.ok) throw new HudforgeServiceError(`Lemon Squeezy checkout failed with status ${response.status}: ${(await safeResponseText(response)).slice(0, 220)}`, 502, 'lemon_squeezy_checkout_failed')
  const payload = (await response.json()) as { data?: { attributes?: { url?: string } } }
  const checkout_url = payload.data?.attributes?.url
  if (!checkout_url) throw new HudforgeServiceError('Lemon Squeezy did not return a checkout URL.', 502, 'lemon_squeezy_checkout_missing_url')
  return { checkout_url, plan_id: planId }
}

export interface LemonSqueezyTopUpCheckoutOptions { apiKey?: string; storeId?: string; siteUrl?: string; fetchImpl?: typeof fetch }
export async function createLemonSqueezyTopUpCheckout(userId: string, topUpId: CreditTopUpId, options: LemonSqueezyTopUpCheckoutOptions = {}) {
  const topUp = creditTopUps.find((t) => t.id === topUpId)
  if (!topUp) throw new HudforgeServiceError(`Invalid top-up ID: ${topUpId}`, 400, 'invalid_topup_id')
  const apiKey = options.apiKey ?? process.env.LEMON_SQUEEZY_API_KEY
  const storeId = options.storeId ?? process.env.LEMON_SQUEEZY_STORE_ID
  const variantIds: Record<CreditTopUpId, string | undefined> = { topup_250: process.env.LEMON_SQUEEZY_TOPUP_250_VARIANT_ID, topup_1000: process.env.LEMON_SQUEEZY_TOPUP_1000_VARIANT_ID, topup_3000: process.env.LEMON_SQUEEZY_TOPUP_3000_VARIANT_ID }
  const variantId = variantIds[topUpId]
  if (!apiKey || !storeId || !variantId) throw new HudforgeServiceError('Lemon Squeezy top-up checkout is not configured.', 503, 'lemon_squeezy_not_configured', { topup_id: topUpId })
  const siteUrl = (options.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.hudforge.app').replace(/\/$/, '')
  const fetchImpl = options.fetchImpl ?? fetch
  const response = await fetchImpl('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: { custom: { user_id: userId, plan_id: 'topup', topup_id: topUpId, credits: topUp.credits } },
          product_options: { redirect_url: `${siteUrl}/billing?topup=success` },
        },
        relationships: { store: { data: { type: 'stores', id: storeId } }, variant: { data: { type: 'variants', id: variantId } } },
      },
    }),
  })
  if (!response.ok) throw new HudforgeServiceError(`Lemon Squeezy top-up checkout failed with status ${response.status}: ${(await safeResponseText(response)).slice(0, 220)}`, 502, 'lemon_squeezy_checkout_failed')
  const payload = (await response.json()) as { data?: { attributes?: { url?: string } } }
  const checkout_url = payload.data?.attributes?.url
  if (!checkout_url) throw new HudforgeServiceError('Lemon Squeezy did not return a checkout URL.', 502, 'lemon_squeezy_checkout_missing_url')
  return { checkout_url, topup_id: topUpId, credits: topUp.credits }
}
export async function verifyLemonSqueezySignature(body: string, signature: string | null, secret: string) {
  if (!secret) throw new HudforgeServiceError('Lemon Squeezy webhook secret is not configured.', 503, 'lemon_squeezy_webhook_not_configured')
  if (!signature) throw new HudforgeServiceError('Missing Lemon Squeezy webhook signature.', 401, 'missing_webhook_signature')
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  const expectedBytes = Buffer.from(expected, 'hex')
  const actualBytes = Buffer.from(signature, 'hex')
  if (expectedBytes.length !== actualBytes.length || !timingSafeEqual(expectedBytes, actualBytes)) throw new HudforgeServiceError('Invalid Lemon Squeezy webhook signature.', 401, 'invalid_webhook_signature')
  return true
}
export async function handleLemonSqueezyWebhook(repository: HudforgeRepository, body: string, signature: string | null, secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? '') {
  await verifyLemonSqueezySignature(body, signature, secret)
  const payload = JSON.parse(body) as { meta?: { event_name?: string; custom_data?: Record<string, unknown> }; data?: { id?: string; attributes?: Record<string, unknown> } }
  const eventName = typeof payload.meta?.event_name === 'string' ? payload.meta.event_name : 'unknown'
  const custom = payload.meta?.custom_data ?? (payload.data?.attributes?.custom_data as Record<string, unknown> | undefined) ?? {}
  const userId = typeof custom.user_id === 'string' ? custom.user_id : ''
  if (!userId) throw new HudforgeServiceError('Lemon Squeezy webhook is missing custom user_id.', 400, 'webhook_user_missing')
  const eventId = `${payload.data?.id ?? stableId(body)}:${eventName}`
  const ledger = await repository.listCreditLedger(userId)
  const usageEvents = await repository.listUsageEvents(userId)
  const isDuplicateEvent = ledger.some((entry) => entry.metadata?.lemon_squeezy_event_id === eventId)
    || usageEvents.some((event) => event.metadata?.lemon_squeezy_event_id === eventId)
  if (isDuplicateEvent) {
    return { processed: false, duplicate: true, user_id: userId, plan_id: typeof custom.plan_id === 'string' ? custom.plan_id : 'starter', credits_granted: 0 }
  }

  const isTopUp = custom.plan_id === 'topup' && typeof custom.topup_id === 'string'
  if (isTopUp) {
    const orderStatus = typeof payload.data?.attributes?.status === 'string' ? payload.data.attributes.status.toLowerCase() : 'paid'
    if (eventName === 'order_created' && orderStatus !== 'paid') {
      return { processed: true, duplicate: false, user_id: userId, plan_id: 'topup', credits_granted: 0 }
    }

    const topUpId = custom.topup_id as string
    const topUp = creditTopUps.find((t) => t.id === topUpId)
    const credits = topUp?.credits ?? (typeof custom.credits === 'number' ? custom.credits : 0)
    if (credits > 0) {
      await repository.addCreditLedgerEntry(userId, credits, 'manual_adjustment', undefined, { source: 'lemon_squeezy', lemon_squeezy_event_id: eventId, plan_id: 'topup', topup_id: topUpId, event_name: eventName })
    }
    return { processed: true, duplicate: false, user_id: userId, plan_id: 'topup', credits_granted: credits }
  }

  const planId = normalizeBillingPlanId(typeof custom.plan_id === 'string' ? custom.plan_id : 'starter')
  const attrs = payload.data?.attributes ?? {}
  const now = new Date().toISOString()
  const existingSubscriptions = await repository.listSubscriptions(userId)
  const existingSubscription = existingSubscriptions.find((subscription) => subscription.lemon_squeezy_subscription_id === stringifyNullable(payload.data?.id))
  const state = mapLemonSqueezySubscriptionState(eventName, typeof attrs.status === 'string' ? attrs.status : eventName)
  const cancelAtPeriodEnd = eventName === 'subscription_cancelled' || Boolean(attrs.cancelled) || state === 'canceled'

  await repository.upsertSubscription({
    id: existingSubscription?.id ?? `sub_${stableId(`${userId}:${payload.data?.id ?? eventId}`).slice(0, 12)}`,
    user_id: userId,
    state,
    lemon_squeezy_customer_id: stringifyNullable(attrs.customer_id) ?? existingSubscription?.lemon_squeezy_customer_id ?? null,
    lemon_squeezy_subscription_id: payload.data?.id ?? existingSubscription?.lemon_squeezy_subscription_id ?? null,
    lemon_squeezy_variant_id: stringifyNullable(attrs.variant_id) ?? existingSubscription?.lemon_squeezy_variant_id ?? null,
    plan_id: planId,
    current_period_start: stringifyNullable(attrs.created_at) ?? existingSubscription?.current_period_start ?? null,
    current_period_end: stringifyNullable(attrs.renews_at ?? attrs.ends_at) ?? existingSubscription?.current_period_end ?? null,
    cancel_at_period_end: cancelAtPeriodEnd,
    metadata: { lemon_squeezy_event_name: eventName },
    created_at: existingSubscription?.created_at ?? now,
    updated_at: now,
  })

  const credits = eventName === 'subscription_payment_success' && (state === 'active_paid' || state === 'trial') ? billingPlans[planId].credits : 0
  if (credits > 0) {
    await repository.addCreditLedgerEntry(userId, credits, 'manual_adjustment', undefined, { source: 'lemon_squeezy', lemon_squeezy_event_id: eventId, plan_id: planId, event_name: eventName })
  } else {
    await repository.recordUsageEvent(userId, { name: 'subscription_synced', metadata: { lemon_squeezy_event_id: eventId, event_name: eventName, plan_id: planId } })
  }

  return { processed: true, duplicate: false, user_id: userId, plan_id: planId, credits_granted: credits }
}

export interface LemonSqueezyPortalOptions { apiKey?: string; fetchImpl?: typeof fetch }

export async function getLemonSqueezyCustomerPortalUrl(repository: HudforgeRepository, userId: string, options: LemonSqueezyPortalOptions = {}) {
  const subscriptions = await repository.listSubscriptions(userId)
  const subscription = subscriptions.find((entry) => entry.lemon_squeezy_subscription_id) ?? subscriptions.find((entry) => entry.lemon_squeezy_customer_id)
  const customerId = subscription?.lemon_squeezy_customer_id
  const subscriptionId = subscription?.lemon_squeezy_subscription_id
  if (!customerId && !subscriptionId) {
    throw new HudforgeServiceError('No Lemon Squeezy customer found for this account.', 404, 'customer_not_found')
  }

  const apiKey = options.apiKey ?? process.env.LEMON_SQUEEZY_API_KEY
  if (!apiKey) throw new HudforgeServiceError('Lemon Squeezy customer portal is not configured.', 503, 'lemon_squeezy_not_configured')

  const fetchImpl = options.fetchImpl ?? fetch
  const resourceUrl = subscriptionId
    ? `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`
    : `https://api.lemonsqueezy.com/v1/customers/${customerId}`
  const response = await fetchImpl(resourceUrl, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/vnd.api+json' },
  })
  if (!response.ok) {
    throw new HudforgeServiceError(`Lemon Squeezy portal lookup failed with status ${response.status}: ${(await safeResponseText(response)).slice(0, 220)}`, 502, 'lemon_squeezy_portal_failed')
  }

  const payload = (await response.json()) as { data?: { attributes?: { urls?: { customer_portal?: string | null } } } }
  const portal_url = payload.data?.attributes?.urls?.customer_portal
  if (!portal_url) throw new HudforgeServiceError('Lemon Squeezy did not return a customer portal URL.', 502, 'lemon_squeezy_portal_missing_url')
  return { portal_url }
}
function isLemonSqueezyConfigured() { return Boolean(process.env.LEMON_SQUEEZY_API_KEY && process.env.LEMON_SQUEEZY_STORE_ID && (process.env.LEMON_SQUEEZY_STARTER_VARIANT_ID || process.env.LEMON_SQUEEZY_PRO_VARIANT_ID)) }
function normalizeBillingPlanId(value: string): Exclude<BillingPlanId, 'free'> { return value === 'pro' ? 'pro' : value === 'dev' ? 'dev' : 'starter' }
function mapLemonSqueezySubscriptionState(eventName: string, value: string): BillingState {
  const normalizedEvent = eventName.toLowerCase()
  if (normalizedEvent === 'subscription_cancelled') return 'canceled'
  const normalized = value.toLowerCase()
  if (normalized.includes('trial')) return 'trial'
  if (normalized.includes('cancel')) return 'canceled'
  if (normalized.includes('past_due') || normalized.includes('past due')) return 'past_due'
  return 'active_paid'
}
function stringifyNullable(value: unknown) { return value === undefined || value === null ? null : String(value) }
function toSubscriptionRow(subscription: HudforgeSubscription) { return { id: subscription.id, user_id: subscription.user_id, state: subscription.state, lemon_squeezy_customer_id: subscription.lemon_squeezy_customer_id ?? null, lemon_squeezy_subscription_id: subscription.lemon_squeezy_subscription_id ?? null, lemon_squeezy_variant_id: subscription.lemon_squeezy_variant_id ?? null, plan_id: subscription.plan_id, current_period_start: subscription.current_period_start ?? null, current_period_end: subscription.current_period_end ?? null, cancel_at_period_end: subscription.cancel_at_period_end, metadata: subscription.metadata ?? {}, created_at: subscription.created_at, updated_at: subscription.updated_at } }
function fromSubscriptionRow(row: Record<string, unknown>): HudforgeSubscription { return { id: String(row.id), user_id: String(row.user_id), state: row.state as BillingState, lemon_squeezy_customer_id: stringifyNullable(row.lemon_squeezy_customer_id), lemon_squeezy_subscription_id: stringifyNullable(row.lemon_squeezy_subscription_id), lemon_squeezy_variant_id: stringifyNullable(row.lemon_squeezy_variant_id), plan_id: (row.plan_id === 'pro' ? 'pro' : row.plan_id === 'dev' ? 'dev' : row.plan_id === 'starter' ? 'starter' : 'free') as BillingPlanId, current_period_start: stringifyNullable(row.current_period_start), current_period_end: stringifyNullable(row.current_period_end), cancel_at_period_end: Boolean(row.cancel_at_period_end), metadata: row.metadata as Record<string, unknown> | undefined, created_at: String(row.created_at), updated_at: String(row.updated_at) } }

export function getProviderStatus(): ProviderStatus { return { llm: process.env.OPENROUTER_API_KEY ? 'openrouter_deepseek' : 'mock', assets: process.env.FAL_KEY ? 'fal' : 'missing_fal_key', billing: process.env.LEMON_SQUEEZY_API_KEY ? 'lemon_squeezy' : 'mock' } }
export function assertGenerationStatus(status: string): asserts status is GenerationStatus { if (!generationStatuses.includes(status as GenerationStatus)) throw new HudforgeServiceError(`Unsupported generation status: ${status}`, 400, 'invalid_status') }
export function exportLayoutToLuau(spec: OptimizedGenerationSpec): string { const lines = [`-- HUDForge export: ${escapeLuauString(spec.intent_summary)}`, `-- UI type: ${spec.ui_type}`, `-- Style: ${spec.style}`, '-- Asset refs are listed in assets/assets.json. Replace rbxassetid://0 with uploaded Roblox asset IDs.', 'local ScreenGui = Instance.new("ScreenGui")', `ScreenGui.Name = "${escapeLuauString(spec.lua_spec.screen_gui_name)}"`, 'ScreenGui.ResetOnSpawn = false', 'ScreenGui.IgnoreGuiInset = true', 'ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling', '']; for (const instance of spec.lua_spec.root_instances) appendInstanceLuau(lines, instance); lines.push('return ScreenGui', ''); return lines.join('\n') }

function buildOptimizedSpec(generation_id: string, prompt: string, ui_type: UiType, style: GenerationStyle, user_settings: UserSettings): OptimizedGenerationSpec { const title = buildTitle(prompt, ui_type); const canvasTarget = user_settings.mobile_first ? 'mobile' : 'desktop'; const nodes = buildLayoutNodes(ui_type, title); const rootInstances = flattenNodesForLua(nodes, 'ScreenGui'); const basePrompt = `${style.replace('_', ' ')} Roblox ${ui_type.replace('_', ' ')} for: ${prompt}. Clean transparent game UI components, Roblox-native layout, editable labels, mobile safe area.`; return { generation_id, ui_type, style, intent_summary: `Create a ${style.replace('_', ' ')} ${ui_type.replace('_', ' ')} that is mobile-friendly, previewable, and exportable to Roblox Studio.`, asset_list: ['main_frame', 'primary_button', 'secondary_button', 'currency_icon', 'background_panel'], layout_spec: { canvas: { target: canvasTarget, width: canvasTarget === 'mobile' ? 390 : 1280, height: canvasTarget === 'mobile' ? 844 : 720, safe_area: true }, nodes }, image_prompts: { main_frame: { prompt: `${basePrompt} Main transparent panel frame with subtle border glow.`, negative_prompt: 'tiny unreadable text, watermark, logo, clutter', transparent: true, intended_use: 'panel' }, primary_button: { prompt: `${basePrompt} Primary buy/action button, rounded, clear state, no baked text.`, negative_prompt: 'text, watermark, photorealism, messy edges', transparent: true, intended_use: 'button' }, secondary_button: { prompt: `${basePrompt} Secondary close/settings button, compact X/button state, no baked text.`, negative_prompt: 'text, watermark, noisy background', transparent: true, intended_use: 'button' }, currency_icon: { prompt: `${basePrompt} Currency icon suitable for coins/gems display.`, negative_prompt: 'watermark, text, blurry', transparent: true, intended_use: 'icon' }, background_panel: { prompt: `${basePrompt} Soft game UI backdrop panel texture for preview context.`, negative_prompt: 'watermark, text, characters, busy scenery', transparent: false, intended_use: 'background' } }, lua_spec: { screen_gui_name: 'HUDForgeGeneratedUI', root_instances: rootInstances }, constraints: { mobile_friendly: true, roblox_native: true, transparent_assets_preferred: true, deterministic_export_required: true } } }
function buildLayoutNodes(ui_type: UiType, title: string): LayoutNode[] { const mainText = ui_type === 'shop_ui' ? 'Featured Items' : ui_type === 'inventory' ? 'Inventory' : ui_type === 'reward_screen' ? 'Reward Unlocked' : ui_type === 'main_menu' ? 'Main Menu' : 'Player HUD'; const actionText = ui_type === 'shop_ui' ? 'BUY' : ui_type === 'inventory' ? 'EQUIP' : ui_type === 'reward_screen' ? 'CLAIM' : ui_type === 'main_menu' ? 'PLAY' : 'BOOST'; return [{ id: 'background_panel', type: 'ImageLabel', name: 'BackgroundPanel', asset_ref: 'background_panel', position: { x_scale: 0, x_offset: 0, y_scale: 0, y_offset: 0 }, size: { x_scale: 1, x_offset: 0, y_scale: 1, y_offset: 0 }, z_index: 1, text: null, children: [] }, { id: 'main_frame', type: 'Frame', name: 'MainFrame', asset_ref: 'main_frame', position: { x_scale: 0.5, x_offset: -175, y_scale: 0.5, y_offset: -245 }, size: { x_scale: 0, x_offset: 350, y_scale: 0, y_offset: 490 }, z_index: 2, text: null, children: [{ id: 'title_label', type: 'TextLabel', name: 'TitleLabel', asset_ref: null, position: { x_scale: 0, x_offset: 24, y_scale: 0, y_offset: 20 }, size: { x_scale: 1, x_offset: -48, y_scale: 0, y_offset: 48 }, z_index: 3, text: title, children: [] }, { id: 'currency_icon', type: 'ImageLabel', name: 'CurrencyIcon', asset_ref: 'currency_icon', position: { x_scale: 0, x_offset: 28, y_scale: 0, y_offset: 92 }, size: { x_scale: 0, x_offset: 48, y_scale: 0, y_offset: 48 }, z_index: 3, text: null, children: [] }, { id: 'summary_label', type: 'TextLabel', name: 'SummaryLabel', asset_ref: null, position: { x_scale: 0, x_offset: 88, y_scale: 0, y_offset: 92 }, size: { x_scale: 1, x_offset: -116, y_scale: 0, y_offset: 48 }, z_index: 3, text: mainText, children: [] }, { id: 'primary_button', type: 'TextButton', name: 'PrimaryButton', asset_ref: 'primary_button', position: { x_scale: 0.5, x_offset: -124, y_scale: 1, y_offset: -92 }, size: { x_scale: 0, x_offset: 248, y_scale: 0, y_offset: 54 }, z_index: 4, text: actionText, children: [] }, { id: 'secondary_button', type: 'TextButton', name: 'CloseButton', asset_ref: 'secondary_button', position: { x_scale: 1, x_offset: -58, y_scale: 0, y_offset: 18 }, size: { x_scale: 0, x_offset: 38, y_scale: 0, y_offset: 38 }, z_index: 5, text: 'X', children: [] }] }] }
function flattenNodesForLua(nodes: LayoutNode[], parent: string): LuaInstanceSpec[] { return nodes.flatMap((node) => [{ id: node.id, class_name: node.type, name: node.name, parent, asset_ref: node.asset_ref, text: node.text, position: node.position, size: node.size, z_index: node.z_index }, ...flattenNodesForLua(node.children, node.name)]) }
function appendInstanceLuau(lines: string[], instance: LuaInstanceSpec) { const variableName = toRobloxIdentifier(instance.name); const parentName = instance.parent === 'ScreenGui' ? 'ScreenGui' : toRobloxIdentifier(instance.parent); lines.push(`local ${variableName} = Instance.new("${instance.class_name}")`, `${variableName}.Name = "${escapeLuauString(instance.name)}"`, `${variableName}.Position = UDim2.new(${instance.position.x_scale}, ${instance.position.x_offset}, ${instance.position.y_scale}, ${instance.position.y_offset})`, `${variableName}.Size = UDim2.new(${instance.size.x_scale}, ${instance.size.x_offset}, ${instance.size.y_scale}, ${instance.size.y_offset})`, `${variableName}.ZIndex = ${instance.z_index}`); if (instance.class_name === 'ImageLabel') { lines.push(`${variableName}.BackgroundTransparency = 1`, `${variableName}.Image = "rbxassetid://0" -- manifest asset_ref: ${escapeLuauString(instance.asset_ref ?? 'none')}`) } else { lines.push(`${variableName}.BackgroundColor3 = Color3.fromRGB(16, 24, 39)`, `${variableName}.BorderSizePixel = 0`) } if (instance.text && (instance.class_name === 'TextLabel' || instance.class_name === 'TextButton')) lines.push(`${variableName}.Font = Enum.Font.GothamBold`, `${variableName}.Text = "${escapeLuauString(instance.text)}"`, `${variableName}.TextColor3 = Color3.fromRGB(255, 255, 255)`, `${variableName}.TextScaled = true`, `${variableName}.BackgroundTransparency = ${instance.class_name === 'TextLabel' ? 1 : 0}`); lines.push(`${variableName}.Parent = ${parentName}`, '') }
function buildExportPackage(spec: OptimizedGenerationSpec, assetBundle?: AssetBundle): ExportPackagePayload {
  const lua = exportLayoutToLuau(spec)
  const generatedAt = new Date().toISOString()
  const filename = `${slugify(spec.ui_type)}-${slugify(spec.style)}-${spec.generation_id}.zip`
  const manifest = {
    product: 'HUDForge',
    generation_id: spec.generation_id,
    generated_at: generatedAt,
    ui_type: spec.ui_type,
    style: spec.style,
    entrypoint: 'code/MainUI.lua',
    import_guide: 'README_IMPORT.md',
    asset_manifest: 'assets/assets.json',
    files: ['manifest.json', 'layout.json', 'code/MainUI.lua', 'assets/assets.json', 'README_IMPORT.md'],
  }
  const files: Required<ExportPackageFile>[] = [
    { path: 'manifest.json', content_type: 'application/json', content: JSON.stringify(manifest, null, 2) },
    { path: 'layout.json', content_type: 'application/json', content: JSON.stringify(spec.layout_spec, null, 2) },
    { path: 'code/MainUI.lua', content_type: 'text/x-lua', content: lua },
    { path: 'assets/assets.json', content_type: 'application/json', content: JSON.stringify({ assets: (assetBundle?.assets ?? []).map((asset) => ({ ...asset, format: 'png', content_type: asset.content_type ?? 'image/png' })), asset_refs: spec.asset_list, replacement_note: 'Upload each PNG image URL to Roblox, then replace matching rbxassetid://0 placeholders in code/MainUI.lua.' }, null, 2) },
    { path: 'README_IMPORT.md', content_type: 'text/markdown', content: buildImportReadme(spec) },
  ]
  const zip = createZipArchive(files.map((file) => ({ path: file.path, content: file.content })))
  const zipBase64 = Buffer.from(zip).toString('base64')
  return {
    generation_id: spec.generation_id,
    status: 'exported',
    package: { generation_id: spec.generation_id, format: 'zip', files: files.map(({ path, content_type }) => ({ path, content_type })) },
    download_url: `data:application/zip;base64,${zipBase64}`,
    limitations: ['Upload generated image URLs to Roblox Creator Hub or Asset Manager, then replace rbxassetid://0 placeholders with the uploaded asset IDs.'],
    filename,
    files,
    zip_base64: zipBase64,
    byte_size: zip.length,
  }
}
function buildImportReadme(spec: OptimizedGenerationSpec) {
  return `# HUDForge Roblox Studio quick import

This package contains a Roblox-ready UI hierarchy generated from your HUDForge prompt.

## Files

- \`code/MainUI.lua\` — deterministic Luau that creates \`${spec.lua_spec.screen_gui_name}\`.
- \`layout.json\` — the editable layout source of truth.
- \`assets/assets.json\` — generated image URLs and asset references.
- \`manifest.json\` — package metadata.

## Roblox Studio quick import

1. Unzip this package.
2. Open Roblox Studio and your place.
3. Create a new \`ModuleScript\` under \`ReplicatedStorage\` or paste \`code/MainUI.lua\` into a \`LocalScript\` for testing.
4. Upload each generated image URL listed in \`assets/assets.json\` through Creator Hub or Asset Manager.
5. Replace every rbxassetid://0 placeholder in \`code/MainUI.lua\` with the uploaded Roblox asset IDs.
6. At runtime, parent the returned ScreenGui to \`Players.LocalPlayer.PlayerGui\`.

Example runtime mount:

\`\`\`lua
local Players = game:GetService("Players")
local screenGui = require(path.to.MainUI)
screenGui.Parent = Players.LocalPlayer.PlayerGui
\`\`\`

## Notes

- Text labels/buttons stay editable in Studio.
- Image assets are referenced by manifest asset_ref comments in the Luau file.
- If the layout needs changes, edit \`layout.json\` first and regenerate code through HUDForge for consistency.
`
}

export function createZipArchive(files: Array<{ path: string; content: string | Uint8Array }>): Uint8Array {
  const encoder = new TextEncoder()
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const nameBytes = encoder.encode(file.path)
    const contentBytes = typeof file.content === 'string' ? encoder.encode(file.content) : file.content
    const crc = crc32(contentBytes)
    const localHeader = concatBytes([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(contentBytes.length), u32(contentBytes.length), u16(nameBytes.length), u16(0), nameBytes,
    ])
    localParts.push(localHeader, contentBytes)
    centralParts.push(concatBytes([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(contentBytes.length), u32(contentBytes.length), u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes,
    ]))
    offset += localHeader.length + contentBytes.length
  }

  const centralDirectory = concatBytes(centralParts)
  const end = concatBytes([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralDirectory.length), u32(offset), u16(0)])
  return concatBytes([...localParts, centralDirectory, end])
}

export function listZipEntries(zip: Uint8Array): string[] {
  const decoder = new TextDecoder()
  const entries: string[] = []
  for (let index = 0; index < zip.length - 4; index += 1) {
    if (zip[index] === 0x50 && zip[index + 1] === 0x4b && zip[index + 2] === 0x01 && zip[index + 3] === 0x02) {
      const nameLength = zip[index + 28] | (zip[index + 29] << 8)
      const extraLength = zip[index + 30] | (zip[index + 31] << 8)
      const commentLength = zip[index + 32] | (zip[index + 33] << 8)
      const nameStart = index + 46
      entries.push(decoder.decode(zip.slice(nameStart, nameStart + nameLength)))
      index = nameStart + nameLength + extraLength + commentLength - 1
    }
  }
  return entries
}

function concatBytes(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const output = new Uint8Array(total)
  let offset = 0
  for (const part of parts) { output.set(part, offset); offset += part.length }
  return output
}
function u16(value: number) { const bytes = new Uint8Array(2); new DataView(bytes.buffer).setUint16(0, value, true); return bytes }
function u32(value: number) { const bytes = new Uint8Array(4); new DataView(bytes.buffer).setUint32(0, value >>> 0, true); return bytes }
const crcTable = Array.from({ length: 256 }, (_, index) => { let crc = index; for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1; return crc >>> 0 })
function crc32(bytes: Uint8Array) { let crc = 0xffffffff; for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0 }

function normalizeSettingsInput(input?: Partial<UserSettings>): UserSettings { return { default_export_format: input?.default_export_format === 'lua' || input?.default_export_format === 'manifest' ? input.default_export_format : 'zip', mobile_first: typeof input?.mobile_first === 'boolean' ? input.mobile_first : true, default_ui_type: normalizeUiType(input?.default_ui_type), default_style: normalizeGenerationStyle(input?.default_style), save_history: typeof input?.save_history === 'boolean' ? input.save_history : true } }
function normalizeUiType(value?: string): UiType { if (value === 'shop' || value === 'shop_ui') return 'shop_ui'; if (value === 'menu' || value === 'main_menu') return 'main_menu'; if (value === 'reward' || value === 'reward_screen') return 'reward_screen'; if (value === 'hud' || value === 'inventory') return value; return 'shop_ui' }
function normalizeGenerationStyle(value?: string): GenerationStyle { if (value === 'sciFi' || value === 'sci-fi' || value === 'sci_fi' || value === 'cyberpunk') return 'sci_fi'; if (value === 'futuristic' || value === 'premium') return 'premium'; if (value === 'fantasy' || value === 'anime') return 'anime'; if (value === 'neon' || value === 'cartoon' || value === 'minimal') return value; return 'neon' }
function paletteForStyle(style: GenerationStyle) { const palettes: Record<GenerationStyle, { background: string; panel: string; accent: string; text: string }> = { neon: { background: '#090A1A', panel: '#15122B', accent: '#B46CFF', text: '#F3E8FF' }, cartoon: { background: '#102033', panel: '#23415E', accent: '#FFCD4D', text: '#FFFFFF' }, sci_fi: { background: '#08111F', panel: '#132033', accent: '#5BE7FF', text: '#EAF7FF' }, anime: { background: '#16091F', panel: '#281237', accent: '#FF79C6', text: '#FFF4FB' }, minimal: { background: '#0B1020', panel: '#1F2937', accent: '#CBD5E1', text: '#F8FAFC' }, premium: { background: '#09090B', panel: '#18181B', accent: '#D4AF37', text: '#FAFAFA' } }; return palettes[style] }
function buildTitle(prompt: string, uiType: UiType) { const analysis = analyzeRobloxPrompt(prompt, uiType); const tokens = analysis.tokens.filter((token) => !['a', 'an', 'the', 'for', 'with', 'make', 'create', 'build', 'design', 'ui'].includes(token)).slice(0, 3); const fallback = uiType.replace('_', ' '); const title = tokens.length ? tokens.map((token) => token[0].toUpperCase() + token.slice(1)).join(' ') : fallback; return `${title} ${uiType === 'hud' ? 'HUD' : 'UI'}` }
function buildMockSvgDataUrl(spec: OptimizedGenerationSpec, name: string, use: AssetUse) { const palette = paletteForStyle(spec.style); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="112" fill="${palette.background}"/><rect x="144" y="208" width="736" height="608" rx="68" fill="${palette.panel}" stroke="${palette.accent}" stroke-width="16"/><circle cx="512" cy="512" r="144" fill="${palette.accent}" opacity="0.74"/><text x="512" y="896" text-anchor="middle" fill="${palette.text}" font-family="Arial" font-size="54" font-weight="700">${escapeXml(name.toUpperCase())}</text><text x="512" y="130" text-anchor="middle" fill="${palette.text}" font-family="Arial" font-size="36" font-weight="700">${escapeXml(use.toUpperCase())}</text></svg>`; return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` }
function toGenerationRow(generation: Generation) { return { id: generation.id, user_id: generation.user_id, title: generation.title, prompt: generation.prompt, ui_type: generation.ui_type, style: generation.style, status: generation.status, project_id: generation.project_id ?? null, optimized_spec: generation.optimized_spec ?? null, asset_bundle: generation.asset_bundle ?? null, export_package: generation.export_package ?? null, error: generation.error ?? null, metadata: generation.metadata ?? {}, created_at: generation.created_at, updated_at: generation.updated_at } }
function fromGenerationRow(row: Record<string, unknown>): Generation { return { id: row.id as string, user_id: row.user_id as string, title: row.title as string, prompt: row.prompt as string, ui_type: row.ui_type as UiType, style: row.style as GenerationStyle, status: row.status as GenerationStatus, project_id: (row.project_id ?? null) as string | null, optimized_spec: (row.optimized_spec ?? undefined) as OptimizedGenerationSpec | undefined, asset_bundle: (row.asset_bundle ?? undefined) as AssetBundle | undefined, export_package: (row.export_package ?? undefined) as ExportPackagePayload | undefined, error: (row.error ?? undefined) as string | undefined, metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined, created_at: row.created_at as string, updated_at: row.updated_at as string } }
function toProjectRow(project: HudforgeProject) { return { id: project.id, user_id: project.user_id, name: project.name, style_profile: project.style_profile, locked_at: project.locked_at, source_generation_id: project.source_generation_id, created_at: project.created_at, updated_at: project.updated_at } }
function fromProjectRow(row: Record<string, unknown>): HudforgeProject { return { id: row.id as string, user_id: row.user_id as string, name: row.name as string, style_profile: (row.style_profile ?? null) as StyleProfile | null, locked_at: (row.locked_at ?? null) as string | null, source_generation_id: (row.source_generation_id ?? null) as string | null, created_at: row.created_at as string, updated_at: row.updated_at as string } }
function dbError(error: { message?: string }, message: string) { return new HudforgeServiceError(`${message}: ${error.message ?? 'database error'}`, 500, 'database_error') }
function mapAtomicDebitError(error: { message?: string }, fallbackAmount: number) {
  const message = error.message ?? ''
  if (message.includes('insufficient_credits')) {
    const match = message.match(/required (\d+), available (\d+)/)
    const required = match ? Number(match[1]) : fallbackAmount
    const available = match ? Number(match[2]) : 0
    return new HudforgeServiceError(`Insufficient credits. Required ${required}, available ${available}.`, 402, 'insufficient_credits', { required, available })
  }
  return dbError(error, 'Failed to debit credits')
}
function stableId(value: string) { let hash = 2166136261; for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619) } return (hash >>> 0).toString(36) }
function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'hudforge-generation' }
function toRobloxIdentifier(value: string) { const identifier = value.replace(/[^a-zA-Z0-9]+/g, ' ').split(' ').filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(''); return /^[A-Za-z]/.test(identifier) ? identifier : `Hudforge${identifier || 'UI'}` }
function escapeLuauString(value: string) { return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ') }
function escapeXml(value: string) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }
