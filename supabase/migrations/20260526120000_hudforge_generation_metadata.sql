-- Add metadata JSONB to hudforge_generations for idempotency keys and extensibility
-- Created: 2026-05-26

ALTER TABLE hudforge_generations
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hudforge_generations_user_idempotency
ON hudforge_generations (user_id, ((metadata->>'idempotency_key')))
WHERE metadata->>'idempotency_key' IS NOT NULL;
