import { Hono } from 'hono'

// ============================================================================
//  Jikan v4 routes  (MyAnimeList data, no API key required)
// ----------------------------------------------------------------------------
//  Jikan (https://jikan.moe) is an open, unofficial REST API for MyAnimeList.
//  It exposes exactly the same dataset as MAL, but without OAuth — which makes
//  it the practical choice for an admin "Auto-fill from MAL/Jikan" tool.
//
//  We intentionally route everything through Jikan instead of the official
//  MAL API because:
//    1. MAL's official API requires per-app OAuth2 client credentials.
//    2. Jikan returns richer, normalised fields (titles, genres, studios,
//       trailers, broadcast info, ratings) in one call.
//    3. Jikan is publicly cached + heavily mirrored, so it is fast.
//
//  Public endpoints below:
//    GET /api/jikan/search?q=...&type=...&limit=...   -> search anime
//    GET /api/jikan/anime/:id                         -> full anime details
//
//  These are read-only and do NOT touch the database or any other module.
// ============================================================================

type Bindings = { DB: D1Database }
export const jikanRoutes = new Hono<{ Bindings: Bindings }>()

const JIKAN_BASE = 'https://api.jikan.moe/v4'

// Map Jikan / MAL status strings to our internal status vocabulary.
function mapJikanStatus(status: string | null | undefined): string {
  if (!status) return 'Ongoing'
  const s = status.toLowerCase()
  if (s.includes('finished') || s.includes('complete')) return 'Completed'
  if (s.includes('airing') || s.includes('currently') || s.includes('ongoing')) return 'Ongoing'
  if (s.includes('not yet') || s.includes('upcoming')) return 'Upcoming'
  return 'Ongoing'
}

// Map Jikan / MAL anime type to our internal type vocabulary.
function mapJikanType(type: string | null | undefined): string {
  if (!type) return 'TV'
  const t = type.toUpperCase()
  // Jikan returns: TV, OVA, Movie, Special, ONA, Music, TV Special
  if (t === 'MOVIE') return 'Movie'
  if (t === 'OVA') return 'OVA'
  if (t === 'ONA') return 'ONA'
  if (t === 'SPECIAL' || t === 'TV SPECIAL') return 'Special'
  if (t === 'MUSIC') return 'Special'
  return 'TV'
}

// Best-effort country detection from Jikan's `producers/studios/licensors` lists.
// MAL doesn't expose country directly, so we infer it from production hints.
function detectCountry(anime: any): string {
  const allNames: string[] = [
    ...((anime.studios || []).map((s: any) => s.name)),
    ...((anime.producers || []).map((p: any) => p.name)),
    ...((anime.licensors || []).map((l: any) => l.name)),
  ].map(n => (n || '').toLowerCase())

  const joined = allNames.join(' ')
  // Very rough heuristics — most MAL entries are Japanese anyway.
  if (/bilibili|tencent|youku|iqiyi|haoliners|nice boat|fanworks|shanghai|beijing/.test(joined)) return 'China'
  if (/studio mir|dr movie|mir/.test(joined) && /korea/.test(joined)) return 'South Korea'
  return 'Japan'
}

// Pick a sensible duration string from Jikan's free-form duration field.
// Jikan returns things like "24 min per ep", "1 hr 50 min", "Unknown".
function normaliseDuration(duration: string | null | undefined): string | null {
  if (!duration) return null
  const d = duration.trim()
  if (!d || d.toLowerCase() === 'unknown') return null
  // Convert "24 min per ep" -> "24 min"
  const perEp = d.match(/(\d+)\s*min/i)
  if (perEp) return `${perEp[1]} min`
  // Convert "1 hr 50 min" -> "110 min"
  const hrMin = d.match(/(\d+)\s*hr\s*(\d+)?\s*min?/i)
  if (hrMin) {
    const hours = parseInt(hrMin[1], 10) || 0
    const mins = parseInt(hrMin[2] || '0', 10) || 0
    const total = hours * 60 + mins
    if (total > 0) return `${total} min`
  }
  return d
}

// Choose the best trailer URL from a Jikan trailer object.
function pickTrailer(trailer: any): string | null {
  if (!trailer) return null
  if (trailer.url) return trailer.url
  if (trailer.youtube_id) return `https://www.youtube.com/watch?v=${trailer.youtube_id}`
  return null
}

// Extract English title from Jikan v4 titles array (preferred) with safe fallbacks.
function extractTitles(anime: any): { display: string, english: string | null, native: string | null } {
  const titles: any[] = anime.titles || []
  const findType = (t: string) => titles.find((x: any) => (x.type || '').toLowerCase() === t.toLowerCase())?.title || null
  const english = findType('English') || anime.title_english || null
  const native = findType('Japanese') || anime.title_japanese || null
  // Display title: prefer English when available, otherwise the canonical "title"
  const display = english || anime.title || findType('Default') || native || ''
  return { display, english, native }
}

// ----------------------------------------------------------------------------
//  GET /api/jikan/search
//    Query params:
//      q      (string, required)  search query
//      type   (string, optional)  one of: tv, movie, ova, ona, special, music
//      limit  (number, optional)  default 20, max 25 (Jikan limit)
//      page   (number, optional)  default 1
// ----------------------------------------------------------------------------
jikanRoutes.get('/search', async (c) => {
  const query = (c.req.query('q') || '').trim()
  const type = (c.req.query('type') || '').trim().toLowerCase()
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10) || 20, 25)
  const page = parseInt(c.req.query('page') || '1', 10) || 1

  if (!query) return c.json({ error: 'Query required' }, 400)

  try {
    const params = new URLSearchParams()
    params.set('q', query)
    params.set('limit', String(limit))
    params.set('page', String(page))
    // Jikan supports filtering by type (tv|movie|ova|ona|special|music)
    if (['tv', 'movie', 'ova', 'ona', 'special', 'music'].includes(type)) {
      params.set('type', type)
    }
    // Higher-quality matches first
    params.set('order_by', 'popularity')
    params.set('sort', 'asc')

    const resp = await fetch(`${JIKAN_BASE}/anime?${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
    })

    if (!resp.ok) {
      return c.json({ error: 'Jikan API error: ' + resp.status }, resp.status === 429 ? 429 : 502)
    }

    const data = await resp.json() as any
    const results = (data.data || []).map((anime: any) => {
      const { display, english, native } = extractTitles(anime)
      const image =
        anime.images?.webp?.large_image_url ||
        anime.images?.jpg?.large_image_url ||
        anime.images?.webp?.image_url ||
        anime.images?.jpg?.image_url ||
        null
      return {
        // Jikan/MAL id (we expose as `id` so the frontend can treat it like any other source)
        id: anime.mal_id,
        mal_id: anime.mal_id,
        media_type: (anime.type || '').toLowerCase() === 'movie' ? 'movie' : 'tv',
        title: display,
        title_english: english,
        title_native: native,
        overview: anime.synopsis || '',
        cover_image: image,
        banner_image: null, // MAL/Jikan doesn't reliably provide backdrops
        release_year: anime.year || (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : null),
        rating: anime.score ? Math.round(anime.score * 10) / 10 : null,
        vote_count: anime.scored_by || 0,
        popularity: anime.popularity || null,
        episode_count: anime.episodes || null,
        type: anime.type || null,
        status: anime.status || null,
      }
    })

    return c.json({
      results,
      total: data.pagination?.items?.total || results.length,
      has_next_page: !!data.pagination?.has_next_page,
      current_page: data.pagination?.current_page || page,
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ----------------------------------------------------------------------------
//  GET /api/jikan/anime/:id
//    Returns a fully-normalised anime detail object (same shape as the TMDB
//    detail endpoint where it makes sense — so the same auto-fill UI can use
//    both data sources interchangeably).
// ----------------------------------------------------------------------------
jikanRoutes.get('/anime/:id', async (c) => {
  const id = c.req.param('id')
  if (!id || !/^\d+$/.test(id)) return c.json({ error: 'Invalid Jikan/MAL id' }, 400)

  try {
    // /anime/{id}/full bundles relations, themes, external, streaming etc.
    const resp = await fetch(`${JIKAN_BASE}/anime/${id}/full`, {
      headers: { 'Accept': 'application/json' },
    })

    if (!resp.ok) {
      if (resp.status === 404) return c.json({ error: 'Not found on Jikan/MAL' }, 404)
      return c.json({ error: 'Jikan API error: ' + resp.status }, resp.status === 429 ? 429 : 502)
    }

    const payload = await resp.json() as any
    const anime = payload.data
    if (!anime) return c.json({ error: 'Empty response from Jikan' }, 502)

    const { display, english, native } = extractTitles(anime)

    const coverImage =
      anime.images?.webp?.large_image_url ||
      anime.images?.jpg?.large_image_url ||
      anime.images?.webp?.image_url ||
      anime.images?.jpg?.image_url ||
      null

    // Jikan doesn't really provide cinematic backdrops — best-effort use trailer poster
    const bannerImage = anime.trailer?.images?.maximum_image_url || anime.trailer?.images?.large_image_url || null

    const genres = [
      ...((anime.genres || []).map((g: any) => g.name)),
      ...((anime.themes || []).map((g: any) => g.name)),
      ...((anime.demographics || []).map((g: any) => g.name)),
    ].filter(Boolean)

    const studios = (anime.studios || []).map((s: any) => s.name).filter(Boolean)

    const transformed = {
      // Source identifiers
      mal_id: anime.mal_id,
      jikan_id: anime.mal_id, // alias for clarity
      media_type: (anime.type || '').toLowerCase() === 'movie' ? 'movie' : 'tv',

      // Titles
      title: display,
      title_english: english || display,
      title_native: native,

      // Description
      description: anime.synopsis || '',

      // Imagery
      cover_image: coverImage,
      banner_image: bannerImage,

      // Trailer
      trailer_url: pickTrailer(anime.trailer),

      // Ratings & meta
      rating: anime.score ? Math.round(anime.score * 10) / 10 : 0,
      vote_count: anime.scored_by || 0,
      release_year: anime.year || (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : null),
      genres,
      studios,
      country: detectCountry(anime),
      type: mapJikanType(anime.type),
      duration: normaliseDuration(anime.duration),
      episode_count: anime.episodes || 0,
      seasons: 1, // MAL counts each season as a separate entry; we surface 1 here
      status: mapJikanStatus(anime.status),
      language: 'ja',
      networks: (anime.producers || []).map((p: any) => p.name),

      // Extra info for admin display
      first_air_date: anime.aired?.from || null,
      last_air_date: anime.aired?.to || null,
      in_production: (anime.status || '').toLowerCase().includes('airing'),

      // MAL-specific extras (handy for admin reference)
      mal_url: anime.url || null,
      mal_rank: anime.rank || null,
      mal_popularity: anime.popularity || null,
      mal_members: anime.members || null,
      mal_favorites: anime.favorites || null,
      season: anime.season || null,
      broadcast: anime.broadcast?.string || null,
    }

    return c.json(transformed)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})
