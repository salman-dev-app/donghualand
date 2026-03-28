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

  // Build episode grid items — use anime cover_image as thumbnail (sorted ascending)
  const sortedEpsAsc = [...allEpisodes].sort((a, b) => a.episode_number - b.episode_number)
  const animeCover = anime.cover_image || ''

  const episodeGridItems = sortedEpsAsc.map(ep => {
    const isActive = ep.episode_number === episode.episode_number
    return `<a href="/watch/${anime.slug}-episode-${ep.episode_number}"
       class="ep-grid-item${isActive ? ' active' : ''}"
       title="Episode ${ep.episode_number}${ep.title ? ': ' + ep.title : ''}"
       data-epnum="${ep.episode_number}">
      <img src="${animeCover}" alt="EP ${ep.episode_number}" class="ep-grid-thumb"
           onerror="this.style.background='var(--bg5)';this.style.minHeight='70px';">
      <span class="ep-grid-num">${isActive ? '<i class="fas fa-volume-up" style="font-size:8px;color:var(--purple2);display:block;margin-bottom:2px;"></i>' : ''}EP ${ep.episode_number}</span>
    </a>`
  }).join('')

  // Sidebar ep pills (sorted descending for sidebar)
  const sortedEpsDesc = [...allEpisodes].sort((a, b) => b.episode_number - a.episode_number)
  const sidebarEpPills = sortedEpsDesc.map(ep => {
    const isActive = ep.episode_number === episode.episode_number
    return `<a href="/watch/${anime.slug}-episode-${ep.episode_number}"
   class="sidebar-ep-pill${isActive ? ' active' : ''}"
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

<div class="watch-page-wrap" id="watchPage">

  <!-- ====== Full-Width Player Section ====== -->
  <div class="watch-main-col">

    <!-- Breadcrumb / Title -->
    <div class="wic-title-row">
      <a href="/anime/${anime.slug}" class="wic-play-icon" title="View anime"></a>
      <h2 class="wic-title">${anime.title} Episode ${episode.episode_number}</h2>
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
      ${nextEp
        ? `<a href="/watch/${anime.slug}-episode-${nextEp.episode_number}" class="ep-nav-btn" style="margin-left:auto;">Next <i class="fas fa-chevron-right"></i></a>`
        : `<span class="ep-nav-btn disabled" style="margin-left:auto;">Next <i class="fas fa-chevron-right"></i></span>`}
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

    <!-- Watch Meta Card -->
    <div class="watch-meta-card">
      <div class="wm-head">
        <img src="${anime.cover_image || ''}" alt="${anime.title}" class="wm-poster"
             onerror="this.style.display='none'">
        <div class="wm-info">
          <a href="/anime/${anime.slug}" class="wm-title" style="transition:color 0.2s;"
             onmouseover="this.style.color='var(--purple2)'" onmouseout="this.style.color=''">${anime.title}</a>
          <div class="wm-badges">
            <span class="badge badge-purple" style="font-size:9px;">${anime.type || 'ONA'}</span>
            <span class="badge ${anime.status === 'Ongoing' ? 'badge-green' : 'badge-blue'}" style="font-size:9px;">${anime.status || 'Ongoing'}</span>
            ${anime.release_year ? `<span class="badge badge-gray" style="font-size:9px;">${anime.release_year}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="wm-actions">
        <button class="wm-action-btn" id="wlBtn" data-slug="${anime.slug}" onclick="addToWatchlist()">
          <i class="fas fa-bookmark"></i> Watchlist
        </button>
        <button class="wm-action-btn" onclick="reportIssue()">
          <i class="fas fa-flag"></i> Report
        </button>
        <button class="wm-action-btn" onclick="shareLink()">
          <i class="fas fa-share-alt"></i> Share
        </button>
        ${nextEp ? `
        <a href="/watch/${anime.slug}-episode-${nextEp.episode_number}"
           class="wm-action-btn" style="margin-left:auto; border-color:rgba(108,92,231,0.4); color:var(--purple2);">
          <i class="fas fa-forward"></i> Next EP
        </a>` : ''}
      </div>
    </div>

    <!-- Synopsis snippet -->
    ${anime.description ? `
    <div style="background:var(--bg3); border:1px solid var(--border); border-radius:var(--r10); padding:14px; margin-bottom:12px;">
      <div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:var(--text3); margin-bottom:8px;">About</div>
      <p style="font-size:13px; color:var(--text2); line-height:1.7; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${anime.description}</p>
    </div>` : ''}

    <!-- ====== EPISODE GRID (below player) ====== -->
    <div class="ep-grid-section" id="epGridSection">
      <div class="ep-grid-head">
        <div class="ep-grid-title">
          <i class="fas fa-th-large"></i>
          Episodes
          <span class="ep-grid-count">${allEpisodes.length} total</span>
        </div>
        <div class="ep-grid-search-wrap">
          <i class="fas fa-search ep-grid-search-icon"></i>
          <input
            type="text"
            class="ep-grid-search"
            id="epGridSearch"
            placeholder="Search ep..."
            oninput="filterEpisodeGrid(this.value)"
            autocomplete="off"
          >
        </div>
      </div>
      <div class="ep-grid-body">
        <div class="ep-grid-wrap" id="epGridWrap">
          ${episodeGridItems}
        </div>
        <div class="ep-grid-empty" id="epGridEmpty">
          <i class="fas fa-search" style="margin-right:6px;"></i> No episodes found
        </div>
      </div>
    </div>

    <!-- ====== COMMENTS SECTION (below episode grid) ====== -->
    <div class="comments-section" id="commentsSection">
      <div class="comments-hd">
        <span><i class="fas fa-comments" style="color:var(--purple2);margin-right:6px;"></i> Comments</span>
        <span class="comments-count" id="commentsCount" style="font-size:12px;color:var(--text3);"></span>
      </div>

      <!-- Post Comment Box -->
      <div class="comment-post-box" id="commentPostBox">
        <div id="commentLoginNotice" style="display:none; text-align:center; padding:14px; background:var(--bg4); border-radius:var(--r8); font-size:13px; color:var(--text3);">
          <a href="/user/login" style="color:var(--purple2);">Sign in</a> to leave a comment.
        </div>
        <div id="commentForm" style="display:none;">
          <div style="display:flex; gap:10px; align-items:flex-start;">
            <img id="commentUserAva" src="" alt="" style="width:36px;height:36px;border-radius:50%;flex-shrink:0;object-fit:cover;">
            <div style="flex:1;">
              <textarea id="commentInput" placeholder="Share your thoughts about this episode..."
                style="width:100%;min-height:80px;background:var(--bg4);border:1px solid var(--border2);border-radius:var(--r8);padding:10px;color:var(--text1);font-size:13px;resize:vertical;font-family:inherit;outline:none;transition:border-color 0.2s;"
                onfocus="this.style.borderColor='var(--purple)'" onblur="this.style.borderColor='var(--border2)'"
                maxlength="2000"></textarea>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;flex-wrap:wrap;gap:8px;">
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text3);cursor:pointer;">
                  <input type="checkbox" id="commentSpoiler" style="accent-color:var(--purple);">
                  Mark as spoiler
                </label>
                <div style="display:flex;gap:8px;align-items:center;">
                  <span id="commentCharCount" style="font-size:11px;color:var(--text4);">0/2000</span>
                  <button onclick="postComment()" id="commentSubmitBtn"
                    style="padding:8px 18px;background:var(--purple);color:#fff;border:none;border-radius:var(--r8);font-size:13px;font-weight:700;cursor:pointer;">
                    <i class="fas fa-paper-plane"></i> Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments List -->
      <div id="commentsList" style="margin-top:12px;">
        <div style="text-align:center;padding:20px;color:var(--text3);font-size:13px;" id="commentsLoading">
          <i class="fas fa-spinner fa-spin"></i> Loading comments...
        </div>
      </div>
      <div id="commentsLoadMore" style="text-align:center;padding:12px;display:none;">
        <button onclick="loadMoreComments()" style="background:var(--bg4);border:1px solid var(--border2);border-radius:var(--r8);padding:8px 20px;color:var(--text2);font-size:13px;cursor:pointer;">
          Load More Comments
        </button>
      </div>
    </div>

  </div><!-- /.watch-main-col -->

</div><!-- /.watch-page-wrap -->

<!-- Bulb overlay -->
<div id="bulbOverlay" class="bulb-overlay" onclick="toggleBulb()"></div>

${popularHtml}
${mobRecHtml}

<script>
// ===== SERVER SWITCHER =====
function switchServer(btn) {
  document.querySelectorAll('.server-btn:not(.server-btn-locked)').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  var frame = document.getElementById('videoFrame');
  if (frame && btn.dataset.src) {
    if (btn.dataset.type === 'embed') {
      frame.src = btn.dataset.src;
    }
  }
}

// ===== BULB MODE =====
function toggleBulb() {
  var page = document.getElementById('watchPage');
  var btn = document.getElementById('bulbBtn');
  var ov = document.getElementById('bulbOverlay');
  if (!page) return;
  var on = page.classList.toggle('bulb-mode');
  if (btn) btn.classList.toggle('bulb-on', on);
  if (ov) ov.classList.toggle('active', on);
}

// ===== EXPAND =====
var isExpanded = false;
function toggleExpand() {
  isExpanded = !isExpanded;
  var page = document.getElementById('watchPage');
  if (page) page.classList.toggle('expanded', isExpanded);
  var icon = document.getElementById('expandIcon');
  if (icon) {
    icon.innerHTML = isExpanded
      ? '<path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>'
      : '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>';
  }
}

// ===== EPISODE GRID SEARCH =====
function filterEpisodeGrid(query) {
  var q = query.trim().toLowerCase();
  var items = document.querySelectorAll('.ep-grid-item');
  var empty = document.getElementById('epGridEmpty');
  var visible = 0;
  items.forEach(function(item) {
    var num = item.getAttribute('data-epnum') || '';
    if (!q || num.includes(q) || ('ep ' + num).includes(q) || ('episode ' + num).includes(q)) {
      item.style.display = '';
      visible++;
    } else {
      item.style.display = 'none';
    }
  });
  if (empty) empty.classList.toggle('show', visible === 0 && q.length > 0);
}

// ===== POP TABS =====
document.querySelectorAll('.pop-tab').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var tab = this.dataset.tab;
    var group = this.closest('.pop-tab-group');
    if (group) group.querySelectorAll('.pop-tab').forEach(function(b) { b.classList.remove('active'); });
    this.classList.add('active');
    var container = this.closest('.mob-below-popular');
    if (container) {
      container.querySelectorAll('.pop-list').forEach(function(l) { l.classList.remove('active'); });
      var list = container.querySelector('.pop-list[data-tab="' + tab + '"]');
      if (list) list.classList.add('active');
    }
  });
});

// ===== REC TABS =====
document.querySelectorAll('.rec-tab').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var genre = this.dataset.genre;
    var container = this.closest('.sidebar-section, .mob-below-rec');
    if (!container) return;
    container.querySelectorAll('.rec-tab').forEach(function(b) { b.classList.remove('active'); });
    container.querySelectorAll('.rec-grid').forEach(function(g) { g.classList.remove('active'); });
    this.classList.add('active');
    var grid = container.querySelector('.rec-grid[data-genre="' + genre + '"]');
    if (grid) grid.classList.add('active');
  });
});

// ===== WATCHLIST =====
function addToWatchlist() {
  if (window.toggleWatchlist) {
    window.toggleWatchlist(
      '${anime.slug}',
      '${anime.title.replace(/'/g, "\\'")}',
      '${(anime.cover_image || '').replace(/'/g, "\\'")}',
      '${anime.type || 'ONA'}'
    );
  } else {
    window.showToast && window.showToast('Added to watchlist!', 'success');
  }
}
function reportIssue() { window.showToast && window.showToast('Issue reported. Thank you!', 'info'); }
function shareLink() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
      .then(function() { window.showToast && window.showToast('Link copied!', 'success'); })
      .catch(function() { window.showToast && window.showToast('Copy: ' + window.location.href, 'info'); });
  } else {
    window.showToast && window.showToast('Copy: ' + window.location.href, 'info');
  }
}

// ===== SAVE WATCH HISTORY =====
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
    var idx = hist.findIndex(function(h) { return h.slug === item.slug && h.ep === item.ep; });
    if (idx >= 0) hist.splice(idx, 1);
    hist.unshift(item);
    localStorage.setItem('watchHistory', JSON.stringify(hist.slice(0, 100)));
  } catch(e) {}
})();

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  // Scroll to active episode
  var activeEp = document.querySelector('.ep-grid-item.active');
  if (activeEp) activeEp.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });

  // Init watchlist button
  if (window.initWatchlistBtn) window.initWatchlistBtn();

  // Init comments
  initComments();
});

// ==================== COMMENTS ====================
var EPISODE_ID = ${episode.id || 'null'};
var ANIME_ID = ${anime.id || 'null'};
var commentsPage = 1;
var totalComments = 0;
var COMMENTS_PER_PAGE = 10;
var replyingTo = null;

function initComments() {
  var token = localStorage.getItem('token');
  var user = JSON.parse(localStorage.getItem('user') || 'null');

  var loginNotice = document.getElementById('commentLoginNotice');
  var form = document.getElementById('commentForm');

  if (token && user) {
    if (form) form.style.display = 'block';
    if (loginNotice) loginNotice.style.display = 'none';
    var ava = document.getElementById('commentUserAva');
    if (ava) ava.src = user.profile_image || user.avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username) + '&background=6c5ce7&color=fff&size=36&bold=true');

    var input = document.getElementById('commentInput');
    var charCount = document.getElementById('commentCharCount');
    if (input && charCount) {
      input.addEventListener('input', function() { charCount.textContent = input.value.length + '/2000'; });
    }
  } else {
    if (loginNotice) loginNotice.style.display = 'block';
    if (form) form.style.display = 'none';
  }

  loadComments(1);
}

async function loadComments(page) {
  var loading = document.getElementById('commentsLoading');
  var list = document.getElementById('commentsList');

  try {
    var params = new URLSearchParams({ page: String(page), limit: String(COMMENTS_PER_PAGE) });
    if (EPISODE_ID) params.set('episode_id', String(EPISODE_ID));
    else if (ANIME_ID) params.set('anime_id', String(ANIME_ID));

    var res = await fetch('/api/comments?' + params);
    var data = await res.json();

    if (loading) loading.style.display = 'none';

    totalComments = data.total || 0;
    var countEl = document.getElementById('commentsCount');
    if (countEl) countEl.textContent = totalComments + ' comment' + (totalComments !== 1 ? 's' : '');

    if (page === 1) list.innerHTML = '';

    if (!data.data || data.data.length === 0) {
      if (page === 1) list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px;"><i class="fas fa-comment-slash"></i> No comments yet. Be the first!</div>';
    } else {
      data.data.forEach(c => list.appendChild(buildCommentEl(c)));
      commentsPage = page;
    }

    var loadMoreBtn = document.getElementById('commentsLoadMore');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = (data.totalPages && page < data.totalPages) ? 'block' : 'none';
    }
  } catch(e) {
    if (loading) loading.style.display = 'none';
    if (list && page === 1) list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px;">Failed to load comments.</div>';
  }
}

function buildCommentEl(c) {
  var div = document.createElement('div');
  div.className = 'comment-item';
  div.dataset.id = c.id;

  var ava = c.user_avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(c.username || '?') + '&background=6c5ce7&color=fff&size=36&bold=true');
  var isAdmin = c.user_role === 'admin';
  var date = c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '';

  var currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  var canDelete = currentUser && (currentUser.id === c.user_id || currentUser.role === 'admin');

  var repliesHtml = (c.replies || []).map(r => buildReplyHtml(r)).join('');

  div.innerHTML = \`
    <div class="comment-main">
      <img src="\${ava}" alt="\${c.username || 'User'}" class="comment-ava" onerror="this.src='https://ui-avatars.com/api/?name=?&background=333&color=fff&size=36'">
      <div class="comment-body">
        <div class="comment-meta">
          <span class="comment-user">\${escHtmlC(c.username || 'User')}\${isAdmin ? ' <span class="comment-admin-badge">Admin</span>' : ''}</span>
          <span class="comment-date">\${date}</span>
          \${c.is_spoiler ? '<span class="comment-spoiler-tag">Spoiler</span>' : ''}
        </div>
        \${c.is_spoiler
          ? \`<div class="comment-spoiler-wrap">
               <div class="comment-spoiler-blur" onclick="this.parentElement.classList.add('revealed')">
                 <i class="fas fa-eye-slash"></i> Spoiler — click to reveal
               </div>
               <p class="comment-text comment-spoiler-text">\${escHtmlC(c.content || '')}</p>
             </div>\`
          : \`<p class="comment-text">\${escHtmlC(c.content || '')}</p>\`
        }
        <div class="comment-actions">
          <button onclick="likeComment(\${c.id}, this)" class="comment-action-btn">
            <i class="fas fa-heart"></i> <span class="like-count">\${c.likes || 0}</span>
          </button>
          <button onclick="startReply(\${c.id}, '\${escHtmlC(c.username || 'User')}')" class="comment-action-btn">
            <i class="fas fa-reply"></i> Reply
          </button>
          \${canDelete ? \`<button onclick="deleteComment(\${c.id}, this)" class="comment-action-btn comment-delete-btn"><i class="fas fa-trash"></i></button>\` : ''}
        </div>
        <div class="reply-form-wrap" id="replyForm-\${c.id}" style="display:none;margin-top:10px;"></div>
        \${repliesHtml ? \`<div class="comment-replies">\${repliesHtml}</div>\` : ''}
      </div>
    </div>\`;
  return div;
}

function buildReplyHtml(r) {
  var ava = r.user_avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(r.username || '?') + '&background=6c5ce7&color=fff&size=30&bold=true');
  var isAdmin = r.user_role === 'admin';
  var date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '';
  var currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  var canDelete = currentUser && (currentUser.id === r.user_id || currentUser.role === 'admin');

  return \`<div class="comment-reply" data-id="\${r.id}">
    <img src="\${ava}" alt="" class="comment-ava-sm" onerror="this.src='https://ui-avatars.com/api/?name=?&background=333&color=fff&size=30'">
    <div class="comment-body">
      <div class="comment-meta">
        <span class="comment-user">\${escHtmlC(r.username || 'User')}\${isAdmin ? ' <span class="comment-admin-badge">Admin</span>' : ''}</span>
        <span class="comment-date">\${date}</span>
      </div>
      <p class="comment-text">\${escHtmlC(r.content || '')}</p>
      <div class="comment-actions">
        <button onclick="likeComment(\${r.id}, this)" class="comment-action-btn"><i class="fas fa-heart"></i> <span class="like-count">\${r.likes||0}</span></button>
        \${canDelete ? \`<button onclick="deleteComment(\${r.id}, this.closest('.comment-reply'))" class="comment-action-btn comment-delete-btn"><i class="fas fa-trash"></i></button>\` : ''}
      </div>
    </div>
  </div>\`;
}

function escHtmlC(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function startReply(parentId, username) {
  document.querySelectorAll('.reply-form-wrap').forEach(function(el) { el.style.display = 'none'; el.innerHTML = ''; });

  replyingTo = parentId;
  var wrap = document.getElementById('replyForm-' + parentId);
  if (!wrap) return;

  var token = localStorage.getItem('token');
  if (!token) { window.showToast && window.showToast('Please sign in to reply', 'info'); return; }

  wrap.style.display = 'block';
  wrap.innerHTML = \`
    <div style="display:flex;gap:8px;align-items:flex-start;">
      <div style="flex:1;">
        <div style="font-size:11px;color:var(--purple2);margin-bottom:5px;">Replying to @\${escHtmlC(username)}</div>
        <textarea id="replyInput-\${parentId}" placeholder="Write a reply..." maxlength="1000"
          style="width:100%;min-height:60px;background:var(--bg5);border:1px solid var(--border2);border-radius:var(--r8);padding:8px;color:var(--text1);font-size:13px;resize:vertical;font-family:inherit;outline:none;"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px;">
          <button onclick="cancelReply(\${parentId})" style="padding:6px 12px;background:transparent;border:1px solid var(--border2);border-radius:var(--r8);color:var(--text2);font-size:12px;cursor:pointer;">Cancel</button>
          <button onclick="submitReply(\${parentId})" style="padding:6px 14px;background:var(--purple);border:none;border-radius:var(--r8);color:#fff;font-size:12px;font-weight:700;cursor:pointer;"><i class="fas fa-paper-plane"></i> Reply</button>
        </div>
      </div>
    </div>\`;
  var replyInput = document.getElementById('replyInput-' + parentId);
  if (replyInput) replyInput.focus();
}

function cancelReply(parentId) {
  var wrap = document.getElementById('replyForm-' + parentId);
  if (wrap) { wrap.style.display = 'none'; wrap.innerHTML = ''; }
  replyingTo = null;
}

async function submitReply(parentId) {
  var input = document.getElementById('replyInput-' + parentId);
  if (!input) return;
  var content = input.value.trim();
  if (!content) { window.showToast && window.showToast('Reply cannot be empty', 'error'); return; }

  var token = localStorage.getItem('token');
  try {
    var body = { content: content, parent_id: parentId };
    if (EPISODE_ID) body.episode_id = EPISODE_ID;
    else if (ANIME_ID) body.anime_id = ANIME_ID;

    var res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body)
    });
    var data = await res.json();
    if (data.success) {
      cancelReply(parentId);
      window.showToast && window.showToast('Reply posted!', 'success');
      loadComments(1);
    } else {
      window.showToast && window.showToast(data.error || 'Failed to post reply', 'error');
    }
  } catch(e) { window.showToast && window.showToast('Error: ' + e.message, 'error'); }
}

async function postComment() {
  var input = document.getElementById('commentInput');
  var spoilerEl = document.getElementById('commentSpoiler');
  var token = localStorage.getItem('token');

  if (!token) { window.showToast && window.showToast('Please sign in to comment', 'info'); return; }
  if (!input || !input.value.trim()) { window.showToast && window.showToast('Comment cannot be empty', 'error'); return; }

  var btn = document.getElementById('commentSubmitBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }

  try {
    var body = {
      content: input.value.trim(),
      is_spoiler: spoilerEl ? spoilerEl.checked : false,
    };
    if (EPISODE_ID) body.episode_id = EPISODE_ID;
    else if (ANIME_ID) body.anime_id = ANIME_ID;

    var res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body)
    });
    var data = await res.json();
    if (data.success) {
      input.value = '';
      if (spoilerEl) spoilerEl.checked = false;
      var cc = document.getElementById('commentCharCount');
      if (cc) cc.textContent = '0/2000';
      window.showToast && window.showToast(data.is_approved ? 'Comment posted!' : 'Comment submitted for review', 'success');
      loadComments(1);
    } else {
      window.showToast && window.showToast(data.error || 'Failed to post comment', 'error');
    }
  } catch(e) { window.showToast && window.showToast('Error: ' + e.message, 'error'); }
  finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Post'; }
  }
}

async function likeComment(id, btn) {
  var token = localStorage.getItem('token');
  if (!token) { window.showToast && window.showToast('Sign in to like comments', 'info'); return; }

  try {
    var res = await fetch('/api/comments/' + id + '/like', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    var data = await res.json();
    if (data.success) {
      var countEl = btn.querySelector('.like-count');
      if (countEl) {
        var cur = parseInt(countEl.textContent) || 0;
        countEl.textContent = data.action === 'liked' ? cur + 1 : Math.max(0, cur - 1);
      }
      btn.style.color = data.action === 'liked' ? 'var(--red)' : '';
    }
  } catch(e) {}
}

async function deleteComment(id, el) {
  if (!confirm('Delete this comment?')) return;
  var token = localStorage.getItem('token');

  try {
    var res = await fetch('/api/comments/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    var data = await res.json();
    if (data.success) {
      if (el && el.closest) el.closest('.comment-item, .comment-reply')?.remove();
      window.showToast && window.showToast('Comment deleted', 'success');
      totalComments = Math.max(0, totalComments - 1);
      var countEl = document.getElementById('commentsCount');
      if (countEl) countEl.textContent = totalComments + ' comment' + (totalComments !== 1 ? 's' : '');
    }
  } catch(e) { window.showToast && window.showToast('Failed to delete', 'error'); }
}

window.loadMoreComments = function() {
  loadComments(commentsPage + 1);
};
</script>

<style>
/* ===== Watch Page Layout ===== */
.watch-page-wrap {
  max-width: 900px;
  margin: 0 auto;
  padding: 14px 16px 32px;
}
.watch-main-col { width: 100%; }

/* ===== Episode Grid ===== */
.ep-grid-section {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--r10);
  overflow: hidden;
  margin-bottom: 14px;
}
.ep-grid-head {
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px;
}
.ep-grid-title {
  font-size: 13px; font-weight: 800; color: var(--text1);
  display: flex; align-items: center; gap: 7px;
}
.ep-grid-title i { color: var(--purple2); }
.ep-grid-count { font-size: 11px; color: var(--text3); font-weight: 400; }
.ep-grid-search-wrap { position: relative; flex-shrink: 0; }
.ep-grid-search {
  background: var(--bg4); border: 1px solid var(--border2);
  border-radius: var(--r50); padding: 6px 12px 6px 30px;
  color: var(--text1); font-size: 12px; outline: none;
  width: 160px; transition: border-color var(--trans), width var(--trans);
}
.ep-grid-search:focus { border-color: var(--purple); width: 200px; }
.ep-grid-search::placeholder { color: var(--text3); }
.ep-grid-search-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  color: var(--text4); font-size: 11px; pointer-events: none;
}
.ep-grid-body { padding: 10px 12px 12px; }
/* Wrap layout — fills row then wraps, NO horizontal scroll */
.ep-grid-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
/* Episode box */
.ep-grid-item {
  display: flex; flex-direction: column; align-items: center;
  width: 62px;
  background: var(--bg4); border: 1.5px solid var(--border2);
  border-radius: var(--r8); overflow: hidden;
  text-decoration: none; cursor: pointer;
  transition: border-color var(--trans), background var(--trans), transform 0.15s;
  flex-shrink: 0;
}
.ep-grid-item:hover {
  border-color: rgba(108,92,231,0.5);
  background: var(--bg5);
  transform: translateY(-2px);
}
.ep-grid-item.active {
  border-color: var(--purple);
  background: var(--purple-dim);
}
.ep-grid-thumb {
  width: 100%; aspect-ratio: 2/3;
  object-fit: cover; display: block;
}
.ep-grid-num {
  font-size: 10px; font-weight: 800;
  color: var(--text2); text-align: center;
  padding: 4px 2px 5px;
  line-height: 1.2; width: 100%;
}
.ep-grid-item.active .ep-grid-num { color: var(--purple2); }
.ep-grid-empty {
  padding: 16px; text-align: center;
  font-size: 13px; color: var(--text3);
  display: none;
}
.ep-grid-empty.show { display: block; }

/* ===== Comments Styles ===== */
.comments-section { background:var(--bg3); border:1px solid var(--border); border-radius:var(--r12); padding:18px; margin-top:14px; }
.comments-hd { display:flex; align-items:center; justify-content:space-between; font-size:14px; font-weight:700; color:var(--text1); margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid var(--border); }
.comment-post-box { margin-bottom:16px; }
.comment-item { padding:12px 0; border-bottom:1px solid var(--border); }
.comment-item:last-child { border-bottom:none; }
.comment-main { display:flex; gap:10px; }
.comment-ava { width:36px; height:36px; border-radius:50%; flex-shrink:0; object-fit:cover; }
.comment-ava-sm { width:28px; height:28px; border-radius:50%; flex-shrink:0; object-fit:cover; }
.comment-body { flex:1; min-width:0; }
.comment-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:5px; }
.comment-user { font-size:13px; font-weight:700; color:var(--text1); }
.comment-admin-badge { background:var(--purple-dim); color:var(--purple2); font-size:9px; padding:1px 6px; border-radius:20px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
.comment-date { font-size:11px; color:var(--text4); }
.comment-spoiler-tag { background:rgba(241,196,15,0.15); color:var(--gold); font-size:9px; padding:1px 6px; border-radius:20px; font-weight:700; text-transform:uppercase; }
.comment-text { font-size:13px; color:var(--text2); line-height:1.6; white-space:pre-wrap; word-break:break-word; margin:0; }
.comment-spoiler-wrap { position:relative; }
.comment-spoiler-blur { position:absolute; inset:0; backdrop-filter:blur(8px); background:rgba(15,15,23,0.8); display:flex; align-items:center; justify-content:center; gap:6px; font-size:12px; color:var(--text3); cursor:pointer; border-radius:4px; z-index:1; }
.comment-spoiler-wrap.revealed .comment-spoiler-blur { display:none; }
.comment-actions { display:flex; align-items:center; gap:8px; margin-top:6px; }
.comment-action-btn { background:none; border:none; color:var(--text4); font-size:12px; cursor:pointer; padding:3px 7px; border-radius:var(--r6); transition:all 0.15s; display:flex; align-items:center; gap:4px; }
.comment-action-btn:hover { background:var(--bg4); color:var(--text2); }
.comment-delete-btn:hover { color:var(--red) !important; }
.comment-replies { margin-top:10px; padding-left:16px; border-left:2px solid var(--border); display:flex; flex-direction:column; gap:8px; }
.comment-reply { display:flex; gap:8px; }

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .watch-page-wrap { padding: 0 0 28px; }
  .ep-grid-section { border-radius: 0; border-left: none; border-right: none; }
  .ep-grid-item { width: 56px; }
  .ep-grid-search { width: 130px; }
  .ep-grid-search:focus { width: 160px; }
  .comments-section { border-radius: 0; border-left: none; border-right: none; }
}
@media (max-width: 480px) {
  .ep-grid-item { width: 50px; }
  .ep-grid-search { width: 110px; }
  .ep-grid-search:focus { width: 140px; }
}
</style>
`

  const epNum = episode.episode_number
  const title = `${anime.title} Episode ${epNum} - Donghualand`
  const description = anime.description ? anime.description.substring(0, 160) : `Watch ${anime.title} Episode ${epNum} online free.`
  return layout(title, content, '', description)
}
