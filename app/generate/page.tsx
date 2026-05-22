import type { Metadata } from 'next'
import { AppShell } from '@/components/app/AppShell'
import { GenerationWorkbench } from '@/components/generator/GenerationWorkbench'

export const metadata: Metadata = {
  title: 'Generate | HUDForge',
  description: 'Create a structured Roblox UI spec, mock assets, preview, and json_payload export package.',
}

export default function GeneratePage() {
  return (
    <AppShell
      title="Generate"
      description="Prompt, optimize into a Roblox UI spec, generate mock-safe assets, preview the result, and export a usable package."
    >
      <GenerationWorkbench />
    </AppShell>
  )
}
