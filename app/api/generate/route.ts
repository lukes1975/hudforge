import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt, style } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
    }

    // TODO: Check user auth (Clerk)
    // TODO: Check user credits
    // TODO: Validate prompt (no inappropriate content)

    // Generate UI via Replicate
    const generation = await generateUI(prompt, style)

    // TODO: Deduct credits
    // TODO: Store generation in database
    // TODO: Upload PNG to storage

    return NextResponse.json({
      success: true,
      generation: {
        id: generation.id,
        imageUrl: generation.imageUrl,
        luauCode: generation.luauCode,
        prompt,
        style,
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Generation failed:', error)
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    )
  }
}

async function generateUI(prompt: string, style?: string) {
  const replicateToken = process.env.REPLICATE_API_TOKEN

  if (!replicateToken) {
    // Mock response for development
    return {
      id: `gen_${Date.now()}`,
      imageUrl: 'https://via.placeholder.com/512x512.png?text=UI+Preview',
      luauCode: generateLuauCode(prompt)
    }
  }

  // TODO: Integrate with Replicate Flux model
  // For now, return mock
  return {
    id: `gen_${Date.now()}`,
    imageUrl: 'https://via.placeholder.com/512x512.png?text=UI+Preview',
    luauCode: generateLuauCode(prompt)
  }
}

function generateLuauCode(prompt: string): string {
  // Basic Luau scaffold - will be enhanced by LLM later
  return `-- Generated from: "${prompt}"
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "GeneratedUI"
ScreenGui.ResetOnSpawn = false

local Frame = Instance.new("Frame")
Frame.Name = "MainFrame"
Frame.Size = UDim2.new(0, 200, 0, 100)
Frame.Position = UDim2.new(0.5, -100, 0.5, -50)
Frame.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
Frame.BorderSizePixel = 0
Frame.Parent = ScreenGui

local UICorner = Instance.new("UICorner")
UICorner.CornerRadius = UDim.new(0, 8)
UICorner.Parent = Frame

return ScreenGui
`
}
