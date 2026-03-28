import { layout } from './layout'
import { animeCard } from './components'

export function searchPage(data: {
  results: any[]
  total: number
  page: number
  perPage: number
  q: string
  genre: string
  type: string
  status: string
  siteName?: string
}) {
  const { results, total, page, perPage, q, genre, type, status, siteName = 'DonghuaLand' } = data
  const totalPages = Math.ceil(total / perPage)

  const buildUrl = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (genre) params.set('genre', genre)
    if (type) params.set('type', type)
    if (status) params.set('status', status)
    params.set('page', String(p))
    return '/search?' + params.toString()
  }

  const genres = ['Action', 'Adventure', 'Fantasy', 'Historical', 'Martial Arts', 'Romance', 'Sci-Fi']
  const types = ['TV', 'Movie', 'OVA', 'Special', 'ONA', 'Donghua']
  const statuses = ['Ongoing', 'Completed', 'Upcoming']

  const pagination = totalPages > 1 ? `
<div class="pagination">
  ${page > 1 ? `<a href="${buildUrl(1)}" class="page-btn"><i class="fas fa-angle-double-left"></i></a>` : ''}
  ${page > 1 ? `<a href="${buildUrl(page - 1)}" class="page-btn"><i class="fas fa-chevron-left"></i></a>` : ''}
  ${Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
    let p = i + 1
    if (totalPages > 7) {
      if (page <= 4) p = i + 1
      else if (page >= totalPages - 3) p = totalPages - 6 + i
      else p = page - 3 + i
    }
    return `<a href="${buildUrl(p)}" class="page-btn${p === page ? ' active' : ''}">${p}</a>`
  }).join('')}
  ${page < totalPages ? `<a href="${buildUrl(page + 1)}" class="page-btn"><i class="fas fa-chevron-right"></i></a>` : ''}
  ${page < totalPages ? `<a href="${buildUrl(totalPages)}" class="page-btn"><i class="fas fa-angle-double-right"></i></a>` : ''}
</div>` : ''

  const content = `
<div class="search-wrap">
  <div class="page-title">
    Browse Anime ${q ? `— <span>"${q}"</span>` : ''}
  </div>

  <!-- Filter Bar -->
  <form class="filter-bar" method="GET" action="/search" id="filterForm">
    <div class="filter-row">
      <div class="filter-field" style="flex:1; min-width:200px;">
        <label class="filter-lbl">Search</label>
        <input type="text" name="q" class="filter-inp" placeholder="Anime title..." value="${q || ''}" id="filterQ">
      </div>
      <div class="filter-field">
        <label class="filter-lbl">Genre</label>
        <select name="genre" class="filter-sel" id="filterGenre">
          <option value="">All Genres</option>
          ${genres.map(g => `<option value="${g}"${genre === g ? ' selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
      <div class="filter-field">
        <label class="filter-lbl">Type</label>
        <select name="type" class="filter-sel" id="filterType">
          <option value="">All Types</option>
          ${types.map(t => `<option value="${t}"${type === t ? ' selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="filter-field">
        <label class="filter-lbl">Status</label>
        <select name="status" class="filter-sel" id="filterStatus">
          <option value="">All Status</option>
          ${statuses.map(s => `<option value="${s}"${status === s ? ' selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap;">
        <button type="submit" class="btn-filter"><i class="fas fa-search"></i> Search</button>
        <a href="/search" class="btn-reset"><i class="fas fa-undo" style="font-size:11px;"></i> Reset</a>
      </div>
    </div>
    <!-- Quick genre chips -->
    <div class="genre-chips-row">
      ${genres.map(g => `
      <a href="/search?genre=${encodeURIComponent(g)}" class="genre-chip-filter${genre === g ? ' active' : ''}">${g}</a>`).join('')}
    </div>
  </form>

  <!-- Results -->
  <div class="results-meta">
    <span>${total}</span> anime found${q ? ` for "${q}"` : ''}${genre ? ` · Genre: ${genre}` : ''}${status ? ` · ${status}` : ''}${type ? ` · ${type}` : ''}
  </div>

  ${results.length > 0 ? `
  <div class="grid-5">
    ${results.map(a => animeCard(a)).join('')}
  </div>
  ${pagination}
  ` : `
  <div class="empty-state">
    <i class="fas fa-search"></i>
    <h3>No Results Found</h3>
    <p>Try different search terms or filters.</p>
  </div>`}

</div>
`

  return layout(
    q ? `Search: ${q} - ${siteName}` : `Browse Anime - ${siteName}`,
    content, '', siteName
  )
}
