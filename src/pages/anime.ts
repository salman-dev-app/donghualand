import { layout } from './layout'

function genresFromJson(g: any): string[] {
  if (!g) return []
  if (Array.isArray(g)) return g
  try { return JSON.parse(g) } catch { return [] }
}

function formatRating(r: any): string {
  if (!r) return '0.0'
  return parseFloat(r).toFixed(1)
}

function animeCard(anime: any): string {
  const ep = anime.latest_episode || anime.episode_number
  const type = (anime.type || 'ONA').toLowerCase()
  const isCompleted = (anime.status || '').toLowerCase() === 'completed'
  const rating = formatRating(anime.rating)
  const watchHref = ep ? `/watch/${anime.slug}-episode-${ep}` : `/anime/${anime.slug}`

  return `<div class="anime-card">
  <a href="${watchHref}" class="card-link">
    <div class="card-image">
      <img src="${anime.cover_image || ''}" alt="${anime.title}" loading="lazy">
      ${isCompleted ? `<div class="bdg-wrap"><div class="bdg completed">Completed</div></div>` : ''}
      <div class="card-type-badge ${type}">${anime.type || 'ONA'}</div>
      <div class="card-bottom-bar">
        <div class="card-ep-info">
          ${ep ? `<span class="card-ep-label">Ep ${ep}</span>` : `<span class="card-ep-label">${anime.type === 'Movie' ? 'Movie' : 'N/A'}</span>`}
        </div>
        <div class="card-right-badges">
          <span class="card-rating-badge">
            <svg viewBox="0 0 24 24" fill="#fbbf24" width="10" height="10"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ${rating}
          </span>
        </div>
      </div>
      <div class="card-play-overlay">
        <div class="card-play-btn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </div>
    <div class="card-info">
      <h3 class="card-title">${anime.title}</h3>
    </div>
  </a>
</div>`
}

function recCard(anime: any): string {
  const status = (anime.status || 'ongoing').toLowerCase()
  const type = (anime.type || 'ONA').toLowerCase()
  const ep = anime.latest_episode
  const href = `/anime/${anime.slug}`
  return `<a href="${href}" class="rec-card">
  <div class="rec-card-img">
    <img src="${anime.cover_image || ''}" alt="${anime.title}" loading="lazy">
    <div class="sc-ribbon-wrap"><div class="sc-ribbon ${status}">${anime.status || 'Ongoing'}</div></div>
    <div class="sc-type">${anime.type || 'ONA'}</div>
  </div>
  <div class="sc-info"><h3 class="sc-title">${anime.title}</h3></div>
</a>`
}

export function animePage(data: { anime: any, episodes: any[], related: any[] }) {
  const { anime, episodes, related } = data
  const genres = genresFromJson(anime.genres)
  const studios = genresFromJson(anime.studios)

  const latestEp = episodes.length > 0 ? episodes[episodes.length - 1].episode_number : null
  const firstEp = episodes.length > 0 ? episodes[0].episode_number : 1

  // Episodes grid - sorted descending (newest first)
  const sortedEps = [...episodes].sort((a, b) => b.episode_number - a.episode_number)
  const epButtons = sortedEps.map(ep => `<a href="/watch/${anime.slug}-episode-${ep.episode_number}"
   class="ep-btn"
   data-ep="${ep.episode_number}"
   style="display:flex;align-items:center;justify-content:center;padding:10px;border-radius:10px;border:1px solid #e5e5e5;text-decoration:none;font-weight:600;">
   ${ep.episode_number}
</a>`).join('')

  // Recommendations by genre
  const recGenres = genres.slice(0, 3)
  const recTabs = recGenres.map((g, i) => `<button class="rec-tab${i === 0 ? ' active' : ''}" data-genre="${g}">${g}</button>`).join('')
  const recGrids = recGenres.map((g, i) => {
    const relAnime = related.filter(r => {
      const rGenres = genresFromJson(r.genres)
      return rGenres.includes(g)
    }).slice(0, 6)
    return `<div class="rec-grid${i === 0 ? ' active' : ''}" data-genre="${g}">
    ${relAnime.length > 0 ? relAnime.map(r => recCard(r)).join('') : related.slice(0, 6).map(r => recCard(r)).join('')}
  </div>`
  }).join('')

  const communityBanner = `
<style>
  .social-comm-banner {
    --sb-admin-bg:  ;
    --sb-admin-txt: ;
  }
</style>
<div class="social-comm-banner">
  <div class="social-comm-inner">
    <span class="social-comm-text">Join our community!</span>
    <div class="social-comm-btns">
      <a href="https://whatsapp.com/channel/0029Vb64XXC5a243Nqli6Z27" target="_blank" rel="noopener"
         class="social-comm-btn social-comm-btn-whatsapp">
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.564 4.14 1.543 5.877L.057 23.428a.75.75 0 0 0 .921.921l5.551-1.486A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75A9.73 9.73 0 0 1 6.51 20.13l-.38-.226-3.934 1.053 1.053-3.934-.226-.38A9.73 9.73 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
        <span>WhatsApp</span>
      </a>
      <a href="https://t.me/AnimeDonghuaOfficial" target="_blank" rel="noopener"
         class="social-comm-btn social-comm-btn-telegram">
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        <span>Telegram</span>
      </a>
    </div>
  </div>
</div>`

  const content = `
${communityBanner}

<!-- ═══════════════ BREADCRUMB ═══════════════ -->
<div class="dv-breadcrumb-bar">
  <div class="container">
    <nav class="detail-breadcrumb">
      <a href="/">Home</a>
      <span class="dv-bc-sep">›</span>
      <a href="/search?type=${encodeURIComponent(anime.type || 'ONA')}">${anime.type || 'ONA'}</a>
      <span class="dv-bc-sep">›</span>
      <span class="dv-bc-current">${anime.title}</span>
    </nav>
  </div>
</div>

<!-- ═══════════════ BANNER ═══════════════ -->
<div class="detail-banner-wrap">
  <div class="detail-banner" style="background-image:url('${anime.banner_image || anime.cover_image || ''}')"></div>
  <div class="detail-banner-overlay"></div>
</div>

<div class="container">

<!-- ═══════════════ HERO ═══════════════ -->
<div class="dv-wrap">

  <!-- LEFT: Poster -->
  <div class="dv-left">
    <div class="dv-poster-box">
      <img src="${anime.cover_image || ''}"
           alt="${anime.title}"
           class="dv-poster-img">
    </div>
  </div>

  <!-- RIGHT: all text -->
  <div class="dv-right">

    <h1 class="dv-title">${anime.title}</h1>
    ${anime.title_native ? `<p class="dv-alt-title">${anime.title_native}</p>` : ''}

    <p class="dv-seo-inline">
      Watch <strong>${anime.title}</strong> full episodes online free in HD.
    </p>

    <div class="dv-info-grid">
      <div class="dv-info-item"><span class="dv-info-dot"></span><span class="dv-info-label">Status:</span><span class="dv-info-val dv-status-${(anime.status || 'ongoing').toLowerCase()}">${anime.status || 'Ongoing'}</span></div>
      <div class="dv-info-item"><span class="dv-info-dot"></span><span class="dv-info-label">Episodes:</span><span class="dv-info-val">${episodes.length || 'TBA'}</span></div>
      <div class="dv-info-item"><span class="dv-info-dot"></span><span class="dv-info-label">Type:</span><span class="dv-info-val">${anime.type || 'ONA'}</span></div>
      <div class="dv-info-item"><span class="dv-info-dot"></span><span class="dv-info-label">Language:</span><span class="dv-info-val">${anime.country || 'Chinese'}</span></div>
      ${anime.view_count ? `<div class="dv-info-item"><span class="dv-info-dot"></span><span class="dv-info-label">Views:</span><span class="dv-info-val">${anime.view_count}</span></div>` : ''}
      ${studios.length > 0 ? `<div class="dv-info-item"><span class="dv-info-dot"></span><span class="dv-info-label">Studio:</span><span class="dv-info-val">${studios[0]}</span></div>` : ''}
      ${anime.release_year ? `<div class="dv-info-item"><span class="dv-info-dot"></span><span class="dv-info-label">Season:</span><span class="dv-info-val">${anime.release_year}</span></div>` : ''}
    </div>

    <div class="dv-genres">
      ${genres.slice(0, 5).map(g => `<a href="/search?genre=${encodeURIComponent(g)}" class="dv-genre-tag">${g}</a>`).join('')}
    </div>

    <div class="dv-action-row">
      ${episodes.length > 0
        ? `<a href="/watch/${anime.slug}-episode-${firstEp}" class="dv-btn-watch">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>
        Watch EP ${firstEp}
      </a>`
        : `<span class="dv-btn-watch" style="opacity:0.6;cursor:default;">No Episodes Yet</span>`}
      <a href="/user/login?redirect=%2Fanime%2F${anime.slug}"
         class="dv-btn-secondary dv-bookmark-btn">
        <i data-lucide="bookmark"></i> Bookmark
      </a>
    </div>

    ${anime.description ? `
    <div class="dv-synopsis-block">
      <h3 class="dv-synopsis-label">Synopsis</h3>
      <p class="dv-synopsis-text" id="synopsisText">${anime.description}</p>
      <button class="synopsis-toggle" id="synopsisToggle">…Show More</button>
    </div>` : ''}

  </div>
</div>

<!-- ═══════════════ EPISODES ═══════════════ -->
<div class="dv-episodes-section" style="width:100%;">

  <div class="dv-episodes-header" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
    <h3 style="display:flex;align-items:center;gap:6px;margin:0;">
      <i data-lucide="film" class="icon-sm"></i>
      Episodes <span class="ep-count">${episodes.length}</span>
    </h3>
    <input
      type="text"
      id="epSearch"
      placeholder="Search ep…"
      style="padding:6px 10px;border-radius:8px;border:1px solid var(--border2,#ddd);max-width:160px;width:100%;background:var(--bg4,#1a1a2e);color:var(--text1,#fff);"
    >
  </div>

  <div id="episodesGrid"
  style="
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(60px,1fr));
  gap:5px;
  max-height:320px;
  overflow-y:auto;
  width:100%;
  ">
    ${epButtons}
  </div>

</div>

${recGenres.length > 0 && related.length > 0 ? `
<!-- Recommendations -->
<div class="rec-section" style="margin-top:1.5rem">
  <div class="detail-section-head">
    <h2 class="detail-section-title">Recommendations</h2>
  </div>
  <div class="rec-tabs" style="margin-bottom:.75rem">
    ${recTabs}
  </div>
  ${recGrids}
</div>` : ''}

</div>

<!-- ═══════════════ RELATED ═══════════════ -->
${related.length > 0 ? `
<div class="container" style="margin-top:1.5rem">
  <section class="anime-section">
    <div class="section-header">
      <h2 class="section-title"><i data-lucide="grid" class="icon-sm"></i> Related Anime</h2>
    </div>
    <div class="anime-grid">
      ${related.map(r => animeCard(r)).join('')}
    </div>
  </section>
</div>` : ''}

<!-- Scripts -->
<script>
(function(){
  var text = document.getElementById('synopsisText');
  var toggle = document.getElementById('synopsisToggle');
  if(!toggle || !text) return;
  toggle.addEventListener('click', function(){
    var expanded = text.classList.toggle('expanded');
    toggle.textContent = expanded ? 'Show Less' : '…Show More';
  });
})();

(function(){
  var inp = document.getElementById('epSearch');
  var grid = document.getElementById('episodesGrid');
  if(!inp || !grid) return;
  inp.addEventListener('input', function(){
    var q = this.value.trim();
    grid.querySelectorAll('.ep-btn').forEach(function(btn){
      btn.classList.toggle('hidden', q !== '' && !btn.dataset.ep.includes(q));
    });
  });
})();

document.querySelectorAll('.rec-tab').forEach(function(btn){
  btn.addEventListener('click', function(){
    var genre = this.dataset.genre;
    document.querySelectorAll('.rec-tab').forEach(function(b){ b.classList.remove('active'); });
    document.querySelectorAll('.rec-grid').forEach(function(g){ g.classList.remove('active'); });
    this.classList.add('active');
    var grid = document.querySelector('.rec-grid[data-genre="' + genre + '"]');
    if(grid) grid.classList.add('active');
  });
});
</script>`

  const title = `${anime.title} - Watch Online Free | Donghualand`
  const description = anime.description ? anime.description.substring(0, 160) : `Watch ${anime.title} online free in HD.`
  return layout(title, content, '', description)
}
