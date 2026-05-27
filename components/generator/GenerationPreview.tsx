'use client'

import { useMemo } from 'react'
import type { GeneratedAsset, LayoutSpec } from '@/lib/hudforge-generation'
import { buildPreviewRenderableNodes } from '@/lib/generation-preview'

type GenerationPreviewProps = {
  layoutSpec?: LayoutSpec
  assets: GeneratedAsset[]
  title?: string
  isGenerating?: boolean
}

export function GenerationPreview({ layoutSpec, assets, title, isGenerating = false }: GenerationPreviewProps) {
  const renderNodes = useMemo(() => (layoutSpec ? buildPreviewRenderableNodes(layoutSpec, assets) : []), [layoutSpec, assets])
  const canvas = layoutSpec?.canvas
  const aspectRatio = canvas ? `${canvas.width} / ${canvas.height}` : '390 / 844'

  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="relative mx-auto max-w-[390px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#090A1A] shadow-2xl">
        <div className="absolute inset-x-16 top-3 z-20 h-1.5 rounded-full bg-white/20" />
        <div className="relative w-full" style={{ aspectRatio }}>
          {!layoutSpec ? (
            <PreviewPlaceholder title={title} isGenerating={isGenerating} />
          ) : (
            <div className="absolute inset-0 overflow-hidden bg-[#090A1A]">
              {renderNodes.map((node) => (
                <PreviewNode key={node.id} node={node} isGenerating={isGenerating} />
              ))}
              {isGenerating ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 border-t border-cyan-400/20 bg-cyan-950/80 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.18em] text-cyan-100">
                  Generating assets…
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      {layoutSpec && assets.length > 0 ? (
        <p className="mt-3 text-center text-xs text-slate-500">
          Composited from layout spec + {assets.filter((asset) => asset.url).length}/{assets.length} generated assets
        </p>
      ) : null}
    </div>
  )
}

function PreviewPlaceholder({ title, isGenerating }: { title?: string; isGenerating?: boolean }) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="grid w-full max-w-[240px] grid-cols-3 gap-2">
        {['Panel', 'Button', 'Icon'].map((label) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <div className="mt-2 h-8 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-400">{isGenerating ? 'Building your UI preview…' : title ?? 'Run generate to preview layout and assets'}</p>
    </div>
  )
}

function PreviewNode({ node, isGenerating }: { node: ReturnType<typeof buildPreviewRenderableNodes>[number]; isGenerating: boolean }) {
  const showSkeleton = node.missingAsset || (node.assetRef && isGenerating && !node.assetUrl)
  const isTextOnly = !node.assetRef && node.text
  const isButton = node.type === 'TextButton'

  return (
    <div
      className="absolute overflow-hidden"
      style={{
        left: node.box.left,
        top: node.box.top,
        width: node.box.width,
        height: node.box.height,
        zIndex: node.zIndex,
      }}
    >
      {showSkeleton ? (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-md border border-dashed border-white/15 bg-white/[0.04] px-1">
          <span className="text-[9px] uppercase tracking-[0.14em] text-slate-500">{node.assetRef ?? node.name}</span>
          <div className="mt-1 h-2/3 w-4/5 animate-pulse rounded bg-white/10" />
        </div>
      ) : node.assetUrl ? (
        <div className="relative h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={node.assetUrl} alt={node.name} className="h-full w-full object-contain object-center" />
          {node.text ? (
            <span className="absolute inset-0 flex items-center justify-center px-1 text-center text-[10px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] sm:text-xs">
              {node.text}
            </span>
          ) : null}
        </div>
      ) : isTextOnly ? (
        <div
          className={`flex h-full w-full items-center justify-center px-1 text-center font-semibold text-white ${isButton ? 'rounded-lg bg-[#7C5CFF]/80' : 'bg-transparent'}`}
          style={{ fontSize: 'clamp(8px, 2.5vw, 14px)' }}
        >
          {node.text}
        </div>
      ) : (
        <div className="h-full w-full rounded-md border border-white/10 bg-[#15122B]/90" />
      )}
    </div>
  )
}
