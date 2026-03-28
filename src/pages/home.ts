import { layout } from './layout'
import { animeCard, genresFromJson, formatRating, recentItem } from './components'

export function homePage(data: {
  featured: any[]
  trending: any[]
  recent: any[]
  popular: any[]
  ongoing: any[]
  schedule: any[]
  siteName?: string
}) {
  const { featured, trending, recent, popular, ongoing, schedule, siteName = 'DonghuaLand' } = data

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
        <span>${genresFromJson(f.genres).slice(0, 3).join(' / ')}</span>
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
  // Guard: only one instance ever runs
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
    // Remove active from current
    slides[cur].classList.remove('active');
    if (dots[cur]) dots[cur].classList.remove('active');
    // Clamp next index
    cur = ((n % total) + total) % total;
    // Activate next
    slides[cur].classList.add('active');
    if (dots[cur]) dots[cur].classList.add('active');
  }

  function resetTimer() {
    clearInterval(timer);
    if (total > 1) timer = setInterval(function(){ go(cur + 1); }, 6000);
  }

  // Expose for onclick attributes (arrows use these via button element listeners below)
  window.heroSlide = function(d) { go(cur + d); resetTimer(); };
  window.heroGoTo  = function(n) { go(n);       resetTimer(); };

  // Wire up arrow buttons (event listeners, not onclick attributes)
  var prevBtn = document.getElementById('heroPrevBtn');
  var nextBtn = document.getElementById('heroNextBtn');
  if (prevBtn) prevBtn.addEventListener('click', function(){ go(cur - 1); resetTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', function(){ go(cur + 1); resetTimer(); });

  // Wire up dots via event delegation
  var dotsWrap = document.getElementById('heroDots');
  if (dotsWrap) {
    dotsWrap.addEventListener('click', function(e) {
      var dot = e.target.closest('.hero-dot');
      if (!dot) return;
      var idx = parseInt(dot.getAttribute('data-idx'), 10);
      if (!isNaN(idx)) { go(idx); resetTimer(); }
    });
  }

  // Start auto-play
  resetTimer();
})();
</script>
` : `
<section class="hero-slider" style="background: linear-gradient(135deg, #0a0a0f 0%, #13131e 50%, #1a1a2e 100%); min-height: 320px; display:flex; align-items:center; justify-content:center;">
  <div style="text-align:center; padding:40px 20px;">
    <i class="fas fa-dragon" style="font-size:60px; color:var(--purple); margin-bottom:20px; display:block;"></i>
    <h1 style="font-size:32px; font-weight:900; margin-bottom:10px;">Welcome to ${siteName}</h1>
    <p style="color:var(--text3); font-size:15px; margin-bottom:24px;">Your world of Chinese anime, unlocked.</p>
    <a href="/search" class="btn-watch" style="display:inline-flex;"><i class="fas fa-compass"></i> Browse Anime</a>
  </div>
</section>`

  // Schedule section
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const schedByDay: Record<string, any[]> = {}
  days.forEach(d => { schedByDay[d] = [] })
  schedule.forEach(s => { if (schedByDay[s.day_of_week]) schedByDay[s.day_of_week].push(s) })
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  const scheduleSection = `
<section class="section section-alt">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-calendar-alt" style="color:var(--purple);"></i> Weekly Schedule</div>
      <a href="/schedule" class="sec-more">View All <i class="fas fa-chevron-right"></i></a>
    </div>
    <p class="sched-note">New episodes available approximately 20–60 minutes after official broadcast time.</p>
    <div class="sched-tabs" id="schedTabs">
      ${days.map((d, i) => `<button class="sched-tab${i === todayIdx ? ' active' : ''}" onclick="switchDay('${d}', this)">${d.slice(0,3)}</button>`).join('')}
    </div>
    ${days.map((d, i) => `
    <div class="sched-day${i === todayIdx ? ' active' : ''}" id="sched-${d}">
      ${schedByDay[d].length > 0 ? schedByDay[d].map(s => `
      <a href="/anime/${s.slug}" class="sched-card">
        <img src="${s.cover_image || ''}" alt="${s.title}" class="sched-poster" loading="lazy" onerror="this.src='https://placehold.co/130x190/0f0f17/6c5ce7?text=?'">
        <div class="sched-info">
          <div class="sched-name">${s.title}</div>
          <div class="sched-time"><i class="fas fa-clock" style="color:var(--purple2);font-size:9px;"></i> ${s.air_time || 'TBA'}</div>
        </div>
      </a>`).join('') : `<div class="sched-empty"><i class="fas fa-moon"></i> No shows this day</div>`}
    </div>`).join('')}
  </div>
</section>
<script>
function switchDay(day, btn) {
  document.querySelectorAll('.sched-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sched-day').forEach(d => d.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('sched-' + day);
  if (el) el.classList.add('active');
}
</script>`

  const content = `
${heroSlider}

${ongoing.length > 0 ? `
<section class="section">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-fire" style="color:var(--purple);"></i> Ongoing Anime</div>
      <a href="/search?status=Ongoing" class="sec-more">View All <i class="fas fa-chevron-right"></i></a>
    </div>
    <div class="scroll-row wide">
      ${ongoing.map(a => animeCard(a)).join('')}
    </div>
  </div>
</section>` : ''}

${recent.length > 0 ? `
<section class="section section-alt">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-clock" style="color:var(--purple);"></i> Recently Updated</div>
      <a href="/search" class="sec-more">View All <i class="fas fa-chevron-right"></i></a>
    </div>
    <div class="recent-grid">
      ${recent.slice(0, 10).map(a => recentItem(a)).join('')}
    </div>
  </div>
</section>` : ''}

${popular.length > 0 ? `
<section class="section">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-star" style="color:var(--purple);"></i> Popular Anime</div>
      <a href="/search" class="sec-more">View All <i class="fas fa-chevron-right"></i></a>
    </div>
    <div class="grid-5">
      ${popular.slice(0, 10).map(a => animeCard(a)).join('')}
    </div>
  </div>
</section>` : ''}

${trending.length > 0 ? `
<section class="section section-alt">
  <div class="container">
    <div class="sec-head">
      <div class="sec-title"><i class="fas fa-chart-line" style="color:var(--purple);"></i> Trending Now</div>
      <a href="/search" class="sec-more">View All <i class="fas fa-chevron-right"></i></a>
    </div>
    <div class="scroll-row">
      ${trending.map(a => animeCard(a)).join('')}
    </div>
  </div>
</section>` : ''}

${scheduleSection}
`

  return layout(`${siteName} - Free Anime Streaming Online`, content, '', siteName)
}
