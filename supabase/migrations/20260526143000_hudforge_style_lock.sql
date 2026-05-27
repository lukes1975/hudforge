-- HUDForge style lock projects + generation project linkage
-- Created: 2026-05-26

CREATE TABLE IF NOT EXISTS hudforge_projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES hudforge_profiles(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    style_profile JSONB,
    locked_at TIMESTAMP WITH TIME ZONE,
    source_generation_id TEXT REFERENCES hudforge_generations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE hudforge_generations
ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES hudforge_projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_hudforge_projects_user_updated ON hudforge_projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_hudforge_generations_project ON hudforge_generations(project_id);

ALTER TABLE hudforge_projects ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_hudforge_projects_updated_at ON hudforge_projects;
CREATE TRIGGER trigger_hudforge_projects_updated_at
BEFORE UPDATE ON hudforge_projects
FOR EACH ROW EXECUTE FUNCTION hudforge_touch_updated_at();
