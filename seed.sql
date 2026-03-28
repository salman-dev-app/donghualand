-- ==================== DonghuaLand Initial Seed ====================
-- This file seeds essential settings only.
-- Anime content is managed entirely through the Admin Panel.
-- Admin credentials are set via Cloudflare environment variables:
--   ADMIN_USERNAME and ADMIN_PASSWORD

-- Default site settings
INSERT OR IGNORE INTO settings (key, value) VALUES 
('site_name', 'DonghuaLand'),
('site_description', 'Watch Chinese Anime (Donghua) online for free in HD.'),
('contact_email', 'admin@donghualand.vip'),
('maintenance_mode', '0'),
('registration_enabled', '1'),
('comments_enabled', '1'),
('comments_require_login', '1'),
('comments_auto_approve', '1'),
-- Header branding (text-only, admin controllable)
('header_text', 'DonghuaLand'),
('header_size', 'medium'),
('header_style', 'bold'),
('header_color', '#a29bfe');
