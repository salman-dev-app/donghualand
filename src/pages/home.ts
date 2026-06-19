import { layout } from './layout'
import { animeCard, genresFromJson, formatRating, recentEpCard } from './components'

export function homePage(data: {
  featured: any[]
  trending: any[]
  recent: any[]
  popular: any[]
  ongoing: any[]
  movies: any[]
  completed: any[]
  upcoming: any[]
  schedule: any[]
  siteName?: string
  siteUrl?: string
}) {
  const {
    featured,
    trending,
    recent,
    popular,
    ongoing,
    movies,
    completed,
    upcoming,
    schedule,
    siteName = 'ANIME WORLD',
    siteUrl = '',
  } = data

  // Hero slider - use featured array (up to 5)
  const heroItems = featured.length > 0 ? featured.slice(0, 5) : []

  const heroSlider = heroItems.length > 0 ? `
<section class="hero-slider" id="heroSlider">
  ${heroItems.map((f, i) => `
  <div class="hero-slide${i === 0 ? ' active' : ''}" data-index="${i}">
    <img src="${f.banner_image || f.cover_image || ''}" 
         alt="${f.title}" class="hero-bg-img" loading="${i === 0 ? 'eager' : 'lazy'}"
         onerror="this.style.opacity='0'">
    <div class="hero-gradient"></div>
    <div class="hero-content">
      <div class="hero-badges">
        <span class="hbadge hbadge-purple">${f.type || 'ONA'}</span>
        <span class="hbadge ${f.status === 'Ongoing' ? 'hbadge-green' : f.status === 'Completed' ? 'hbadge-blue' : 'hbadge-gray'}">${f.status || 'Ongoing'}</span>
        ${f.release_year ? `<span class="hbadge hbadge-gray">${f.release_year}</span>` : ''}
      </div>
      <h1 class="hero-title">${f.title}</h1>
      ${f.title_native ? `<div class="hero-native">${f.title_native}</div>` : ''}
      ${f.rating ? `
      <div class="hero-rating-row">
        <span class="hrating-num">${formatRating(f.rating)}</span>
        <span class="hrating-stars"><i class="fas fa-star"></i></span>
        <span class="hrating-count">${f.vote_count || 0} votes</span>
      </div>` : ''}
      <div class="hero-meta-row">
        ${f.release_year ? `<span>${f.release_year}</span><span class="hmeta-dot"></span>` : ''}
        <span>${genresFromJson(f.genres).slice(0, 3).join(' · ')}</span>
      </div>
      <p class="hero-desc">${f.description || ''}</p>
      <div class="hero-btns">
        <a href="/watch/${f.slug}-episode-1" class="btn-watch">
          <i class="fas fa-play"></i> Watch Now
        </a>
        <a href="/anime/${f.slug}" class="btn-info">
          <i class="fas fa-info-circle"></i> Details
        </a>
      </div>
    </div>
  </div>`).join('')}

  ${heroItems.length > 1 ? `
  <button class="hero-arrow prev" id="heroPrevBtn" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
  <button class="hero-arrow next" id="heroNextBtn" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
  <div class="hero-dots" id="heroDots">
    ${heroItems.map((_, i) => `<div class="hero-dot${i === 0 ? ' active' : ''}" data-idx="${i}"></div>`).join('')}
  </div>` : ''}
</section>
<script>
(function(){
  if (window.__heroSliderInit) return;
  window.__heroSliderInit = true;

  var slider = document.getElementById('heroSlider');
  if (!slider) return;

  var slides = slider.querySelectorAll('.hero-slide');
  var dots   = slider.querySelectorAll('.hero-dot');
  var total  = slides.length;
  if (total === 0) return;

  var cur = 0;
  var timer = null;

  function go(n) {
    slides[cur].classList.remove('active');
    if (dots[cur]) dots[cur].classList.remove('active');
    cur = ((n % total) + total) % total;
    slides[cur].classList.add('active');
    if (dots[cur]) dots[cur].classList.add('active');
  }

  function resetTimer() {
    clearInterval(timer);
    if (total > 1) timer = setInterval(function(){ go(cur + 1); }, 6500);
  }

  window.heroSlide = function(d) { go(cur + d); resetTimer(); };
  window.heroGoTo  = function(n) { go(n);       resetTimer(); };

  var prevBtn = document.getElementById('heroPrevBtn');
  var nextBtn = document.getElementById('heroNextBtn');
  if (prevBtn) prevBtn.addEventListener('click', function(){ go(cur - 1); resetTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', function(){ go(cur + 1); resetTimer(); });

  var dotsWrap = document.getElementById('heroDots');
  if (dotsWrap) {
    dotsWrap.addEventListener('click', function(e) {
      var dot = e.target.closest('.hero-dot');
      if (!dot) return;
      var idx = parseInt(dot.getAttribute('data-idx'), 10);
      if (!isNaN(idx)) { go(idx); resetTimer(); }
    });
  }

  // Touch/swipe support
  var touchStartX = 0;
  slider.addEventListener('touchstart', function(e){ touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', function(e){
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { go(diff > 0 ? cur + 1 : cur - 1); resetTimer(); }
  }, { passive: true });

  resetTimer();
})();
</script>
` : `
<section class="hero-slider" style="background: linear-gradient(135deg, #080810 0%, #111120 50%, #1c1c32 100%); min-height: 360px; display:flex; align-items:center; justify-content:center;">
  <div style="text-align:center; padding:48px 24px;">
    <div style="width:72px;height:72px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:18px;display:flex;align-items:center;justify-content:center;margin:0 auto 22px;box-shadow:0 8px 32px rgba(124,58,237,0.45);">
      <i class="fas fa-dragon" style="font-size:32px; color:#fff;"></i>
    </div>
    <h1 style="font-size:36px; font-weight:900; margin-bottom:12px; background:linear-gradient(135deg,#a78bfa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Welcome to ${siteName}</h1>
    <p style="color:var(--text3); font-size:15px; margin-bottom:28px; max-width:420px; margin-left:auto; margin-right:auto; line-height:1.7;">Stream the best Chinese anime (Donghua) online, completely free in HD quality.</p>
    <a href="/search" class="btn-watch" style="display:inline-flex;"><i class="fas fa-compass"></i> Browse Anime</a>
  </div>
</section>`

  // ──────────────────────────────────────────────────────────────────────
  // SCHEDULE SECTION — Date-aware, hides/shows by exact day tab click
  // ──────────────────────────────────────────────────────────────────────
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const schedByDay: Record<string, any[]> = {}
  days.forEach(d => { schedByDay[d] = [] })
  schedule.forEach(s => { if (schedByDay[s.day_of_week]) schedByDay[s.day_of_week].push(s) })

  // JS getDay(): 0=Sun,1=Mon...6=Sat → our index: Mon=0...Sun=6
  const todayJS = new Date().getDay()
  const todayIdx = todayJS === 0 ? 6 : todayJS - 1
  const todayName = days[todayIdx]

  // Generate the actual calendar date for each day of the current week
  const now = new Date()
  const weekDates: { date: number; month: string; full: string }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + (i - todayIdx))
    weekDates.push({
      date: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      full: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    })
  }

  // Sort each day by air_time
  days.forEach(d => {
    schedByDay[d].sort((a: any, b: any) => {
      if (!a.air_time) return 1
      if (!b.air_time) return -1
      return a.air_time.localeCompare(b.air_time)
    })
  })

  const scheduleSection = `
<section class="section section-alt home-schedule-section">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-calendar-alt" style="color:var(--purple3);margin-right:6px;"></i> Weekly Schedule</div>
      <a href="/schedule" class="sec-more">Full Schedule <i class="fas fa-chevron-right"></i></a>
    </div>
    <p class="sched-note">
      <i class="fas fa-satellite-dish" style="margin-right:5px;color:var(--purple3);"></i>
      New episodes available approximately 20–60 minutes after official broadcast time.
    </p>

    <!-- Day tabs with dates -->
    <div class="home-sched-tabs" id="homeSchedTabs">
      ${days.map((d, i) => `
      <button class="home-sched-tab${i === todayIdx ? ' active' : ''}" data-day="${d}" onclick="homeSwitchDay('${d}', this)">
        <span class="hstab-day">${d.slice(0, 3)}</span>
        <span class="hstab-date">${weekDates[i].date}</span>
        ${i === todayIdx ? '<span class="hstab-today-dot"></span>' : ''}
      </button>`).join('')}
    </div>

    <!-- Day content panels — only active one is visible -->
    ${days.map((d, i) => `
    <div class="home-sched-panel${i === todayIdx ? ' active' : ''}" id="home-sched-${d}">
      <div class="sched-day-header">
        <span class="sched-day-label"><i class="fas fa-calendar-day"></i> ${d} — ${weekDates[i].full}</span>
        ${i === todayIdx ? '<span class="sched-today-badge"><i class="fas fa-circle" style="font-size:6px;margin-right:4px;"></i>Today</span>' : ''}
      </div>
      ${schedByDay[d].length > 0 ? `
      <div class="scroll-row wide">
        ${schedByDay[d].map((s: any) => `
        <a href="/anime/${s.slug}" class="acard">
          <div class="acard-img">
            <img src="${s.cover_image || ''}" alt="${s.title}" loading="lazy"
                 onerror="this.src='https://placehold.co/150x220/111120/8b5cf6?text=?'">
            <div class="acard-overlay">
              <div class="acard-play"><i class="fas fa-play"></i></div>
            </div>
            ${s.next_episode ? `<div class="acard-ep">EP ${s.next_episode}</div>` : ''}
            <div class="acard-time-badge"><i class="fas fa-clock"></i> ${s.air_time || 'TBA'}</div>
            <div class="acard-status"></div>
          </div>
          <div class="acard-body">
            <div class="acard-name">${s.title}</div>
            <div class="acard-meta">
              ${s.next_episode ? `<span style="color:var(--accent2);font-weight:700;">EP ${s.next_episode} upcoming</span>` : '<span style="color:var(--green);">Ongoing</span>'}
            </div>
          </div>
        </a>`).join('')}
      </div>` : `
      <div class="home-sched-empty">
        <i class="fas fa-moon"></i>
        <strong>No releases on ${d}</strong>
        <span>Check back later</span>
      </div>`}
    </div>`).join('')}
  </div>
</section>
<script>
(function() {
  window.homeSwitchDay = function(day, btn) {
    // Hide ALL day panels first
    var panels = document.querySelectorAll('.home-sched-panel');
    for (var i = 0; i < panels.length; i++) {
      panels[i].classList.remove('active');
    }
    // Remove active from ALL tabs
    var tabs = document.querySelectorAll('#homeSchedTabs .home-sched-tab');
    for (var j = 0; j < tabs.length; j++) {
      tabs[j].classList.remove('active');
    }
    // Show selected day panel
    var panel = document.getElementById('home-sched-' + day);
    if (panel) panel.classList.add('active');
    // Activate clicked tab
    if (btn) btn.classList.add('active');
  };
})();
</script>`

  // ──────────────────────────────────────────────────────────────────────
  // POPULAR ANIME RANKED SECTION — shown after every content section
  // Supports Weekly / Monthly / All time tabs
  // ──────────────────────────────────────────────────────────────────────
  function popularAnimeSection(sectionId: string, items: any[]): string {
    if (items.length === 0) return ''
    const topItems = items.slice(0, 10)
    return `
<section class="section popular-ranked-section" id="popularSection-${sectionId}">
  <div class="container">
    <div class="popular-ranked-wrap">
      <div class="popular-ranked-header">
        <div class="popular-ranked-title">
          <i class="fas fa-chart-line" style="color:var(--purple3);font-size:18px;"></i>
          Popular Anime
        </div>
        <div class="popular-ranked-tabs" id="popTabs-${sectionId}">
          <button class="pop-tab active" data-period="weekly" onclick="switchPopTab('${sectionId}', 'weekly', this)">Weekly</button>
          <button class="pop-tab" data-period="monthly" onclick="switchPopTab('${sectionId}', 'monthly', this)">Monthly</button>
          <button class="pop-tab" data-period="all" onclick="switchPopTab('${sectionId}', 'all', this)">All</button>
        </div>
      </div>
      <div class="popular-ranked-list" id="popList-${sectionId}">
        ${topItems.map((a: any, idx: number) => {
          const genres = genresFromJson(a.genres)
          const rating = parseFloat(a.rating)
          const img = a.cover_image || 'https://placehold.co/60x85/111120/8b5cf6?text=?'
          return `
        <a href="/anime/${a.slug}" class="pop-rank-item">
          <div class="pop-rank-num${idx < 3 ? ' pop-rank-top' : ''}">${idx + 1}</div>
          <div class="pop-rank-poster">
            <img src="${img}" alt="${a.title}" loading="lazy"
                 onerror="this.src='https://placehold.co/60x85/111120/8b5cf6?text=?'">
          </div>
          <div class="pop-rank-info">
            <div class="pop-rank-name">${a.title}</div>
            <div class="pop-rank-meta">
              ${genres.slice(0, 1).join('') || a.type || 'ONA'}
              ${!isNaN(rating) && rating > 0 ? `<span class="pop-rank-rating"><i class="fas fa-star"></i> ${rating.toFixed(1)}</span>` : ''}
            </div>
          </div>
        </a>`
        }).join('')}
      </div>
    </div>
  </div>
</section>
<script>
(function() {
  if (!window.__popTabData) window.__popTabData = {};
  window.__popTabData['${sectionId}'] = ${JSON.stringify(topItems.map((a: any, idx: number) => ({
    slug: a.slug,
    title: a.title,
    cover_image: a.cover_image || '',
    genres: a.genres,
    rating: a.rating,
    type: a.type,
    view_count: a.view_count || 0,
  })))};

  window.switchPopTab = window.switchPopTab || function(sectionId, period, btn) {
    // Update active tab button
    var tabs = document.querySelectorAll('#popTabs-' + sectionId + ' .pop-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    // For now all periods show the same data (sorted by view_count)
    // In a real implementation you'd fetch period-specific data
    var listEl = document.getElementById('popList-' + sectionId);
    if (!listEl) return;
    var items = (window.__popTabData && window.__popTabData[sectionId]) || [];
    listEl.innerHTML = items.map(function(a, idx) {
      var genres = [];
      try {
        var g = typeof a.genres === 'string' ? JSON.parse(a.genres) : a.genres;
        if (Array.isArray(g)) genres = g.filter(Boolean);
      } catch(e) {}
      var rating = parseFloat(a.rating);
      var img = a.cover_image || 'https://placehold.co/60x85/111120/8b5cf6?text=?';
      var genreText = (genres[0] || a.type || 'ONA');
      var ratingHtml = (!isNaN(rating) && rating > 0) ? '<span class="pop-rank-rating"><i class="fas fa-star"></i> ' + rating.toFixed(1) + '</span>' : '';
      var topClass = idx < 3 ? ' pop-rank-top' : '';
      return '<a href="/anime/' + a.slug + '" class="pop-rank-item">' +
        '<div class="pop-rank-num' + topClass + '">' + (idx + 1) + '</div>' +
        '<div class="pop-rank-poster"><img src="' + img + '" alt="' + a.title + '" loading="lazy" onerror="this.src=\'https://placehold.co/60x85/111120/8b5cf6?text=?\'"></div>' +
        '<div class="pop-rank-info"><div class="pop-rank-name">' + a.title + '</div><div class="pop-rank-meta">' + genreText + ratingHtml + '</div></div>' +
        '</a>';
    }).join('');
  };
})();
</script>`
  }

  const content = `
${heroSlider}

${scheduleSection}

${popularAnimeSection('schedule', popular)}

${ongoing.length > 0 ? `
<section class="section">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-fire" style="color:#f59e0b;margin-right:6px;"></i> Ongoing Anime</div>
      <a href="/search?status=Ongoing" class="sec-more">View All <i class="fas fa-chevron-right"></i></a>
    </div>
    <div class="scroll-row wide">
      ${ongoing.map(a => animeCard(a)).join('')}
    </div>
  </div>
</section>` : ''}

${popularAnimeSection('ongoing', popular)}

${recent.length > 0 ? `
<section class="section section-alt">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-clock" style="color:var(--accent2);margin-right:6px;"></i> Recently Updated</div>
      <a href="/search" class="sec-more">View All <i class="fas fa-chevron-right"></i></a>
    </div>
    <div class="scroll-row wide">
      ${recent.slice(0, 12).map(a => recentEpCard(a)).join('')}
    </div>
  </div>
</section>` : ''}

${popularAnimeSection('recent', popular)}

${movies.length > 0 ? `
<section class="section">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-film" style="color:var(--pink);margin-right:6px;"></i> Movies</div>
      <a href="/search?type=Movie" class="sec-more">View All <i class="fas fa-chevron-right"></i></a>
    </div>
    <div class="scroll-row wide">
      ${movies.map(a => animeCard(a)).join('')}
    </div>
  </div>
</section>` : ''}

${popularAnimeSection('movies', popular)}

${completed.length > 0 ? `
<section class="section section-alt">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-check-circle" style="color:var(--accent2);margin-right:6px;"></i> Completed</div>
      <a href="/search?status=Completed" class="sec-more">View All <i class="fas fa-chevron-right"></i></a>
    </div>
    <div class="scroll-row wide">
      ${completed.map(a => animeCard(a)).join('')}
    </div>
  </div>
</section>` : ''}

${popularAnimeSection('completed', popular)}

${upcoming.length > 0 ? `
<section class="section">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-rocket" style="color:var(--purple3);margin-right:6px;"></i> Upcoming</div>
      <a href="/search?status=Upcoming" class="sec-more">View All <i class="fas fa-chevron-right"></i></a>
    </div>
    <div class="scroll-row wide">
      ${upcoming.map(a => animeCard(a)).join('')}
    </div>
  </div>
</section>` : ''}

${popularAnimeSection('upcoming', popular)}

${trending.length > 0 ? `
<section class="section section-alt">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-chart-line" style="color:var(--pink);margin-right:6px;"></i> Trending Now</div>
      <a href="/search" class="sec-more">View All <i class="fas fa-chevron-right"></i></a>
    </div>
    <div class="scroll-row">
      ${trending.map(a => animeCard(a)).join('')}
    </div>
  </div>
</section>` : ''}

${popularAnimeSection('trending', popular)}
`

  return layout(`${siteName} — Free Anime Streaming Online`, content, '', siteName, siteUrl)
}
