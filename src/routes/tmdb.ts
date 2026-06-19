import { Hono } from 'hono'

type Bindings = { DB: D1Database, TMDB_API_KEY: string }
export const tmdbRoutes = new Hono<{ Bindings: Bindings }>()

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE = 'https://image.tmdb.org/t/p'

// Search TMDB — returns BOTH Movies and TV Shows (uses /search/multi)
// Bug fix: previously only /search/tv was hit, so movies never showed up.
// `type` query param can force a single media type: 'movie' | 'tv' | 'multi' (default)
tmdbRoutes.get('/search', async (c) => {
  const query = c.req.query('q') || ''
  const page = c.req.query('page') || '1'
  const type = (c.req.query('type') || 'multi').toLowerCase()
  const apiKey = c.req.query('api_key') || c.env.TMDB_API_KEY || ''

  if (!apiKey) return c.json({ error: 'TMDB API key not configured' }, 400)
  if (!query) return c.json({ error: 'Query required' }, 400)

  try {
    let rawResults: any[] = []
    let totalResults = 0
    let totalPages = 0

    if (type === 'movie' || type === 'tv') {
      // Single media type search
      const url = `${TMDB_BASE}/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=${page}&include_adult=false`
      const resp = await fetch(url)
      if (!resp.ok) return c.json({ error: 'TMDB API error: ' + resp.status }, resp.status)
      const data = await resp.json() as any
      rawResults = (data.results || []).map((r: any) => ({ ...r, media_type: type }))
      totalResults = data.total_results || 0
      totalPages = data.total_pages || 0
    } else {
      // Multi search — returns movies, TV, and people. We filter out people.
      // Run in parallel with explicit movie + tv searches and merge so we don't miss anything.
      const [multiResp, movieResp, tvResp] = await Promise.all([
        fetch(`${TMDB_BASE}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=${page}&include_adult=false`),
        fetch(`${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=${page}&include_adult=false`),
        fetch(`${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=${page}&include_adult=false`),
      ])

      const multiData = multiResp.ok ? await multiResp.json() as any : { results: [] }
      const movieData = movieResp.ok ? await movieResp.json() as any : { results: [] }
      const tvData = tvResp.ok ? await tvResp.json() as any : { results: [] }

      const seen = new Set<string>()
      const pushUnique = (arr: any[], mediaType?: string) => {
        for (const item of arr) {
          const mt = item.media_type || mediaType
          if (mt !== 'movie' && mt !== 'tv') continue
          const key = `${mt}:${item.id}`
          if (seen.has(key)) continue
          seen.add(key)
          rawResults.push({ ...item, media_type: mt })
        }
      }
      // multi first (richer ranking), then dedicated movie/tv fills in misses
      pushUnique(multiData.results || [])
      pushUnique(movieData.results || [], 'movie')
      pushUnique(tvData.results || [], 'tv')

      // Sort by popularity desc so the most relevant items appear first regardless of source
      rawResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

      totalResults = (multiData.total_results || 0) + (movieData.total_results || 0) + (tvData.total_results || 0)
      totalPages = Math.max(multiData.total_pages || 0, movieData.total_pages || 0, tvData.total_pages || 0)
    }

    const results = rawResults.map((item: any) => {
      const isMovie = item.media_type === 'movie'
      const dateStr = isMovie ? item.release_date : item.first_air_date
      return {
        id: item.id,
        media_type: item.media_type, // 'movie' | 'tv'
        title: isMovie ? (item.title || item.original_title) : (item.name || item.original_name),
        title_english: isMovie ? item.original_title : item.original_name,
        overview: item.overview,
        cover_image: item.poster_path ? `${TMDB_IMAGE}/w500${item.poster_path}` : null,
        banner_image: item.backdrop_path ? `${TMDB_IMAGE}/original${item.backdrop_path}` : null,
        release_year: dateStr ? new Date(dateStr).getFullYear() : null,
        rating: item.vote_average,
        vote_count: item.vote_count,
        genres: item.genre_ids,
        popularity: item.popularity,
        original_language: item.original_language,
      }
    })

    return c.json({ results, total: totalResults, total_pages: totalPages })
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

    // Get studios (production companies)
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

    // Determine type based on TMDB type field
    let type = 'ONA'
    if (detail.type === 'Documentary') type = 'Special'
    else if (detail.type === 'Miniseries') type = 'ONA'
    else if (detail.number_of_seasons === 1 && (detail.number_of_episodes || 0) <= 3) type = 'OVA'
    else if (detail.type === 'Scripted') type = 'TV'
    else type = 'ONA'

    // Get episode runtime (duration in minutes)
    // TMDB provides episode_run_time as array of runtimes
    const runtimes = detail.episode_run_time || []
    const duration = runtimes.length > 0
      ? `${runtimes[0]} min`
      : null

    // Make sure main title is English - prefer the en-US detail.name
    // When we request with language=en-US, TMDB returns the translated English title in detail.name
    // For non-English shows, detail.name = English translation, detail.original_name = original script
    const mainTitle = detail.name || detail.original_name

    // Ensure English title is not null - always use at least detail.name
    if (!titleEnglish) {
      titleEnglish = detail.name || detail.original_name
    }

    const transformed = {
      tmdb_id: detail.id,
      // Main display title - ALWAYS English (TMDB returns en-US translated name)
      title: mainTitle,
      // Native title (Chinese, Japanese, etc.) - only original script
      title_native: nativeTitle,
      // English title explicitly
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
      // Episode duration in minutes (e.g. "24 min")
      duration,
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

// Get TMDB Movie details — returns English data, same shape as /tv/:id where applicable
tmdbRoutes.get('/movie/:id', async (c) => {
  const id = c.req.param('id')
  const apiKey = c.req.query('api_key') || c.env.TMDB_API_KEY || ''

  if (!apiKey) return c.json({ error: 'TMDB API key not configured' }, 400)

  try {
    const [detailResp, videoResp, transResp, imagesResp] = await Promise.all([
      fetch(`${TMDB_BASE}/movie/${id}?api_key=${apiKey}&language=en-US&append_to_response=credits,keywords,release_dates`),
      fetch(`${TMDB_BASE}/movie/${id}/videos?api_key=${apiKey}&language=en-US`),
      fetch(`${TMDB_BASE}/movie/${id}/translations?api_key=${apiKey}`),
      fetch(`${TMDB_BASE}/movie/${id}/images?api_key=${apiKey}`),
    ])

    if (!detailResp.ok) return c.json({ error: 'Not found on TMDB' }, 404)

    const detail = await detailResp.json() as any
    const videos = await videoResp.json() as any
    const translations = await transResp.json() as any
    const images = await imagesResp.json() as any

    const allVideos = (videos.results || [])
    const trailer =
      allVideos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'en') ||
      allVideos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') ||
      allVideos.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube') ||
      null

    const zhCNTrans = (translations.translations || []).find((t: any) => t.iso_639_1 === 'zh' && t.iso_3166_1 === 'CN')
    const zhTrans = (translations.translations || []).find((t: any) => t.iso_639_1 === 'zh')
    const jaTrans = (translations.translations || []).find((t: any) => t.iso_639_1 === 'ja')
    const enTrans = (translations.translations || []).find((t: any) => t.iso_639_1 === 'en' && t.iso_3166_1 === 'US')

    const countries: string[] = (detail.production_countries || []).map((p: any) => p.iso_3166_1)
    let nativeTitle: string | null = null
    if (countries.includes('CN') || countries.includes('TW') || countries.includes('HK')) {
      nativeTitle = zhCNTrans?.data?.title || zhTrans?.data?.title || null
    } else if (countries.includes('JP')) {
      nativeTitle = jaTrans?.data?.title || detail.original_title || null
    } else {
      nativeTitle = zhCNTrans?.data?.title || zhTrans?.data?.title || null
    }

    const isEnglishOriginal = detail.original_language === 'en'
    let titleEnglish: string | null = null
    if (isEnglishOriginal) {
      titleEnglish = detail.original_title || detail.title
    } else {
      titleEnglish = enTrans?.data?.title || detail.title || null
    }

    const description = (detail.overview && detail.overview.length > 10)
      ? detail.overview
      : (enTrans?.data?.overview || '')

    let coverImage = detail.poster_path ? `${TMDB_IMAGE}/w500${detail.poster_path}` : null
    if (images.posters && images.posters.length > 0) {
      const enPoster = images.posters.find((p: any) => p.iso_639_1 === 'en' || p.iso_639_1 === null)
      if (enPoster) coverImage = `${TMDB_IMAGE}/w500${enPoster.file_path}`
    }

    let bannerImage = detail.backdrop_path ? `${TMDB_IMAGE}/original${detail.backdrop_path}` : null
    if (images.backdrops && images.backdrops.length > 0) {
      const enBackdrop = images.backdrops.find((b: any) => b.iso_639_1 === 'en' || b.iso_639_1 === null)
      if (enBackdrop) bannerImage = `${TMDB_IMAGE}/original${enBackdrop.file_path}`
    }

    const studios = (detail.production_companies || []).map((c: any) => c.name)
    const genres = (detail.genres || []).map((g: any) => g.name)

    const country = countries.includes('CN') ? 'China'
      : countries.includes('JP') ? 'Japan'
      : countries.includes('KR') ? 'South Korea'
      : countries.includes('TW') ? 'Taiwan'
      : countries.includes('HK') ? 'Hong Kong'
      : (countries[0] || 'Unknown')

    const duration = detail.runtime ? `${detail.runtime} min` : null
    const mainTitle = detail.title || detail.original_title
    if (!titleEnglish) titleEnglish = detail.title || detail.original_title

    const transformed = {
      tmdb_id: detail.id,
      media_type: 'movie',
      title: mainTitle,
      title_native: nativeTitle,
      title_english: titleEnglish,
      description,
      cover_image: coverImage,
      banner_image: bannerImage,
      trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      rating: Math.round((detail.vote_average || 0) * 10) / 10,
      vote_count: detail.vote_count || 0,
      release_year: detail.release_date ? new Date(detail.release_date).getFullYear() : null,
      genres,
      studios,
      country,
      type: 'Movie',
      duration,
      episode_count: 1,
      seasons: 1,
      status: detail.status === 'Released' ? 'Completed' : ((detail.status === 'Post Production' || detail.status === 'In Production') ? 'Upcoming' : 'Completed'),
      language: detail.original_language,
      networks: [],
      first_air_date: detail.release_date || null,
      last_air_date: detail.release_date || null,
      in_production: detail.status !== 'Released',
    }

    return c.json(transformed)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Search anime specifically (English-first; now also searches Movies so anime films appear)
tmdbRoutes.get('/search/anime', async (c) => {
  const query = c.req.query('q') || ''
  const apiKey = c.req.query('api_key') || c.env.TMDB_API_KEY || ''

  if (!apiKey) return c.json({ error: 'TMDB API key not configured' }, 400)
  if (!query) return c.json({ error: 'Query required' }, 400)

  try {
    // Search TV (en + zh) and Movies (en) in parallel so anime movies show up too
    const [tvEnResp, tvZhResp, movieEnResp] = await Promise.all([
      fetch(`${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&include_adult=false`),
      fetch(`${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=zh-CN&include_adult=false`),
      fetch(`${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&include_adult=false`),
    ])

    const tvEnData = await tvEnResp.json() as any
    const tvZhData = await tvZhResp.json() as any
    const movieEnData = await movieEnResp.json() as any

    const tvEnList = (tvEnData.results || []).map((x: any) => ({ ...x, media_type: 'tv' }))
    const tvZhList = (tvZhData.results || []).map((x: any) => ({ ...x, media_type: 'tv' }))
    const movieList = (movieEnData.results || []).map((x: any) => ({ ...x, media_type: 'movie' }))

    const seen = new Set<string>()
    const merged: any[] = []
    const pushUnique = (arr: any[]) => {
      for (const item of arr) {
        const key = `${item.media_type}:${item.id}`
        if (seen.has(key)) continue
        seen.add(key)
        merged.push(item)
      }
    }
    pushUnique(tvEnList)
    pushUnique(movieList)
    pushUnique(tvZhList)

    const results = merged.slice(0, 30).map((item: any) => {
      const isMovie = item.media_type === 'movie'
      const dateStr = isMovie ? item.release_date : item.first_air_date
      const displayTitle = isMovie ? (item.title || item.original_title) : (item.name || item.original_name)
      const englishTitle = isMovie ? item.original_title : item.original_name
      return {
        id: item.id,
        media_type: item.media_type,
        title: displayTitle,
        title_english: englishTitle && englishTitle !== displayTitle ? englishTitle : null,
        overview: item.overview,
        cover_image: item.poster_path ? `${TMDB_IMAGE}/w500${item.poster_path}` : null,
        banner_image: item.backdrop_path ? `${TMDB_IMAGE}/original${item.backdrop_path}` : null,
        release_year: dateStr ? new Date(dateStr).getFullYear() : null,
        rating: Math.round((item.vote_average || 0) * 10) / 10,
        vote_count: item.vote_count,
        popularity: item.popularity,
        original_language: item.original_language,
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
