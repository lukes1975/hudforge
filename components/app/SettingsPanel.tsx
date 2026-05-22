'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { generationStyleOptions, generationUiTypeOptions } from '@/lib/generation-workbench'
import type { UserSettings } from '@/lib/hudforge-generation'
import { formatGenerationStyle, formatUiType } from '@/lib/hudforge-client'

type SettingsResponse = {
  success: boolean
  settings?: UserSettings
  error?: { message: string }
}

const exportFormats: Array<{ label: string; value: UserSettings['default_export_format'] }> = [
  { label: 'ZIP-ready package', value: 'zip' },
  { label: 'Lua only', value: 'lua' },
  { label: 'Manifest only', value: 'manifest' },
]

export function SettingsPanel() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [draft, setDraft] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSettings() {
      setLoading(true)
      setError(null)
      try {
        const payload = await fetchJson<SettingsResponse>('/api/settings')
        if (!payload.success || !payload.settings) throw new Error(payload.error?.message ?? 'Failed to load settings')
        if (active) {
          setSettings(payload.settings)
          setDraft(payload.settings)
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load settings')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadSettings()
    return () => {
      active = false
    }
  }, [])

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) return

    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const payload = await fetchJson<SettingsResponse>('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!payload.success || !payload.settings) throw new Error(payload.error?.message ?? 'Failed to save settings')
      setSettings(payload.settings)
      setDraft(payload.settings)
      setMessage('Settings saved to the existing mock-safe settings API.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <StatusCard title="Loading settings" detail="Fetching GET /api/settings..." />
  }

  if (!draft) {
    return <StatusCard tone="error" title="Settings unavailable" detail={error ?? 'The settings API did not return workspace defaults.'} />
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
      <form onSubmit={saveSettings} className="rune-card space-y-5 p-6">
        <div>
          <p className="section-kicker">Live preferences</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Generation defaults</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">This form reads and writes the existing /api/settings route. Persistence is mock-safe server memory until Supabase generation tables are approved.</p>
        </div>

        {error ? <InlineNotice tone="error" text={error} /> : null}
        {message ? <InlineNotice text={message} /> : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Default UI type</span>
          <select value={draft.default_ui_type} onChange={(event) => setDraft({ ...draft, default_ui_type: event.target.value as UserSettings['default_ui_type'] })} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
            {generationUiTypeOptions.map((option) => <option key={option.value} value={option.value} className="bg-slate-950 text-white">{option.label}</option>)}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Default style</span>
          <select value={draft.default_style} onChange={(event) => setDraft({ ...draft, default_style: event.target.value as UserSettings['default_style'] })} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
            {generationStyleOptions.map((option) => <option key={option.value} value={option.value} className="bg-slate-950 text-white">{option.label}</option>)}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Export preference</span>
          <select value={draft.default_export_format} onChange={(event) => setDraft({ ...draft, default_export_format: event.target.value as UserSettings['default_export_format'] })} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
            {exportFormats.map((option) => <option key={option.value} value={option.value} className="bg-slate-950 text-white">{option.label}</option>)}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleCard label="Mobile-first canvas" checked={draft.mobile_first} onChange={(checked) => setDraft({ ...draft, mobile_first: checked })} />
          <ToggleCard label="Save generation history" checked={draft.save_history} onChange={(checked) => setDraft({ ...draft, save_history: checked })} />
        </div>

        <button type="submit" disabled={saving} className="forge-button forge-button--primary">{saving ? 'Saving...' : 'Save settings'}</button>
      </form>

      <aside className="rune-card p-6">
        <p className="section-kicker">Current API state</p>
        <div className="mt-5 grid gap-4">
          <SummaryRow label="UI type" value={formatUiType(settings?.default_ui_type ?? draft.default_ui_type)} />
          <SummaryRow label="Style" value={formatGenerationStyle(settings?.default_style ?? draft.default_style)} />
          <SummaryRow label="Export" value={settings?.default_export_format ?? draft.default_export_format} />
          <SummaryRow label="Canvas" value={(settings?.mobile_first ?? draft.mobile_first) ? 'Mobile first' : 'Desktop'} />
          <SummaryRow label="History" value={(settings?.save_history ?? draft.save_history) ? 'Enabled' : 'Disabled'} />
        </div>
      </aside>
    </div>
  )
}

function ToggleCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-cyan-300" />
    </label>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function InlineNotice({ text, tone = 'default' }: { text: string; tone?: 'default' | 'error' }) {
  return <p className={`rounded-lg border px-3 py-2 text-sm ${tone === 'error' ? 'border-red-400/30 bg-red-500/10 text-red-100' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'}`}>{text}</p>
}

function StatusCard({ title, detail, tone = 'default' }: { title: string; detail: string; tone?: 'default' | 'error' }) {
  return (
    <section className={`rune-card p-6 ${tone === 'error' ? 'border-red-400/30' : ''}`}>
      <p className="section-kicker">Settings</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">{detail}</p>
    </section>
  )
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const payload = (await response.json()) as T
  if (!response.ok) {
    const maybeError = payload as { error?: { message?: string } }
    throw new Error(maybeError.error?.message ?? `Request failed with ${response.status}`)
  }
  return payload
}
