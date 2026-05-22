import { AppShell } from '@/components/app/AppShell'
import { SettingsPanel } from '@/components/app/SettingsPanel'

export default function SettingsPage() {
  return (
    <AppShell title="Settings" description="Workspace defaults for generation style, device target, and export behavior.">
      <SettingsPanel />
    </AppShell>
  )
}
