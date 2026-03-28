// DonghuaLand Main App.js
'use strict';

// ============ TOAST ============
window.showToast = function(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: 'fas fa-check-circle', error: 'fas fa-times-circle', info: 'fas fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// ============ AUTH ============
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const signInBtn = document.getElementById('headerSignIn');
  const joinBtn = document.getElementById('headerJoin');
  const userWrap = document.getElementById('userMenuWrap');
  const ava = document.getElementById('userAva');
  const nameLabel = document.getElementById('userNameLabel');
  const mobSignIn = document.getElementById('mobSignIn');
  const mobJoin = document.getElementById('mobJoin');
  const bnavProfile = document.getElementById('bnav-profile');
  const mobAuthBtn = document.getElementById('mobAuthBtn');

  if (token && user) {
    if (signInBtn) signInBtn.classList.add('hidden');
    if (joinBtn) joinBtn.classList.add('hidden');
    if (mobAuthBtn) mobAuthBtn.classList.add('hidden');
    if (userWrap) userWrap.classList.remove('hidden');
    if (ava) ava.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6c5ce7&color=fff&size=40&bold=true`;
    if (nameLabel) nameLabel.textContent = user.username;
    if (mobSignIn) { mobSignIn.textContent = user.username; mobSignIn.href = '/user/profile'; }
    if (mobJoin) mobJoin.style.display = 'none';
    if (bnavProfile) {
      bnavProfile.href = '/user/profile';
      const span = bnavProfile.querySelector('span');
      const icon = bnavProfile.querySelector('i');
      if (span) span.textContent = 'Profile';
      if (icon) icon.className = 'fas fa-user-circle';
    }
  } else {
    if (mobAuthBtn) mobAuthBtn.classList.remove('hidden');
  }
}

window.doLogout = function() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => { window.location.href = '/'; }, 800);
};

// ============ USER MENU ============
function initUserMenu() {
  const btn = document.getElementById('userMenuBtn');
  const wrap = document.getElementById('userMenuWrap');
  if (btn && wrap) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      wrap.classList.toggle('open');
    });
    document.addEventListener('click', () => wrap?.classList.remove('open'));
  }
}

// ============ HEADER SCROLL ============
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ============ MOBILE MENU ============
function initMobileMenu() {
  const btn = document.getElementById('mobMenuBtn');
  const drawer = document.getElementById('mobDrawer');
  const icon = document.getElementById('mobMenuIcon');
  if (btn && drawer) {
    btn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      if (icon) icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        if (icon) icon.className = 'fas fa-bars';
        document.body.style.overflow = '';
      });
    });
  }
}

// ============ UNIFIED SEARCH OVERLAY ============
// Used by: header search btn (desktop+mobile), bottom nav search btn
let searchOverlayTimer;

window.toggleSearchOverlay = function() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  if (overlay.classList.contains('open')) {
    closeSearchOverlay();
  } else {
    openSearchOverlay();
  }
};

window.openSearchOverlay = function() {
  const overlay = document.getElementById('searchOverlay');
  const desktopBtn = document.getElementById('desktopSearchBtn');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (desktopBtn) desktopBtn.classList.add('active');
  setTimeout(() => {
    const inp = document.getElementById('overlaySearchInput');
    if (inp) inp.focus();
  }, 80);
};

window.closeSearchOverlay = function() {
  const overlay = document.getElementById('searchOverlay');
  const desktopBtn = document.getElementById('desktopSearchBtn');
  const drop = document.getElementById('searchOverlayDrop');
  if (overlay) overlay.classList.remove('open');
  if (desktopBtn) desktopBtn.classList.remove('active');
  if (drop) { drop.innerHTML = ''; drop.classList.remove('show'); }
  document.body.style.overflow = '';
};

window.handleSearchOverlayClick = function(e) {
  const box = document.querySelector('.search-overlay-box');
  if (box && !box.contains(e.target)) {
    closeSearchOverlay();
  }
};

function initSearchOverlay() {
  const input = document.getElementById('overlaySearchInput');
  const drop = document.getElementById('searchOverlayDrop');
  if (!input || !drop) return;

  input.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    clearTimeout(searchOverlayTimer);
    if (q.length < 2) {
      drop.classList.remove('show');
      drop.innerHTML = '';
      return;
    }
    searchOverlayTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/quick?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          drop.innerHTML = data.data.map(a => `
            <a href="/anime/${a.slug}" class="sovl-result" onclick="closeSearchOverlay()">
              <img src="${a.cover_image || 'https://placehold.co/44x62/0f0f17/6c5ce7?text=?'}"
                   alt="${a.title}"
                   onerror="this.src='https://placehold.co/44x62/0f0f17/6c5ce7?text=?'">
              <div class="sovl-info">
                <div class="sovl-name">${a.title}</div>
                <div class="sovl-meta">${a.type || 'ONA'} &middot; ${a.status || ''} &middot; ${a.release_year || ''}</div>
              </div>
              <i class="fas fa-chevron-right sovl-arrow"></i>
            </a>`).join('');
          drop.classList.add('show');
        } else {
          drop.innerHTML = `<div class="sovl-empty"><i class="fas fa-search"></i> No results for "${q}"</div>`;
          drop.classList.add('show');
        }
      } catch {
        drop.classList.remove('show');
      }
    }, 280);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSearchOverlay(); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = input.value.trim();
      closeSearchOverlay();
      window.location.href = q ? '/search?q=' + encodeURIComponent(q) : '/search';
    }
  });
}

// ============ DESKTOP SEARCH TOGGLE ============
window.toggleDesktopSearch = function() {
  toggleSearchOverlay();
};

// Keep old mobile search fns for backward compat
window.toggleMobileSearch = function() { toggleSearchOverlay(); };
window.closeMobileSearch = function() { closeSearchOverlay(); };

// ============ BOTTOM NAV ACTIVE STATE ============
function initBottomNav() {
  const path = window.location.pathname;
  const map = {
    'bnav-home': ['/', '/home'],
    'bnav-browse': ['/search'],
    'bnav-watchlist': ['/user/watchlist'],
    'bnav-profile': ['/user/profile', '/user/login', '/user/register', '/user/settings', '/user/history']
  };
  Object.entries(map).forEach(([id, paths]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (paths.some(p => p === path || (p !== '/' && path.startsWith(p)))) {
      el.classList.add('active');
    }
  });
  if (path.startsWith('/watch/') || path.startsWith('/anime/')) {
    document.getElementById('bnav-browse')?.classList.add('active');
  }
  if (path === '/') {
    document.getElementById('bnav-home')?.classList.add('active');
  }
}

// ============ SEARCH AUTOCOMPLETE (legacy header - now unified) ============
window.headerSearchSubmit = function(e, form) {
  const q = form.querySelector('input[name="q"]')?.value?.trim();
  if (!q) { e.preventDefault(); window.location.href = '/search'; return false; }
  return true;
};

// ============ ACTIVE NAV LINK ============
function initNavActive() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === path || (href !== '/' && path.startsWith(href)))) {
      a.classList.add('active');
    }
  });
  document.querySelectorAll('.mob-nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === path || (href !== '/' && path.startsWith(href)))) {
      a.classList.add('active');
    }
  });
}

// ============ SCHEDULE TABS ============
function initScheduleTabs() {
  const tabs = document.querySelectorAll('.sched-tab');
  const days = document.querySelectorAll('.sched-day');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      days.forEach(d => d.classList.remove('active'));
      tab.classList.add('active');
      const dayEl = document.getElementById('day-' + tab.dataset.day);
      if (dayEl) dayEl.classList.add('active');
    });
  });
}

// ============ HERO SLIDER ============
// The hero slider is fully controlled by the inline script in home.ts (window.heroSlide / window.heroGoTo).
// This stub is kept so nothing breaks if called from old references.
function initHeroSlider() { /* no-op: slider managed by inline script in home.ts */ }

// ============ WATCHLIST (localStorage) ============
window.getWatchlist = function() {
  try { return JSON.parse(localStorage.getItem('watchlist') || '[]'); } catch { return []; }
};
window.saveWatchlist = function(list) {
  localStorage.setItem('watchlist', JSON.stringify(list));
};
window.isInWatchlist = function(slug) {
  return getWatchlist().some(item => item.slug === slug);
};
window.toggleWatchlist = function(slug, title, cover, type) {
  const list = getWatchlist();
  const idx = list.findIndex(item => item.slug === slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    saveWatchlist(list);
    showToast('Removed from watchlist', 'info');
    const btn = document.getElementById('wlBtn');
    if (btn) { btn.innerHTML = '<i class="fas fa-bookmark"></i> Add to Watchlist'; btn.classList.remove('active'); }
    return false;
  } else {
    list.unshift({ slug, title, cover: cover || '', type: type || 'ONA', addedAt: new Date().toISOString() });
    saveWatchlist(list);
    showToast('Added to watchlist!', 'success');
    const btn = document.getElementById('wlBtn');
    if (btn) { btn.innerHTML = '<i class="fas fa-bookmark"></i> In Watchlist'; btn.classList.add('active'); }
    return true;
  }
};

// Init watchlist button state on anime/watch pages
function initWatchlistBtn() {
  const btn = document.getElementById('wlBtn');
  if (!btn) return;
  const slug = btn.dataset.slug;
  if (!slug) return;
  if (isInWatchlist(slug)) {
    btn.innerHTML = '<i class="fas fa-bookmark"></i> In Watchlist';
    btn.classList.add('active');
  }
}

// ============ BROADCAST BANNER ============
function initBroadcastBanner() {
  var banner = document.getElementById('broadcastBanner');
  if (!banner) return;
  fetch('/api/broadcasts/active')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (!d.data || d.data.length === 0) return;
      var typeStyles = {
        info:    { bg: '#0d1f33', border: 'rgba(52,152,219,0.6)', color: '#74b9ff', icon: 'fa-info-circle' },
        success: { bg: '#0d2a1a', border: 'rgba(0,208,132,0.6)',  color: '#00d084', icon: 'fa-check-circle' },
        warning: { bg: '#2a1f05', border: 'rgba(241,196,15,0.6)', color: '#fdcb6e', icon: 'fa-exclamation-triangle' },
        error:   { bg: '#2a0d0d', border: 'rgba(232,64,64,0.6)',  color: '#ff7675', icon: 'fa-times-circle' },
      };
      // Show the most recent active broadcast
      var bc = d.data[0];
      var ts = typeStyles[bc.type] || typeStyles.info;
      // Apply styles — banner is now inside site-main, flows naturally below header
      banner.style.display = 'block';
      banner.style.background = ts.bg;
      banner.style.borderBottom = '2px solid ' + ts.border;
      banner.style.padding = '11px 16px';
      banner.style.textAlign = 'center';
      banner.style.width = '100%';
      // Build inner HTML
      var msg = bc.message.replace(/</g,'&lt;').replace(/>/g,'&gt;');
      banner.innerHTML =
        '<div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;position:relative;">' +
          '<i class="fas ' + ts.icon + '" style="color:' + ts.color + ';flex-shrink:0;font-size:14px;"></i>' +
          '<span style="font-size:13px;color:' + ts.color + ';font-weight:500;line-height:1.4;">' + msg + '</span>' +
          '<button id="broadcastDismiss" style="position:absolute;right:0;top:50%;transform:translateY(-50%);background:none;border:none;color:' + ts.color + ';cursor:pointer;font-size:20px;line-height:1;padding:4px 8px;opacity:0.75;" title="Dismiss">&times;</button>' +
        '</div>';
      // Wire dismiss button
      var dismissBtn = document.getElementById('broadcastDismiss');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', function() {
          var b = document.getElementById('broadcastBanner');
          if (b) { b.style.opacity = '0'; b.style.transition = 'opacity 0.3s'; setTimeout(function(){ b.style.display = 'none'; }, 300); }
        });
      }
    })
    .catch(function() {});
}

// ============ FOOTER SOCIAL LINKS ============
function initFooterSocials() {
  const socialContainer = document.getElementById('footerSocial');
  if (!socialContainer) return;
  fetch('/api/site-settings')
    .then(r => r.json())
    .then(d => {
      if (!d.data) return;
      const s = d.data;
      const links = [
        { key: 'social_discord',   icon: 'fab fa-discord',   color: '#5865F2', label: 'Discord',   url: (v) => v.startsWith('http') ? v : 'https://discord.gg/' + v },
        { key: 'social_twitter',   icon: 'fab fa-twitter',   color: '#1DA1F2', label: 'Twitter',   url: (v) => v.startsWith('http') ? v : 'https://twitter.com/' + v.replace('@','') },
        { key: 'social_reddit',    icon: 'fab fa-reddit',    color: '#FF4500', label: 'Reddit',    url: (v) => v.startsWith('http') ? v : 'https://reddit.com/r/' + v.replace('r/','') },
        { key: 'social_telegram',  icon: 'fab fa-telegram',  color: '#229ED9', label: 'Telegram',  url: (v) => v.startsWith('http') ? v : 'https://t.me/' + v.replace('@','') },
        { key: 'social_facebook',  icon: 'fab fa-facebook',  color: '#1877F2', label: 'Facebook',  url: (v) => v.startsWith('http') ? v : 'https://facebook.com/' + v },
        { key: 'social_youtube',   icon: 'fab fa-youtube',   color: '#FF0000', label: 'YouTube',   url: (v) => v.startsWith('http') ? v : 'https://youtube.com/' + v },
        { key: 'social_instagram', icon: 'fab fa-instagram', color: '#E1306C', label: 'Instagram', url: (v) => v.startsWith('http') ? v : 'https://instagram.com/' + v },
        { key: 'social_tiktok',    icon: 'fab fa-tiktok',    color: '#ffffff',  label: 'TikTok',   url: (v) => v.startsWith('http') ? v : 'https://tiktok.com/@' + v.replace('@','') },
      ];
      const html = links
        .filter(l => s[l.key] && s[l.key].trim())
        .map(l => `<a href="${l.url(s[l.key].trim())}" target="_blank" rel="noopener" class="footer-social-link" title="${l.label}" style="color:${l.color}"><i class="${l.icon}"></i></a>`)
        .join('');
      socialContainer.innerHTML = html || '';
    })
    .catch(() => {});
}

// ============ SITE LOGO & HEADER BRANDING ============
// Loads settings from /api/site-settings and applies:
//   - Image logo (logo_type = 'image'): shows <img id="logoImg">, hides text
//   - Text logo (logo_type = 'text'): shows styled text, hides image
function initSiteHeaderBranding() {
  fetch('/api/site-settings')
    .then(r => r.json())
    .then(d => {
      if (!d.data) return;
      const s = d.data;
      const siteName = s.header_text || s.site_name || 'DonghuaLand';
      const logoType = s.logo_type || 'text';
      const logoUrl = s.logo_url || '';
      const logoHeight = parseInt(s.logo_height || '36', 10);
      const headerSize = s.header_size || 'medium';
      const headerStyle = s.header_style || 'bold';
      const headerColor = s.header_color || '#a29bfe';

      const logoImg = document.getElementById('logoImg');
      const logoBrand = document.getElementById('logoTextBrand');

      if (logoType === 'image' && logoUrl.trim()) {
        // ── IMAGE LOGO ──
        if (logoImg) {
          logoImg.src = logoUrl.trim();
          logoImg.alt = siteName;
          logoImg.style.height = logoHeight + 'px';
          logoImg.style.display = 'block';
        }
        if (logoBrand) logoBrand.style.display = 'none';
      } else {
        // ── TEXT LOGO ──
        if (logoImg) logoImg.style.display = 'none';
        if (logoBrand) {
          const sizeMap = { small: '16px', medium: '20px', large: '26px', xlarge: '32px' };
          const fontSize = sizeMap[headerSize] || '20px';
          logoBrand.style.display = '';
          logoBrand.textContent = siteName;
          logoBrand.style.fontSize = fontSize;
          logoBrand.style.fontWeight = headerStyle === 'normal' ? '600' : '800';
          logoBrand.style.fontStyle = headerStyle === 'italic' ? 'italic' : 'normal';
          if (headerStyle === 'gradient') {
            logoBrand.style.background = 'linear-gradient(135deg, #6c5ce7, #a29bfe)';
            logoBrand.style.webkitBackgroundClip = 'text';
            logoBrand.style.webkitTextFillColor = 'transparent';
            logoBrand.style.backgroundClip = 'text';
            logoBrand.style.color = 'transparent';
          } else {
            logoBrand.style.background = '';
            logoBrand.style.webkitBackgroundClip = '';
            logoBrand.style.webkitTextFillColor = '';
            logoBrand.style.backgroundClip = '';
            logoBrand.style.color = headerColor;
          }
        }
      }

      // Apply site name to footer
      const footerName = document.getElementById('footerSiteName');
      if (footerName) footerName.textContent = siteName;

      // Apply to footer copyright
      const footerCopy = document.getElementById('footerCopy');
      if (footerCopy) {
        footerCopy.textContent = '© ' + new Date().getFullYear() + ' ' + siteName + '. All rights reserved.';
      }

      // Update document title
      if (document.title.includes('DonghuaLand') && siteName !== 'DonghuaLand') {
        document.title = document.title.replace('DonghuaLand', siteName);
      }
    })
    .catch(() => {});
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initUserMenu();
  initHeaderScroll();
  initMobileMenu();
  initSearchOverlay();
  initBottomNav();
  initNavActive();
  initScheduleTabs();
  initHeroSlider();
  initWatchlistBtn();
  initBroadcastBanner();
  initFooterSocials();
  initSiteHeaderBranding();
});
