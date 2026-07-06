-- Add onboarding_complete flag to users table.
-- New users land on /onboarding before /dashboard until this is true.
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- Mark existing users as already onboarded so they are not redirected.
-- Criteria: has a business name set, or account is older than 1 day.
UPDATE users
SET onboarding_complete = true
WHERE company_name IS NOT NULL
   OR created_at < NOW() - INTERVAL '1 day';
