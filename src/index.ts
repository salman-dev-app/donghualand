import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { getCookie } from 'hono/cookie'

// Routes
import { animeRoutes } from './routes/anime'
import { episodeRoutes } from './routes/episodes'
import { userRoutes } from './routes/users'
import { adminRoutes } from './routes/admin'
import { searchRoutes } from './routes/search'
import { tmdbRoutes } from './routes/tmdb'
import { commentRoutes } from './routes/comments'
import { uploadRoutes } from './routes/upload'

// Page templates
import { homePage } from './pages/home'
import { animePage } from './pages/anime'
import { watchPage } from './pages/watch'
import { searchPage } from './pages/search'
import { loginPage } from './pages/login'
import { registerPage } from './pages/register'
import { adminLoginPage, adminPanelPage } from './pages/adminPanel'
import { notFoundPage } from './pages/404'
import { watchlistPage } from './pages/watchlist'
import { profilePage } from './pages/profile'
import { historyPage } from './pages/history'
import { settingsPage } from './pages/settings'
import { schedulePage } from './pages/schedule'
import { aboutPage, contactPage, privacyPage, termsPage, dmcaPage } from './pages/staticPages'

// ============================================================
// HELPERS
// ============================================================

const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: 'DonghuaLand',
  site_description: 'Watch Chinese Anime (Donghua) online for free in HD.',
  contact_email: '',
  dmca_email: '',
  privacy_email: '',
  about_email: '',
  registration_enabled: '1',
  maintenance_mode: '0',
  social_discord: '',
  social_twitter: '',
  social_reddit: '',
  social_telegram: '',
  social_facebook: '',
  social_youtube: '',
  social_instagram: '',
  social_tiktok: '',
}

async function getSiteSettings(db: D1Database | undefined): Promise<Record<string, string>> {
  const result: Record<string, string> = { ...DEFAULT_SETTINGS }
  if (!db) return result
  try {
    const rows = await db.prepare('SELECT key, value FROM settings').all()
    if (rows.results) rows.results.forEach((s: any) => { result[s.key] = s.value })
  } catch { /* return defaults */ }
  return result
}

type Bindings = {
  DB: D1Database
  TMDB_API_KEY: string
  JWT_SECRET: string
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string
  IMGBB_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Static files
app.use('/static/*', serveStatic({ root: './' }))

// ============================================================
// MAINTENANCE MODE MIDDLEWARE
// Blocks all non-admin routes when maintenance_mode = '1'
// ============================================================
app.use('*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  // Always allow admin routes and static assets through
  const isExempt = path.startsWith('/admin') ||
    path.startsWith('/api/admin') ||
    path.startsWith('/static') ||
    path === '/api/site-settings' ||
    path === '/api/broadcasts/active'
  if (isExempt) return next()

  const db = c.env?.DB
  if (db) {
    try {
      const row = await db.prepare(
        "SELECT value FROM settings WHERE key='maintenance_mode'"
      ).first() as any
      if (row && row.value === '1') {
        // Show maintenance page for HTML requests
        const accept = c.req.header('Accept') || ''
        if (accept.includes('text/html')) {
          return c.html(`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Maintenance - DonghuaLand</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0a0f;color:#f0f0f5;font-family:system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.wrap{text-align:center;max-width:480px}
.icon{font-size:72px;color:#6c5ce7;margin-bottom:24px}
h1{font-size:32px;font-weight:900;margin-bottom:12px}
p{font-size:15px;color:#808090;line-height:1.7;margin-bottom:24px}
.badge{display:inline-flex;align-items:center;gap:8px;background:rgba(108,92,231,0.15);color:#a29bfe;border:1px solid rgba(108,92,231,0.35);padding:8px 20px;border-radius:999px;font-size:13px;font-weight:700}
</style></head><body>
<div class="wrap">
  <div class="icon"><i class="fas fa-tools"></i></div>
  <h1>Under Maintenance</h1>
  <p>We are currently performing scheduled maintenance. We'll be back shortly. Thank you for your patience!</p>
  <div class="badge"><i class="fas fa-clock"></i> Back Soon</div>
</div>
</body></html>`, 503)
        }
        // For API requests return JSON
        return c.json({ error: 'Site is under maintenance', maintenance: true }, 503)
      }
    } catch { /* ignore, proceed normally */ }
  }
  return next()
})

// API Routes
app.route('/api/anime', animeRoutes)
app.route('/api/episodes', episodeRoutes)
app.route('/api/users', userRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/search', searchRoutes)
app.route('/api/tmdb', tmdbRoutes)
app.route('/api/comments', commentRoutes)
app.route('/api/upload', uploadRoutes)

// ============================================================
// PUBLIC SETTINGS & BROADCASTS API
// ============================================================

// Public site settings (for frontend to read site name, socials, etc.)
app.get('/api/site-settings', async (c) => {
  const db = c.env?.DB
  const settings = await getSiteSettings(db)
  // Only expose safe public fields
  return c.json({
    success: true,
    data: {
      site_name: settings.site_name,
      site_description: settings.site_description,
      contact_email: settings.contact_email,
      dmca_email: settings.dmca_email,
      privacy_email: settings.privacy_email,
      about_email: settings.about_email,
      social_discord: settings.social_discord,
      social_twitter: settings.social_twitter,
      social_reddit: settings.social_reddit,
      social_telegram: settings.social_telegram,
      social_facebook: settings.social_facebook,
      social_youtube: settings.social_youtube,
      social_instagram: settings.social_instagram,
      social_tiktok: settings.social_tiktok,
    }
  })
})

// Public active broadcasts
app.get('/api/broadcasts/active', async (c) => {
  const db = c.env?.DB
  if (!db) return c.json({ success: true, data: [] })
  try {
    const data = await db.prepare(
      'SELECT id, message, type FROM broadcasts WHERE is_active=1 ORDER BY created_at DESC LIMIT 5'
    ).all()
    return c.json({ success: true, data: data.results || [] })
  } catch { return c.json({ success: true, data: [] }) }
})

// ============================================================
// FRONTEND PAGES
// ============================================================

// Home page
app.get('/', async (c) => {
  const db = c.env?.DB
  try {
    if (!db) throw new Error('Database not configured')

    const featured = await db.prepare(`
      SELECT * FROM anime WHERE is_featured = 1 ORDER BY updated_at DESC LIMIT 5
    `).all()

    const trending = await db.prepare(`
      SELECT * FROM anime WHERE is_trending = 1 ORDER BY view_count DESC LIMIT 10
    `).all()

    const recent = await db.prepare(`
      SELECT a.*, MAX(e.created_at) as latest_ep_date, MAX(e.episode_number) as latest_ep,
      COUNT(e.id) as total_eps
      FROM anime a LEFT JOIN episodes e ON a.id = e.anime_id
      GROUP BY a.id ORDER BY latest_ep_date DESC LIMIT 10
    `).all()

    const popular = await db.prepare(`
      SELECT * FROM anime ORDER BY view_count DESC LIMIT 12
    `).all()

    const ongoing = await db.prepare(`
      SELECT a.*, MAX(e.episode_number) as latest_ep
      FROM anime a LEFT JOIN episodes e ON a.id = e.anime_id
      WHERE a.status = 'Ongoing'
      GROUP BY a.id ORDER BY a.updated_at DESC LIMIT 12
    `).all()

    const schedule = await db.prepare(`
      SELECT s.*, a.title, a.cover_image, a.slug, a.status
      FROM schedule s JOIN anime a ON s.anime_id = a.id
      ORDER BY s.day_of_week
    `).all()

    return c.html(homePage({
      featured: featured.results as any[],
      trending: trending.results as any[],
      recent: recent.results as any[],
      popular: popular.results as any[],
      ongoing: ongoing.results as any[],
      schedule: schedule.results as any[],
    }))
  } catch (e: any) {
    // Show empty home page with welcome message instead of demo data
    return c.html(homePage({
      featured: [],
      trending: [],
      recent: [],
      popular: [],
      ongoing: [],
      schedule: [],
    }))
  }
})

// Anime detail page
app.get('/anime/:slug', async (c) => {
  const slug = c.req.param('slug')
  const db = c.env?.DB

  try {
    if (!db) throw new Error('Database not configured')
    const anime = await db.prepare('SELECT * FROM anime WHERE slug = ?').bind(slug).first()
    if (!anime) return c.html(notFoundPage(), 404)

    const episodes = await db.prepare(
      'SELECT * FROM episodes WHERE anime_id = ? ORDER BY episode_number ASC'
    ).bind((anime as any).id).all()

    const related = await db.prepare(`
      SELECT * FROM anime WHERE id != ? ORDER BY view_count DESC LIMIT 8
    `).bind((anime as any).id).all()

    await db.prepare('UPDATE anime SET view_count = view_count + 1 WHERE id = ?').bind((anime as any).id).run()

    return c.html(animePage({
      anime: anime as any,
      episodes: episodes.results as any[],
      related: related.results as any[]
    }))
  } catch (e: any) {
    return c.html(notFoundPage(), 404)
  }
})

// Watch episode page
app.get('/watch/:watchpath{.+-episode-[0-9]+}', async (c) => {
  const watchpath = c.req.param('watchpath')
  const epMatch = watchpath.match(/^(.+)-episode-(\d+)$/)
  if (!epMatch) return c.html(notFoundPage(), 404)
  const slug = epMatch[1]
  const epNum = parseInt(epMatch[2])
  const db = c.env?.DB

  try {
    if (!db) throw new Error('Database not configured')
    const anime = await db.prepare('SELECT * FROM anime WHERE slug = ?').bind(slug).first()
    if (!anime) return c.html(notFoundPage(), 404)

    const episode = await db.prepare(
      'SELECT * FROM episodes WHERE anime_id = ? AND episode_number = ?'
    ).bind((anime as any).id, epNum).first()

    if (!episode) return c.html(notFoundPage(), 404)

    const allEpisodes = await db.prepare(
      'SELECT * FROM episodes WHERE anime_id = ? ORDER BY episode_number ASC'
    ).bind((anime as any).id).all()

    const allEps = allEpisodes.results as any[]
    const prevEp = allEps.find((e: any) => e.episode_number === epNum - 1) || null
    const nextEp = allEps.find((e: any) => e.episode_number === epNum + 1) || null

    await db.prepare('UPDATE episodes SET view_count = view_count + 1 WHERE id = ?').bind((episode as any).id).run()

    return c.html(watchPage({
      anime: anime as any,
      episode: episode as any,
      allEpisodes: allEps,
      prevEp,
      nextEp
    }))
  } catch (e: any) {
    return c.html(notFoundPage(), 404)
  }
})

// Search page
app.get('/search', async (c) => {
  const q = c.req.query('q') || ''
  const status = c.req.query('status') || ''
  const genre = c.req.query('genre') || ''
  const type = c.req.query('type') || ''
  const year = c.req.query('year') || ''
  const page = parseInt(c.req.query('page') || '1')
  const perPage = 24
  const db = c.env?.DB

  try {
    if (!db) throw new Error('Database not configured')
    let query = 'SELECT a.*, MAX(e.episode_number) as latest_ep FROM anime a LEFT JOIN episodes e ON a.id = e.anime_id WHERE 1=1'
    let countQuery = 'SELECT COUNT(DISTINCT a.id) as total FROM anime a WHERE 1=1'
    const params: any[] = []
    const countParams: any[] = []

    if (q) {
      const cond = ' AND (a.title LIKE ? OR a.title_native LIKE ? OR a.title_english LIKE ?)'
      query += cond; countQuery += cond
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
      countParams.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }
    if (status) { const cond = ' AND a.status = ?'; query += cond; countQuery += cond; params.push(status); countParams.push(status) }
    if (genre) { const cond = ' AND a.genres LIKE ?'; query += cond; countQuery += cond; params.push(`%${genre}%`); countParams.push(`%${genre}%`) }
    if (type) { const cond = ' AND a.type = ?'; query += cond; countQuery += cond; params.push(type); countParams.push(type) }
    if (year) { const cond = ' AND a.release_year = ?'; query += cond; countQuery += cond; params.push(parseInt(year)); countParams.push(parseInt(year)) }

    query += ' GROUP BY a.id ORDER BY a.view_count DESC LIMIT ? OFFSET ?'
    params.push(perPage, (page - 1) * perPage)

    const [results, countRes] = await Promise.all([
      db.prepare(query).bind(...params).all(),
      db.prepare(countQuery).bind(...countParams).first()
    ])
    const total = (countRes as any)?.total || 0

    return c.html(searchPage({
      results: results.results as any[],
      total, page, perPage,
      q, status, genre, type
    }))
  } catch (e: any) {
    return c.html(searchPage({
      results: [],
      total: 0, page: 1, perPage,
      q, status, genre, type
    }))
  }
})

// Quick search API (no demo fallback)
app.get('/api/search/quick', async (c) => {
  const q = c.req.query('q') || ''
  const db = c.env?.DB
  try {
    if (!db || !q) return c.json({ data: [] })
    const results = await db.prepare(`
      SELECT id, title, title_native, slug, cover_image, type, status, release_year
      FROM anime WHERE title LIKE ? OR title_native LIKE ? OR title_english LIKE ?
      ORDER BY view_count DESC LIMIT 8
    `).bind(`%${q}%`, `%${q}%`, `%${q}%`).all()
    return c.json({ data: results.results || [] })
  } catch {
    return c.json({ data: [] })
  }
})

// User auth pages
app.get('/user/login', (c) => c.html(loginPage()))
app.get('/user/register', (c) => c.html(registerPage()))

// ============================================================
// ADMIN PANEL - Protected at /admin
// ============================================================

// Admin login page (standalone, no site header)
app.get('/admin', async (c) => {
  return c.html(adminLoginPage())
})

// Admin panel (all sections handled client-side after auth)
app.get('/admin/panel', async (c) => {
  return c.html(adminPanelPage('dashboard'))
})

app.get('/admin/panel/:section', async (c) => {
  const section = c.req.param('section')
  return c.html(adminPanelPage(section))
})

// Schedule page
app.get('/schedule', async (c) => {
  return c.html(schedulePage())
})

// Static pages - load emails from DB settings
app.get('/about', async (c) => {
  const settings = await getSiteSettings(c.env?.DB)
  return c.html(aboutPage(settings))
})
app.get('/contact', async (c) => {
  const settings = await getSiteSettings(c.env?.DB)
  return c.html(contactPage(settings))
})
app.get('/privacy', async (c) => {
  const settings = await getSiteSettings(c.env?.DB)
  return c.html(privacyPage(settings))
})
app.get('/terms', async (c) => {
  const settings = await getSiteSettings(c.env?.DB)
  return c.html(termsPage(settings))
})
app.get('/dmca', async (c) => {
  const settings = await getSiteSettings(c.env?.DB)
  return c.html(dmcaPage(settings))
})

// User pages
app.get('/user/watchlist', (c) => c.html(watchlistPage()))
app.get('/user/profile', (c) => c.html(profilePage()))
app.get('/user/history', (c) => c.html(historyPage()))
app.get('/user/settings', (c) => c.html(settingsPage()))
app.get('/user/membership', (c) => c.redirect('/user/register'))

// Schedule API
app.get('/api/schedule', async (c) => {
  const db = c.env?.DB
  try {
    if (!db) throw new Error('No DB')
    const data = await db.prepare(`
      SELECT s.*, a.title, a.cover_image, a.slug, a.status
      FROM schedule s JOIN anime a ON s.anime_id = a.id
      ORDER BY s.day_of_week, s.air_time
    `).all()
    return c.json({ success: true, data: data.results || [] })
  } catch (e: any) {
    return c.json({ success: true, data: [] })
  }
})

// 404
app.notFound((c) => c.html(notFoundPage(), 404))

export default app
