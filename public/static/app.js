// DonghuaLand Main App.js - matching reference site
'use strict';

// ============ TOAST ============
window.showToast = function(msg, type) {
  type = type || 'info';
  var container = document.getElementById('toastContainer') || document.body;
  if (!container) return;
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:80px;right:16px;z-index:9999;background:var(--bg5,#1a1a2e);color:var(--text1,#fff);padding:10px 18px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.4);border:1px solid var(--border2,#333);max-width:320px;word-break:break-word;transition:opacity 0.3s;';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function(){
    toast.style.opacity = '0';
    setTimeout(function(){ toast.remove(); }, 300);
  }, 3000);
};

// ============ THEME TOGGLE ============
function initThemeToggle() {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// ============ NAVBAR SCROLL ============
function initNavbarScroll() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ============ MOBILE MENU ============
function initMobileMenu() {
  var menuToggle = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  if (!menuToggle || !navLinks) return;
  
  menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open');
  });
  
  document.addEventListener('click', function(e) {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      navLinks.classList.remove('open');
      menuToggle.classList.remove('open');
    }
  });
}

// ============ GENRE DROPDOWN ============
function initGenreDropdown() {
  var dropdown = document.getElementById('genreDropdown');
  if (!dropdown) return;
  
  // Use static fallback genres (common donghua genres)
  var genres = ['Action','Adventure','Fantasy','Historical','Martial Arts','Romance','Sci-Fi','Comedy','Drama','Mystery','Cultivation','Xianxia'];
  dropdown.innerHTML = genres.map(function(g) {
    return '<a href="/search?genre=' + encodeURIComponent(g) + '" class="dropdown-item">' + g + '</a>';
  }).join('');
}

// ============ SEARCH ============
var searchDebounce = null;

function initSearch() {
  var liveInput = document.getElementById('liveSearchInput');
  var searchResults = document.getElementById('searchResults');
  var navSearch = document.getElementById('navSearch');
  
  // Desktop live search
  if (liveInput && searchResults) {
    liveInput.addEventListener('input', function() {
      clearTimeout(searchDebounce);
      var q = this.value.trim();
      if (q.length < 2) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('show');
        return;
      }
      searchDebounce = setTimeout(function() {
        fetch('/api/anime?q=' + encodeURIComponent(q) + '&limit=8')
          .then(function(r){ return r.json(); })
          .then(function(data) {
            var items = data.data || data.anime || [];
            if (!items.length) {
              searchResults.innerHTML = '<div class="sr-empty">No results for "' + escapeHtml(q) + '"</div>';
            } else {
              searchResults.innerHTML = items.map(function(a) {
                var ep = a.latest_episode;
                var href = ep ? '/watch/' + a.slug + '-episode-' + ep : '/anime/' + a.slug;
                return '<a href="' + href + '" class="h-search-result">' +
                  '<img src="' + (a.cover_image||'') + '" alt="' + escapeHtml(a.title) + '" style="width:34px;height:48px;object-fit:cover;border-radius:4px;flex-shrink:0;">' +
                  '<div><div class="sr-name">' + escapeHtml(a.title) + '</div>' +
                  '<div class="sr-meta">' + (a.type||'ONA') + ' · ' + (a.status||'') + '</div></div></a>';
              }).join('');
            }
            searchResults.classList.add('show');
          })
          .catch(function(){});
      }, 300);
    });
    
    liveInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var q = this.value.trim();
        if (q) window.location.href = '/search?q=' + encodeURIComponent(q);
      }
    });
    
    document.addEventListener('click', function(e) {
      if (!navSearch || !navSearch.contains(e.target)) {
        searchResults.classList.remove('show');
      }
    });
  }
  
  // Mobile search overlay
  var searchIconBtn = document.getElementById('searchIconBtn');
  var navbarSearchOverlay = document.getElementById('navbarSearchOverlay');
  var overlayClose = document.getElementById('overlayClose');
  var overlayInput = document.getElementById('overlaySearchInput');
  var overlayResults = document.getElementById('overlaySearchResults');
  
  if (searchIconBtn && navbarSearchOverlay) {
    searchIconBtn.addEventListener('click', function() {
      navbarSearchOverlay.classList.add('open');
      if (overlayInput) setTimeout(function(){ overlayInput.focus(); }, 100);
    });
  }
  
  if (overlayClose && navbarSearchOverlay) {
    overlayClose.addEventListener('click', function() {
      navbarSearchOverlay.classList.remove('open');
      if (overlayResults) overlayResults.innerHTML = '';
    });
  }
  
  if (overlayInput && overlayResults) {
    overlayInput.addEventListener('input', function() {
      clearTimeout(searchDebounce);
      var q = this.value.trim();
      if (q.length < 2) {
        overlayResults.innerHTML = '';
        return;
      }
      searchDebounce = setTimeout(function() {
        fetch('/api/anime?q=' + encodeURIComponent(q) + '&limit=8')
          .then(function(r){ return r.json(); })
          .then(function(data) {
            var items = data.data || data.anime || [];
            if (!items.length) {
              overlayResults.innerHTML = '<div class="sr-empty" style="padding:12px 16px;font-size:13px;color:var(--text-muted,#888);">No results</div>';
            } else {
              overlayResults.innerHTML = items.map(function(a) {
                var ep = a.latest_episode;
                var href = ep ? '/watch/' + a.slug + '-episode-' + ep : '/anime/' + a.slug;
                return '<a href="' + href + '" class="h-search-result" style="display:flex;gap:10px;padding:10px 14px;align-items:center;text-decoration:none;">' +
                  '<img src="' + (a.cover_image||'') + '" alt="' + escapeHtml(a.title) + '" style="width:34px;height:48px;object-fit:cover;border-radius:4px;flex-shrink:0;">' +
                  '<div><div class="sr-name" style="font-size:13px;font-weight:600;color:var(--text1,#fff);">' + escapeHtml(a.title) + '</div>' +
                  '<div class="sr-meta" style="font-size:11px;color:var(--text3,#aaa);">' + (a.type||'ONA') + ' · ' + (a.status||'') + '</div></div></a>';
              }).join('');
            }
          })
          .catch(function(){});
      }, 300);
    });
    
    overlayInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var q = this.value.trim();
        if (q) window.location.href = '/search?q=' + encodeURIComponent(q);
      }
    });
  }
}

// Toggle search in bottom nav  
window.toggleNavSearch = function() {
  var btn = document.getElementById('searchIconBtn');
  if (btn) btn.click();
};

// ============ BOTTOM NAV ACTIVE STATE ============
function initBottomNav() {
  var path = window.location.pathname;
  var items = [
    { id: 'bnav-home', paths: ['/'] },
    { id: 'bnav-browse', paths: ['/search', '/az-list'] },
    { id: 'bnav-bookmarks', paths: ['/bookmarks'] },
    { id: 'bnav-profile', paths: ['/user/login', '/user/profile', '/user/'] }
  ];
  
  items.forEach(function(item) {
    var el = document.getElementById(item.id);
    if (!el) return;
    var isActive = item.paths.some(function(p) {
      return p === '/' ? path === '/' : path.startsWith(p);
    });
    if (isActive) el.classList.add('active');
  });
}

// ============ AUTH CHECK ============
function checkAuth() {
  var token = localStorage.getItem('token');
  var user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch(e){}
  
  var navLoginBtn = document.getElementById('navLoginBtn');
  var bnavProfile = document.getElementById('bnav-profile');
  
  if (token && user) {
    // Hide login button, show username
    if (navLoginBtn) {
      navLoginBtn.innerHTML = '<span style="font-size:12px;font-weight:700;">' + escapeHtml(user.username || 'Me') + '</span>';
      navLoginBtn.href = '/user/profile';
    }
    if (bnavProfile) {
      bnavProfile.href = '/user/profile';
      var span = bnavProfile.querySelector('span');
      if (span) span.textContent = 'Profile';
    }
  }
}

window.doLogout = function() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

// ============ LOGO BRANDING from settings ============
function initLogoBranding() {
  fetch('/api/site-settings')
    .then(function(r){ return r.json(); })
    .then(function(data) {
      var s = data.data || data;
      var logoImg = document.getElementById('navLogoImg');
      var logoLink = document.getElementById('navLogoLink');
      var footerLink = document.getElementById('footerLogoLink');
      
      // Logo: image or text
      if (s.logo_type === 'image' && s.logo_url) {
        if (logoImg) {
          logoImg.src = s.logo_url;
          logoImg.style.height = (s.logo_height || '36') + 'px';
        }
      } else {
        // Text logo
        var name = s.header_text || s.site_name || 'Donghualand';
        if (logoImg) logoImg.style.display = 'none';
        if (logoLink) {
          // Check if text span exists, else create
          var span = logoLink.querySelector('span');
          if (!span) {
            span = document.createElement('span');
            span.style.cssText = 'font-weight:800;font-size:20px;letter-spacing:-0.5px;color:var(--color-primary,#6652ff);font-family:Outfit,sans-serif;';
            logoLink.appendChild(span);
          }
          span.textContent = name;
        }
      }
      
      if (footerLink && s.site_name) {
        footerLink.textContent = s.site_name;
      }
    })
    .catch(function(){});
}

// ============ LUCIDE ICONS ============
function initLucide() {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}

// ============ UTIL ============
function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============ WATCHLIST (localStorage) ============
window.toggleWatchlist = function(slug, title, cover, type) {
  var list = [];
  try { list = JSON.parse(localStorage.getItem('watchlist') || '[]'); } catch(e){}
  var idx = list.findIndex(function(i){ return i.slug === slug; });
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem('watchlist', JSON.stringify(list));
    window.showToast('Removed from bookmarks', 'info');
  } else {
    list.unshift({ slug: slug, title: title, cover: cover, type: type, addedAt: new Date().toISOString() });
    localStorage.setItem('watchlist', JSON.stringify(list));
    window.showToast('Added to bookmarks!', 'success');
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
      var bc = d.data[0];
      var ts = typeStyles[bc.type] || typeStyles.info;
      banner.style.display = 'block';
      banner.style.background = ts.bg;
      banner.style.borderBottom = '2px solid ' + ts.border;
      banner.style.padding = '11px 16px';
      banner.style.textAlign = 'center';
      banner.style.width = '100%';
      var msg = bc.message.replace(/</g,'&lt;').replace(/>/g,'&gt;');
      banner.innerHTML =
        '<div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;position:relative;">' +
          '<i class="fas ' + ts.icon + '" style="color:' + ts.color + ';flex-shrink:0;font-size:14px;"></i>' +
          '<span style="font-size:13px;color:' + ts.color + ';font-weight:500;line-height:1.4;">' + msg + '</span>' +
          '<button id="broadcastDismiss" style="position:absolute;right:0;top:50%;transform:translateY(-50%);background:none;border:none;color:' + ts.color + ';cursor:pointer;font-size:20px;line-height:1;padding:4px 8px;opacity:0.75;" title="Dismiss">&times;</button>' +
        '</div>';
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

// ============ THEME TOGGLE (DARK / LIGHT) ============
(function initThemeEarly() {
  const saved = localStorage.getItem('siteTheme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('siteTheme', theme);
  // Update new navbar theme toggle (lucide icon)
  var btn = document.getElementById('themeToggle');
  if (btn) {
    var sunIcon = btn.querySelector('.icon-sun');
    var moonIcon = btn.querySelector('.icon-moon');
    if (sunIcon) sunIcon.style.display = theme === 'light' ? 'none' : '';
    if (moonIcon) moonIcon.style.display = theme === 'light' ? '' : 'none';
  }
  // Update old theme toggle button if present
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
  }
  const oldBtn = document.getElementById('themeToggleBtn');
  if (oldBtn) {
    oldBtn.title = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  }
}

window.toggleTheme = function() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
};

function initTheme() {
  const saved = localStorage.getItem('siteTheme') || 'dark';
  applyTheme(saved);
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initThemeToggle();
  initNavbarScroll();
  initMobileMenu();
  initGenreDropdown();
  initSearch();
  initBottomNav();
  checkAuth();
  initLogoBranding();
  
  // Init lucide after a tiny delay to ensure icons are in DOM
  setTimeout(initLucide, 50);
  
  // Also re-init lucide when new content is added (for dynamically loaded pages)
  var observer = new MutationObserver(function() {
    clearTimeout(window._lucideTimer);
    window._lucideTimer = setTimeout(initLucide, 100);
  });
  observer.observe(document.body, { childList: true, subtree: false });
});

// Lucide icons ready on script load too
if (document.readyState !== 'loading') {
  setTimeout(initLucide, 100);
}
