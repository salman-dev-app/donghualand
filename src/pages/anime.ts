import { layout } from './layout'
import { genresFromJson, formatRating, episodeCard, breadcrumb, animeCard } from './components'

export function animePage(data: { anime: any, episodes: any[], related: any[] }) {
  const { anime, episodes, related } = data
  const genres = genresFromJson(anime.genres)
  const studios = genresFromJson(anime.studios)

  const content = `
${breadcrumb([{ label: 'Browse', href: '/search' }, { label: anime.title }])}

<!-- Detail Hero -->
<div class="detail-hero">
  <div class="detail-banner-wrap">
    <img src="${anime.banner_image || anime.cover_image || ''}" 
         alt="${anime.title}" class="detail-banner" loading="lazy"
         onerror="this.style.display='none'">
    <div class="detail-banner-grad"></div>
    <div class="detail-content">
      <img src="${anime.cover_image || 'https://placehold.co/180x270/0f0f17/6c5ce7?text=No+Image'}"
           alt="${anime.title}" class="detail-poster" loading="lazy"
           onerror="this.src='https://placehold.co/180x270/0f0f17/6c5ce7?text=No+Image'">
      <div class="detail-info">
        <div class="detail-badges">
          <span class="badge badge-purple">${anime.type || 'ONA'}</span>
          <span class="badge ${anime.status === 'Ongoing' ? 'badge-green' : anime.status === 'Completed' ? 'badge-blue' : 'badge-gray'}">${anime.status || 'Ongoing'}</span>
          ${anime.release_year ? `<span class="badge badge-gray">${anime.release_year}</span>` : ''}
        </div>
        <h1 class="detail-title">${anime.title}</h1>
        ${anime.title_native ? `<div class="detail-native">${anime.title_native}</div>` : ''}
        <div class="detail-rating">
          <span class="detail-rating-num">${formatRating(anime.rating)}</span>
          <i class="fas fa-star" style="color:var(--gold); font-size:14px;"></i>
          <span style="font-size:13px; color:var(--text3);">${anime.vote_count || 0} votes</span>
          <span style="color:var(--text4);">·</span>
          <span style="font-size:13px; color:var(--text3);"><i class="fas fa-eye" style="color:var(--purple2);"></i> ${anime.view_count || 0} views</span>
        </div>
        <div class="detail-genres">
          ${genres.map(g => `<a href="/search?genre=${encodeURIComponent(g)}" class="genre-chip">${g}</a>`).join('')}
        </div>
        <div class="detail-actions">
          ${episodes.length > 0
            ? `<a href="/watch/${anime.slug}-episode-1" class="btn-act-watch"><i class="fas fa-play"></i> Watch EP 1</a>`
            : `<span class="btn-act-save" style="opacity:0.6; cursor:default;"><i class="fas fa-clock"></i> No Episodes Yet</span>`}
          <button class="btn-act-save" id="wlBtn" data-slug="${anime.slug}" onclick="toggleBookmark('${anime.slug}', '${anime.title.replace(/'/g, "\\'")}', '${(anime.cover_image || '').replace(/'/g, "\\'")}', '${anime.type || 'ONA'}', this)">
            <i class="fas fa-bookmark"></i> Add to Watchlist
          </button>
          ${anime.trailer_url ? `<a href="${anime.trailer_url}" target="_blank" class="btn-act-trailer"><i class="fas fa-film"></i> Trailer</a>` : ''}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Stats Row -->
<div class="detail-stats">
  <div class="detail-stats-inner">
    ${anime.release_year ? `<div class="stat-box"><div class="stat-label">Year</div><div class="stat-val">${anime.release_year}</div></div>` : ''}
    <div class="stat-box"><div class="stat-label">Episodes</div><div class="stat-val">${episodes.length || 'TBA'}</div></div>
    ${anime.duration ? `<div class="stat-box"><div class="stat-label">Duration</div><div class="stat-val">${anime.duration}</div></div>` : ''}
    ${anime.type ? `<div class="stat-box"><div class="stat-label">Type</div><div class="stat-val">${anime.type}</div></div>` : ''}
    ${studios.length > 0 ? `<div class="stat-box"><div class="stat-label">Studio</div><div class="stat-val">${studios[0]}</div></div>` : ''}
    ${anime.country ? `<div class="stat-box"><div class="stat-label">Country</div><div class="stat-val">${anime.country}</div></div>` : ''}
  </div>
</div>

<!-- Synopsis + Episodes -->
<div class="detail-body">
  ${anime.description ? `
  <div class="detail-synopsis">
    <h3>Synopsis</h3>
    <p class="synopsis-text" id="synopsisText">${anime.description}</p>
  </div>` : ''}
</div>

<!-- Episodes -->
${episodes.length > 0 ? `
<div class="eps-section">
  <div class="eps-head">
    <div class="eps-title">
      Episodes <span>(${episodes.length} total)</span>
    </div>
    <div class="eps-filter">
      <input type="text" placeholder="Filter episodes..." oninput="filterEps(this.value)" id="epsFilter">
    </div>
  </div>
  <div class="eps-grid" id="epsGrid">
    ${episodes.map(ep => episodeCard(ep, anime.slug, anime.cover_image)).join('')}
  </div>
</div>` : `
<div class="eps-section">
  <div class="empty-state">
    <i class="fas fa-video-slash"></i>
    <h3>No Episodes Yet</h3>
    <p>Episodes will be added soon. Check back later!</p>
  </div>
</div>`}

${related.length > 0 ? `
<section class="section section-alt">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title">You Might Also Like</div>
    </div>
    <div class="grid-5">
      ${related.slice(0, 10).map(a => animeCard(a)).join('')}
    </div>
  </div>
</section>` : ''}

<script>
function filterEps(q) {
  const g = document.getElementById('epsGrid')
  if (!g) return
  g.querySelectorAll('.ep-card').forEach(c => {
    const n = c.querySelector('.ep-name')?.textContent?.toLowerCase() || ''
    const num = c.querySelector('.ep-num-tag')?.textContent?.toLowerCase() || ''
    c.style.display = (!q || n.includes(q.toLowerCase()) || num.includes(q.toLowerCase())) ? '' : 'none'
  })
}
function toggleBookmark(slug, title, cover, type, btn) {
  if (window.toggleWatchlist) {
    window.toggleWatchlist(slug, title, cover, type);
  } else {
    // Fallback
    const list = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const idx = list.findIndex(i => i.slug === slug);
    if (idx >= 0) {
      list.splice(idx, 1);
      localStorage.setItem('watchlist', JSON.stringify(list));
      if(btn) btn.innerHTML = '<i class="fas fa-bookmark"></i> Add to Watchlist';
      window.showToast('Removed from watchlist', 'info');
    } else {
      list.unshift({ slug, title, cover, type, addedAt: new Date().toISOString() });
      localStorage.setItem('watchlist', JSON.stringify(list));
      if(btn) btn.innerHTML = '<i class="fas fa-bookmark"></i> In Watchlist';
      window.showToast('Added to watchlist!', 'success');
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  if (window.initWatchlistBtn) window.initWatchlistBtn();
});
</script>
`

  return layout(`${anime.title} - Watch Online Free | Donghualand`, content)
}
