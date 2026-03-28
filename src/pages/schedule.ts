import { layout } from './layout'

export function schedulePage(siteName: string = 'DonghuaLand'): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const today = new Date().getDay()
  // Convert JS day (0=Sun) to our schedule (0=Mon)
  const todayIdx = today === 0 ? 6 : today - 1

  const tabsHtml = days.map((d, i) => `
    <button class="sched-tab${i === todayIdx ? ' active' : ''}" data-day="${d}">
      ${d.slice(0, 3)}
      ${i === todayIdx ? '<span class="today-dot"></span>' : ''}
    </button>
  `).join('')

  const daysPlaceholder = days.map((d, i) => `
<div class="sched-day${i === todayIdx ? ' active' : ''}" id="day-${d}">
  <div class="sched-empty"><i class="fas fa-spinner fa-spin"></i> Loading...</div>
</div>`).join('')

  const content = `
<div class="schedule-page-wrap">
  <div class="page-title">
    <i class="fas fa-calendar-alt"></i> Weekly Schedule
    <span class="page-title-sub">New episodes every week</span>
  </div>
  <div class="sched-tabs-wrap">
    <div class="sched-tabs">${tabsHtml}</div>
  </div>
  <div class="sched-content" id="scheduleContent">
    ${daysPlaceholder}
  </div>
</div>

<script>
// Load schedule from API
(async function() {
  try {
    const res = await fetch('/api/schedule');
    const d = await res.json();
    const schedData = d.data || [];
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const schedByDay = {};
    days.forEach(day => schedByDay[day] = []);
    schedData.forEach(item => { if (schedByDay[item.day_of_week]) schedByDay[item.day_of_week].push(item); });
    days.forEach(day => {
      const el = document.getElementById('day-' + day);
      if (!el) return;
      const items = schedByDay[day];
      if (items.length === 0) {
        el.innerHTML = '<div class="sched-empty"><i class="fas fa-moon"></i> No releases this day</div>';
      } else {
        el.innerHTML = items.map(item => \`
          <a href="/anime/\${item.slug}" class="sched-card">
            <img src="\${item.cover_image || ''}" alt="\${item.title}" class="sched-poster"
                 onerror="this.src='https://placehold.co/80x112/0f0f17/6c5ce7?text=?'" loading="lazy">
            <div class="sched-info">
              <div class="sched-title">\${item.title}</div>
              \${item.air_time ? '<div class="sched-time"><i class="fas fa-clock"></i> ' + item.air_time + '</div>' : ''}
              <span class="badge badge-green">Ongoing</span>
            </div>
          </a>\`).join('');
      }
    });
  } catch(e) {
    document.querySelectorAll('.sched-day').forEach(el => {
      el.innerHTML = '<div class="sched-empty"><i class="fas fa-moon"></i> No data available</div>';
    });
  }
})();

// Tab switching
document.querySelectorAll('.sched-tab').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.sched-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sched-day').forEach(d => d.classList.remove('active'));
    this.classList.add('active');
    const day = this.dataset.day;
    const dayEl = document.getElementById('day-' + day);
    if (dayEl) dayEl.classList.add('active');
  });
});
</script>
`
  return layout(`Schedule - ${siteName}`, content, '', siteName)
}
