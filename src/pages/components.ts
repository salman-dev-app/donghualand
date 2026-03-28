// Shared components matching donghualand.vip exactly

export function genresFromJson(g: any): string[] {
  if (!g) return []
  if (Array.isArray(g)) return g.filter(Boolean)
  try {
    const p = JSON.parse(g)
    if (Array.isArray(p)) return p.filter(Boolean)
    return []
  } catch { return [] }
}

export function formatRating(r: any): string {
  const n = parseFloat(r)
  return isNaN(n) ? 'N/A' : n.toFixed(1)
}

export function statusBadge(status: string) {
  const s = (status || '').toLowerCase()
  if (s === 'ongoing') return 'badge-green'
  if (s === 'completed') return 'badge-blue'
  return 'badge-gray'
}

export function statusBarClass(status: string) {
  return (status || '').toLowerCase() === 'completed' ? 'done' : ''
}

export function animeCard(a: any): string {
  const genres = genresFromJson(a.genres)
  const statusClass = statusBadge(a.status)
  const barClass = statusBarClass(a.status)
  const img = a.cover_image || 'https://placehold.co/150x220/0f0f17/6c5ce7?text=No+Image'
  const ep = a.latest_ep || a.total_episodes || ''
  const rating = parseFloat(a.rating)
  return `
<a href="/anime/${a.slug}" class="acard">
  <div class="acard-img">
    <img src="${img}" alt="${a.title}" loading="lazy" onerror="this.src='https://placehold.co/150x220/0f0f17/6c5ce7?text=?'">
    <div class="acard-overlay">
      <div class="acard-play"><i class="fas fa-play"></i></div>
    </div>
    ${a.type ? `<div class="acard-type">${a.type}</div>` : ''}
    ${ep ? `<div class="acard-ep">EP ${ep}</div>` : ''}
    ${!isNaN(rating) ? `<div class="acard-score"><i class="fas fa-star" style="color:var(--gold);font-size:8px;"></i>${rating.toFixed(1)}</div>` : ''}
    <div class="acard-status ${barClass}"></div>
  </div>
  <div class="acard-body">
    <div class="acard-name">${a.title}</div>
    <div class="acard-meta">
      <span>${a.release_year || ''}</span>
      ${a.release_year && genres.length ? '<span class="acard-meta-dot"></span>' : ''}
      <span>${genres.slice(0, 1).join('')}</span>
    </div>
  </div>
</a>`
}

export function episodeCard(ep: any, slug: string, animeCover?: string): string {
  // Always use the anime cover image as thumbnail — no manual upload needed
  const thumb = animeCover || 'https://placehold.co/320x180/0f0f17/6c5ce7?text=EP+' + ep.episode_number
  return `
<a href="/watch/${slug}-episode-${ep.episode_number}" class="ep-card">
  <div class="ep-thumb">
    <img src="${thumb}" alt="Episode ${ep.episode_number}" loading="lazy" onerror="this.src='https://placehold.co/320x180/0f0f17/6c5ce7?text=EP+${ep.episode_number}'">
    <div class="ep-thumb-overlay">
      <i class="fas fa-play" style="font-size:20px; color:#fff;"></i>
    </div>
    <div class="ep-num-tag">EP ${ep.episode_number}</div>
  </div>
  <div class="ep-info">
    <div class="ep-name">${ep.title || 'Episode ' + ep.episode_number}</div>
    ${ep.air_date ? `<div class="ep-date">${ep.air_date}</div>` : ''}
  </div>
</a>`
}

export function breadcrumb(items: { label: string, href?: string }[]): string {
  return `
<nav class="breadcrumb">
  <a href="/"><i class="fas fa-home"></i></a>
  ${items.map(item => `
  <i class="fas fa-chevron-right sep" style="font-size:9px; color:var(--text4);"></i>
  ${item.href ? `<a href="${item.href}">${item.label}</a>` : `<span>${item.label}</span>`}
  `).join('')}
</nav>`
}

export function recentItem(a: any): string {
  const genres = genresFromJson(a.genres)
  const img = a.cover_image || 'https://placehold.co/50x70/0f0f17/6c5ce7?text=?'
  const statusTag = (a.status || 'ONA').toLowerCase() === 'ongoing' ? 'rtag-on' :
    (a.status || '').toLowerCase() === 'completed' ? 'rtag-done' : 'rtag-up'
  const typeTag = 'rtag-ona'
  const href = a.latest_ep ? `/watch/${a.slug}-episode-${a.latest_ep}` : `/anime/${a.slug}`
  return `
<a href="${href}" class="recent-item">
  <img src="${img}" alt="${a.title}" class="recent-thumb" loading="lazy" onerror="this.src='https://placehold.co/50x70/0f0f17/6c5ce7?text=?'">
  <div class="recent-info">
    <div class="recent-name">${a.title}</div>
    <div class="recent-tags">
      <span class="rtag ${typeTag}">${a.type || 'ONA'}</span>
      <span class="rtag ${statusTag}">${a.status || 'Ongoing'}</span>
    </div>
    ${a.latest_ep ? `<div class="recent-ep"><i class="fas fa-play-circle" style="font-size:9px;"></i> EP ${a.latest_ep}</div>` : ''}
    <div class="recent-genre">${genres.slice(0, 2).join(' · ')}</div>
  </div>
</a>`
}
