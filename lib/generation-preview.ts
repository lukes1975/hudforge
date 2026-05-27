import type { GeneratedAsset, LayoutNode, LayoutSpec, LayoutVector } from './hudforge-generation'

export interface PreviewBoxStyle {
  left: string
  top: string
  width: string
  height: string
}

export interface PreviewRenderableNode {
  id: string
  type: LayoutNode['type']
  name: string
  assetRef: string | null
  text: string | null
  zIndex: number
  box: PreviewBoxStyle
  assetUrl: string | null
  missingAsset: boolean
}

export function buildAssetUrlMap(assets: GeneratedAsset[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const asset of assets) {
    if (asset.name && asset.url) map.set(asset.name, asset.url)
  }
  return map
}

export function layoutVectorToPixels(vector: LayoutVector, parentWidth: number, parentHeight: number, axis: 'x' | 'y'): number {
  if (axis === 'x') return vector.x_scale * parentWidth + vector.x_offset
  return vector.y_scale * parentHeight + vector.y_offset
}

export function layoutBoxToPercent(
  position: LayoutVector,
  size: LayoutVector,
  canvasWidth: number,
  canvasHeight: number,
): PreviewBoxStyle {
  const leftPx = layoutVectorToPixels(position, canvasWidth, canvasHeight, 'x')
  const topPx = layoutVectorToPixels(position, canvasWidth, canvasHeight, 'y')
  const widthPx = Math.max(layoutVectorToPixels(size, canvasWidth, canvasHeight, 'x'), 1)
  const heightPx = Math.max(layoutVectorToPixels(size, canvasWidth, canvasHeight, 'y'), 1)

  return {
    left: `${(leftPx / canvasWidth) * 100}%`,
    top: `${(topPx / canvasHeight) * 100}%`,
    width: `${(widthPx / canvasWidth) * 100}%`,
    height: `${(heightPx / canvasHeight) * 100}%`,
  }
}

export function resolvePreviewAssetUrl(assetRef: string | null, assetUrlMap: Map<string, string>): string | null {
  if (!assetRef) return null
  const url = assetUrlMap.get(assetRef)
  return url && url.trim() ? url : null
}

function flattenPreviewNodes(
  nodes: LayoutNode[],
  canvasWidth: number,
  canvasHeight: number,
  assetUrlMap: Map<string, string>,
  parentWidth = canvasWidth,
  parentHeight = canvasHeight,
  offsetX = 0,
  offsetY = 0,
): PreviewRenderableNode[] {
  const flattened: PreviewRenderableNode[] = []

  for (const node of nodes) {
    const leftPx = layoutVectorToPixels(node.position, parentWidth, parentHeight, 'x') + offsetX
    const topPx = layoutVectorToPixels(node.position, parentWidth, parentHeight, 'y') + offsetY
    const widthPx = Math.max(layoutVectorToPixels(node.size, parentWidth, parentHeight, 'x'), 1)
    const heightPx = Math.max(layoutVectorToPixels(node.size, parentWidth, parentHeight, 'y'), 1)

    const box: PreviewBoxStyle = {
      left: `${(leftPx / canvasWidth) * 100}%`,
      top: `${(topPx / canvasHeight) * 100}%`,
      width: `${(widthPx / canvasWidth) * 100}%`,
      height: `${(heightPx / canvasHeight) * 100}%`,
    }

    const assetUrl = resolvePreviewAssetUrl(node.asset_ref, assetUrlMap)
    const missingAsset = Boolean(node.asset_ref && !assetUrl)

    flattened.push({
      id: node.id,
      type: node.type,
      name: node.name,
      assetRef: node.asset_ref,
      text: node.text,
      zIndex: node.z_index,
      box,
      assetUrl,
      missingAsset,
    })

    if (node.children.length > 0) {
      flattened.push(...flattenPreviewNodes(node.children, canvasWidth, canvasHeight, assetUrlMap, widthPx, heightPx, leftPx, topPx))
    }
  }

  return flattened
}

export function buildPreviewRenderableNodes(layoutSpec: LayoutSpec, assets: GeneratedAsset[]): PreviewRenderableNode[] {
  const assetUrlMap = buildAssetUrlMap(assets)
  const { width, height } = layoutSpec.canvas
  return flattenPreviewNodes(layoutSpec.nodes, width, height, assetUrlMap).sort((a, b) => a.zIndex - b.zIndex)
}

export function countPreviewImageNodes(nodes: PreviewRenderableNode[]): { total: number; withUrl: number; missing: number } {
  const imageNodes = nodes.filter((node) => node.assetRef !== null)
  const withUrl = imageNodes.filter((node) => node.assetUrl).length
  return { total: imageNodes.length, withUrl, missing: imageNodes.length - withUrl }
}
