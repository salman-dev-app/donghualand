-- Migration: 0002_schedule_enhancements
-- Adds next_episode and notes columns to schedule table for enhanced scheduling

-- Add next_episode column (tracks the next upcoming episode number for this slot)
ALTER TABLE schedule ADD COLUMN next_episode INTEGER;

-- Add notes column (e.g. "Season 2 — airs every Friday at 20:00 CST")
ALTER TABLE schedule ADD COLUMN notes TEXT;

-- Update index to include air_time ordering
CREATE INDEX IF NOT EXISTS idx_schedule_day_time ON schedule(day_of_week, air_time);
