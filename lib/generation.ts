import Replicate, { type Status } from 'replicate'
import { analyzeRobloxPrompt, buildRobloxImagePrompt, type PromptAnalysis } from './prompts'

export type GenerationStatus = Status | 'queued'

export interface GenerateRequestBody {
  prompt?: unknown
  style?: unknown
}

export interface GenerationMetadata {
  id: string
  prompt: string
  style?: string
  luauCode: string
  createdAt: string
  analysis: PromptAnalysis
}

export interface GenerationResponse {
  id: string
  status: GenerationStatus
  imageUrl: string | null
  luauCode: string
  prompt: string
  style?: string
  createdAt: string
  pollUrl: string
}

export interface PollGenerationResponse {
  id: string
  status: GenerationStatus
  imageUrl: string | null
  output: unknown
  error: unknown
  logs?: string
  luauCode?: string
  createdAt?: string
  completedAt?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly retryAfter?: number
  ) {
    super(message)
  }
}

const DEFAULT_MODEL = 'black-forest-labs/flux-schnell'
const MAX_PROMPT_LENGTH = 800
const RETRY_DELAYS_MS = [250, 750, 1500]
const GENERATION_TTL_MS = 1000 * 60 * 60
const RATE_LIMIT_WINDOW_MS = 1000 * 60
const RATE_LIMIT_MAX_REQUESTS = 8

const generationStore = new Map<string, GenerationMetadata>()
const mockStatuses = new Map<string, { createdAt: number; imageUrl: string }>()
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function validateGenerateRequest(body: GenerateRequestBody): { prompt: string; style?: string } {
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  const style = typeof body.style === 'string' ? body.style.trim() : undefined

  if (!prompt) {
    throw new ApiError('Prompt required', 400, 'prompt_required')
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new ApiError(`Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer`, 400, 'prompt_too_long')
  }

  return { prompt, style: style || undefined }
}

export function checkRateLimit(key: string): { remaining: number; resetAt: number } {
  const now = Date.now()
  const current = rateLimitStore.get(key)

  if (!current || current.resetAt <= now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS
    rateLimitStore.set(key, { count: 1, resetAt })
    return { remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt }
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000)
    throw new ApiError('Rate limit exceeded', 429, 'rate_limited', retryAfter)
  }

  current.count += 1
  return { remaining: RATE_LIMIT_MAX_REQUESTS - current.count, resetAt: current.resetAt }
}

export async function createGeneration(prompt: string, style?: string): Promise<GenerationResponse> {
  cleanupExpiredGenerations()

  const analysis = analyzeRobloxPrompt(prompt, style)
  const luauCode = generateLuauCode(prompt, style)
  const createdAt = new Date().toISOString()
  const token = process.env.REPLICATE_API_TOKEN

  if (!token) {
    const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const imageUrl = `https://placehold.co/512x512/png?text=${encodeURIComponent(analysis.uiType)}`
    rememberGeneration({ id, prompt, style, luauCode, createdAt, analysis })
    mockStatuses.set(id, { createdAt: Date.now(), imageUrl })

    return {
      id,
      status: 'queued',
      imageUrl: null,
      luauCode,
      prompt,
      style,
      createdAt,
      pollUrl: `/api/generate/${id}`,
    }
  }

  const replicate = new Replicate({ auth: token })
  const prediction = await retryTransient(() =>
    replicate.predictions.create({
      model: process.env.REPLICATE_MODEL || DEFAULT_MODEL,
      input: buildReplicateInput(prompt, style),
      webhook: process.env.REPLICATE_WEBHOOK_URL || undefined,
      webhook_events_filter: process.env.REPLICATE_WEBHOOK_URL ? ['completed'] : undefined,
    })
  )

  rememberGeneration({ id: prediction.id, prompt, style, luauCode, createdAt, analysis })

  return {
    id: prediction.id,
    status: prediction.status,
    imageUrl: extractImageUrl(prediction.output),
    luauCode,
    prompt,
    style,
    createdAt,
    pollUrl: `/api/generate/${prediction.id}`,
  }
}

export async function getGeneration(id: string): Promise<PollGenerationResponse> {
  cleanupExpiredGenerations()

  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new ApiError('Invalid generation ID', 400, 'invalid_generation_id')
  }

  const metadata = generationStore.get(id)
  const mock = mockStatuses.get(id)

  if (mock) {
    const elapsed = Date.now() - mock.createdAt
    const status: GenerationStatus = elapsed > 1200 ? 'succeeded' : elapsed > 300 ? 'processing' : 'queued'

    return {
      id,
      status,
      imageUrl: status === 'succeeded' ? mock.imageUrl : null,
      output: status === 'succeeded' ? [mock.imageUrl] : null,
      error: null,
      luauCode: metadata?.luauCode,
      createdAt: metadata?.createdAt,
      completedAt: status === 'succeeded' ? new Date(mock.createdAt + 1200).toISOString() : undefined,
    }
  }

  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    throw new ApiError('Generation not found', 404, 'generation_not_found')
  }

  const replicate = new Replicate({ auth: token })
  const prediction = await retryTransient(() => replicate.predictions.get(id))

  return {
    id: prediction.id,
    status: prediction.status,
    imageUrl: extractImageUrl(prediction.output),
    output: prediction.output ?? null,
    error: prediction.error ?? null,
    logs: prediction.logs,
    luauCode: metadata?.luauCode,
    createdAt: metadata?.createdAt ?? prediction.created_at,
    completedAt: prediction.completed_at,
  }
}

export function generateLuauCode(prompt: string, style?: string): string {
  const analysis = analyzeRobloxPrompt(prompt, style)

  switch (analysis.uiType) {
    case 'button':
      return createButtonLuau(prompt, analysis)
    case 'healthBar':
      return createHealthBarLuau(prompt, analysis)
    case 'inventory':
      return createInventoryLuau(prompt, analysis)
    case 'shop':
      return createShopLuau(prompt, analysis)
    case 'leaderboard':
      return createLeaderboardLuau(prompt, analysis)
    case 'dialog':
      return createDialogLuau(prompt, analysis)
    case 'menu':
    case 'hud':
      return createPanelLuau(prompt, analysis)
  }
}

export function extractImageUrl(output: unknown): string | null {
  if (typeof output === 'string') return output
  if (Array.isArray(output)) {
    const firstUrl = output.find((item) => typeof item === 'string' && /^https?:\/\//.test(item))
    return typeof firstUrl === 'string' ? firstUrl : null
  }
  if (output && typeof output === 'object') {
    const maybeUrl = 'url' in output ? (output as { url?: unknown }).url : undefined
    if (typeof maybeUrl === 'string') return maybeUrl
  }
  return null
}

function buildReplicateInput(prompt: string, style?: string): Record<string, unknown> {
  return {
    prompt: buildRobloxImagePrompt(prompt, style),
    aspect_ratio: '1:1',
    output_format: 'png',
    num_outputs: 1,
    go_fast: true,
    megapixels: '1',
    disable_safety_checker: false,
  }
}

function rememberGeneration(metadata: GenerationMetadata) {
  generationStore.set(metadata.id, metadata)
}

function cleanupExpiredGenerations() {
  const now = Date.now()

  for (const [id, metadata] of generationStore) {
    if (Date.parse(metadata.createdAt) + GENERATION_TTL_MS < now) {
      generationStore.delete(id)
      mockStatuses.delete(id)
    }
  }

  for (const [key, bucket] of rateLimitStore) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }
}

async function retryTransient<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isTransientError(error) || attempt === RETRY_DELAYS_MS.length) break
      await sleep(RETRY_DELAYS_MS[attempt])
    }
  }

  throw normalizeReplicateError(lastError)
}

function normalizeReplicateError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (isReplicateApiError(error)) {
    const status = error.response.status
    if (status === 401 || status === 403) {
      return new ApiError('Image provider authentication failed', 502, 'provider_auth_failed')
    }
    if (status === 429) {
      return new ApiError('Image provider is rate limiting requests', 503, 'provider_rate_limited', 10)
    }
    if (status >= 400 && status < 500) {
      return new ApiError('Image generation request was rejected', 400, 'provider_rejected')
    }
    return new ApiError('Image provider is temporarily unavailable', 503, 'provider_unavailable')
  }

  return new ApiError('Image generation failed', 500, 'generation_failed')
}

function isTransientError(error: unknown): boolean {
  if (isReplicateApiError(error)) {
    return error.response.status === 429 || error.response.status >= 500
  }
  return true
}

function isReplicateApiError(error: unknown): error is { response: Response } {
  return Boolean(error && typeof error === 'object' && 'response' in error && (error as { response?: unknown }).response instanceof Response)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createHeader(prompt: string, analysis: PromptAnalysis): string {
  return `-- Generated from: "${escapeLuauComment(prompt)}"
-- UI type: ${analysis.uiType}
-- Style: ${analysis.style}
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "Generated${toPascalCase(analysis.uiType)}"
ScreenGui.ResetOnSpawn = false
ScreenGui.IgnoreGuiInset = true
ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling

`
}

function createButtonLuau(prompt: string, analysis: PromptAnalysis): string {
  return `${createHeader(prompt, analysis)}local Button = Instance.new("TextButton")
Button.Name = "PrimaryActionButton"
Button.AnchorPoint = Vector2.new(0.5, 0.5)
Button.Position = UDim2.new(0.5, 0, 0.72, 0)
Button.Size = UDim2.new(0, 260, 0, 72)
Button.ZIndex = 10
Button.BackgroundColor3 = Color3.fromRGB(36, 126, 255)
Button.BorderSizePixel = 0
Button.AutoButtonColor = true
Button.Font = Enum.Font.GothamBold
Button.Text = "PLAY"
Button.TextColor3 = Color3.fromRGB(255, 255, 255)
Button.TextScaled = true
Button.Parent = ScreenGui

local Corner = Instance.new("UICorner")
Corner.CornerRadius = UDim.new(0, 14)
Corner.Parent = Button

local Stroke = Instance.new("UIStroke")
Stroke.Thickness = 3
Stroke.Color = Color3.fromRGB(255, 255, 255)
Stroke.Transparency = 0.15
Stroke.Parent = Button

local Gradient = Instance.new("UIGradient")
Gradient.Rotation = 90
Gradient.Color = ColorSequence.new({
  ColorSequenceKeypoint.new(0, Color3.fromRGB(75, 170, 255)),
  ColorSequenceKeypoint.new(1, Color3.fromRGB(24, 89, 214))
})
Gradient.Parent = Button

return ScreenGui
`
}

function createHealthBarLuau(prompt: string, analysis: PromptAnalysis): string {
  return `${createHeader(prompt, analysis)}local Container = Instance.new("Frame")
Container.Name = "HealthBar"
Container.AnchorPoint = Vector2.new(0, 0)
Container.Position = UDim2.new(0, 24, 0, 24)
Container.Size = UDim2.new(0, 320, 0, 34)
Container.ZIndex = 5
Container.BackgroundColor3 = Color3.fromRGB(24, 24, 28)
Container.BorderSizePixel = 0
Container.Parent = ScreenGui

local ContainerCorner = Instance.new("UICorner")
ContainerCorner.CornerRadius = UDim.new(0, 12)
ContainerCorner.Parent = Container

local ContainerStroke = Instance.new("UIStroke")
ContainerStroke.Thickness = 2
ContainerStroke.Color = Color3.fromRGB(12, 12, 14)
ContainerStroke.Parent = Container

local Fill = Instance.new("Frame")
Fill.Name = "Fill"
Fill.Position = UDim2.new(0, 4, 0, 4)
Fill.Size = UDim2.new(0.76, -8, 1, -8)
Fill.ZIndex = 6
Fill.BackgroundColor3 = Color3.fromRGB(235, 63, 74)
Fill.BorderSizePixel = 0
Fill.Parent = Container

local FillCorner = Instance.new("UICorner")
FillCorner.CornerRadius = UDim.new(0, 9)
FillCorner.Parent = Fill

local FillGradient = Instance.new("UIGradient")
FillGradient.Color = ColorSequence.new({
  ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 105, 105)),
  ColorSequenceKeypoint.new(1, Color3.fromRGB(184, 31, 54))
})
FillGradient.Parent = Fill

local Label = Instance.new("TextLabel")
Label.Name = "HealthText"
Label.BackgroundTransparency = 1
Label.Size = UDim2.new(1, 0, 1, 0)
Label.ZIndex = 7
Label.Font = Enum.Font.GothamBold
Label.Text = "HP 76 / 100"
Label.TextColor3 = Color3.fromRGB(255, 255, 255)
Label.TextScaled = true
Label.Parent = Container

return ScreenGui
`
}

function createInventoryLuau(prompt: string, analysis: PromptAnalysis): string {
  return `${createHeader(prompt, analysis)}local Panel = Instance.new("Frame")
Panel.Name = "InventoryPanel"
Panel.AnchorPoint = Vector2.new(0.5, 0.5)
Panel.Position = UDim2.new(0.5, 0, 0.5, 0)
Panel.Size = UDim2.new(0, 460, 0, 340)
Panel.ZIndex = 5
Panel.BackgroundColor3 = Color3.fromRGB(32, 35, 42)
Panel.BorderSizePixel = 0
Panel.Parent = ScreenGui

local PanelCorner = Instance.new("UICorner")
PanelCorner.CornerRadius = UDim.new(0, 12)
PanelCorner.Parent = Panel

local PanelStroke = Instance.new("UIStroke")
PanelStroke.Thickness = 2
PanelStroke.Color = Color3.fromRGB(88, 94, 110)
PanelStroke.Parent = Panel

local Grid = Instance.new("Frame")
Grid.Name = "SlotGrid"
Grid.Position = UDim2.new(0, 24, 0, 58)
Grid.Size = UDim2.new(1, -48, 1, -82)
Grid.BackgroundTransparency = 1
Grid.ZIndex = 6
Grid.Parent = Panel

local Layout = Instance.new("UIGridLayout")
Layout.CellSize = UDim2.new(0, 72, 0, 72)
Layout.CellPadding = UDim2.new(0, 10, 0, 10)
Layout.SortOrder = Enum.SortOrder.LayoutOrder
Layout.Parent = Grid

for index = 1, 20 do
  local Slot = Instance.new("ImageButton")
  Slot.Name = string.format("Slot%02d", index)
  Slot.BackgroundColor3 = Color3.fromRGB(47, 52, 62)
  Slot.BorderSizePixel = 0
  Slot.ZIndex = 7
  Slot.LayoutOrder = index
  Slot.Parent = Grid

  local SlotCorner = Instance.new("UICorner")
  SlotCorner.CornerRadius = UDim.new(0, 8)
  SlotCorner.Parent = Slot

  local SlotStroke = Instance.new("UIStroke")
  SlotStroke.Thickness = 1
  SlotStroke.Color = Color3.fromRGB(108, 116, 135)
  SlotStroke.Transparency = 0.2
  SlotStroke.Parent = Slot
end

return ScreenGui
`
}

function createShopLuau(prompt: string, analysis: PromptAnalysis): string {
  return `${createHeader(prompt, analysis)}local Shop = Instance.new("Frame")
Shop.Name = "ShopPanel"
Shop.AnchorPoint = Vector2.new(0.5, 0.5)
Shop.Position = UDim2.new(0.5, 0, 0.5, 0)
Shop.Size = UDim2.new(0, 520, 0, 360)
Shop.ZIndex = 5
Shop.BackgroundColor3 = Color3.fromRGB(27, 29, 34)
Shop.BorderSizePixel = 0
Shop.Parent = ScreenGui

local Corner = Instance.new("UICorner")
Corner.CornerRadius = UDim.new(0, 12)
Corner.Parent = Shop

local Stroke = Instance.new("UIStroke")
Stroke.Thickness = 2
Stroke.Color = Color3.fromRGB(255, 202, 86)
Stroke.Parent = Shop

local Title = Instance.new("TextLabel")
Title.Name = "Title"
Title.BackgroundTransparency = 1
Title.Position = UDim2.new(0, 24, 0, 16)
Title.Size = UDim2.new(1, -48, 0, 38)
Title.ZIndex = 6
Title.Font = Enum.Font.GothamBold
Title.Text = "SHOP"
Title.TextColor3 = Color3.fromRGB(255, 239, 187)
Title.TextScaled = true
Title.Parent = Shop

for index = 1, 3 do
  local Item = Instance.new("Frame")
  Item.Name = string.format("ItemCard%02d", index)
  Item.Position = UDim2.new(0, 24 + ((index - 1) * 160), 0, 82)
  Item.Size = UDim2.new(0, 144, 0, 232)
  Item.ZIndex = 6
  Item.BackgroundColor3 = Color3.fromRGB(41, 45, 54)
  Item.BorderSizePixel = 0
  Item.Parent = Shop

  local ItemCorner = Instance.new("UICorner")
  ItemCorner.CornerRadius = UDim.new(0, 10)
  ItemCorner.Parent = Item

  local BuyButton = Instance.new("TextButton")
  BuyButton.Name = "BuyButton"
  BuyButton.AnchorPoint = Vector2.new(0.5, 1)
  BuyButton.Position = UDim2.new(0.5, 0, 1, -12)
  BuyButton.Size = UDim2.new(1, -24, 0, 42)
  BuyButton.ZIndex = 7
  BuyButton.BackgroundColor3 = Color3.fromRGB(58, 170, 92)
  BuyButton.BorderSizePixel = 0
  BuyButton.Font = Enum.Font.GothamBold
  BuyButton.Text = "BUY"
  BuyButton.TextColor3 = Color3.fromRGB(255, 255, 255)
  BuyButton.TextScaled = true
  BuyButton.Parent = Item

  local BuyCorner = Instance.new("UICorner")
  BuyCorner.CornerRadius = UDim.new(0, 8)
  BuyCorner.Parent = BuyButton
end

return ScreenGui
`
}

function createLeaderboardLuau(prompt: string, analysis: PromptAnalysis): string {
  return `${createHeader(prompt, analysis)}local Board = Instance.new("Frame")
Board.Name = "Leaderboard"
Board.AnchorPoint = Vector2.new(1, 0)
Board.Position = UDim2.new(1, -24, 0, 24)
Board.Size = UDim2.new(0, 300, 0, 280)
Board.ZIndex = 5
Board.BackgroundColor3 = Color3.fromRGB(20, 24, 31)
Board.BorderSizePixel = 0
Board.Parent = ScreenGui

local Corner = Instance.new("UICorner")
Corner.CornerRadius = UDim.new(0, 10)
Corner.Parent = Board

local Stroke = Instance.new("UIStroke")
Stroke.Thickness = 2
Stroke.Color = Color3.fromRGB(86, 153, 255)
Stroke.Parent = Board

for index = 1, 5 do
  local Row = Instance.new("TextLabel")
  Row.Name = string.format("PlayerRow%02d", index)
  Row.BackgroundTransparency = index % 2 == 0 and 0.85 or 1
  Row.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
  Row.Position = UDim2.new(0, 16, 0, 20 + (index * 42))
  Row.Size = UDim2.new(1, -32, 0, 34)
  Row.ZIndex = 6
  Row.Font = Enum.Font.GothamMedium
  Row.Text = string.format("#%d  Player  %d", index, (6 - index) * 1200)
  Row.TextColor3 = Color3.fromRGB(235, 241, 255)
  Row.TextScaled = true
  Row.TextXAlignment = Enum.TextXAlignment.Left
  Row.Parent = Board
end

return ScreenGui
`
}

function createDialogLuau(prompt: string, analysis: PromptAnalysis): string {
  return `${createHeader(prompt, analysis)}local Dialog = Instance.new("Frame")
Dialog.Name = "DialogPanel"
Dialog.AnchorPoint = Vector2.new(0.5, 1)
Dialog.Position = UDim2.new(0.5, 0, 1, -32)
Dialog.Size = UDim2.new(0.72, 0, 0, 160)
Dialog.ZIndex = 20
Dialog.BackgroundColor3 = Color3.fromRGB(23, 24, 29)
Dialog.BorderSizePixel = 0
Dialog.Parent = ScreenGui

local Corner = Instance.new("UICorner")
Corner.CornerRadius = UDim.new(0, 12)
Corner.Parent = Dialog

local Stroke = Instance.new("UIStroke")
Stroke.Thickness = 2
Stroke.Color = Color3.fromRGB(230, 230, 220)
Stroke.Transparency = 0.15
Stroke.Parent = Dialog

local Speaker = Instance.new("TextLabel")
Speaker.Name = "SpeakerName"
Speaker.BackgroundTransparency = 1
Speaker.Position = UDim2.new(0, 24, 0, 14)
Speaker.Size = UDim2.new(1, -48, 0, 30)
Speaker.ZIndex = 21
Speaker.Font = Enum.Font.GothamBold
Speaker.Text = "NPC"
Speaker.TextColor3 = Color3.fromRGB(255, 222, 138)
Speaker.TextScaled = true
Speaker.TextXAlignment = Enum.TextXAlignment.Left
Speaker.Parent = Dialog

local Body = Instance.new("TextLabel")
Body.Name = "BodyText"
Body.BackgroundTransparency = 1
Body.Position = UDim2.new(0, 24, 0, 52)
Body.Size = UDim2.new(1, -48, 1, -72)
Body.ZIndex = 21
Body.Font = Enum.Font.Gotham
Body.Text = "Your quest begins here."
Body.TextColor3 = Color3.fromRGB(245, 245, 245)
Body.TextScaled = true
Body.TextWrapped = true
Body.TextXAlignment = Enum.TextXAlignment.Left
Body.TextYAlignment = Enum.TextYAlignment.Top
Body.Parent = Dialog

return ScreenGui
`
}

function createPanelLuau(prompt: string, analysis: PromptAnalysis): string {
  return `${createHeader(prompt, analysis)}local Panel = Instance.new("Frame")
Panel.Name = "MainPanel"
Panel.AnchorPoint = Vector2.new(0.5, 0.5)
Panel.Position = UDim2.new(0.5, 0, 0.5, 0)
Panel.Size = UDim2.new(0, 420, 0, 260)
Panel.ZIndex = 5
Panel.BackgroundColor3 = Color3.fromRGB(28, 31, 38)
Panel.BorderSizePixel = 0
Panel.Parent = ScreenGui

local Corner = Instance.new("UICorner")
Corner.CornerRadius = UDim.new(0, 12)
Corner.Parent = Panel

local Stroke = Instance.new("UIStroke")
Stroke.Thickness = 2
Stroke.Color = Color3.fromRGB(106, 118, 145)
Stroke.Parent = Panel

local Gradient = Instance.new("UIGradient")
Gradient.Rotation = 90
Gradient.Color = ColorSequence.new({
  ColorSequenceKeypoint.new(0, Color3.fromRGB(44, 48, 58)),
  ColorSequenceKeypoint.new(1, Color3.fromRGB(22, 24, 30))
})
Gradient.Parent = Panel

return ScreenGui
`
}

function escapeLuauComment(value: string): string {
  return value.replace(/[\r\n]/g, ' ').replace(/"/g, '\\"')
}

function toPascalCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}
