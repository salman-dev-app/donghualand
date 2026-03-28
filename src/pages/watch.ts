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

export function watchPage(data: { anime: any, episode: any, allEpisodes: any[], prevEp: any, nextEp: any, nowAiring?: any[], popular?: any[] }) {
  const { anime, episode, allEpisodes, prevEp, nextEp } = data
  const nowAiring = data.nowAiring || []
  const popular = data.popular || []
  const genres = genresFromJson(anime.genres)

  const hasEmbed = episode.embed_url && episode.embed_url.trim()
  const hasVideo = episode.video_url && episode.video_url.trim()

  // Sort episodes descending
  const sortedEps = [...allEpisodes].sort((a, b) => b.episode_number - a.episode_number)

  // Mobile ep pills
  const mobEpPills = sortedEps.map(ep => {
    const isActive = ep.episode_number === episode.episode_number
    return `<a href="/watch/${anime.slug}-episode-${ep.episode_number}"
   class="ep-pill${isActive ? ' active' : ''} "
   id="mob-ep-${ep.episode_number}"
   data-ep="${ep.episode_number}">
  ${ep.episode_number}
</a>`
  }).join('')

  // Sidebar ep pills
  const sidebarEpPills = sortedEps.map(ep => {
    const isActive = ep.episode_number === episode.episode_number
    return `<a href="/watch/${anime.slug}-episode-${ep.episode_number}"
   class="sidebar-ep-pill${isActive ? ' active' : ''} "
   id="sep-${ep.episode_number}"
   data-ep="${ep.episode_number}"
   title="Episode ${ep.episode_number}">
  ${ep.episode_number}
</a>`
  }).join('')

  // Now airing sidebar
  const nowAiringHtml = nowAiring.length > 0 ? `
<div class="sidebar-section">
  <h4 class="sidebar-title">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    Now Airing
  </h4>
  <div class="sidebar-list">
    ${nowAiring.slice(0, 8).map(a => `
    <a href="/anime/${a.slug}" class="sidebar-item">
      <img src="${a.cover_image || ''}" alt="${a.title}">
      <div class="sidebar-item-info">
        <p class="sidebar-item-title">${a.title}</p>
        <p class="sidebar-item-meta">
          ${a.type || 'ONA'} · ${a.release_year || ''}
        </p>
      </div>
    </a>`).join('')}
  </div>
</div>` : ''

  // Recommendations sidebar by genre
  const recGenres = genres.slice(0, 3)
  const recTabsSidebar = recGenres.map((g, i) => `<button class="rec-tab${i === 0 ? ' active' : ''}" data-genre="${g}">${g}</button>`).join('')
  const recGridsSidebar = recGenres.map((g, i) => {
    const items = popular.filter(a => {
      const ag = genresFromJson(a.genres)
      return ag.includes(g)
    }).slice(0, 6)
    const cards = (items.length > 0 ? items : popular.slice(0, 6)).map(a => {
      const status = (a.status || 'ongoing').toLowerCase()
      return `<a href="/anime/${a.slug}" class="rec-card">
  <div class="rec-card-img">
    <img src="${a.cover_image || ''}" alt="${a.title}" loading="lazy">
    <div class="sc-ribbon-wrap"><div class="sc-ribbon ${status}">${a.status || 'Ongoing'}</div></div>
    <div class="sc-type">${a.type || 'ONA'}</div>
    <div class="rec-card-bottom">
      <span class="rec-card-status">${a.status || 'Ongoing'}</span>
      <span class="rec-sub">SUB</span>
    </div>
  </div>
  <div class="sc-info"><h3 class="sc-title">${a.title}</h3></div>
</a>`
    }).join('')
    return `<div class="rec-grid rec-grid-sidebar${i === 0 ? ' active' : ''}" data-genre="${g}">
    ${cards}
  </div>`
  }).join('')

  // Popular section (mob below)
  const popularTabs = ['Weekly', 'Monthly', 'All']
  const popularHtml = popular.length > 0 ? `
<div class="mob-below-popular popular-watch-section">
  <div class="mob-below-header">
    <h4 class="sidebar-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      Popular Anime
    </h4>
    <div class="pop-tab-group pop-tab-group-sm">
      <button class="pop-tab active" data-tab="Weekly-m">Weekly</button>
      <button class="pop-tab " data-tab="Monthly-m">Monthly</button>
      <button class="pop-tab " data-tab="All-m">All</button>
    </div>
  </div>
  <div class="pop-list active" data-tab="Weekly-m">
    ${popular.slice(0, 10).map((a, i) => `
    <a href="/anime/${a.slug}" class="pop-list-item">
      <span class="pop-rank pop-rank-sm${i < 3 ? ' pop-rank-top' : ''}">${i + 1}</span>
      <img src="${a.cover_image || ''}" alt="${a.title}" class="pop-thumb pop-thumb-sm">
      <div class="pop-info">
        <p class="pop-title">${a.title}</p>
        <p class="pop-meta">
          <span>${genresFromJson(a.genres)[0] || 'Action'}</span>
          <span class="pop-dot">·</span><span class="pop-star">★ ${formatRating(a.rating)}</span>
        </p>
      </div>
    </a>`).join('')}
  </div>
  <div class="pop-list " data-tab="Monthly-m">
    ${popular.slice(0, 10).map((a, i) => `
    <a href="/anime/${a.slug}" class="pop-list-item">
      <span class="pop-rank pop-rank-sm${i < 3 ? ' pop-rank-top' : ''}">${i + 1}</span>
      <img src="${a.cover_image || ''}" alt="${a.title}" class="pop-thumb pop-thumb-sm">
      <div class="pop-info">
        <p class="pop-title">${a.title}</p>
        <p class="pop-meta">
          <span>${genresFromJson(a.genres)[0] || 'Action'}</span>
          <span class="pop-dot">·</span><span class="pop-star">★ ${formatRating(a.rating)}</span>
        </p>
      </div>
    </a>`).join('')}
  </div>
  <div class="pop-list " data-tab="All-m">
    ${popular.slice(0, 10).map((a, i) => `
    <a href="/anime/${a.slug}" class="pop-list-item">
      <span class="pop-rank pop-rank-sm${i < 3 ? ' pop-rank-top' : ''}">${i + 1}</span>
      <img src="${a.cover_image || ''}" alt="${a.title}" class="pop-thumb pop-thumb-sm">
      <div class="pop-info">
        <p class="pop-title">${a.title}</p>
        <p class="pop-meta">
          <span>${genresFromJson(a.genres)[0] || 'Action'}</span>
          <span class="pop-dot">·</span><span class="pop-star">★ ${formatRating(a.rating)}</span>
        </p>
      </div>
    </a>`).join('')}
  </div>
</div>` : ''

  // Mob below recommendations
  const mobRecHtml = recGenres.length > 0 && popular.length > 0 ? `
<div class="mob-below-rec rec-section rec-section-mob">
  <h4 class="sidebar-title mob-rec-title">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    Recommendation
  </h4>
  <div class="rec-tabs rec-tabs-sm">
    ${recGenres.map((g, i) => `<button class="rec-tab${i === 0 ? ' active' : ''}" data-genre="${g}">${g}</button>`).join('')}
  </div>
  ${recGenres.map((g, i) => {
    const items = (popular.filter(a => genresFromJson(a.genres).includes(g)).slice(0, 6))
    const cards = (items.length > 0 ? items : popular.slice(0, 6)).map(a => {
      const status = (a.status || 'ongoing').toLowerCase()
      return `<a href="/anime/${a.slug}" class="rec-card">
  <div class="rec-card-img">
    <img src="${a.cover_image || ''}" alt="${a.title}" loading="lazy">
    <div class="sc-ribbon-wrap"><div class="sc-ribbon ${status}">${a.status || 'Ongoing'}</div></div>
    <div class="sc-type">${a.type || 'ONA'}</div>
    <div class="rec-card-bottom">
      <span class="rec-card-status">${a.status || 'Ongoing'}</span>
      <span class="rec-sub">SUB</span>
    </div>
  </div>
  <div class="sc-info"><h3 class="sc-title">${a.title}</h3></div>
</a>`
    }).join('')
    return `<div class="rec-grid rec-grid-mob${i === 0 ? ' active' : ''}" data-genre="${g}">
    ${cards}
  </div>`
  }).join('')}
</div>` : ''

  // Share URLs
  const pageUrl = `https://donghualand.vip/watch/${anime.slug}-episode-${episode.episode_number}`
  const shareTitle = `${anime.title} Episode ${episode.episode_number}`
  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
  const twShare = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareTitle)}`
  const waShare = `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + pageUrl)}`
  const tgShare = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareTitle)}`

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

<div class="watch-page" id="watchPage">

  <!-- ===== MAIN COLUMN ===== -->
  <div class="watch-main">
    <!-- Anime info card -->
    <div class="wic-card">

      <!-- Title row -->
      <div class="wic-title-row">
        <a href="/anime/${anime.slug}" class="wic-play-icon" title="View anime"></a>
        <h2 class="wic-title">
          ${anime.title} Episode ${episode.episode_number}
        </h2>
      </div>

      <!-- Meta row -->
      <div class="wic-meta-row">
        <span class="wic-sub-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          ${anime.type || 'ONA'}
        </span>
        ${episode.air_date ? `
        <span class="wic-date">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Released on ${episode.air_date}
        </span>` : ''}
        <span class="wic-status-badge wic-status-${(anime.status || 'ongoing').toLowerCase()}">${anime.status || 'Ongoing'}</span>
      </div>

      <!-- Series row -->
      <div class="wic-series-row">
        <span class="wic-series-label">series:</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
        <a href="/anime/${anime.slug}" class="wic-series-link">${anime.title}</a>
      </div>

      <!-- Share buttons -->
      <div class="wic-share-row">
        <a href="${fbShare}" target="_blank" rel="noopener" class="wic-share-btn wic-share-fb" title="Share on Facebook">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="${twShare}" target="_blank" rel="noopener" class="wic-share-btn wic-share-tw" title="Share on Twitter">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
        </a>
        <a href="${waShare}" target="_blank" rel="noopener" class="wic-share-btn wic-share-wa" title="Share on WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.564 4.14 1.543 5.877L.057 23.428a.75.75 0 0 0 .921.921l5.551-1.486A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75A9.73 9.73 0 0 1 6.51 20.13l-.38-.226-3.934 1.053 1.053-3.934-.226-.38A9.73 9.73 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
        </a>
        <a href="${tgShare}" target="_blank" rel="noopener" class="wic-share-btn wic-share-tg" title="Share on Telegram">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        </a>
      </div>

    </div>

    <!-- VIDEO PLAYER -->
    <div class="video-outer" id="videoOuter">
      <div class="video-wrapper" id="videoWrapper">
        ${hasEmbed
          ? `<iframe src="${episode.embed_url}"
          frameborder="0" allowfullscreen
          allow="autoplay; encrypted-media; picture-in-picture"
          class="video-frame" id="videoFrame"></iframe>`
          : hasVideo
          ? `<video controls class="video-frame" id="videoFrame">
          <source src="${episode.video_url}" type="video/mp4">
        </video>`
          : `<div class="video-frame" id="videoFrame" style="display:flex;align-items:center;justify-content:center;background:#111;color:#888;flex-direction:column;gap:12px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          <p style="font-size:14px;">No video source available</p>
        </div>`}
      </div>

      <!-- Controls bar: Prev/Next | Bulb | Expand -->
      <div class="video-controls-bar">
        <div class="vc-nav">
          ${!prevEp
            ? `<span class="vc-btn disabled"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><path d="m15 18-6-6 6-6"/><line x1="6" y1="6" x2="6" y2="18"/></svg> Prev</span>`
            : `<a href="/watch/${anime.slug}-episode-${prevEp.episode_number}" class="vc-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><path d="m15 18-6-6 6-6"/><line x1="6" y1="6" x2="6" y2="18"/></svg> Prev
          </a>`}
          ${nextEp
            ? `<a href="/watch/${anime.slug}-episode-${nextEp.episode_number}" class="vc-btn">
            Next <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><path d="m9 6 6 6-6 6"/><line x1="18" y1="6" x2="18" y2="18"/></svg>
          </a>`
            : ''}
        </div>

        <div class="vc-actions">
          <button class="vc-icon-btn" id="bulbBtn" title="Bulb Mode" onclick="toggleBulb()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17"><path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.2 4.16-3 5.2V17H9v-2.8C7.2 13.16 6 11.22 6 9a6 6 0 0 1 6-6z"/></svg>
          </button>
          <button class="vc-icon-btn" id="expandBtn" title="Expand" onclick="toggleExpand()">
            <svg id="expandIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- SERVER SWITCHER -->
    ${hasEmbed || hasVideo ? `
    <div class="server-switcher">
      <span class="server-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="18" r="1" fill="currentColor"/></svg>
        Servers:
      </span>
      ${hasEmbed ? `<button class="server-btn active" data-src="${episode.embed_url}" data-type="embed" onclick="switchServer(this)">Server 1</button>` : ''}
      ${hasVideo ? `<button class="server-btn${!hasEmbed ? ' active' : ''}" data-src="${episode.video_url}" data-type="video" onclick="switchServer(this)">Direct</button>` : ''}
    </div>` : ''}

    <!-- Mobile Episode List -->
    <div class="mob-ep-bar">
      <div class="mob-ep-header">
        <h4 class="mob-ep-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          Episodes
        </h4>
        <input type="text" placeholder="Search..." class="mob-ep-search" oninput="filterMobEps(this.value)">
      </div>
      <div class="mob-ep-scroll" id="mobEpScroll">
        ${mobEpPills}
      </div>
    </div>

  </div><!-- /.watch-main -->

  <!-- ===== SIDEBAR ===== -->
  <div class="watch-sidebar" id="watchSidebar">

    <!-- Anime info -->
    <div class="sidebar-anime-info desktop-only">
      <img src="${anime.cover_image || ''}" alt="${anime.title}" class="sidebar-cover">
      <div class="sidebar-text">
        <h3>${anime.title}</h3>
        <p class="sidebar-genre">${genres.slice(0, 3).join(', ')}</p>
        <div class="sidebar-meta">
          <span class="status-badge ${(anime.status || 'ongoing').toLowerCase()}">${anime.status || 'Ongoing'}</span>
          ${anime.release_year ? `<span>${anime.release_year}</span>` : ''}
        </div>
      </div>
    </div>

    <!-- Episodes -->
    <div class="sidebar-section sidebar-ep-section">
      <div class="sidebar-ep-header">
        <h4 class="sidebar-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          Episodes <span class="ep-count">${allEpisodes.length}</span>
        </h4>
        <input type="text" id="sidebarEpSearch" placeholder="Search..." class="sidebar-ep-search" oninput="filterSidebarEps(this.value)">
      </div>
      <div class="sidebar-ep-grid" id="sidebarEpGrid">
        ${sidebarEpPills}
      </div>
    </div>

    ${nowAiringHtml}

    <!-- Recommendations -->
    ${recGenres.length > 0 && popular.length > 0 ? `
    <div class="sidebar-section rec-section">
      <div class="sidebar-section-header sidebar-rec-header">
        <h4 class="sidebar-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Recommendation
        </h4>
      </div>
      <div class="rec-tabs rec-tabs-sm">
        ${recTabsSidebar}
      </div>
      ${recGridsSidebar}
    </div>` : ''}

  </div><!-- /.watch-sidebar -->
</div><!-- /.watch-page -->

<!-- Bulb overlay -->
<div id="bulbOverlay" class="bulb-overlay" onclick="toggleBulb()"></div>

${popularHtml}
${mobRecHtml}

<script>
function switchServer(btn) {
  document.querySelectorAll('.server-btn:not(.server-btn-locked)').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  var frame = document.getElementById('videoFrame');
  if(frame && btn.dataset.src){
    if(btn.dataset.type === 'embed'){
      frame.src = btn.dataset.src;
    }
  }
}

function toggleBulb() {
  var page = document.getElementById('watchPage');
  var btn = document.getElementById('bulbBtn');
  var ov = document.getElementById('bulbOverlay');
  var on = page.classList.toggle('bulb-mode');
  btn.classList.toggle('bulb-on', on);
  ov.classList.toggle('active', on);
}

var isExpanded = false;
function toggleExpand() {
  isExpanded = !isExpanded;
  document.getElementById('watchPage').classList.toggle('expanded', isExpanded);
  var icon = document.getElementById('expandIcon');
  icon.innerHTML = isExpanded
    ? '<path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>'
    : '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>';
}

function filterSidebarEps(q) {
  document.querySelectorAll('.sidebar-ep-pill').forEach(function(p){
    p.classList.toggle('hidden', q.trim() !== '' && !p.dataset.ep.includes(q.trim()));
  });
}

function filterMobEps(q) {
  document.querySelectorAll('#mobEpScroll .ep-pill').forEach(function(p){
    p.classList.toggle('hidden', q.trim() !== '' && !p.dataset.ep.includes(q.trim()));
  });
}

// Pop tabs
document.querySelectorAll('.pop-tab').forEach(function(btn){
  btn.addEventListener('click', function(){
    var tab = this.dataset.tab;
    var group = this.closest('.pop-tab-group');
    if(group) group.querySelectorAll('.pop-tab').forEach(function(b){ b.classList.remove('active'); });
    this.classList.add('active');
    var container = this.closest('.mob-below-popular');
    if(container){
      container.querySelectorAll('.pop-list').forEach(function(l){ l.classList.remove('active'); });
      var list = container.querySelector('.pop-list[data-tab="'+tab+'"]');
      if(list) list.classList.add('active');
    }
  });
});

// Rec tabs
document.querySelectorAll('.rec-tab').forEach(function(btn){
  btn.addEventListener('click', function(){
    var genre = this.dataset.genre;
    var container = this.closest('.sidebar-section, .mob-below-rec');
    if(!container) return;
    container.querySelectorAll('.rec-tab').forEach(function(b){ b.classList.remove('active'); });
    container.querySelectorAll('.rec-grid').forEach(function(g){ g.classList.remove('active'); });
    this.classList.add('active');
    var grid = container.querySelector('.rec-grid[data-genre="'+genre+'"]');
    if(grid) grid.classList.add('active');
  });
});

document.addEventListener('DOMContentLoaded', function(){
  var mobActive = document.getElementById('mob-ep-${episode.episode_number}');
  var mobScroll = document.getElementById('mobEpScroll');
  if(mobActive && mobScroll){
    mobScroll.scrollLeft = mobActive.offsetLeft - mobScroll.offsetWidth / 2 + mobActive.offsetWidth / 2;
  }
  var sepActive = document.getElementById('sep-${episode.episode_number}');
  var sepGrid = document.getElementById('sidebarEpGrid');
  if(sepActive && sepGrid){
    sepGrid.scrollTop = sepActive.offsetTop - sepGrid.offsetTop - 60;
  }
});

// Watch history
(function(){
  try {
    var hist = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    var item = {
      slug: '${anime.slug}',
      title: '${anime.title.replace(/'/g, "\\'")}',
      cover: '${(anime.cover_image || '').replace(/'/g, "\\'")}',
      ep: ${episode.episode_number},
      href: '/watch/${anime.slug}-episode-${episode.episode_number}',
      date: new Date().toISOString()
    };
    var idx = hist.findIndex(function(h){ return h.slug === item.slug && h.ep === item.ep; });
    if(idx >= 0) hist.splice(idx, 1);
    hist.unshift(item);
    localStorage.setItem('watchHistory', JSON.stringify(hist.slice(0, 100)));
  } catch(e){}
})();
</script>`

  const epNum = episode.episode_number
  const title = `${anime.title} Episode ${epNum} - Donghualand`
  const description = anime.description ? anime.description.substring(0, 160) : `Watch ${anime.title} Episode ${epNum} online free.`
  return layout(title, content, '', description)
}
