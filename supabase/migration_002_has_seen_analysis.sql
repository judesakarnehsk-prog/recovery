-- Add has_seen_analysis flag to users table
-- Controls whether the Business Analyzer CTA card is shown on the dashboard
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_seen_analysis BOOLEAN DEFAULT FALSE;
