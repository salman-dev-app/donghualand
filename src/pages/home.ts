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

function animeCard(anime: any, latestEp?: number): string {
  const ep = latestEp || anime.latest_episode || anime.episode_number
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

export function homePage(data: {
  featured: any[]
  trending: any[]
  recent: any[]
  popular: any[]
  ongoing: any[]
  schedule: any[]
  recentPage?: number
  recentTotal?: number
}) {
  const { featured, trending, recent, popular, ongoing, schedule } = data
  const recentPage = data.recentPage || 1
  const recentTotal = data.recentTotal || recent.length

  // Hero slider
  const heroItems = featured.length > 0 ? featured.slice(0, 5) : []

  const heroSlides = heroItems.map((f, i) => {
    const genres = genresFromJson(f.genres)
    const ep = f.latest_episode
    const watchHref = ep ? `/watch/${f.slug}-episode-${ep}` : `/anime/${f.slug}`
    return `<div class="hero-slide${i === 0 ? ' active' : ''}"
     style="background-image:url('${f.banner_image || f.cover_image || ''}')">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-badges">
      <span class="badge badge-primary">${f.type || 'ONA'}</span>
      <span class="badge badge-status ${(f.status || 'ongoing').toLowerCase()}">${f.status || 'Ongoing'}</span>
    </div>
    <h1 class="hero-title">${f.title}</h1>
    ${f.title_native ? `<p class="hero-alt-title">${f.title_native}</p>` : ''}
    <div class="hero-meta">
      ${f.rating ? `<span><svg width="13" height="13" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${formatRating(f.rating)}</span>` : ''}
      ${f.release_year ? `<span>${f.release_year}</span>` : ''}
      ${genres.length > 0 ? `<span>${genres.slice(0, 3).join(', ')}</span>` : ''}
    </div>
    ${f.description ? `<p class="hero-desc">${f.description.length > 150 ? f.description.substring(0, 150) + '...' : f.description}</p>` : ''}
    <div class="hero-actions">
      <a href="${watchHref}" class="btn btn-primary btn-hero">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        ${ep ? `Watch EP ${ep}` : 'Watch Now'}
      </a>
      <a href="/anime/${f.slug}" class="btn btn-glass">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        Details
      </a>
    </div>
  </div>
</div>`
  }).join('')

  const heroDots = heroItems.map((_, i) => `<button class="hero-dot${i === 0 ? ' active' : ''}" data-index="${i}"></button>`).join('')

  const heroSection = heroItems.length > 0 ? `
<!-- Hero Slider -->
<section class="hero-section" id="heroSection">
  <div class="hero-slider" id="heroSlider">
    ${heroSlides}
  </div>
  <div class="hero-controls">
    <button class="hero-arrow hero-prev" id="heroPrev">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <div class="hero-dots" id="heroDots">
      ${heroDots}
    </div>
    <button class="hero-arrow hero-next" id="heroNext">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  </div>
</section>
<script>
(function(){
  var slides = document.querySelectorAll('#heroSlider .hero-slide');
  var dots = document.querySelectorAll('#heroDots .hero-dot');
  var prev = document.getElementById('heroPrev');
  var next = document.getElementById('heroNext');
  var cur = 0, total = slides.length;
  if(!total) return;
  function go(n){
    slides[cur].classList.remove('active');
    dots[cur] && dots[cur].classList.remove('active');
    cur = ((n % total) + total) % total;
    slides[cur].classList.add('active');
    dots[cur] && dots[cur].classList.add('active');
  }
  var timer = setInterval(function(){ go(cur+1); }, 6000);
  function reset(){ clearInterval(timer); timer = setInterval(function(){ go(cur+1); }, 6000); }
  if(prev) prev.addEventListener('click', function(){ go(cur-1); reset(); });
  if(next) next.addEventListener('click', function(){ go(cur+1); reset(); });
  document.querySelectorAll('#heroDots .hero-dot').forEach(function(d){
    d.addEventListener('click', function(){ go(parseInt(this.dataset.index)); reset(); });
  });
})();
</script>` : ''

  // Schedule section
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date()
  const todayDay = today.getDay() === 0 ? 6 : today.getDay() - 1
  const todayDate = today.getDate()

  // Group schedule by day
  const schedByDay: Record<string, any[]> = {}
  dayNames.forEach(d => { schedByDay[d] = [] })
  schedule.forEach(s => {
    if (schedByDay[s.day_of_week]) schedByDay[s.day_of_week].push(s)
  })

  // Group by time within a day
  function groupByTime(items: any[]) {
    const groups: Record<string, any[]> = {}
    items.forEach(s => {
      const t = s.time || '00:00'
      if (!groups[t]) groups[t] = []
      groups[t].push(s)
    })
    return groups
  }

  function renderDayPanel(dayName: string, dayIdx: number): string {
    const items = schedByDay[dayName] || []
    const isActive = dayIdx === todayDay
    if (items.length === 0) {
      return `<div class="wsch-day-panel${isActive ? ' is-active' : ''}" data-day="${dayIdx}">
  <div class="wsch-empty">No anime scheduled for this day.</div>
</div>`
    }

    const grouped = groupByTime(items)
    const timeGroups = Object.keys(grouped).sort()

    const scrollContent = timeGroups.map(time => {
      const cards = grouped[time]
      const dotCols = cards.map(() => `<div class="wsch-grp-dot-col">
  <div class="wsch-tl-connector"></div>
  <div class="wsch-tl-dot"></div>
</div>`).join('')
      const cardItems = cards.map(c => {
        const ep = c.latest_episode
        return `<a href="/anime/${c.slug}" class="wsch-card">
  <div class="wsch-card-img">
    <img src="${c.cover_image || ''}" alt="${c.title}" loading="lazy">
    ${ep ? `<div class="wsch-ep-badge">Up to EP ${ep}</div>` : ''}
  </div>
  <p class="wsch-card-title">${c.title}</p>
</a>`
      }).join('')

      return `<div class="wsch-time-group" style="padding:0 .35rem">
  <div class="wsch-grp-header">
    <div class="wsch-grp-line"></div>
    <div class="wsch-tl-bubble">${time}</div>
    <div class="wsch-grp-line"></div>
  </div>
  <div class="wsch-grp-dots">${dotCols}</div>
  <div class="wsch-grp-cards">${cardItems}</div>
</div>`
    }).join('')

    return `<div class="wsch-day-panel${isActive ? ' is-active' : ''}" data-day="${dayIdx}">
  <div class="wsch-scroll-wrap">${scrollContent}</div>
</div>`
  }

  const dayBtns = dayNames.map((d, i) => `<button class="wsch-day-btn${i === todayDay ? ' is-today' : ''}" data-day="${i}">
  <span class="wsch-day-name">${dayShort[i]}</span>
  <span class="wsch-day-num">${i + 1}</span>
</button>`).join('')

  const dayPanels = dayNames.map((d, i) => renderDayPanel(d, i)).join('')

  const scheduleSection = `
<section class="wsch-section">
  <div class="wsch-head">
    <h2 class="wsch-title">Weekly Schedule</h2>
    <span class="wsch-info" id="wschInfoBtn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <div class="wsch-info-tooltip" id="wschInfoTooltip">
        The timeline shows the official broadcast times. New episodes will be processed and available on our website approximately 20–60 minutes after airing.
      </div>
    </span>
  </div>
  <div class="wsch-days-wrap">
    <div class="wsch-days-grid">${dayBtns}</div>
  </div>
  ${dayPanels}
  <script>
  (function(){
    var dayBtns = document.querySelectorAll('.wsch-day-btn');
    var dayPanels = document.querySelectorAll('.wsch-day-panel');
    dayBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        dayBtns.forEach(function(b){ b.classList.remove('is-today'); });
        dayPanels.forEach(function(p){ p.classList.remove('is-active'); });
        btn.classList.add('is-today');
        var p = document.querySelector('.wsch-day-panel[data-day="'+btn.dataset.day+'"]');
        if(p) p.classList.add('is-active');
      });
    });
    var infoBtn = document.getElementById('wschInfoBtn');
    if(infoBtn){
      infoBtn.addEventListener('click', function(e){
        e.stopPropagation();
        infoBtn.classList.toggle('is-open');
      });
      document.addEventListener('click', function(){ infoBtn.classList.remove('is-open'); });
    }
  })();
  </script>
</section>`

  // Community banner
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

  // Recently Updated section
  const totalPages = Math.ceil(recentTotal / 12)

  function renderPagination(): string {
    if (totalPages <= 1) return ''
    const prevDisabled = recentPage <= 1
    const nextDisabled = recentPage >= totalPages
    let pages = ''
    for (let p = 1; p <= totalPages; p++) {
      if (p === recentPage) {
        pages += `<a href="${p === 1 ? '/' : `/page/${p}`}" class="page-btn active">${p}</a>`
      } else {
        pages += `<a href="${p === 1 ? '/' : `/page/${p}`}" class="page-btn">${p}</a>`
      }
    }
    return `<div class="rp-pagination">
  <div class="rp-info">
    Page ${recentPage} of ${totalPages}
    <span class="rp-total">(${recentTotal} anime)</span>
  </div>
  <div class="pagination">
    ${prevDisabled
      ? `<span class="page-btn disabled"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="m15 18-6-6 6-6"/></svg></span>`
      : `<a href="${recentPage === 2 ? '/' : `/page/${recentPage - 1}`}" class="page-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="m15 18-6-6 6-6"/></svg></a>`}
    ${pages}
    ${nextDisabled
      ? ''
      : `<a href="/page/${recentPage + 1}" class="page-btn rp-next" title="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="m9 6 6 6-6 6"/></svg></a>`}
  </div>
</div>`
  }

  const recentSection = recent.length > 0 ? `
<section class="anime-section" id="recentSection">
  <div class="section-header">
    <h2 class="section-title"><i data-lucide="clock" class="icon-sm"></i> Recently Updated</h2>
    <a href="/search" class="see-all">View All <i data-lucide="arrow-right" class="icon-xs"></i></a>
  </div>
  <div class="home-anime-grid">
    ${recent.map(a => animeCard(a)).join('')}
  </div>
  ${renderPagination()}
</section>
<script>
(function(){
  document.addEventListener('mouseover', function(e){
    const card = e.target.closest('.anime-card');
    if(card) card.classList.add('tapped');
  });
  document.addEventListener('mouseout', function(e){
    const card = e.target.closest('.anime-card');
    if(card && !card.contains(e.relatedTarget)) card.classList.remove('tapped');
  });
})();
</script>` : ''

  // Most Popular section
  const popularSection = popular.length > 0 ? `
<section class="anime-section">
  <div class="section-header">
    <h2 class="section-title"><i data-lucide="flame" class="icon-sm"></i> Most Popular</h2>
    <a href="/search?sort=popular" class="see-all">View All <i data-lucide="arrow-right" class="icon-xs"></i></a>
  </div>
  <div class="home-anime-grid">
    ${popular.map(a => animeCard(a)).join('')}
  </div>
</section>` : ''

  // Trending section
  const trendingSection = trending.length > 0 ? `
<section class="anime-section">
  <div class="section-header">
    <h2 class="section-title"><i data-lucide="trending-up" class="icon-sm"></i> Trending</h2>
    <a href="/search?sort=trending" class="see-all">View All <i data-lucide="arrow-right" class="icon-xs"></i></a>
  </div>
  <div class="home-anime-grid">
    ${trending.map(a => animeCard(a)).join('')}
  </div>
</section>` : ''

  const content = `
${communityBanner}
${heroSection}

<div class="container">
  ${scheduleSection}
  ${recentSection}
  ${popularSection}
  ${trendingSection}
</div>`

  return layout('Donghualand - Watch Chinese Anime Online Free', content)
}
