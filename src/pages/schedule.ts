import { layout } from './layout'

export function schedulePage(siteName: string = 'DonghuaLand'): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const today = new Date()
  const todayJS = today.getDay()
  // Convert JS day (0=Sun) to our schedule (0=Mon)
  const todayIdx = todayJS === 0 ? 6 : todayJS - 1

  // Generate dates for each day of the current week
  const weekDates: { date: number; month: string; full: string; iso: string }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    const diff = i - todayIdx
    d.setDate(today.getDate() + diff)
    weekDates.push({
      date: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      full: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      iso: d.toISOString().split('T')[0], // YYYY-MM-DD
    })
  }

  // Day picker strip with dates
  const dayPickerHtml = days.map((d, i) => `
    <button class="day-picker-btn${i === todayIdx ? ' active today-btn' : ''}" data-day="${d}" onclick="switchSchedDay('${d}', this)">
      <span class="dpb-month">${weekDates[i].month}</span>
      <span class="dpb-date">${weekDates[i].date}</span>
      <span class="dpb-day">${d.slice(0, 3)}</span>
      ${i === todayIdx ? '<span class="today-dot"></span>' : ''}
    </button>
  `).join('')

  const daysPlaceholder = days.map((d, i) => `
<div class="sched-day${i === todayIdx ? ' active' : ''}" id="day-${d}">
  <div class="sched-day-header">
    <span class="sched-day-label">
      <i class="fas fa-calendar-day"></i> ${d} — ${weekDates[i].full}
    </span>
    ${i === todayIdx ? '<span class="sched-today-badge"><i class="fas fa-circle" style="font-size:6px;margin-right:4px;"></i>Today</span>' : ''}
  </div>
  <div class="sched-grid" id="day-grid-${d}">
    <div class="sched-empty" style="grid-column:1/-1;">
      <i class="fas fa-spinner fa-spin"></i>
      <strong>Loading schedule...</strong>
    </div>
  </div>
</div>`).join('')

  const content = `
<!-- Schedule Hero Banner -->
<div class="schedule-hero">
  <div class="schedule-hero-inner">
    <div class="schedule-hero-left">
      <h1 class="schedule-hero-title">
        <i class="fas fa-calendar-alt"></i>
        Weekly Schedule
      </h1>
      <p class="schedule-hero-subtitle">
        Official broadcast times for all ongoing donghua series.
      </p>
      <div class="schedule-hero-note">
        <i class="fas fa-clock"></i>
        New episodes available approximately 20–60 minutes after official broadcast
      </div>
    </div>
  </div>

  <!-- Day picker strip with dates -->
  <div class="day-picker-wrap" style="max-width:1440px;margin:0 auto;padding-top:18px;">
    <div class="day-picker-strip">
      ${dayPickerHtml}
    </div>
  </div>
</div>

<!-- Sticky tab bar -->
<div class="sched-tabs-wrap">
  <div class="sched-tabs sched-tabs-dated" id="schedTabsBar">
    ${days.map((d, i) => `
    <button class="sched-tab sched-tab-dated${i === todayIdx ? ' active' : ''}" data-day="${d}" onclick="switchSchedDay('${d}', this)">
      <span class="stab-day">${d.slice(0, 3)}</span>
      <span class="stab-date">${weekDates[i].date}</span>
      ${i === todayIdx ? '<span class="today-dot"></span>' : ''}
    </button>`).join('')}
  </div>
</div>

<!-- Schedule Content -->
<div class="schedule-page-wrap">
  <div id="scheduleContent">
    ${daysPlaceholder}
  </div>

  <!-- Future Releases -->
  <div class="future-releases-section">
    <div class="future-releases-title">
      <i class="fas fa-rocket" style="color:var(--accent2);font-size:16px;"></i>
      Upcoming Episodes
    </div>
    <div id="futureReleasesList">
      <div class="future-empty">
        <i class="fas fa-spinner fa-spin" style="margin-right:8px;color:var(--purple3);"></i>
        Loading upcoming releases...
      </div>
    </div>
  </div>
</div>

<script>
// ==== SCHEDULE PAGE LOGIC ====
(async function initSchedulePage() {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  // Current week dates (computed client-side to always be accurate)
  const today = new Date();
  const todayJS = today.getDay(); // 0=Sun
  const todayIdx = todayJS === 0 ? 6 : todayJS - 1;

  function getWeekDate(idx) {
    const d = new Date(today);
    d.setDate(today.getDate() + (idx - todayIdx));
    return d;
  }

  // Sync tab + day picker on click
  window.switchSchedDay = function(day, clickedEl) {
    // Hide ALL day panels
    document.querySelectorAll('.sched-day').forEach(function(d) {
      d.classList.remove('active');
    });
    // Remove active from ALL tab buttons (both sticky bar and day picker)
    document.querySelectorAll('.sched-tab, .day-picker-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    // Activate the selected day panel
    var dayEl = document.getElementById('day-' + day);
    if (dayEl) dayEl.classList.add('active');
    // Activate matching buttons
    document.querySelectorAll('[data-day="' + day + '"]').forEach(function(b) {
      b.classList.add('active');
    });
  };

  // Fetch schedule data
  try {
    const res = await fetch('/api/schedule');
    const json = await res.json();
    const schedData = json.data || [];

    // Group by day
    const schedByDay = {};
    days.forEach(d => schedByDay[d] = []);
    schedData.forEach(item => {
      if (schedByDay[item.day_of_week]) schedByDay[item.day_of_week].push(item);
    });

    // Sort by air_time within each day
    days.forEach(d => {
      schedByDay[d].sort((a, b) => {
        if (!a.air_time) return 1;
        if (!b.air_time) return -1;
        return a.air_time.localeCompare(b.air_time);
      });
    });

    // Render each day grid
    days.forEach((day, idx) => {
      const gridEl = document.getElementById('day-grid-' + day);
      if (!gridEl) return;
      const items = schedByDay[day];
      const weekDate = getWeekDate(idx);
      const dateStr = weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (items.length === 0) {
        gridEl.innerHTML = \`
          <div class="sched-empty" style="grid-column:1/-1;">
            <i class="fas fa-moon"></i>
            <strong>No releases on \${day}</strong>
            <span>Nothing scheduled for \${dateStr}</span>
          </div>\`;
      } else {
        gridEl.innerHTML = items.map(item => {
          const animeHref = \`/anime/\${item.slug}\`;
          return \`
          <a href="\${animeHref}" class="sched-card">
            <div class="sched-poster-wrap">
              <img src="\${item.cover_image || ''}" alt="\${item.title}" class="sched-poster"
                   onerror="this.src='https://placehold.co/150x225/0f0f17/6c5ce7?text=?'" loading="lazy">
              <div class="sched-poster-overlay">
                <div class="sched-poster-play"><i class="fas fa-play"></i></div>
              </div>
              \${item.next_episode ? \`<div class="sched-ep-badge">EP \${item.next_episode}</div>\` : ''}
            </div>
            <div class="sched-info">
              <div class="sched-title">\${item.title}</div>
              <div class="sched-time">
                <i class="fas fa-clock"></i> \${item.air_time || 'TBA'}
                <span class="sched-date-pill">\${dateStr}</span>
              </div>
              \${item.next_episode
                ? \`<div class="sched-next-ep"><i class="fas fa-play-circle"></i> Episode \${item.next_episode} upcoming</div>\`
                : \`<span class="sched-badge">Ongoing</span>\`}
              \${item.notes ? \`<div class="sched-notes"><i class="fas fa-info-circle"></i> \${item.notes}</div>\` : ''}
            </div>
          </a>\`;
        }).join('');
      }
    });

    // Build upcoming episodes list — anime with next_episode set
    try {
      const upcoming = schedData
        .filter(s => s.next_episode)
        .sort((a, b) => {
          // Sort by day order
          const order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
          return order.indexOf(a.day_of_week) - order.indexOf(b.day_of_week);
        })
        .slice(0, 12);

      const futureEl = document.getElementById('futureReleasesList');
      if (futureEl) {
        if (upcoming.length === 0) {
          futureEl.innerHTML = '<div class="future-empty"><i class="fas fa-satellite-dish" style="margin-right:8px;color:var(--text4);"></i> No upcoming episodes set yet</div>';
        } else {
          futureEl.innerHTML = '<div class="future-list">' + upcoming.map(item => \`
            <a href="/anime/\${item.slug}" class="future-item">
              <img src="\${item.cover_image || ''}" alt="\${item.title}" class="future-item-poster"
                   onerror="this.src='https://placehold.co/42x60/111120/8b5cf6?text=?'" loading="lazy">
              <div class="future-item-info">
                <div class="future-item-title">\${item.title}</div>
                <div class="future-item-meta">\${item.day_of_week}\${item.air_time ? ' · ' + item.air_time : ''}</div>
              </div>
              <div class="future-item-date">
                <span class="future-ep-badge">EP \${item.next_episode}</span>
              </div>
            </a>\`).join('') + '</div>';
        }
      }
    } catch (e) {
      const futureEl = document.getElementById('futureReleasesList');
      if (futureEl) futureEl.innerHTML = '<div class="future-empty">Unable to load upcoming episodes</div>';
    }

  } catch (err) {
    days.forEach(day => {
      const gridEl = document.getElementById('day-grid-' + day);
      if (gridEl) {
        gridEl.innerHTML = \`
          <div class="sched-empty" style="grid-column:1/-1;">
            <i class="fas fa-exclamation-triangle" style="color:var(--red);"></i>
            <strong>Failed to load schedule</strong>
            <span>Please refresh the page</span>
          </div>\`;
      }
    });
    const futureEl = document.getElementById('futureReleasesList');
    if (futureEl) futureEl.innerHTML = '<div class="future-empty">Unable to load data</div>';
  }
})();
</script>
`
  return layout(`Schedule - ${siteName}`, content, '', siteName)
}
