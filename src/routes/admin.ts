import { Hono } from 'hono'
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../utils/auth'

type Bindings = {
  DB: D1Database
  TMDB_API_KEY: string
  JWT_SECRET: string
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string
  IMGBB_API_KEY: string
}

export const adminRoutes = new Hono<{ Bindings: Bindings }>()

function getSecret(env: any): string {
  return env.JWT_SECRET || 'donghua-secret-key-2024'
}

function getAdminUsername(env: any): string {
  return env.ADMIN_USERNAME || 'admin'
}

function getAdminPassword(env: any): string {
  return env.ADMIN_PASSWORD || ''
}

// ============ ADMIN LOGIN ============
// POST /api/admin/login
adminRoutes.post('/login', async (c) => {
  const db = c.env?.DB
  const { username, password } = await c.req.json()

  if (!username || !password) {
    return c.json({ error: 'Username and password required' }, 400)
  }

  try {
    let isValid = false
    const envUsername = getAdminUsername(c.env)
    const envPassword = getAdminPassword(c.env)

    // Primary: check against environment variable credentials
    if (envPassword && username === envUsername && password === envPassword) {
      isValid = true
    }

    // Fallback: check DB admins table (for password changes via admin panel)
    if (!isValid && db) {
      try {
        const admin = await db.prepare(
          'SELECT * FROM admins WHERE username = ?'
        ).bind(username).first()
        if (admin) {
          isValid = await verifyPassword(password, (admin as any).password_hash)
        }
      } catch { /* DB may not have admins table yet */ }
    }

    if (!isValid) {
      return c.json({ error: 'Invalid admin credentials' }, 401)
    }

    // Generate admin JWT token
    const payload = {
      id: 0,
      username: username,
      email: 'admin@donghualand.vip',
      role: 'admin',
      plan: 'premium',
    }
    const token = await generateToken(payload, getSecret(c.env))

    return c.json({ success: true, token, user: payload })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ============ ADMIN AUTH VERIFY ============
// GET /api/admin/verify
adminRoutes.get('/verify', async (c) => {
  const auth = c.req.header('Authorization')
  if (!auth) return c.json({ error: 'Not authenticated' }, 401)

  try {
    const token = auth.replace('Bearer ', '')
    const payload = await verifyToken(token, getSecret(c.env))
    if (payload.role !== 'admin') return c.json({ error: 'Admin access required' }, 403)
    return c.json({ success: true, user: payload })
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
})

// ============ ADMIN AUTH MIDDLEWARE ============
async function requireAdmin(c: any, next: any) {
  const auth = c.req.header('Authorization')
  if (!auth) return c.json({ error: 'Authentication required' }, 401)
  try {
    const token = auth.replace('Bearer ', '')
    const payload = await verifyToken(token, getSecret(c.env))
    if (payload.role !== 'admin') return c.json({ error: 'Admin access required' }, 403)
    c.set('adminUser', payload)
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}

// ============ STATS ============
adminRoutes.get('/stats', requireAdmin, async (c) => {
  const db = c.env?.DB
  try {
    if (!db) throw new Error('No DB')
    const [a, e, u, v, cm] = await Promise.all([
      db.prepare('SELECT COUNT(*) as total FROM anime').first(),
      db.prepare('SELECT COUNT(*) as total FROM episodes').first(),
      db.prepare('SELECT COUNT(*) as total FROM users').first(),
      db.prepare('SELECT COALESCE(SUM(view_count),0) as total FROM anime').first(),
      db.prepare('SELECT COUNT(*) as total FROM comments WHERE is_approved = 1').first(),
    ])
    return c.json({
      success: true,
      data: {
        total_anime: (a as any)?.total || 0,
        total_episodes: (e as any)?.total || 0,
        total_users: (u as any)?.total || 0,
        total_views: (v as any)?.total || 0,
        total_comments: (cm as any)?.total || 0,
      }
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ============ ANIME CRUD ============
adminRoutes.get('/anime', requireAdmin, async (c) => {
  const db = c.env.DB
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const q = c.req.query('q') || ''
  const status = c.req.query('status') || ''
  try {
    let where = '1=1'
    const params: any[] = []
    if (q) {
      where += ' AND (a.title LIKE ? OR a.title_native LIKE ?)'
      params.push(`%${q}%`, `%${q}%`)
    }
    if (status) {
      where += ' AND a.status = ?'
      params.push(status)
    }
    const data = await db.prepare(`
      SELECT a.*, COUNT(e.id) as episode_count
      FROM anime a LEFT JOIN episodes e ON a.id = e.anime_id
      WHERE ${where}
      GROUP BY a.id ORDER BY a.created_at DESC LIMIT ? OFFSET ?
    `).bind(...params, limit, (page - 1) * limit).all()
    const total = await db.prepare(`SELECT COUNT(*) as c FROM anime a WHERE ${where}`).bind(...params).first()
    return c.json({ success: true, data: data.results, total: (total as any)?.c || 0 })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.post('/anime', requireAdmin, async (c) => {
  const db = c.env.DB
  try {
    const b = await c.req.json()
    if (!b.title || !b.slug) return c.json({ error: 'Title and slug are required' }, 400)
    const r = await db.prepare(`
      INSERT INTO anime (
        title, title_native, title_english, slug, description,
        cover_image, banner_image, trailer_url, status, type,
        release_year, rating, vote_count, genres, studios, country, duration,
        is_featured, is_trending, is_popular, view_count
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      b.title, b.title_native || null, b.title_english || null, b.slug,
      b.description || null, b.cover_image || null, b.banner_image || null,
      b.trailer_url || null, b.status || 'Ongoing', b.type || 'ONA',
      b.release_year || null, b.rating || null, b.vote_count || 0,
      b.genres || '[]', b.studios || '[]', b.country || 'China', b.duration || null,
      b.is_featured ? 1 : 0, b.is_trending ? 1 : 0, b.is_popular ? 1 : 0, 0
    ).run()
    return c.json({ success: true, id: r.meta.last_row_id })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.put('/anime/:id', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    const b = await c.req.json()
    if (!b.title || !b.slug) return c.json({ error: 'Title and slug are required' }, 400)
    await db.prepare(`
      UPDATE anime SET
        title=?, title_native=?, title_english=?, slug=?, description=?,
        cover_image=?, banner_image=?, trailer_url=?, status=?, type=?,
        release_year=?, rating=?, genres=?, studios=?, country=?, duration=?,
        is_featured=?, is_trending=?, is_popular=?,
        updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).bind(
      b.title, b.title_native || null, b.title_english || null, b.slug,
      b.description || null, b.cover_image || null, b.banner_image || null,
      b.trailer_url || null, b.status || 'Ongoing', b.type || 'ONA',
      b.release_year || null, b.rating || null,
      b.genres || '[]', b.studios || '[]', b.country || 'China', b.duration || null,
      b.is_featured ? 1 : 0, b.is_trending ? 1 : 0, b.is_popular ? 1 : 0,
      parseInt(id)
    ).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.delete('/anime/:id', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    await db.prepare('DELETE FROM episodes WHERE anime_id = ?').bind(parseInt(id)).run()
    await db.prepare('DELETE FROM schedule WHERE anime_id = ?').bind(parseInt(id)).run()
    await db.prepare('DELETE FROM comments WHERE anime_id = ?').bind(parseInt(id)).run()
    await db.prepare('DELETE FROM anime WHERE id = ?').bind(parseInt(id)).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

// ============ EPISODES CRUD ============
adminRoutes.get('/episodes', requireAdmin, async (c) => {
  const db = c.env.DB
  const animeId = c.req.query('anime_id')
  try {
    const q = animeId
      ? 'SELECT * FROM episodes WHERE anime_id = ? ORDER BY episode_number ASC'
      : 'SELECT * FROM episodes ORDER BY created_at DESC LIMIT 50'
    const data = animeId
      ? await db.prepare(q).bind(parseInt(animeId)).all()
      : await db.prepare(q).all()
    return c.json({ success: true, data: data.results })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.post('/episodes', requireAdmin, async (c) => {
  const db = c.env.DB
  try {
    const b = await c.req.json()
    if (!b.anime_id || !b.episode_number) return c.json({ error: 'anime_id and episode_number required' }, 400)
    const r = await db.prepare(`
      INSERT INTO episodes (anime_id, episode_number, title, embed_url, video_url, thumbnail, air_date, is_members_only)
      VALUES (?,?,?,?,?,?,?,?)
    `).bind(
      parseInt(b.anime_id), parseInt(b.episode_number),
      b.title || null, b.embed_url || null, b.video_url || null,
      b.thumbnail || null, b.air_date || null, b.is_members_only ? 1 : 0
    ).run()
    await db.prepare('UPDATE anime SET episode_count=(SELECT COUNT(*) FROM episodes WHERE anime_id=?), updated_at=CURRENT_TIMESTAMP WHERE id=?')
      .bind(parseInt(b.anime_id), parseInt(b.anime_id)).run()
    return c.json({ success: true, id: r.meta.last_row_id })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.put('/episodes/:id', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    const b = await c.req.json()
    await db.prepare(`
      UPDATE episodes SET
        episode_number=?, title=?, embed_url=?, video_url=?, thumbnail=?,
        air_date=?, is_members_only=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).bind(
      parseInt(b.episode_number), b.title || null, b.embed_url || null,
      b.video_url || null, b.thumbnail || null, b.air_date || null,
      b.is_members_only ? 1 : 0, parseInt(id)
    ).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.delete('/episodes/:id', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    const ep = await db.prepare('SELECT anime_id FROM episodes WHERE id=?').bind(parseInt(id)).first()
    await db.prepare('DELETE FROM episodes WHERE id = ?').bind(parseInt(id)).run()
    if (ep) {
      await db.prepare('UPDATE anime SET episode_count=(SELECT COUNT(*) FROM episodes WHERE anime_id=?) WHERE id=?')
        .bind((ep as any).anime_id, (ep as any).anime_id).run()
    }
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

// ============ USERS ============
adminRoutes.get('/users', requireAdmin, async (c) => {
  const db = c.env.DB
  try {
    const data = await db.prepare(
      'SELECT id, username, email, role, plan, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 200'
    ).all()
    return c.json({ success: true, data: data.results })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.post('/users/:id/ban', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    await db.prepare("UPDATE users SET is_active = 0, role='banned' WHERE id=?").bind(parseInt(id)).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.post('/users/:id/unban', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    await db.prepare("UPDATE users SET is_active = 1, role='user' WHERE id=?").bind(parseInt(id)).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.delete('/users/:id', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    await db.prepare('DELETE FROM comments WHERE user_id = ?').bind(parseInt(id)).run()
    await db.prepare('DELETE FROM watchlist WHERE user_id = ?').bind(parseInt(id)).run()
    await db.prepare('DELETE FROM users WHERE id = ?').bind(parseInt(id)).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

// ============ SCHEDULE ============
adminRoutes.get('/schedule', requireAdmin, async (c) => {
  const db = c.env.DB
  try {
    const data = await db.prepare(`
      SELECT s.*, a.title, a.cover_image, a.slug
      FROM schedule s JOIN anime a ON s.anime_id = a.id
      ORDER BY s.day_of_week
    `).all()
    return c.json({ success: true, data: data.results })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.post('/schedule', requireAdmin, async (c) => {
  const db = c.env.DB
  try {
    const { anime_id, day_of_week, air_time } = await c.req.json()
    if (!anime_id || !day_of_week) return c.json({ error: 'anime_id and day_of_week required' }, 400)
    await db.prepare(
      'INSERT OR REPLACE INTO schedule (anime_id, day_of_week, air_time) VALUES (?, ?, ?)'
    ).bind(parseInt(anime_id), day_of_week, air_time || null).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.delete('/schedule/:id', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    await db.prepare('DELETE FROM schedule WHERE id = ?').bind(parseInt(id)).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

// ============ COMMENTS MANAGEMENT ============
adminRoutes.get('/comments', requireAdmin, async (c) => {
  const db = c.env.DB
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '30')
  const status = c.req.query('status') || 'all'
  const offset = (page - 1) * limit

  try {
    let where = '1=1'
    if (status === 'pending') where = 'c.is_approved = 0'
    else if (status === 'approved') where = 'c.is_approved = 1'
    else if (status === 'rejected') where = 'c.is_approved = -1'

    const data = await db.prepare(`
      SELECT c.id, c.content, c.is_approved, c.is_spoiler, c.likes, c.created_at,
             u.username, u.id as user_id,
             a.title as anime_title, a.slug as anime_slug,
             e.episode_number
      FROM comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN anime a ON c.anime_id = a.id
      LEFT JOIN episodes e ON c.episode_id = e.id
      WHERE ${where}
      ORDER BY c.created_at DESC LIMIT ? OFFSET ?
    `).bind(limit, offset).all()

    const countRes = await db.prepare(
      `SELECT COUNT(*) as total FROM comments c WHERE ${where}`
    ).first()

    return c.json({
      success: true,
      data: data.results,
      total: (countRes as any)?.total || 0,
      page, limit,
    })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.patch('/comments/:id', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    const { action } = await c.req.json()
    if (action === 'approve') {
      await db.prepare('UPDATE comments SET is_approved = 1 WHERE id = ?').bind(parseInt(id)).run()
    } else if (action === 'reject') {
      await db.prepare('UPDATE comments SET is_approved = -1 WHERE id = ?').bind(parseInt(id)).run()
    } else if (action === 'delete') {
      await db.prepare('DELETE FROM comments WHERE id = ? OR parent_id = ?').bind(parseInt(id), parseInt(id)).run()
    } else {
      return c.json({ error: 'Invalid action' }, 400)
    }
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.delete('/comments/:id', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    await db.prepare('DELETE FROM comments WHERE id = ? OR parent_id = ?').bind(parseInt(id), parseInt(id)).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

// ============ SETTINGS ============

// Helper: ensure settings table exists
async function ensureSettingsTable(db: D1Database) {
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run()
  } catch { /* table may already exist, ignore */ }
}

// Helper: ensure broadcasts table exists
async function ensureBroadcastTable(db: D1Database) {
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS broadcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run()
  } catch { /* ignore */ }
}

// Default settings
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
  // Header branding (supports both text and image logo)
  header_text: 'DonghuaLand',
  header_size: 'medium',
  header_style: 'bold',
  header_color: '#a29bfe',
  // Logo type: 'text' (styled text) or 'image' (image from URL)
  logo_type: 'text',
  logo_url: '',
  logo_height: '36',
}

adminRoutes.get('/settings', requireAdmin, async (c) => {
  const db = c.env.DB
  const result: Record<string, string> = { ...DEFAULT_SETTINGS }
  try {
    await ensureSettingsTable(db)
    const settings = await db.prepare('SELECT * FROM settings').all()
    if (settings.results) {
      settings.results.forEach((s: any) => { result[s.key] = s.value })
    }
  } catch { /* return defaults if DB error */ }
  return c.json({ success: true, data: result })
})

adminRoutes.post('/settings', requireAdmin, async (c) => {
  const db = c.env.DB
  try {
    await ensureSettingsTable(db)
    const body = await c.req.json()
    if (!body || typeof body !== 'object') {
      return c.json({ error: 'Invalid settings data' }, 400)
    }
    for (const [key, value] of Object.entries(body)) {
      await db.prepare(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
      ).bind(key, String(value ?? '')).run()
    }
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

// ============ BROADCASTS ============

adminRoutes.get('/broadcasts', requireAdmin, async (c) => {
  const db = c.env.DB
  try {
    await ensureBroadcastTable(db)
    const data = await db.prepare(
      'SELECT * FROM broadcasts ORDER BY created_at DESC LIMIT 50'
    ).all()
    return c.json({ success: true, data: data.results || [] })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.post('/broadcasts', requireAdmin, async (c) => {
  const db = c.env.DB
  try {
    await ensureBroadcastTable(db)
    const { message, type } = await c.req.json()
    if (!message || !message.trim()) return c.json({ error: 'Message is required' }, 400)
    const validTypes = ['info', 'warning', 'success', 'error']
    const broadcastType = validTypes.includes(type) ? type : 'info'
    const r = await db.prepare(
      'INSERT INTO broadcasts (message, type, is_active) VALUES (?, ?, 1)'
    ).bind(message.trim(), broadcastType).run()
    return c.json({ success: true, id: r.meta.last_row_id })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.patch('/broadcasts/:id', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    await ensureBroadcastTable(db)
    const { is_active, message, type } = await c.req.json()
    if (message !== undefined) {
      const validTypes = ['info', 'warning', 'success', 'error']
      const bType = validTypes.includes(type) ? type : 'info'
      await db.prepare(
        'UPDATE broadcasts SET message=?, type=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
      ).bind(message.trim(), bType, is_active !== undefined ? (is_active ? 1 : 0) : 1, parseInt(id)).run()
    } else {
      await db.prepare(
        'UPDATE broadcasts SET is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
      ).bind(is_active ? 1 : 0, parseInt(id)).run()
    }
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

adminRoutes.delete('/broadcasts/:id', requireAdmin, async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  try {
    await ensureBroadcastTable(db)
    await db.prepare('DELETE FROM broadcasts WHERE id=?').bind(parseInt(id)).run()
    return c.json({ success: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

// ============ ADMIN PASSWORD CHANGE ============
adminRoutes.post('/change-password', requireAdmin, async (c) => {
  const db = c.env?.DB
  try {
    const { current_password, new_password } = await c.req.json()
    if (!current_password || !new_password) return c.json({ error: 'Both passwords required' }, 400)
    if (new_password.length < 8) return c.json({ error: 'New password must be at least 8 characters' }, 400)

    // Verify current password against env var
    const envPassword = getAdminPassword(c.env)
    const envUsername = getAdminUsername(c.env)
    let isValid = current_password === envPassword

    if (!isValid && db) {
      try {
        const admin = await db.prepare("SELECT password_hash FROM admins WHERE username = ?").bind(envUsername).first()
        if (admin) isValid = await verifyPassword(current_password, (admin as any).password_hash)
      } catch { /* ignore */ }
    }
    if (!isValid) return c.json({ error: 'Current password is incorrect' }, 401)

    // Store new password hash in DB
    if (db) {
      const newHash = await hashPassword(new_password)
      try {
        await db.prepare(
          "INSERT OR REPLACE INTO admins (username, email, password_hash) VALUES (?, 'admin@donghualand.vip', ?)"
        ).bind(envUsername, newHash).run()
      } catch {
        // Create admins table if it doesn't exist
        await db.prepare(`CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`).run()
        await db.prepare(
          "INSERT OR REPLACE INTO admins (username, email, password_hash) VALUES (?, 'admin@donghualand.vip', ?)"
        ).bind(envUsername, newHash).run()
      }
    }
    return c.json({ success: true, message: 'Password updated successfully. Note: Env var ADMIN_PASSWORD still takes priority on next login.' })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

// ============ IMGBB STATUS ============
adminRoutes.get('/imgbb-status', requireAdmin, async (c) => {
  const apiKey = c.env.IMGBB_API_KEY

  return c.json({
    success: true,
    configured: !!apiKey,
  })
})

// ============ CLOUDINARY STATUS (legacy redirect - returns imgbb status) ============
adminRoutes.get('/cloudinary-status', requireAdmin, async (c) => {
  const apiKey = c.env.IMGBB_API_KEY

  return c.json({
    success: true,
    configured: !!apiKey,
    cloud_name: null,
  })
})
