// DonghuaLand Admin Panel JavaScript
'use strict';

// ====== ADMIN STATE ======
let currentPage = 'dashboard';
let animeListPage = 1;
let allAnimeCache = [];
let animeListFilter = '';
let animeListStatus = '';
let editingAnimeId = null;

// ====== PAGE NAVIGATION ======
window.showPage = function(page) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('admin-' + page);
  const nav = document.getElementById('nav-' + page);
  if (el) el.classList.add('active');
  if (nav) nav.classList.add('active');
  currentPage = page;
  if (page === 'dashboard') loadDashboard();
  if (page === 'anime') loadAnimeList();
  if (page === 'episodes') loadEpisodesPage();
  if (page === 'users') loadUsers();
  if (page === 'schedule') loadSchedulePage();
  if (page === 'settings') loadSettings();
  if (page === 'comments') loadComments();
};

// ====== AUTH ======
window.adminLogout = function() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/admin';
};

function getToken() { return localStorage.getItem('token') || ''; }
function headers() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
}

// ====== DASHBOARD ======
async function loadDashboard() {
  const dateEl = document.getElementById('dashDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  try {
    const res = await fetch('/api/admin/stats', { headers: headers() });
    const d = await res.json();
    if (d.data) {
      const s = d.data;
      setText('sAnime', s.total_anime || 0);
      setText('sEps', s.total_episodes || 0);
      setText('sUsers', s.total_users || 0);
      setText('sViews', formatNum(s.total_views || 0));
      setText('sComments', s.total_comments || 0);
    }
  } catch(e) { console.warn('Stats error', e); }
  try {
    const res = await fetch('/api/anime?limit=10&page=1', { headers: headers() });
    const d = await res.json();
    const tbody = document.getElementById('dashRecentBody');
    if (!tbody) return;
    if (d.data && d.data.length > 0) {
      tbody.innerHTML = d.data.map(a => `
        <tr>
          <td>
            <div class="anime-cell-wrap">
              <img src="${a.cover_image || ''}" class="cell-poster" onerror="this.style.display='none'" alt="">
              <div><div class="cell-name">${a.title}</div><div class="cell-native">${a.title_native || ''}</div></div>
            </div>
          </td>
          <td><span class="badge ${a.status === 'Ongoing' ? 'badge-green' : a.status === 'Completed' ? 'badge-blue' : 'badge-gray'}" style="font-size:9px;">${a.status || ''}</span></td>
          <td>${a.episode_count || 0}</td>
          <td style="color:var(--gold);">${a.rating || '—'}</td>
          <td>
            <div class="tbl-act">
              <button class="tbl-btn tbl-edit" onclick="editAnime('${a.id}','${escHtml(a.slug)}')">Edit</button>
              <button class="tbl-btn tbl-ep" onclick="goToEpisodes('${a.id}','${escHtml(a.slug)}')">EPs</button>
            </div>
          </td>
        </tr>`).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--text3);">No anime yet. <a href="#" onclick="showPage(\'add-anime\')" style="color:var(--purple2);">Add your first anime</a></td></tr>';
    }
  } catch(e) { console.warn('Recent error', e); }
}

// ====== ANIME LIST ======
async function loadAnimeList(page = 1) {
  animeListPage = page;
  const tbody = document.getElementById('animeListBody');
  const pager = document.getElementById('animeListPager');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text3);"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
  try {
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (animeListFilter) params.set('q', animeListFilter);
    if (animeListStatus) params.set('status', animeListStatus);
    const res = await fetch('/api/anime?' + params, { headers: headers() });
    const d = await res.json();
    if (d.data && d.data.length > 0) {
      tbody.innerHTML = d.data.map(a => `
        <tr>
          <td>
            <div class="anime-cell-wrap">
              <img src="${a.cover_image || ''}" class="cell-poster" onerror="this.style.display='none'" alt="">
              <div>
                <div class="cell-name">${a.title}</div>
                <div class="cell-native">${a.title_native || ''}</div>
              </div>
            </div>
          </td>
          <td style="color:var(--purple2);">${a.type || 'ONA'}</td>
          <td><span class="badge ${a.status === 'Ongoing' ? 'badge-green' : a.status === 'Completed' ? 'badge-blue' : 'badge-gray'}" style="font-size:9px;">${a.status || ''}</span></td>
          <td style="color:var(--text3);">${a.release_year || '—'}</td>
          <td style="color:var(--gold);">${a.rating || '—'}</td>
          <td>${a.episode_count || 0}</td>
          <td>
            <div class="tbl-act">
              <button class="tbl-btn tbl-edit" onclick="editAnime('${a.id}','${escHtml(a.slug)}')">Edit</button>
              <button class="tbl-btn tbl-ep" onclick="goToEpisodes('${a.id}','${escHtml(a.slug)}')">EPs</button>
              <button class="tbl-btn tbl-del" onclick="deleteAnime('${a.id}','${escHtml(a.title)}')">Del</button>
            </div>
          </td>
        </tr>`).join('');

      // Pagination
      if (pager) {
        const total = d.total || d.data.length;
        const totalPages = Math.ceil(total / 15);
        if (totalPages > 1) {
          pager.innerHTML = Array.from({ length: totalPages }, (_, i) => `
            <button onclick="loadAnimeList(${i+1})" class="page-btn${i+1 === page ? ' active' : ''}">${i+1}</button>
          `).join('');
        } else { pager.innerHTML = ''; }
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text3);">No anime found. <a href="#" onclick="showPage(\'add-anime\')" style="color:var(--purple2);">Add anime</a></td></tr>';
      if (pager) pager.innerHTML = '';
    }
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--red);">Error loading. Check login.</td></tr>`;
  }
}

window.filterAnimeList = function(v) { animeListFilter = v; loadAnimeList(1); };
window.filterAnimeStatus = function(v) { animeListStatus = v; loadAnimeList(1); };

async function editAnime(id, slug) {
  try {
    const res = await fetch('/api/anime/' + slug, { headers: headers() });
    const d = await res.json();
    // API returns anime directly (not wrapped in 'data')
    if (!d || d.error || !d.id) { showToast('Anime not found', 'error'); return; }
    const a = d;
    showPage('add-anime');
    editingAnimeId = id;
    document.getElementById('editAnimeId').value = id;
    document.getElementById('addAnimeTitle').textContent = 'Edit Anime';
    document.getElementById('saveAnimeBtn').innerHTML = '<i class="fas fa-save"></i> Update Anime';
    setVal('fTitle', a.title);
    setVal('fTitleNative', a.title_native);
    setVal('fTitleEnglish', a.title_english);
    setVal('fSlug', a.slug);
    setVal('fType', a.type);
    setVal('fStatus', a.status);
    setVal('fYear', a.release_year);
    setVal('fRating', a.rating);
    setVal('fDescription', a.description);
    setVal('fCoverImage', a.cover_image);
    setVal('fBannerImage', a.banner_image);
    setVal('fTrailer', a.trailer_url);
    setVal('fCountry', a.country);
    setVal('fDuration', a.duration);
    // Genres
    let genres = a.genres;
    try { genres = JSON.parse(a.genres).join(', '); } catch {}
    setVal('fGenres', genres);
    // Studios
    let studios = a.studios;
    try { studios = JSON.parse(a.studios).join(', '); } catch {}
    setVal('fStudios', studios);
    // Flags
    setCheck('fFeatured', a.is_featured);
    setCheck('fTrending', a.is_trending);
    setCheck('fPopular', a.is_popular);
    // Preview images
    previewImg('fCoverImage', 'prevCover');
    previewImg('fBannerImage', 'prevBanner');
  } catch(e) { showToast('Error loading anime data', 'error'); }
}

window.goToEpisodes = function(animeId, slug) {
  showPage('episodes');
  setTimeout(() => {
    const sel = document.getElementById('epAnimeSelect');
    if (sel) { sel.value = animeId; loadAnimeEpisodes(animeId); }
  }, 200);
};

async function deleteAnime(id, title) {
  if (!confirm('Delete "' + title + '"? This also deletes all its episodes.')) return;
  try {
    const res = await fetch('/api/admin/anime/' + id, { method: 'DELETE', headers: headers() });
    const d = await res.json();
    if (d.success) { showToast('Deleted: ' + title, 'success'); loadAnimeList(animeListPage); }
    else showToast(d.error || 'Delete failed', 'error');
  } catch { showToast('Error deleting', 'error'); }
}

window.resetAnimeForm = function() {
  editingAnimeId = null;
  document.getElementById('editAnimeId').value = '';
  document.getElementById('addAnimeTitle').textContent = 'Add Anime';
  document.getElementById('saveAnimeBtn').innerHTML = '<i class="fas fa-save"></i> Save Anime';
  ['fTitle','fTitleNative','fTitleEnglish','fSlug','fDescription','fCoverImage','fBannerImage','fTrailer','fDuration','fGenres','fStudios'].forEach(id => setVal(id, ''));
  setVal('fType', 'ONA'); setVal('fStatus', 'Ongoing'); setVal('fYear', ''); setVal('fRating', ''); setVal('fCountry', 'China');
  setCheck('fFeatured', false); setCheck('fTrending', false); setCheck('fPopular', false);
  document.getElementById('prevCover').style.display = 'none';
  document.getElementById('prevBanner').style.display = 'none';
  document.getElementById('tmdbResults').innerHTML = '';
  const jr = document.getElementById('jikanResults'); if (jr) jr.innerHTML = '';
};

window.saveAnime = async function() {
  const title = getVal('fTitle');
  const slug = getVal('fSlug');
  if (!title.trim()) { showToast('Title is required', 'error'); return; }
  if (!slug.trim()) { showToast('Slug is required', 'error'); return; }

  const genresRaw = getVal('fGenres');
  const genresArr = genresRaw ? genresRaw.split(',').map(g => g.trim()).filter(Boolean) : [];

  const studiosRaw = getVal('fStudios');
  const studiosArr = studiosRaw ? studiosRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const body = {
    title, slug,
    title_native: getVal('fTitleNative'),
    title_english: getVal('fTitleEnglish'),
    type: getVal('fType'),
    status: getVal('fStatus'),
    release_year: getVal('fYear') ? parseInt(getVal('fYear')) : null,
    rating: getVal('fRating') ? parseFloat(getVal('fRating')) : null,
    description: getVal('fDescription'),
    cover_image: getVal('fCoverImage'),
    banner_image: getVal('fBannerImage'),
    trailer_url: getVal('fTrailer'),
    country: getVal('fCountry'),
    duration: getVal('fDuration'),
    genres: JSON.stringify(genresArr),
    studios: JSON.stringify(studiosArr),
    is_featured: getCheck('fFeatured') ? 1 : 0,
    is_trending: getCheck('fTrending') ? 1 : 0,
    is_popular: getCheck('fPopular') ? 1 : 0,
  };

  const btn = document.getElementById('saveAnimeBtn');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    const id = document.getElementById('editAnimeId').value;
    const url = id ? '/api/admin/anime/' + id : '/api/admin/anime';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
    const d = await res.json();
    if (d.success) {
      showToast((id ? 'Updated' : 'Added') + ': ' + title, 'success');
      resetAnimeForm();
      showPage('anime');
    } else {
      showToast(d.error || 'Save failed', 'error');
    }
  } catch { showToast('Error saving', 'error'); }
  btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save Anime';
};

// ====== TMDB (Server-side API Key - no key needed in frontend) ======
// Bug fix: previously this only searched TV shows. Now it uses /api/tmdb/search
// which returns BOTH Movies and TV Shows, with a type filter dropdown.
window.tmdbSearch = async function() {
  const q = getVal('tmdbQuery');
  if (!q) { showToast('Enter a search query', 'error'); return; }
  const typeEl = document.getElementById('tmdbType');
  const type = (typeEl && typeEl.value) ? typeEl.value : 'multi';
  const res = document.getElementById('tmdbResults');
  res.innerHTML = '<div style="padding:16px; color:var(--text3);"><i class="fas fa-spinner fa-spin"></i> Searching TMDB...</div>';
  try {
    // Hit the generic search endpoint (multi/movie/tv) so movies are no longer hidden.
    const r = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`, { headers: headers() });
    const d = await r.json();
    if (d.error && d.error.includes('not configured')) {
      res.innerHTML = '<div style="padding:16px; color:var(--red);">TMDB API key not configured on server. Add TMDB_API_KEY as a Cloudflare secret.</div>';
      return;
    }
    if (d.error) {
      res.innerHTML = '<div style="padding:16px; color:var(--red);">TMDB error: ' + escHtml(d.error) + '</div>';
      return;
    }
    if (d.results && d.results.length > 0) {
      res.innerHTML = d.results.map(item => {
        const mt = item.media_type === 'movie' ? 'movie' : 'tv';
        const badgeLabel = mt === 'movie' ? 'Movie' : 'TV';
        // Encode the media_type into the click handler so tmdbSelect knows which detail endpoint to hit
        return `
        <div class="tmdb-r" onclick="tmdbSelect('${item.id}','${mt}')">
          <span class="tmdb-r-badge ${mt}">${badgeLabel}</span>
          <img src="${item.cover_image || 'https://placehold.co/110x165/0f0f17/6c5ce7?text=?'}" alt="${escHtml(item.title)}" onerror="this.src='https://placehold.co/110x165/0f0f17/6c5ce7?text=?'">
          <div class="tmdb-r-name">${escHtml(item.title)}</div>
          <div class="tmdb-r-year">${item.release_year || ''}${item.rating ? ' • ★ ' + item.rating : ''}</div>
        </div>`;
      }).join('');
    } else {
      res.innerHTML = '<div style="padding:16px; color:var(--text3);">No results found.</div>';
    }
  } catch(e) { res.innerHTML = '<div style="padding:16px; color:var(--red);">TMDB search error: ' + e.message + '</div>'; }
};

window.tmdbSelect = async function(tmdbId, mediaType) {
  // Default to 'tv' to preserve old behaviour for any callers that didn't pass mediaType
  const mt = mediaType === 'movie' ? 'movie' : 'tv';
  showToast('Fetching ' + (mt === 'movie' ? 'movie' : 'TV') + ' data from TMDB...', 'info');
  try {
    // Server uses its own TMDB_API_KEY secret - always returns English data
    const endpoint = mt === 'movie' ? `/api/tmdb/movie/${tmdbId}` : `/api/tmdb/tv/${tmdbId}`;
    const r = await fetch(endpoint, { headers: headers() });
    const d = await r.json();
    if (d.error) { showToast('TMDB Error: ' + d.error, 'error'); return; }
    if (!d.title && !d.tmdb_id) { showToast('No data returned from TMDB', 'error'); return; }

    const filled = [];

    // ---- Title (English) ----
    const englishTitle = d.title_english || d.title || '';
    setVal('fTitle', englishTitle);
    if (englishTitle) filled.push('Title');

    // ---- Native Title (Chinese/Japanese original) ----
    setVal('fTitleNative', d.title_native || '');
    if (d.title_native) filled.push('Native Title');

    // ---- English Title explicitly ----
    setVal('fTitleEnglish', d.title_english || d.title || '');
    if (d.title_english) filled.push('English Title');

    // ---- Slug (auto-generated from English title) ----
    if (englishTitle) {
      setVal('fSlug', slugify(englishTitle));
      filled.push('Slug');
    }

    // ---- Description (English) ----
    if (d.description) {
      setVal('fDescription', d.description);
      filled.push('Description');
    }

    // ---- Cover Image ----
    if (d.cover_image) {
      setVal('fCoverImage', d.cover_image);
      filled.push('Cover Image');
    }

    // ---- Banner Image ----
    if (d.banner_image) {
      setVal('fBannerImage', d.banner_image);
      filled.push('Banner Image');
    }

    // ---- Trailer URL ----
    if (d.trailer_url) {
      setVal('fTrailer', d.trailer_url);
      filled.push('Trailer');
    }

    // ---- Rating ----
    if (d.rating) {
      setVal('fRating', String(d.rating));
      filled.push('Rating (' + d.rating + ')');
    }

    // ---- Year ----
    if (d.release_year) {
      setVal('fYear', String(d.release_year));
      filled.push('Year');
    }

    // ---- Status ----
    setVal('fStatus', d.status || 'Ongoing');
    filled.push('Status');

    // ---- Type ----
    setVal('fType', d.type || 'ONA');
    filled.push('Type');

    // ---- Country ----
    setVal('fCountry', d.country || 'China');
    filled.push('Country');

    // ---- Duration (episode runtime) ----
    if (d.duration) {
      setVal('fDuration', d.duration);
      filled.push('Duration');
    }

    // ---- Genres (English names) ----
    if (d.genres && d.genres.length > 0) {
      setVal('fGenres', Array.isArray(d.genres) ? d.genres.join(', ') : d.genres);
      filled.push('Genres');
    }

    // ---- Studios / Production Companies ----
    if (d.studios && d.studios.length > 0) {
      setVal('fStudios', Array.isArray(d.studios) ? d.studios.join(', ') : d.studios);
      filled.push('Studios');
    }

    // ---- Preview images ----
    previewImg('fCoverImage', 'prevCover');
    previewImg('fBannerImage', 'prevBanner');

    // ---- Success message ----
    showToast('✓ TMDB filled: ' + filled.join(', '), 'success');
    document.getElementById('tmdbResults').innerHTML = '';

    // Scroll to the anime form
    const formEl = document.getElementById('fTitle');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch(e) { showToast('Error fetching TMDB details: ' + e.message, 'error'); }
};

// ====== JIKAN / MyAnimeList (no key required) ======
// Jikan v4 is the open REST mirror of MyAnimeList data, exposed by the
// server at /api/jikan/*. It complements TMDB — especially for Japanese
// anime where MAL's metadata (titles, studios, episode counts, scores)
// is typically more accurate.
window.jikanSearch = async function() {
  const q = getVal('jikanQuery');
  if (!q) { showToast('Enter a search query', 'error'); return; }
  const typeEl = document.getElementById('jikanType');
  const type = (typeEl && typeEl.value) ? typeEl.value : '';
  const res = document.getElementById('jikanResults');
  if (!res) return;
  res.innerHTML = '<div style="padding:16px; color:var(--text3);"><i class="fas fa-spinner fa-spin"></i> Searching MyAnimeList (Jikan)...</div>';
  try {
    const params = new URLSearchParams({ q });
    if (type) params.set('type', type);
    params.set('limit', '20');
    const r = await fetch('/api/jikan/search?' + params.toString(), { headers: headers() });
    const d = await r.json();
    if (d.error) {
      res.innerHTML = '<div style="padding:16px; color:var(--red);">Jikan error: ' + escHtml(d.error) + '</div>';
      return;
    }
    if (d.results && d.results.length > 0) {
      res.innerHTML = d.results.map(item => {
        const label = item.type || (item.media_type === 'movie' ? 'Movie' : 'TV');
        return `
        <div class="tmdb-r" onclick="jikanSelect('${item.mal_id || item.id}')">
          <span class="tmdb-r-badge jikan">${escHtml(label)}</span>
          <img src="${item.cover_image || 'https://placehold.co/110x165/0f0f17/2e51a2?text=MAL'}" alt="${escHtml(item.title)}" onerror="this.src='https://placehold.co/110x165/0f0f17/2e51a2?text=MAL'">
          <div class="tmdb-r-name">${escHtml(item.title)}</div>
          <div class="tmdb-r-year">${item.release_year || ''}${item.rating ? ' • ★ ' + item.rating : ''}</div>
        </div>`;
      }).join('');
    } else {
      res.innerHTML = '<div style="padding:16px; color:var(--text3);">No results found on MyAnimeList.</div>';
    }
  } catch(e) {
    res.innerHTML = '<div style="padding:16px; color:var(--red);">Jikan search error: ' + e.message + '</div>';
  }
};

window.jikanSelect = async function(malId) {
  showToast('Fetching anime data from MyAnimeList (Jikan)...', 'info');
  try {
    const r = await fetch('/api/jikan/anime/' + encodeURIComponent(malId), { headers: headers() });
    const d = await r.json();
    if (d.error) { showToast('Jikan Error: ' + d.error, 'error'); return; }
    if (!d.title && !d.mal_id) { showToast('No data returned from Jikan', 'error'); return; }

    const filled = [];

    // Title (English preferred)
    const englishTitle = d.title_english || d.title || '';
    setVal('fTitle', englishTitle); if (englishTitle) filled.push('Title');

    // Native title (Japanese)
    setVal('fTitleNative', d.title_native || ''); if (d.title_native) filled.push('Native Title');

    // English title field
    setVal('fTitleEnglish', d.title_english || d.title || ''); if (d.title_english) filled.push('English Title');

    // Slug
    if (englishTitle) { setVal('fSlug', slugify(englishTitle)); filled.push('Slug'); }

    // Description
    if (d.description) { setVal('fDescription', d.description); filled.push('Description'); }

    // Cover image
    if (d.cover_image) { setVal('fCoverImage', d.cover_image); filled.push('Cover Image'); }

    // Banner image (Jikan rarely has true backdrops; falls back to trailer poster)
    if (d.banner_image) { setVal('fBannerImage', d.banner_image); filled.push('Banner Image'); }

    // Trailer
    if (d.trailer_url) { setVal('fTrailer', d.trailer_url); filled.push('Trailer'); }

    // Rating
    if (d.rating) { setVal('fRating', String(d.rating)); filled.push('Rating (' + d.rating + ')'); }

    // Year
    if (d.release_year) { setVal('fYear', String(d.release_year)); filled.push('Year'); }

    // Status / Type / Country
    setVal('fStatus', d.status || 'Ongoing'); filled.push('Status');
    setVal('fType', d.type || 'TV'); filled.push('Type');
    setVal('fCountry', d.country || 'Japan'); filled.push('Country');

    // Duration
    if (d.duration) { setVal('fDuration', d.duration); filled.push('Duration'); }

    // Genres (Jikan includes genres + themes + demographics)
    if (d.genres && d.genres.length > 0) {
      setVal('fGenres', Array.isArray(d.genres) ? d.genres.join(', ') : d.genres);
      filled.push('Genres');
    }

    // Studios
    if (d.studios && d.studios.length > 0) {
      setVal('fStudios', Array.isArray(d.studios) ? d.studios.join(', ') : d.studios);
      filled.push('Studios');
    }

    previewImg('fCoverImage', 'prevCover');
    previewImg('fBannerImage', 'prevBanner');

    showToast('✓ Jikan/MAL filled: ' + filled.join(', '), 'success');
    const jr = document.getElementById('jikanResults'); if (jr) jr.innerHTML = '';

    const formEl = document.getElementById('fTitle');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch(e) {
    showToast('Error fetching Jikan details: ' + e.message, 'error');
  }
};

// ====== IMAGE HANDLING ======
window.previewImg = function(inputId, previewId) {
  const url = getVal(inputId);
  const img = document.getElementById(previewId);
  if (!img) return;
  if (url) {
    img.src = url; img.style.display = 'block';
    img.onerror = () => { img.style.display = 'none'; };
  } else {
    img.style.display = 'none';
  }
};

// Upload image to IMGBB via admin API endpoint
window.handleImgUpload = async function(input, inputId, previewId, isBanner = false) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Only image files allowed', 'error'); return; }
  if (file.size > 32 * 1024 * 1024) { showToast('File too large (max 32MB)', 'error'); return; }

  showToast('Uploading image...', 'info');
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', isBanner ? 'banner' : 'cover');

    const res = await fetch('/api/upload/admin', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + getToken() },
      body: formData
    });
    const data = await res.json();

    if (data.success && data.url) {
      setVal(inputId, data.url);
      const img = document.getElementById(previewId);
      if (img) { img.src = data.url; img.style.display = 'block'; }
      showToast('Image uploaded successfully!', 'success');
    } else {
      showToast(data.error || 'Upload failed. Check IMGBB_API_KEY configuration.', 'error');
      // Fallback: use base64 preview only (local preview, URL not saved)
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.getElementById(previewId);
        if (img) { img.src = e.target.result; img.style.display = 'block'; }
      };
      reader.readAsDataURL(file);
    }
  } catch(e) {
    showToast('Upload error: ' + e.message, 'error');
  }
  input.value = '';
};

window.handleVideoUpload = function(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 100 * 1024 * 1024) { showToast('Video too large for direct upload (max 100MB). Use a CDN URL instead.', 'error'); return; }
  const url = URL.createObjectURL(file);
  setVal('epVideo', url);
  showToast('Video loaded locally. Use a CDN or Streamtape URL for production.', 'info');
};

// ====== EPISODES ======
window.loadEpisodesPage = async function() {
  const sel = document.getElementById('epAnimeSelect');
  if (!sel || sel.options.length > 1) return;
  try {
    const res = await fetch('/api/anime?limit=100', { headers: headers() });
    const d = await res.json();
    if (d.data) {
      sel.innerHTML = '<option value="">-- Choose Anime --</option>' +
        d.data.map(a => `<option value="${a.id}">${a.title}</option>`).join('');
      const schedSel = document.getElementById('schedAnime');
      if (schedSel) {
        schedSel.innerHTML = '<option value="">-- Select --</option>' +
          d.data.map(a => `<option value="${a.id}">${a.title}</option>`).join('');
      }
    }
  } catch {}
};

window.loadAnimeEpisodes = async function(animeId) {
  if (!animeId) return;
  const card = document.getElementById('epListCard');
  const tbody = document.getElementById('epListBody');
  const info = document.getElementById('epAnimeInfo');
  if (!tbody) return;
  card.style.display = 'block';
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text3);"><i class="fas fa-spinner fa-spin"></i></td></tr>';
  try {
    const res = await fetch('/api/episodes/anime/' + animeId, { headers: headers() });
    const d = await res.json();
    const title = document.getElementById('epListTitle');
    if (title) title.textContent = 'Episodes (' + (d.data ? d.data.length : 0) + ')';
    if (d.data && d.data.length > 0) {
      tbody.innerHTML = d.data.map(ep => `
        <tr>
          <td style="color:var(--purple2); font-weight:700;">${ep.episode_number}</td>
          <td>${ep.title || '—'}</td>
          <td style="font-size:11px; color:var(--text3);">${ep.embed_url ? '<i class="fas fa-check" style="color:var(--green);"></i> Yes' : '<i class="fas fa-times" style="color:var(--text4);"></i> No'}</td>
          <td style="font-size:11px; color:var(--text3);">${ep.video_url ? '<i class="fas fa-check" style="color:var(--green);"></i> Yes' : '<i class="fas fa-times" style="color:var(--text4);"></i> No'}</td>
          <td style="color:var(--text3);">${ep.air_date || '—'}</td>
          <td>
            <div class="tbl-act">
              <button class="tbl-btn tbl-edit" onclick="editEpisode(${ep.id},${ep.episode_number},'${escHtml(ep.title||'')}','${escHtml(ep.embed_url||'')}','${escHtml(ep.video_url||'')}','${escHtml(ep.air_date||'')}',${ep.is_members_only||0})">Edit</button>
              <button class="tbl-btn tbl-del" onclick="deleteEpisode(${ep.id},${ep.episode_number})">Del</button>
            </div>
          </td>
        </tr>`).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text3);">No episodes yet.</td></tr>';
    }
    // Update anime info
    const animeInfo = document.getElementById('epAnimeInfo');
    if (animeInfo) animeInfo.style.display = 'flex';
    const titleEl = document.getElementById('epAnimeTitle');
    const countEl = document.getElementById('epAnimeCount');
    const thumbEl = document.getElementById('epAnimeThumb');
    const sel = document.getElementById('epAnimeSelect');
    if (titleEl && sel) titleEl.textContent = sel.options[sel.selectedIndex]?.text || '';
    if (countEl) countEl.textContent = (d.data ? d.data.length : 0) + ' episodes';
  } catch { tbody.innerHTML = '<tr><td colspan="6" style="color:var(--red);padding:20px;text-align:center;">Error loading episodes</td></tr>'; }
};

window.editEpisode = function(id, num, title, embed, video, airDate, membersOnly) {
  document.getElementById('epNum').value = num;
  setVal('epTitle', title);
  setVal('epEmbed', embed);
  setVal('epVideo', video);
  const dateEl = document.getElementById('epDate');
  if (dateEl) dateEl.value = airDate || '';
  setCheck('epMembers', membersOnly == 1 || membersOnly === true);
  document.getElementById('addEpBtn').dataset.editId = id;
  document.getElementById('addEpBtn').innerHTML = '<i class="fas fa-save"></i> Update Episode';
  showToast('Editing episode ' + num + ' — scroll up to form', 'info');
  // Scroll to the episode form
  const form = document.getElementById('addEpCard');
  if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.resetEpForm = function() {
  document.getElementById('epNum').value = '';
  ['epTitle','epEmbed','epVideo'].forEach(id => setVal(id, ''));
  const btn = document.getElementById('addEpBtn');
  btn.dataset.editId = '';
  btn.innerHTML = '<i class="fas fa-plus"></i> Add Episode';
};

window.addEpisode = async function() {
  const animeId = document.getElementById('epAnimeSelect').value;
  if (!animeId) { showToast('Select an anime first', 'error'); return; }
  const num = document.getElementById('epNum').value;
  if (!num) { showToast('Episode number is required', 'error'); return; }
  const btn = document.getElementById('addEpBtn');
  const editId = btn.dataset.editId;
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  try {
    const body = {
      anime_id: animeId,
      episode_number: parseInt(num),
      title: getVal('epTitle'),
      embed_url: getVal('epEmbed'),
      video_url: getVal('epVideo'),
      thumbnail: '',
      air_date: document.getElementById('epDate')?.value || null,
      is_members_only: getCheck('epMembers') ? 1 : 0
    };
    let url = '/api/admin/episodes';
    let method = 'POST';
    if (editId) { url = '/api/admin/episodes/' + editId; method = 'PUT'; }
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
    const d = await res.json();
    if (d.success) {
      showToast('Episode ' + num + (editId ? ' updated' : ' added') + '!', 'success');
      resetEpForm();
      loadAnimeEpisodes(animeId);
    } else {
      showToast(d.error || 'Failed', 'error');
    }
  } catch { showToast('Error saving episode', 'error'); }
  btn.disabled = false;
  btn.innerHTML = btn.dataset.editId ? '<i class="fas fa-save"></i> Update Episode' : '<i class="fas fa-plus"></i> Add Episode';
};

window.deleteEpisode = async function(id, num) {
  if (!confirm('Delete episode ' + num + '?')) return;
  try {
    const res = await fetch('/api/admin/episodes/' + id, { method: 'DELETE', headers: headers() });
    const d = await res.json();
    if (d.success) {
      showToast('Episode ' + num + ' deleted', 'success');
      const animeId = document.getElementById('epAnimeSelect').value;
      loadAnimeEpisodes(animeId);
    } else showToast(d.error || 'Delete failed', 'error');
  } catch { showToast('Error', 'error'); }
};

// ====== USERS ======
async function loadUsers() {
  const tbody = document.getElementById('usersBody');
  if (!tbody) return;
  try {
    const res = await fetch('/api/admin/users', { headers: headers() });
    const d = await res.json();
    if (d.data && d.data.length > 0) {
      tbody.innerHTML = d.data.map(u => `
        <tr>
          <td style="font-weight:600;">${escHtml(u.username)}</td>
          <td style="color:var(--text3);">${escHtml(u.email)}</td>
          <td><span class="badge ${u.role === 'admin' ? 'badge-purple' : u.role === 'banned' ? 'badge-red' : 'badge-gray'}" style="font-size:9px;">${u.role || 'user'}</span></td>
          <td style="color:var(--text3);">${u.plan || 'free'}</td>
          <td style="color:var(--text3); font-size:12px;">${u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
          <td>
            <div class="tbl-act">
              ${u.role !== 'admin' && u.role !== 'banned' ? `<button class="tbl-btn tbl-del" onclick="banUser('${u.id}','${escHtml(u.username)}')">Ban</button>` : ''}
              ${u.role === 'banned' ? `<button class="tbl-btn tbl-unban" onclick="unbanUser('${u.id}','${escHtml(u.username)}')">Unban</button>` : ''}
            </div>
          </td>
        </tr>`).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text3);">No users yet.</td></tr>';
    }
  } catch { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--red);">Error loading users.</td></tr>'; }
}

window.filterUsers = function(v) {
  const rows = document.querySelectorAll('#usersBody tr');
  rows.forEach(r => {
    const text = r.textContent.toLowerCase();
    r.style.display = v ? (text.includes(v.toLowerCase()) ? '' : 'none') : '';
  });
};

window.banUser = async function(id, name) {
  if (!confirm('Ban user "' + name + '"? They will not be able to log in.')) return;
  try {
    const res = await fetch('/api/admin/users/' + id + '/ban', { method: 'POST', headers: headers() });
    const d = await res.json();
    showToast(d.success ? 'User banned: ' + name : (d.error || 'Error'), d.success ? 'success' : 'error');
    loadUsers();
  } catch { showToast('Error', 'error'); }
};

window.unbanUser = async function(id, name) {
  if (!confirm('Unban user "' + name + '"?')) return;
  try {
    const res = await fetch('/api/admin/users/' + id + '/unban', { method: 'POST', headers: headers() });
    const d = await res.json();
    showToast(d.success ? 'User unbanned: ' + name : (d.error || 'Error'), d.success ? 'success' : 'error');
    loadUsers();
  } catch { showToast('Error', 'error'); }
};

// ====== SCHEDULE ======
let allSchedData = [];
let schedDayFilter = 'all';

async function loadSchedulePage() {
  // Populate anime dropdown for schedule form
  try {
    const res = await fetch('/api/anime?limit=200&page=1', { headers: headers() });
    const d = await res.json();
    const sel = document.getElementById('schedAnime');
    if (sel && d.data) {
      const currentVal = sel.value;
      sel.innerHTML = '<option value="">-- Select Anime --</option>' +
        d.data.map(a => `<option value="${a.id}">${escHtml(a.title)}</option>`).join('');
      if (currentVal) sel.value = currentVal;
    }
  } catch(e) { console.warn('Failed to load anime for schedule', e); }

  loadScheduleTable();
  loadScheduleQuickAdd();
}

async function loadScheduleTable() {
  const tbody = document.getElementById('schedBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text3);"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
  try {
    const res = await fetch('/api/admin/schedule', { headers: headers() });
    const d = await res.json();
    allSchedData = d.data || [];
    renderScheduleTable();
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="7" style="color:var(--red);padding:20px;text-align:center;">Error: ' + escHtml(e.message) + '</td></tr>';
  }
}

function renderScheduleTable() {
  const tbody = document.getElementById('schedBody');
  if (!tbody) return;
  const filtered = schedDayFilter === 'all'
    ? allSchedData
    : allSchedData.filter(s => s.day_of_week === schedDayFilter);

  if (filtered.length === 0) {
    const msg = schedDayFilter === 'all'
      ? 'No schedule entries yet. Add anime above.'
      : 'No entries for ' + schedDayFilter + '.';
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text3);">' +
      '<i class="fas fa-calendar-times" style="font-size:24px;display:block;margin-bottom:10px;color:var(--text4);"></i>' +
      msg + '</td></tr>';
    return;
  }

  // Sort by air_date first (if set), then by day order, then air_time
  const dayOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  filtered.sort((a, b) => {
    // If both have air_date, sort by date
    if (a.air_date && b.air_date) return a.air_date.localeCompare(b.air_date);
    if (a.air_date) return -1;
    if (b.air_date) return 1;
    // Otherwise sort by day order
    const da = dayOrder.indexOf(a.day_of_week);
    const db = dayOrder.indexOf(b.day_of_week);
    if (da !== db) return da - db;
    if (!a.air_time) return 1;
    if (!b.air_time) return -1;
    return a.air_time.localeCompare(b.air_time);
  });

  // Format date helper
  function fmtDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch(e) { return iso; }
  }

  // Check if a date is past
  function isPast(iso) {
    if (!iso) return false;
    const d = new Date(iso + 'T23:59:59');
    return d < new Date();
  }

  tbody.innerHTML = filtered.map(s => `
    <tr${isPast(s.air_date) ? ' style="opacity:0.55;"' : ''}>
      <td>
        <div class="anime-cell-wrap">
          <img src="${s.cover_image || ''}" class="cell-poster" onerror="this.style.display='none'" alt="">
          <div>
            <div class="cell-name">${escHtml(s.title || '')}</div>
            <div class="cell-native" style="font-size:10px;color:var(--purple3);">${s.title_native ? escHtml(s.title_native) : 'ID: ' + s.anime_id}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="badge badge-purple" style="font-size:9px;">${s.day_of_week}</span>
      </td>
      <td style="font-size:12px;">
        ${s.air_date
          ? `<span style="color:${isPast(s.air_date) ? 'var(--text4)' : 'var(--accent2)'};font-weight:700;">${fmtDate(s.air_date)}</span>${isPast(s.air_date) ? ' <span style="font-size:9px;color:var(--text4);">(past)</span>' : ''}`
          : '<span style="color:var(--text4);">—</span>'}
      </td>
      <td style="color:var(--text2);font-weight:600;font-size:13px;">
        ${s.air_time ? '<i class="fas fa-clock" style="color:var(--purple3);margin-right:5px;font-size:10px;"></i>' + s.air_time : '<span style="color:var(--text4);">—</span>'}
      </td>
      <td style="font-size:12px;">
        ${s.next_episode
          ? `<span style="background:linear-gradient(135deg,var(--purple),#4f46e5);color:#fff;padding:2px 8px;border-radius:4px;font-weight:800;font-size:10px;">EP ${s.next_episode}</span>${s.next_ep_title ? '<div style="color:var(--text3);font-size:10px;margin-top:3px;">' + escHtml(s.next_ep_title) + '</div>' : ''}`
          : '<span style="color:var(--text4);">—</span>'}
      </td>
      <td style="color:var(--text3);font-size:12px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${s.notes ? escHtml(s.notes) : '<span style="color:var(--text4);">—</span>'}
      </td>
      <td>
        <div class="tbl-act">
          <button class="tbl-btn tbl-edit" onclick="editScheduleEntry(${s.id})"><i class="fas fa-edit"></i> Edit</button>
          <button class="tbl-btn tbl-del" onclick="removeSchedule(${s.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

window.filterSchedByDay = function(day, btn) {
  schedDayFilter = day;
  document.querySelectorAll('#schedDayFilterTabs .admin-btn').forEach(b => {
    b.className = b.className.replace('admin-btn-purple', 'admin-btn-outline');
  });
  if (btn) {
    btn.className = btn.className.replace('admin-btn-outline', 'admin-btn-purple');
  }
  renderScheduleTable();
};

// Sync day-of-week dropdown when air_date changes
window.syncDayToDate = function() {
  const dateVal = getVal('schedAirDate');
  if (!dateVal) return;
  const d = new Date(dateVal + 'T00:00:00');
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const dayName = dayNames[d.getDay()];
  setVal('schedDay', dayName);
};

// Sync air_date to current week's date when day changes (optional helper)
window.syncDateToDay = function() {
  // Only auto-fill if air_date is empty
  const existing = getVal('schedAirDate');
  if (existing) return;
  const day = getVal('schedDay');
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = new Date();
  const todayIdx = today.getDay();
  const targetIdx = dayNames.indexOf(day);
  if (targetIdx < 0) return;
  let diff = targetIdx - todayIdx;
  if (diff < 0) diff += 7;
  const target = new Date(today);
  target.setDate(today.getDate() + diff);
  const iso = target.toISOString().split('T')[0];
  setVal('schedAirDate', iso);
};

window.editScheduleEntry = function(id) {
  const entry = allSchedData.find(s => s.id === id);
  if (!entry) return;
  setVal('schedAnime', entry.anime_id);
  setVal('schedDay', entry.day_of_week);
  setVal('schedTime', entry.air_time || '');
  setVal('schedAirDate', entry.air_date || '');
  setVal('schedNextEp', entry.next_episode || '');
  setVal('schedNextEpTitle', entry.next_ep_title || '');
  setVal('schedNotes', entry.notes || '');
  setVal('schedEditId', id);
  const titleEl = document.getElementById('schedFormTitle');
  if (titleEl) titleEl.innerHTML = '<i class="fas fa-edit" style="color:var(--gold);margin-right:7px;"></i>Edit Schedule Entry';
  const saveBtn = document.getElementById('schedSaveBtn');
  if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save"></i> Update Schedule';
  // Scroll to form
  const form = document.getElementById('admin-schedule');
  if (form) form.querySelector('[style*="border-radius"]').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.resetSchedForm = function() {
  setVal('schedAnime', '');
  setVal('schedDay', 'Monday');
  setVal('schedTime', '');
  setVal('schedAirDate', '');
  setVal('schedNextEp', '');
  setVal('schedNextEpTitle', '');
  setVal('schedNotes', '');
  setVal('schedEditId', '');
  const titleEl = document.getElementById('schedFormTitle');
  if (titleEl) titleEl.innerHTML = '<i class="fas fa-plus-circle" style="color:var(--purple2);margin-right:7px;"></i>Add Anime to Schedule';
  const saveBtn = document.getElementById('schedSaveBtn');
  if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Schedule';
};

window.saveSchedule = async function() {
  const animeId = getVal('schedAnime');
  const day = getVal('schedDay');
  const editId = getVal('schedEditId');
  if (!animeId || !day) { showToast('Please select an anime and day', 'error'); return; }

  const payload = {
    anime_id: animeId,
    day_of_week: day,
    air_time: getVal('schedTime') || null,
    air_date: getVal('schedAirDate') || null,
    next_episode: getVal('schedNextEp') ? parseInt(getVal('schedNextEp')) : null,
    next_ep_title: getVal('schedNextEpTitle') || null,
    notes: getVal('schedNotes') || null
  };

  const saveBtn = document.getElementById('schedSaveBtn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

  try {
    let res, d;
    if (editId) {
      // Update existing
      res = await fetch('/api/admin/schedule/' + editId, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify(payload)
      });
      d = await res.json();
      if (d.success) {
        showToast('Schedule updated!', 'success');
        resetSchedForm();
        loadScheduleTable();
      } else {
        showToast(d.error || 'Failed to update', 'error');
      }
    } else {
      // Add new
      res = await fetch('/api/admin/schedule', {
        method: 'POST', headers: headers(),
        body: JSON.stringify(payload)
      });
      d = await res.json();
      if (d.success) {
        showToast('Added to schedule!', 'success');
        resetSchedForm();
        loadScheduleTable();
        loadScheduleQuickAdd();
      } else {
        showToast(d.error || 'Failed to add', 'error');
      }
    }
  } catch(e) {
    showToast('Error: ' + e.message, 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      const editId2 = getVal('schedEditId');
      saveBtn.innerHTML = editId2
        ? '<i class="fas fa-save"></i> Update Schedule'
        : '<i class="fas fa-plus"></i> Add to Schedule';
    }
  }
};

// Keep old addSchedule as alias
window.addSchedule = window.saveSchedule;

window.removeSchedule = async function(id) {
  if (!confirm('Remove this anime from the schedule?')) return;
  try {
    const res = await fetch('/api/admin/schedule/' + id, { method: 'DELETE', headers: headers() });
    const d = await res.json();
    if (d.success) {
      showToast('Removed from schedule', 'success');
      loadScheduleTable();
      loadScheduleQuickAdd();
    } else {
      showToast(d.error || 'Error', 'error');
    }
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
};

// Quick add — shows ongoing anime NOT in schedule
async function loadScheduleQuickAdd() {
  const container = document.getElementById('schedQuickAddList');
  if (!container) return;
  try {
    // Get all anime and current schedule
    const [animeRes, schedRes] = await Promise.all([
      fetch('/api/anime?limit=200&status=Ongoing', { headers: headers() }),
      fetch('/api/admin/schedule', { headers: headers() })
    ]);
    const [animeData, schedData] = await Promise.all([animeRes.json(), schedRes.json()]);
    const scheduledIds = new Set((schedData.data || []).map(s => s.anime_id));
    const unscheduled = (animeData.data || []).filter(a => !scheduledIds.has(a.id));
    if (unscheduled.length === 0) {
      container.innerHTML = '<span style="color:var(--green);font-size:12px;"><i class="fas fa-check-circle"></i> All ongoing anime are scheduled!</span>';
      return;
    }
    container.innerHTML = unscheduled.slice(0, 20).map(a => `
      <button class="admin-btn admin-btn-outline" style="padding:5px 12px;font-size:11px;gap:6px;"
              onclick="quickAddToSchedule('${a.id}','${escHtml(a.title)}')">
        <img src="${a.cover_image || ''}" style="width:18px;height:24px;object-fit:cover;border-radius:3px;flex-shrink:0;" onerror="this.style.display='none'" alt="">
        ${escHtml(a.title)}
      </button>`).join('');
  } catch(e) {
    container.innerHTML = '<span style="color:var(--text3);font-size:12px;">Unable to load</span>';
  }
}

window.quickAddToSchedule = function(animeId, animeTitle) {
  // Pre-fill form with this anime
  setVal('schedAnime', animeId);
  resetSchedForm();
  setVal('schedAnime', animeId);
  // Scroll to form and focus day selector
  const form = document.getElementById('admin-schedule');
  if (form) {
    const firstCard = form.querySelector('.admin-form-grid');
    if (firstCard) firstCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  showToast(animeTitle + ' selected — set the day & time', 'info');
};

// ====== SETTINGS ======
async function loadSettings() {
  // Check IMGBB status
  try {
    const res = await fetch('/api/admin/imgbb-status', { headers: headers() });
    const d = await res.json();
    const statusEl = document.getElementById('imgbbStatus');
    if (statusEl) {
      if (d.configured) {
        statusEl.innerHTML = '<span style="color:var(--green);"><i class="fas fa-check-circle"></i> IMGBB configured and ready for image uploads.</span>';
      } else {
        statusEl.innerHTML = '<span style="color:var(--red);"><i class="fas fa-times-circle"></i> IMGBB NOT configured — add <code style="background:var(--bg4);padding:2px 6px;border-radius:4px;">IMGBB_API_KEY</code> as a Cloudflare secret. Get key at <a href="https://api.imgbb.com/" target="_blank" style="color:var(--purple2);">api.imgbb.com</a></span>';
      }
    }
  } catch(e) {
    const statusEl = document.getElementById('imgbbStatus');
    if (statusEl) statusEl.innerHTML = '<span style="color:var(--text3);">Unable to check IMGBB status.</span>';
  }

  // Load DB settings
  try {
    const res = await fetch('/api/admin/settings', { headers: headers() });
    const d = await res.json();
    if (d.data) {
      const s = d.data;
      // General
      setCheck('setRegistration', s.registration_enabled !== '0');
      setCheck('setMaintenance', s.maintenance_mode === '1');
      // Emails
      setVal('setContactEmail', s.contact_email || '');
      setVal('setDmcaEmail', s.dmca_email || '');
      setVal('setPrivacyEmail', s.privacy_email || '');
      setVal('setAboutEmail', s.about_email || '');
      // Social links
      setVal('setSocialDiscord', s.social_discord || '');
      setVal('setSocialTwitter', s.social_twitter || '');
      setVal('setSocialReddit', s.social_reddit || '');
      setVal('setSocialTelegram', s.social_telegram || '');
      setVal('setSocialFacebook', s.social_facebook || '');
      setVal('setSocialYoutube', s.social_youtube || '');
      setVal('setSocialInstagram', s.social_instagram || '');
      setVal('setSocialTiktok', s.social_tiktok || '');
    }
  } catch(e) { console.warn('Settings load error:', e); }

  // Load broadcasts
  loadBroadcasts();
}

// Save general settings (registration, maintenance)
window.saveGeneralSettings = async function() {
  const body = {
    registration_enabled: getCheck('setRegistration') ? '1' : '0',
    maintenance_mode: getCheck('setMaintenance') ? '1' : '0',
  };
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: headers(),
      body: JSON.stringify(body)
    });
    const d = await res.json();
    showToast(d.success ? 'General settings saved!' : (d.error || 'Error'), d.success ? 'success' : 'error');
  } catch { showToast('Error saving settings', 'error'); }
};

// Save email settings
window.saveEmailSettings = async function() {
  const body = {
    contact_email: getVal('setContactEmail'),
    dmca_email: getVal('setDmcaEmail'),
    privacy_email: getVal('setPrivacyEmail'),
    about_email: getVal('setAboutEmail'),
  };
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: headers(),
      body: JSON.stringify(body)
    });
    const d = await res.json();
    showToast(d.success ? 'Email settings saved!' : (d.error || 'Error'), d.success ? 'success' : 'error');
  } catch { showToast('Error saving email settings', 'error'); }
};

// Save social media settings
window.saveSocialSettings = async function() {
  const body = {
    social_discord: getVal('setSocialDiscord'),
    social_twitter: getVal('setSocialTwitter'),
    social_reddit: getVal('setSocialReddit'),
    social_telegram: getVal('setSocialTelegram'),
    social_facebook: getVal('setSocialFacebook'),
    social_youtube: getVal('setSocialYoutube'),
    social_instagram: getVal('setSocialInstagram'),
    social_tiktok: getVal('setSocialTiktok'),
  };
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: headers(),
      body: JSON.stringify(body)
    });
    const d = await res.json();
    showToast(d.success ? 'Social links saved! Changes appear in site footer.' : (d.error || 'Error'), d.success ? 'success' : 'error');
  } catch { showToast('Error saving social links', 'error'); }
};

// ====== BROADCASTS ======
async function loadBroadcasts() {
  const container = document.getElementById('broadcastList');
  if (!container) return;
  container.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  try {
    const res = await fetch('/api/admin/broadcasts', { headers: headers() });
    const d = await res.json();
    if (d.data && d.data.length > 0) {
      const typeColors = {
        info: { bg: 'rgba(52,152,219,0.1)', color: 'var(--blue)', border: 'rgba(52,152,219,0.3)', icon: 'fa-info-circle' },
        success: { bg: 'rgba(0,208,132,0.1)', color: 'var(--green)', border: 'rgba(0,208,132,0.3)', icon: 'fa-check-circle' },
        warning: { bg: 'rgba(241,196,15,0.1)', color: 'var(--gold)', border: 'rgba(241,196,15,0.3)', icon: 'fa-exclamation-triangle' },
        error: { bg: 'rgba(232,64,64,0.1)', color: 'var(--red)', border: 'rgba(232,64,64,0.3)', icon: 'fa-times-circle' },
      };
      container.innerHTML = d.data.map(b => {
        const tc = typeColors[b.type] || typeColors.info;
        return `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:${tc.bg};border:1px solid ${tc.border};border-radius:var(--r8);margin-bottom:8px;">
          <i class="fas ${tc.icon}" style="color:${tc.color};margin-top:2px;flex-shrink:0;"></i>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;color:var(--text1);word-break:break-word;">${escHtml(b.message)}</div>
            <div style="font-size:11px;color:var(--text3);margin-top:4px;">${b.type.toUpperCase()} &bull; ${b.is_active ? '<span style="color:var(--green);">Active</span>' : '<span style="color:var(--text4);">Inactive</span>'} &bull; ${b.created_at ? new Date(b.created_at).toLocaleString() : ''}</div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            <button class="tbl-btn tbl-edit" onclick="toggleBroadcast(${b.id}, ${b.is_active ? 0 : 1})" title="${b.is_active ? 'Deactivate' : 'Activate'}">${b.is_active ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>'}</button>
            <button class="tbl-btn tbl-del" onclick="deleteBroadcast(${b.id})" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      }).join('');
    } else {
      container.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:20px;border:1px dashed var(--border);border-radius:var(--r8);">No broadcasts yet. Create one above to notify all visitors.</div>';
    }
  } catch(e) {
    container.innerHTML = '<div style="color:var(--red);font-size:13px;padding:12px;">Error loading broadcasts: ' + e.message + '</div>';
  }
}

window.sendBroadcast = async function() {
  const msg = getVal('broadcastMsg');
  const type = getVal('broadcastType') || 'info';
  if (!msg || !msg.trim()) { showToast('Please enter a broadcast message', 'error'); return; }
  try {
    const res = await fetch('/api/admin/broadcasts', {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ message: msg.trim(), type })
    });
    const d = await res.json();
    if (d.success) {
      showToast('Broadcast sent! Visitors will see it immediately.', 'success');
      setVal('broadcastMsg', '');
      loadBroadcasts();
    } else {
      showToast(d.error || 'Failed to send broadcast', 'error');
    }
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
};

window.toggleBroadcast = async function(id, newState) {
  try {
    const res = await fetch('/api/admin/broadcasts/' + id, {
      method: 'PATCH', headers: headers(),
      body: JSON.stringify({ is_active: newState })
    });
    const d = await res.json();
    if (d.success) {
      showToast(newState ? 'Broadcast activated' : 'Broadcast deactivated', 'success');
      loadBroadcasts();
    } else { showToast(d.error || 'Error', 'error'); }
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
};

window.deleteBroadcast = async function(id) {
  if (!confirm('Delete this broadcast?')) return;
  try {
    const res = await fetch('/api/admin/broadcasts/' + id, { method: 'DELETE', headers: headers() });
    const d = await res.json();
    if (d.success) { showToast('Broadcast deleted', 'success'); loadBroadcasts(); }
    else showToast(d.error || 'Error', 'error');
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
};

window.changePassword = async function() {
  const cur = getVal('pwdCurrent');
  const np = getVal('pwdNew');
  const cp = getVal('pwdConfirm');
  if (!cur) { showToast('Enter current password', 'error'); return; }
  if (!np) { showToast('Enter new password', 'error'); return; }
  if (np !== cp) { showToast('Passwords do not match', 'error'); return; }
  if (np.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
  try {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ current_password: cur, new_password: np })
    });
    const d = await res.json();
    showToast(d.success ? 'Password updated!' : (d.error || 'Failed'), d.success ? 'success' : 'error');
    if (d.success) { setVal('pwdCurrent', ''); setVal('pwdNew', ''); setVal('pwdConfirm', ''); }
  } catch { showToast('Error changing password', 'error'); }
};

// ====== COMMENTS MANAGEMENT ======
let commentsAdminPage = 1;
let commentsAdminStatus = 'all';

window.loadComments = async function(page, status) {
  if (page !== undefined) commentsAdminPage = parseInt(page) || 1;
  if (status !== undefined) commentsAdminStatus = status;
  // Also check filter dropdown
  const filterEl = document.getElementById('commentFilter');
  if (filterEl && status === undefined) commentsAdminStatus = filterEl.value || 'all';
  
  const tbody = document.getElementById('commentsBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text3);"><i class="fas fa-spinner fa-spin"></i></td></tr>';
  try {
    const params = new URLSearchParams({ page: String(commentsAdminPage), limit: '30', status: commentsAdminStatus });
    const res = await fetch('/api/admin/comments?' + params, { headers: headers() });
    const d = await res.json();
    if (d.data && d.data.length > 0) {
      tbody.innerHTML = d.data.map(c => `
        <tr>
          <td style="font-size:12px;color:var(--text2);font-weight:600;">${escHtml(c.username || '')}</td>
          <td style="max-width:280px;">
            <div style="font-size:12px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(c.content || '')}</div>
            ${c.is_spoiler ? '<div style="font-size:10px;color:var(--gold);">⚠ Spoiler</div>' : ''}
          </td>
          <td style="font-size:11px;color:var(--text3);">${escHtml(c.anime_title || 'N/A')}${c.episode_number ? ' EP'+c.episode_number : ''}</td>
          <td>
            <span class="badge ${c.is_approved === 1 ? 'badge-green' : c.is_approved === 0 ? 'badge-gray' : 'badge-gray'}" style="font-size:9px;">
              ${c.is_approved === 1 ? 'Approved' : c.is_approved === 0 ? 'Pending' : 'Rejected'}
            </span>
          </td>
          <td style="font-size:11px;color:var(--text3);">${c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</td>
          <td>
            <div class="tbl-act">
              ${c.is_approved !== 1 ? `<button class="tbl-btn tbl-edit" onclick="moderateComment('${c.id}','approve')">Approve</button>` : ''}
              ${c.is_approved !== -1 ? `<button class="tbl-btn tbl-ep" onclick="moderateComment('${c.id}','reject')" style="background:rgba(241,196,15,0.1);color:var(--gold);border-color:rgba(241,196,15,0.3);">Reject</button>` : ''}
              <button class="tbl-btn tbl-del" onclick="moderateComment('${c.id}','delete')">Del</button>
            </div>
          </td>
        </tr>`).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text3);">No comments found.</td></tr>';
    }
    // Pagination
    const pager = document.getElementById('commentsPager');
    if (pager && d.total > 30) {
      const totalPages = Math.ceil(d.total / 30);
      pager.innerHTML = Array.from({ length: totalPages }, (_, i) =>
        `<button onclick="loadComments(${i+1})" class="page-btn${i+1 === commentsAdminPage ? ' active' : ''}">${i+1}</button>`
      ).join('');
    } else if (pager) pager.innerHTML = '';
  } catch(e) { tbody.innerHTML = '<tr><td colspan="6" style="color:var(--red);padding:20px;">Error: ' + e.message + '</td></tr>'; }
};

window.moderateComment = async function(id, action) {
  if (action === 'delete' && !confirm('Delete this comment?')) return;
  try {
    const res = await fetch('/api/admin/comments/' + id, {
      method: 'PATCH', headers: headers(),
      body: JSON.stringify({ action })
    });
    const d = await res.json();
    showToast(d.success ? 'Done!' : (d.error || 'Error'), d.success ? 'success' : 'error');
    if (d.success) loadComments();
  } catch { showToast('Error', 'error'); }
};

// ====== TOAST ======
window.showToast = function(msg, type) {
  type = type || 'info';
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  toast.innerHTML = '<i class="fas ' + (icons[type] || 'fa-info-circle') + '"></i>' + msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
};

// ====== HELPERS ======
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function getVal(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v || ''; }
function getCheck(id) { const el = document.getElementById(id); return el ? el.checked : false; }
function setCheck(id, v) { const el = document.getElementById(id); if (el) el.checked = !!v; }
function escHtml(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,"&#39;").replace(/"/g,'&quot;'); }
function formatNum(n) { return n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n); }
function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim(); }

// Auto-slug from title
document.addEventListener('DOMContentLoaded', () => {
  const titleInp = document.getElementById('fTitle');
  const slugInp = document.getElementById('fSlug');
  if (titleInp && slugInp) {
    titleInp.addEventListener('input', () => {
      const editId = document.getElementById('editAnimeId');
      if (!editId || !editId.value) {
        slugInp.value = slugify(titleInp.value);
      }
    });
  }

  // Set date in dashboard
  const dateEl = document.getElementById('dashDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
});
