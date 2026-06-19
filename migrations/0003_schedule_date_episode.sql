-- Migration: 0003_schedule_date_episode
-- Adds air_date (specific episode air date) and next_ep_title columns to schedule table
-- These power the date-based schedule system on the homepage and schedule page

-- Add air_date column — stores the specific YYYY-MM-DD date when next episode airs
-- When set, this date is used to auto-highlight the correct day tab on homepage/schedule page
ALTER TABLE schedule ADD COLUMN air_date TEXT;

-- Add next_ep_title column — optional title for the upcoming episode
ALTER TABLE schedule ADD COLUMN next_ep_title TEXT;

-- Index for efficient date-based lookups
CREATE INDEX IF NOT EXISTS idx_schedule_air_date ON schedule(air_date);

-- Index for day + date combined sorting
CREATE INDEX IF NOT EXISTS idx_schedule_day_date ON schedule(day_of_week, air_date, air_time);
