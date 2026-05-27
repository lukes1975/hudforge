'use client'

import { useCallback, useEffect, useState } from 'react'
import { GenerationWorkbench } from '@/components/generator/GenerationWorkbench'
import { ChatForge } from '@/components/workspace/ChatForge'
import { GenerationRitual } from '@/components/workspace/GenerationRitual'
import { StudioStub } from '@/components/workspace/StudioStub'
import type { GenerationStyle } from '@/lib/hudforge-generation'
import { useGenerationFlow } from '@/lib/use-generation-flow'
import {
  buildSelectedUiTypesPromptAugmentation,
  resolvePrimaryBackendUiType,
  type WorkspaceUiTypeId,
} from '@/lib/ui-type-registry'

type WorkspaceMode = 'forge' | 'ritual' | 'studio-stub'

type ForgePayload = {
  prompt: string
  selectedUiTypes: WorkspaceUiTypeId[]
  style: GenerationStyle
}

type DashboardWorkspaceProps = {
  generationCount: number
  startNewProject?: boolean
}

export function DashboardWorkspace({ generationCount, startNewProject = false }: DashboardWorkspaceProps) {
  const showChatForge = generationCount === 0 || startNewProject
  const chatForgeVariant = generationCount === 0 ? 'light' : 'dark'

  const [mode, setMode] = useState<WorkspaceMode>('forge')
  const [forgePayload, setForgePayload] = useState<ForgePayload | null>(null)

  const {
    status,
    generation,
    assetProgress,
    queueTier,
    errorMessage,
    isSubmitting,
    runGeneration,
    reset,
  } = useGenerationFlow()

  useEffect(() => {
    if (status === 'preview_ready' && generation) {
      setMode('studio-stub')
    }
  }, [status, generation])

  const handleChatForgeSubmit = useCallback(
    async (payload: ForgePayload) => {
      setForgePayload(payload)
      setMode('ritual')

      const augmentedPrompt = `${payload.prompt.trim()}${buildSelectedUiTypesPromptAugmentation(payload.selectedUiTypes)}`

      await runGeneration({
        prompt: augmentedPrompt,
        uiType: resolvePrimaryBackendUiType(payload.selectedUiTypes),
        style: payload.style,
      })
    },
    [runGeneration],
  )

  const handleRetry = useCallback(() => {
    reset()
    setMode('forge')
  }, [reset])

  if (!showChatForge) {
    return <GenerationWorkbench />
  }

  if (mode === 'studio-stub' && generation) {
    return <StudioStub generation={generation} hasPriorGenerations={generationCount > 0} />
  }

  if (mode === 'ritual' && forgePayload) {
    return (
      <>
        <GenerationRitual
          prompt={forgePayload.prompt}
          selectedUiTypes={forgePayload.selectedUiTypes}
          style={forgePayload.style}
          status={status}
          assetProgress={assetProgress}
          queueTier={queueTier}
          errorMessage={errorMessage}
          onRetry={handleRetry}
        />
      </>
    )
  }

  return (
    <ChatForge
      variant={chatForgeVariant}
      onSubmit={handleChatForgeSubmit}
      isSubmitting={isSubmitting}
      showBackLink={startNewProject && generationCount > 0}
    />
  )
}
