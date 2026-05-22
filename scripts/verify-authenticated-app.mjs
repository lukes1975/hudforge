import { chromium } from '@playwright/test'

const baseUrl = process.env.HUDFORGE_E2E_BASE_URL ?? 'http://localhost:3000'
const e2eUser = process.env.HUDFORGE_E2E_USER ?? 'local-e2e-user'
const mvpPrompt = 'Create a neon anime simulator shop UI with coins, gems, buy buttons, and a close button. Make it mobile-friendly.'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function expectNoConsoleErrors(page, action) {
  const errors = []
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    if (text.includes('/_next/webpack-hmr')) return
    errors.push(text)
  })
  page.on('pageerror', (error) => errors.push(error.message))
  await action()
  assert(errors.length === 0, `Console/page errors found:\n${errors.join('\n')}`)
}

async function openRoute(page, route) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'commit', timeout: 15_000 })
  await page.waitForLoadState('domcontentloaded', { timeout: 15_000 }).catch(() => undefined)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    extraHTTPHeaders: {
      'x-hudforge-e2e-user': e2eUser,
    },
    viewport: { width: 1440, height: 1100 },
    acceptDownloads: true,
  })

  const page = await context.newPage()

  try {
    await expectNoConsoleErrors(page, async () => {
      for (const route of ['/dashboard', '/generate', '/projects', '/settings', '/billing']) {
        console.log(`route ${route}`)
        await openRoute(page, route)
        assert(!page.url().includes('/sign-in'), `${route} redirected to sign-in; auth bypass/session failed`)
        await page.getByText(/authenticated workspace/i).first().waitFor({ timeout: 15_000 })
      }

      console.log('flow /generate')
      await openRoute(page, '/generate')
      await page.locator('form textarea').fill(mvpPrompt)
      await page.locator('form button[type="submit"]').click()
      await page.getByText('Preview ready').first().waitFor({ timeout: 20_000 })
      await page.getByText('Assets ready').first().waitFor({ timeout: 20_000 })
      const exportResponsePromise = page.waitForResponse((response) => response.url().includes('/api/generate/export') && response.request().method() === 'POST')
      await page.getByRole('button', { name: 'Build export' }).click()
      const exportPayload = await (await exportResponsePromise).json()
      const exportFilePaths = exportPayload.export_package?.files?.map((file) => file.path) ?? exportPayload.exportPackage?.files?.map((file) => file.path) ?? []
      assert(exportFilePaths.includes('manifest.json'), 'Export payload missing manifest.json')
      assert(exportFilePaths.includes('layout.json'), 'Export payload missing layout.json')
      assert(exportFilePaths.includes('code/MainUI.lua'), 'Export payload missing code/MainUI.lua')
      await page.getByText('Exported').first().waitFor({ timeout: 20_000 })
      await page.getByText('code/MainUI.lua').first().waitFor({ timeout: 10_000 })
      await page.getByText('local ScreenGui = Instance.new("ScreenGui")').first().waitFor({ timeout: 10_000 })

      console.log('flow /projects')
      await openRoute(page, '/projects')
      await page.getByRole('heading', { name: 'Generation history' }).waitFor({ timeout: 15_000 })
      await page.getByText('Simulator Shop UI').first().waitFor({ timeout: 15_000 })
      await page.getByText('4 package files ready').first().waitFor({ timeout: 15_000 })
      const exportAgainResponsePromise = page.waitForResponse((response) => response.url().includes('/api/generate/export') && response.request().method() === 'POST')
      await page.getByRole('button', { name: 'Export again' }).first().click()
      const exportAgainPayload = await (await exportAgainResponsePromise).json()
      const exportAgainFilePaths = exportAgainPayload.export_package?.files?.map((file) => file.path) ?? exportAgainPayload.exportPackage?.files?.map((file) => file.path) ?? []
      assert(exportAgainFilePaths.includes('manifest.json'), 'Export-again payload missing manifest.json')
      assert(exportAgainFilePaths.includes('layout.json'), 'Export-again payload missing layout.json')
      assert(exportAgainFilePaths.includes('code/MainUI.lua'), 'Export-again payload missing code/MainUI.lua')
      await page.getByText('4 package files ready').first().waitFor({ timeout: 15_000 })

      console.log('flow /settings')
      await openRoute(page, '/settings')
      await page.getByText('Generation defaults').waitFor({ timeout: 15_000 })
      await page.locator('select').nth(0).selectOption('inventory')
      await page.locator('select').nth(1).selectOption('minimal')
      await page.locator('select').nth(2).selectOption('manifest')
      await page.getByRole('button', { name: 'Save settings' }).click()
      await page.getByText('Settings saved to the existing mock-safe settings API.').waitFor({ timeout: 15_000 })
      await page.locator('aside').getByText('Inventory').waitFor({ timeout: 15_000 })
      await page.locator('aside').getByText('Minimal').waitFor({ timeout: 15_000 })
      await page.locator('aside').getByText('manifest').waitFor({ timeout: 15_000 })

      console.log('flow /billing')
      await openRoute(page, '/billing')
      await page.getByText('Mock mode').first().waitFor({ timeout: 15_000 })
      await page.getByText('Credits left').first().waitFor({ timeout: 15_000 })
      await page.getByText('Checkout not configured').first().waitFor({ timeout: 15_000 })
    })

    console.log(JSON.stringify({
      ok: true,
      auth: 'HUD_FORGE_E2E_AUTH_BYPASS=1 + x-hudforge-e2e-user header',
      routes: ['/dashboard', '/generate', '/projects', '/settings', '/billing'],
      generatedPrompt: mvpPrompt,
    }, null, 2))
  } finally {
    await context.close()
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
