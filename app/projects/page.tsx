import { AppShell } from '@/components/app/AppShell'
import { ProjectsPanel } from '@/components/app/ProjectsPanel'

export default function ProjectsPage() {
  return (
    <AppShell title="Projects" description="Recent generation history and export state from the authenticated generation API.">
      <ProjectsPanel />
    </AppShell>
  )
}
