import { layout } from './layout'

export function schedulePage(siteName: string = 'DonghuaLand'): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const today = new Date()
  const todayJS = today.getDay()
  // Convert JS day (0=Sun) to our schedule (0=Mon)
  const todayIdx = todayJS === 0 ? 6 : todayJS - 1

  // Generate dates for each day of the current week
  const weekDates: string[] = []
  const weekDatesFull: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    const diff = i - todayIdx
    d.setDate(today.getDate() + diff)
    weekDates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    weekDatesFull.push(d)
  }

  // Day picker strip (DonghuaNation style with dates)
  const dayPickerHtml = days.map((d, i) => `
    <button class="day-picker-btn${i === todayIdx ? ' active today-btn' : ''}" data-day="${d}" onclick="switchSchedDay('${d}', this)">
      <span class="dpb-day">${d.slice(0, 3)}</span>
      <span class="dpb-date">${weekDatesFull[i].getDate()}</span>
      ${i === todayIdx ? '<span class="today-dot"></span>' : ''}
    </button>
  `).join('')

  const daysPlaceholder = days.map((d, i) => `
<div class="sched-day${i === todayIdx ? ' active' : ''}" id="day-${d}">
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
  <div class="sched-tabs" id="schedTabsBar">
    ${days.map((d, i) => `
    <button class="sched-tab${i === todayIdx ? ' active' : ''}" data-day="${d}" onclick="switchSchedDay('${d}', this)">
      ${d}
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
      Future Releases
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

  // Sync tab + day picker on click
  window.switchSchedDay = function(day, clickedEl) {
    // Update all tabs (both bar and day picker)
    document.querySelectorAll('.sched-tab, .day-picker-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sched-day').forEach(d => d.classList.remove('active'));

    // Mark all matching buttons active
    document.querySelectorAll('[data-day="' + day + '"]').forEach(b => b.classList.add('active'));

    const dayEl = document.getElementById('day-' + day);
    if (dayEl) dayEl.classList.add('active');
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
    days.forEach(day => {
      const gridEl = document.getElementById('day-grid-' + day);
      if (!gridEl) return;
      const items = schedByDay[day];

      if (items.length === 0) {
        gridEl.innerHTML = \`
          <div class="sched-empty" style="grid-column:1/-1;">
            <i class="fas fa-moon"></i>
            <strong>No releases this day</strong>
            <span>Check back for updates</span>
          </div>\`;
      } else {
        gridEl.innerHTML = items.map(item => \`
          <a href="/anime/\${item.slug}" class="sched-card">
            <div class="sched-poster-wrap">
              <img src="\${item.cover_image || ''}" alt="\${item.title}" class="sched-poster"
                   onerror="this.src='https://placehold.co/150x225/0f0f17/6c5ce7?text=?'" loading="lazy">
              <div class="sched-poster-overlay">
                <div class="sched-poster-play"><i class="fas fa-play"></i></div>
              </div>
            </div>
            <div class="sched-info">
              <div class="sched-title">\${item.title}</div>
              \${item.air_time ? \`<div class="sched-time"><i class="fas fa-clock"></i> \${item.air_time}</div>\` : ''}
              <span class="sched-badge">Ongoing</span>
            </div>
          </a>\`).join('');
      }
    });

    // Build future releases from upcoming anime
    try {
      const upcoming = schedData.filter(s => s.status === 'Upcoming').slice(0, 8);
      const futureEl = document.getElementById('futureReleasesList');
      if (futureEl) {
        if (upcoming.length === 0) {
          futureEl.innerHTML = '<div class="future-empty"><i class="fas fa-satellite-dish" style="margin-right:8px;color:var(--text4);"></i> No upcoming releases added yet</div>';
        } else {
          futureEl.innerHTML = '<div class="future-list">' + upcoming.map(item => \`
            <a href="/anime/\${item.slug}" class="future-item">
              <img src="\${item.cover_image || ''}" alt="\${item.title}" class="future-item-poster"
                   onerror="this.src='https://placehold.co/42x60/111120/8b5cf6?text=?'" loading="lazy">
              <div class="future-item-info">
                <div class="future-item-title">\${item.title}</div>
                <div class="future-item-meta">\${item.title_native || ''}</div>
              </div>
              \${item.air_time ? \`<div class="future-item-date"><i class="fas fa-clock" style="margin-right:4px;"></i>\${item.air_time}</div>\` : ''}
            </a>\`).join('') + '</div>';
        }
      }
    } catch (e) {
      const futureEl = document.getElementById('futureReleasesList');
      if (futureEl) futureEl.innerHTML = '<div class="future-empty">No upcoming releases yet</div>';
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
