import { hudforgeError, hudforgeJson, requireHudforgeUser } from '@/lib/hudforge-api'
import { createExportForGeneration } from '@/lib/hudforge-generation'

export async function POST(request: Request) {
  try {
    const userId = await requireHudforgeUser()
    const body = (await request.json()) as { generation_id?: unknown; generationId?: unknown }
    const generationId = typeof body.generation_id === 'string' ? body.generation_id : typeof body.generationId === 'string' ? body.generationId : ''
    const generation = await createExportForGeneration(userId, generationId)
    const exportPackage = generation.export_package

    return hudforgeJson({
      generation,
      exportPackage,
      export_package: exportPackage,
      generation_id: generation.id,
      status: exportPackage?.status ?? 'exported',
      package: exportPackage?.package,
      download_url: exportPackage?.download_url ?? null,
      byte_size: exportPackage?.byte_size ?? null,
      limitations: exportPackage?.limitations ?? [],
    })
  } catch (error) {
    return hudforgeError(error, 'Export failed')
  }
}
