'use client'

import { useCallback, useState } from 'react'
import { GenerationWorkbench } from '@/components/generator/GenerationWorkbench'
import { ChatForge } from '@/components/workspace/ChatForge'
import type { GenerationStyle } from '@/lib/hudforge-generation'
import type { WorkspaceUiTypeId } from '@/lib/ui-type-registry'

type DashboardWorkspaceProps = {
  generationCount: number
}

export function DashboardWorkspace({ generationCount }: DashboardWorkspaceProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChatForgeSubmit = useCallback(
    async (payload: { prompt: string; selectedUiTypes: WorkspaceUiTypeId[]; style: GenerationStyle }) => {
      setIsSubmitting(true)
      try {
        // Step 5 wires the generation API; stub for onboarding shell preview.
        console.info('[ChatForge] submit stub', payload)
      } finally {
        setIsSubmitting(false)
      }
    },
    [],
  )

  if (generationCount === 0) {
    return (
      <ChatForge
        variant="light"
        onSubmit={handleChatForgeSubmit}
        isSubmitting={isSubmitting}
      />
    )
  }

  return <GenerationWorkbench />
}
