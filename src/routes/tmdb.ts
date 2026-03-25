import { Hono } from 'hono'

type Bindings = { DB: D1Database, TMDB_API_KEY: string }
export const tmdbRoutes = new Hono<{ Bindings: Bindings }>()

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE = 'https://image.tmdb.org/t/p'

// Search TMDB (English-first)
tmdbRoutes.get('/search', async (c) => {
  const query = c.req.query('q') || ''
  const page = c.req.query('page') || '1'
  const apiKey = c.req.query('api_key') || c.env.TMDB_API_KEY || ''

  if (!apiKey) return c.json({ error: 'TMDB API key not configured' }, 400)
  if (!query) return c.json({ error: 'Query required' }, 400)

  try {
    // Search in English first for proper English results
    const url = `${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=${page}`
    const resp = await fetch(url)
    if (!resp.ok) return c.json({ error: 'TMDB API error: ' + resp.status }, resp.status)

    const data = await resp.json() as any

    const results = (data.results || []).map((item: any) => ({
      id: item.id,
      title: item.name,
      title_english: item.original_name,
      overview: item.overview,
      cover_image: item.poster_path ? `${TMDB_IMAGE}/w500${item.poster_path}` : null,
      banner_image: item.backdrop_path ? `${TMDB_IMAGE}/original${item.backdrop_path}` : null,
      release_year: item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
      rating: item.vote_average,
      vote_count: item.vote_count,
      genres: item.genre_ids,
      popularity: item.popularity,
      original_language: item.original_language,
    }))

    return c.json({ results, total: data.total_results, total_pages: data.total_pages })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Get TMDB TV Show details - always returns English data with all fields
tmdbRoutes.get('/tv/:id', async (c) => {
  const id = c.req.param('id')
  const apiKey = c.req.query('api_key') || c.env.TMDB_API_KEY || ''

  if (!apiKey) return c.json({ error: 'TMDB API key not configured' }, 400)

  try {
    // Fetch English details + videos + images + external IDs + translations (for native title)
    const [detailResp, videoResp, transResp, imagesResp] = await Promise.all([
      fetch(`${TMDB_BASE}/tv/${id}?api_key=${apiKey}&language=en-US&append_to_response=credits,keywords,content_ratings`),
      fetch(`${TMDB_BASE}/tv/${id}/videos?api_key=${apiKey}&language=en-US`),
      fetch(`${TMDB_BASE}/tv/${id}/translations?api_key=${apiKey}`),
      fetch(`${TMDB_BASE}/tv/${id}/images?api_key=${apiKey}`),
    ])

    if (!detailResp.ok) return c.json({ error: 'Not found on TMDB' }, 404)

    const detail = await detailResp.json() as any
    const videos = await videoResp.json() as any
    const translations = await transResp.json() as any
    const images = await imagesResp.json() as any

    // Find best trailer - prefer English YouTube trailers
    const allVideos = (videos.results || [])
    const trailer =
      allVideos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'en') ||
      allVideos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') ||
      allVideos.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube') ||
      null

    // Get Chinese translations for native title
    const zhCNTrans = (translations.translations || []).find((t: any) => t.iso_639_1 === 'zh' && t.iso_3166_1 === 'CN')
    const zhTrans = (translations.translations || []).find((t: any) => t.iso_639_1 === 'zh')
    const jaTrans = (translations.translations || []).find((t: any) => t.iso_639_1 === 'ja')

    // Get English translation for best overview (sometimes en-US detail is better)
    const enTrans = (translations.translations || []).find((t: any) => t.iso_639_1 === 'en' && t.iso_3166_1 === 'US')

    // Determine native title based on origin country
    const countries = detail.origin_country || []
    let nativeTitle: string | null = null
    if (countries.includes('CN') || countries.includes('TW') || countries.includes('HK')) {
      nativeTitle = zhCNTrans?.data?.name || zhTrans?.data?.name || null
    } else if (countries.includes('JP')) {
      nativeTitle = jaTrans?.data?.name || detail.original_name || null
    } else {
      nativeTitle = zhCNTrans?.data?.name || zhTrans?.data?.name || null
    }

    // Determine English title
    // If original_language is English, original_name IS the English title
    // Otherwise use the translated English name or detail.name (which is en-US)
    const isEnglishOriginal = detail.original_language === 'en'
    let titleEnglish: string | null = null
    if (isEnglishOriginal) {
      titleEnglish = detail.original_name || detail.name
    } else {
      titleEnglish = enTrans?.data?.name || detail.name || null
    }

    // Best description: use English overview first, fallback to whatever is available
    const description = (detail.overview && detail.overview.length > 10)
      ? detail.overview
      : (enTrans?.data?.overview || '')

    // Get best poster - prefer English-language poster from images
    let coverImage = detail.poster_path ? `${TMDB_IMAGE}/w500${detail.poster_path}` : null
    if (images.posters && images.posters.length > 0) {
      // Find English poster first
      const enPoster = images.posters.find((p: any) => p.iso_639_1 === 'en' || p.iso_639_1 === null)
      if (enPoster) {
        coverImage = `${TMDB_IMAGE}/w500${enPoster.file_path}`
      }
    }

    // Get best backdrop
    let bannerImage = detail.backdrop_path ? `${TMDB_IMAGE}/original${detail.backdrop_path}` : null
    if (images.backdrops && images.backdrops.length > 0) {
      const enBackdrop = images.backdrops.find((b: any) => b.iso_639_1 === 'en' || b.iso_639_1 === null)
      if (enBackdrop) {
        bannerImage = `${TMDB_IMAGE}/original${enBackdrop.file_path}`
      }
    }

    // Get studios
    const studios = (detail.production_companies || []).map((c: any) => c.name)

    // Get genres in English
    const genres = (detail.genres || []).map((g: any) => g.name)

    // Determine country
    const country = countries.includes('CN') ? 'China'
      : countries.includes('JP') ? 'Japan'
      : countries.includes('KR') ? 'South Korea'
      : countries.includes('TW') ? 'Taiwan'
      : countries.includes('HK') ? 'Hong Kong'
      : (countries[0] || 'China')

    // Determine type
    let type = 'ONA'
    if (detail.type === 'Miniseries') type = 'ONA'
    else if (detail.type === 'Documentary') type = 'Special'
    else if (detail.number_of_seasons === 1 && (detail.number_of_episodes || 0) <= 3) type = 'OVA'
    else if (detail.type === 'Scripted') type = 'TV'
    else type = 'ONA'

    const transformed = {
      tmdb_id: detail.id,
      // Main display title should be English
      title: detail.name || detail.original_name,
      // Native title (Chinese, Japanese, etc.)
      title_native: nativeTitle,
      // English title
      title_english: titleEnglish,
      // Description always in English
      description: description,
      cover_image: coverImage,
      banner_image: bannerImage,
      trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      rating: Math.round((detail.vote_average || 0) * 10) / 10,
      vote_count: detail.vote_count || 0,
      release_year: detail.first_air_date ? new Date(detail.first_air_date).getFullYear() : null,
      genres,
      studios,
      country,
      type,
      episode_count: detail.number_of_episodes || 0,
      seasons: detail.number_of_seasons || 1,
      status: mapTmdbStatus(detail.status),
      language: detail.original_language,
      networks: (detail.networks || []).map((n: any) => n.name),
      // Extra info for admin display
      first_air_date: detail.first_air_date || null,
      last_air_date: detail.last_air_date || null,
      in_production: detail.in_production || false,
    }

    return c.json(transformed)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Search anime specifically (English-first search for Donghua/Chinese anime)
tmdbRoutes.get('/search/anime', async (c) => {
  const query = c.req.query('q') || ''
  const apiKey = c.req.query('api_key') || c.env.TMDB_API_KEY || ''

  if (!apiKey) return c.json({ error: 'TMDB API key not configured' }, 400)
  if (!query) return c.json({ error: 'Query required' }, 400)

  try {
    // Search in English AND Chinese to find as many results as possible
    const [enResp, zhResp] = await Promise.all([
      fetch(`${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US`),
      fetch(`${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=zh-CN`),
    ])

    const enData = await enResp.json() as any
    const zhData = await zhResp.json() as any

    // Merge English results first (priority), then add unique Chinese results
    const allResults = [...(enData.results || []), ...(zhData.results || [])]
    const seen = new Set()
    const unique = allResults.filter(item => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })

    // Map results - always show English names when available
    const results = unique.slice(0, 20).map((item: any) => {
      // Get English data version if we have it
      const enItem = (enData.results || []).find((e: any) => e.id === item.id)
      const useItem = enItem || item

      return {
        id: useItem.id,
        title: useItem.name,
        title_english: useItem.original_name !== useItem.name ? useItem.original_name : null,
        overview: useItem.overview,
        cover_image: useItem.poster_path ? `${TMDB_IMAGE}/w500${useItem.poster_path}` : null,
        banner_image: useItem.backdrop_path ? `${TMDB_IMAGE}/original${useItem.backdrop_path}` : null,
        release_year: useItem.first_air_date ? new Date(useItem.first_air_date).getFullYear() : null,
        rating: Math.round((useItem.vote_average || 0) * 10) / 10,
        vote_count: useItem.vote_count,
        popularity: useItem.popularity,
        original_language: useItem.original_language,
      }
    })

    return c.json({ results })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

function mapTmdbStatus(status: string): string {
  const map: Record<string, string> = {
    'Returning Series': 'Ongoing',
    'In Production': 'Ongoing',
    'Planned': 'Upcoming',
    'Ended': 'Completed',
    'Canceled': 'Completed',
    'Pilot': 'Upcoming',
    'In Limbo': 'Ongoing',
  }
  return map[status] || 'Ongoing'
}
