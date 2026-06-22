// Layout template — Premium Redesign v2.0

export function layout(title: string, content: string, extraHead: string = '', siteName: string = 'ANIME WORLD', siteUrl: string = ''): string {
  const siteDesc = 'Stream anime online for free in HD — new episodes daily, no subscription needed. Watch your favorite anime anytime, anywhere.'
  const ogImage = siteUrl ? `${siteUrl}/static/og-banner.jpg` : '/static/og-banner.jpg'
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${siteDesc}">
<!-- Open Graph / Social Media -->
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${siteDesc}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1280">
<meta property="og:image:height" content="720">
<meta property="og:site_name" content="${siteName}">
${siteUrl ? `<meta property="og:url" content="${siteUrl}">` : ''}
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${siteDesc}">
<meta name="twitter:image" content="${ogImage}">
<!-- Theme & PWA -->
<meta name="theme-color" content="#7c3aed">
<meta name="mobile-web-app-capable" content="yes">
<!-- Apple PWA -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${siteName}">
<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" href="/static/icon-180x180.png">
<link rel="apple-touch-icon" sizes="180x180" href="/static/icon-180x180.png">
<link rel="apple-touch-icon" sizes="167x167" href="/static/icon-167x167.png">
<link rel="apple-touch-icon" sizes="152x152" href="/static/icon-152x152.png">
<link rel="apple-touch-icon" sizes="144x144" href="/static/icon-144x144.png">
<link rel="apple-touch-icon" sizes="128x128" href="/static/icon-128x128.png">
<link rel="apple-touch-icon" sizes="96x96"   href="/static/icon-96x96.png">
<!-- Favicons -->
<link rel="icon" type="image/png" sizes="512x512" href="/static/icon-512x512.png">
<link rel="icon" type="image/png" sizes="192x192" href="/static/icon-192x192.png">
<link rel="icon" type="image/png" sizes="32x32"   href="/static/icon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16"   href="/static/icon-16x16.png">
<link rel="icon" type="image/svg+xml"             href="/static/favicon.svg">
<link rel="icon" type="image/x-icon"              href="/static/favicon.ico">
<link rel="shortcut icon"                          href="/static/favicon.ico">
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="image" href="/static/logo.png" fetchpriority="high">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
<link rel="stylesheet" href="/static/style.css">
<!-- Critical inline CSS — prevents FOUC (Flash of Unstyled Content)
     Must contain enough rules to make header/logo/main render correctly
     even before /static/style.css finishes loading. -->
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080810;color:#e8e8f0;min-height:100vh;overflow-x:hidden;line-height:1.5;-webkit-font-smoothing:antialiased}
  a{text-decoration:none;color:inherit}
  button{cursor:pointer;border:none;background:none;font-family:inherit}
  img{display:block;max-width:100%}
  .site-header{position:fixed;top:0;left:0;right:0;height:64px;z-index:1000;background:rgba(8,8,16,0.85);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid rgba(255,255,255,0.05)}
  .header-inner{max-width:1440px;margin:0 auto;height:100%;display:flex;align-items:center;gap:12px;padding:0 20px}
  .logo{display:flex;align-items:center;gap:9px;flex-shrink:0;white-space:nowrap}
  .site-logo-img{height:40px;width:auto;max-width:180px;max-height:40px;object-fit:contain;display:block}
  .footer-logo-img{height:36px;max-width:160px;max-height:36px}
  .site-main{margin-top:64px;min-height:60vh}
  .hidden{display:none !important}
  /* Logged-in user wrap is hidden by default until JS confirms auth */
  #userMenuWrap.hidden{display:none !important}
  /* CRITICAL: Hide drawer / search overlay / share modal / PWA modal by default so they
     never flash inline in the document flow before /static/style.css arrives.
     They are absolutely / fixed positioned via the main stylesheet; using
     position:fixed + visibility:hidden here removes them from the visible flow. */
  .mob-drawer{position:fixed;top:0;right:0;bottom:0;width:300px;max-width:85vw;z-index:1100;transform:translateX(100%);visibility:hidden}
  .mob-drawer.open{transform:translateX(0);visibility:visible}
  .search-overlay{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.65);visibility:hidden;opacity:0}
  .search-overlay.open{visibility:visible;opacity:1}
  .share-modal-backdrop{position:fixed;inset:0;z-index:3000;visibility:hidden;opacity:0;pointer-events:none}
  .share-modal-backdrop.open{visibility:visible;opacity:1;pointer-events:auto}
  #pwaInstallModal{position:fixed;inset:0;z-index:99999;pointer-events:none;visibility:hidden}
  #pwaInstallModal.open{pointer-events:auto;visibility:visible}
  /* PWA FAB hidden by default — JS shows it only after install prompt is captured */
  .pwa-fab{display:none}
  /* Toast container should never push layout */
  .toast-container{position:fixed;bottom:20px;right:20px;z-index:5000;display:flex;flex-direction:column;gap:10px;pointer-events:none}
  /* Dropdown menus / autocomplete drops must be hidden by default — never flash inline */
  .nav-dropdown-menu,.user-drop,.h-search-drop,.search-overlay-drop{display:none}
  .nav-dropdown:hover .nav-dropdown-menu,.user-wrap.open .user-drop,.h-search-drop.show,.search-overlay-drop.show{display:block}
  /* Header search bar hidden by default — toggled by JS */
  .header-search{display:none}
  .header-search.open{display:block}
  /* Mobile-only / desktop-only baselines (avoid both showing before CSS) */
  .mob-search-btn,.mob-auth-btn,.mob-btn{display:none}
  .desktop-search-btn,.btn-signin,.btn-join{display:inline-flex}
  @media (max-width:768px){
    .desktop-search-btn,.btn-signin,.btn-join{display:none}
    .mob-search-btn,.mob-auth-btn,.mob-btn{display:inline-flex;align-items:center;justify-content:center}
  }
  /* Stable hero/player aspect ratio so layout never collapses while loading */
  .hero-slider{position:relative;width:100%;height:560px;max-height:80vh;overflow:hidden;background:#0a0a14}
  .player-box{position:relative;aspect-ratio:16/9;background:#000;border-radius:14px;overflow:hidden;margin-bottom:14px;width:100%}
  .watch-wrap{max-width:960px;margin:0 auto;padding:16px 20px 40px;min-height:50vh}
  /* Bottom nav baseline so it never explodes on mobile before CSS arrives */
  .bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;height:62px;z-index:998;background:#0d0d18;border-top:1px solid rgba(255,255,255,0.05)}
  @media (max-width:768px){
    .site-header{height:58px}
    .site-main{margin-top:58px;padding-bottom:62px}
    .bottom-nav{display:flex}
    .header-inner{padding:0 12px;gap:7px}
    .site-logo-img{height:34px;max-height:34px;max-width:150px}
    .hero-slider{height:340px;max-height:340px;min-height:290px}
    .watch-wrap{padding:0;min-height:50vh}
    .player-box{border-radius:0}
  }
</style>
${extraHead}
</head>
<body>

<!-- ==================== HEADER ==================== -->
<header class="site-header" id="siteHeader">
  <div class="header-inner">

    <!-- Logo — width/height attrs prevent FOUC oversizing before CSS loads -->
    <a href="/" class="logo" aria-label="${siteName}">
      <img src="/static/logo.png" alt="${siteName}" class="site-logo-img" id="headerSiteName"
           width="100" height="40" decoding="async" fetchpriority="high"
           style="height:40px;width:auto;max-width:180px;max-height:40px;object-fit:contain;display:block"
           onerror="this.onerror=null;this.style.display='none';">
    </a>

    <!-- Search bar (desktop: hidden until search icon clicked) -->
    <div class="header-search desktop-search" id="desktopSearchBox">
      <form action="/search" method="GET" class="h-search-form" onsubmit="return headerSearchSubmit(event, this)">
        <i class="fas fa-search h-search-icon"></i>
        <input type="text" name="q" id="hSearchInput" class="h-search-input" placeholder="Search anime..." autocomplete="off">
        <button type="button" class="h-search-close" onclick="closeDesktopSearch()" title="Close"><i class="fas fa-times"></i></button>
        <div class="h-search-drop" id="hSearchDrop"></div>
      </form>
    </div>

    <!-- Desktop navigation -->
    <nav class="header-nav">
      <a href="/" class="nav-link"><i class="fas fa-home" style="font-size:12px;"></i> Home</a>
      <div class="nav-dropdown">
        <a class="nav-link" style="cursor:pointer;">Browse <i class="fas fa-chevron-down" style="font-size:9px;"></i></a>
        <div class="nav-dropdown-menu">
          <a href="/search?status=Ongoing" class="nav-drop-item"><i class="fas fa-circle" style="color:var(--green);font-size:8px;"></i> Ongoing</a>
          <a href="/search?status=Completed" class="nav-drop-item"><i class="fas fa-check-circle"></i> Completed</a>
          <a href="/search?type=ONA" class="nav-drop-item"><i class="fas fa-video"></i> ONA Series</a>
          <a href="/search?type=Movie" class="nav-drop-item"><i class="fas fa-film"></i> Movies</a>
          <div class="nav-divider"></div>
          <a href="/search?genre=Action" class="nav-drop-item"><i class="fas fa-bolt"></i> Action</a>
          <a href="/search?genre=Fantasy" class="nav-drop-item"><i class="fas fa-hat-wizard"></i> Fantasy</a>
          <a href="/search?genre=Adventure" class="nav-drop-item"><i class="fas fa-map-marked-alt"></i> Adventure</a>
          <a href="/search?genre=Historical" class="nav-drop-item"><i class="fas fa-landmark"></i> Historical</a>
          <a href="/search?genre=Martial+Arts" class="nav-drop-item"><i class="fas fa-fist-raised"></i> Martial Arts</a>
          <a href="/search?genre=Romance" class="nav-drop-item"><i class="fas fa-heart"></i> Romance</a>
        </div>
      </div>
      <a href="/schedule" class="nav-link"><i class="fas fa-calendar-alt" style="font-size:12px;"></i> Schedule</a>
    </nav>

    <!-- Header right actions -->
    <div class="header-right">
      <!-- Desktop search toggle icon -->
      <button class="desktop-search-btn" id="desktopSearchBtn" onclick="toggleDesktopSearch()" title="Search">
        <i class="fas fa-search"></i>
      </button>

      <!-- Desktop: Sign In / Join buttons -->
      <a href="/user/login" class="btn-signin" id="headerSignIn">Sign In</a>
      <a href="/user/register" class="btn-join" id="headerJoin">Join Free</a>

      <!-- Mobile: Search Icon Button -->
      <button class="mob-search-btn" id="mobSearchBtn" onclick="toggleSearchOverlay()" title="Search">
        <i class="fas fa-search"></i>
      </button>

      <!-- Mobile: Login/Register Icon (shown when logged out) -->
      <a href="/user/login" class="mob-auth-btn" id="mobAuthBtn" title="Sign In">
        <i class="fas fa-user"></i>
      </a>

      <!-- User menu (shown when logged in) -->
      <div class="user-wrap hidden" id="userMenuWrap">
        <button class="user-btn" id="userMenuBtn">
          <img src="" alt="" class="user-ava" id="userAva">
          <span id="userNameLabel" class="user-name-label"></span>
          <i class="fas fa-chevron-down" style="font-size:9px; color:var(--text3);"></i>
        </button>
        <div class="user-drop" id="userDrop">
          <a href="/user/profile" class="user-drop-item"><i class="fas fa-user-circle"></i> Profile</a>
          <a href="/user/watchlist" class="user-drop-item"><i class="fas fa-bookmark"></i> Watchlist</a>
          <a href="/user/history" class="user-drop-item"><i class="fas fa-history"></i> History</a>
          <div class="drop-divider"></div>
          <a href="/user/settings" class="user-drop-item"><i class="fas fa-cog"></i> Settings</a>
          <button class="user-drop-item danger" onclick="doLogout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
        </div>
      </div>

      <!-- Mobile hamburger -->
      <button class="mob-btn" id="mobMenuBtn">
        <i class="fas fa-bars" id="mobMenuIcon"></i>
      </button>
    </div>

  </div>
</header>

<!-- ==================== SEARCH OVERLAY ==================== -->
<div class="search-overlay" id="searchOverlay" onclick="handleSearchOverlayClick(event)">
  <div class="search-overlay-box">
    <div class="search-overlay-header">
      <i class="fas fa-search search-overlay-icon"></i>
      <input type="text" id="overlaySearchInput" class="search-overlay-input"
             placeholder="Search anime, movies, series..." autocomplete="off" autofocus>
      <button class="search-overlay-close" onclick="closeSearchOverlay()" title="Close">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="search-overlay-drop" id="searchOverlayDrop"></div>
    <div class="search-overlay-footer">
      <span>Press <kbd>Enter</kbd> to see all results &nbsp;·&nbsp; <kbd>Esc</kbd> to close</span>
    </div>
  </div>
</div>

<!-- ==================== MOBILE DRAWER ==================== -->
<div class="mob-drawer" id="mobDrawer">
  <div class="mob-drawer-inner">
    <div id="mobUserSection">
      <div class="mob-auth">
        <a href="/user/login" class="a-in" id="mobSignIn">Sign In</a>
        <a href="/user/register" class="a-join" id="mobJoin">Join Free</a>
      </div>
    </div>
    <div class="mob-sep"></div>
    <a href="/" class="mob-nav-link"><i class="fas fa-home"></i> Home</a>
    <a href="/search" class="mob-nav-link"><i class="fas fa-compass"></i> Browse Anime</a>
    <a href="/search?status=Ongoing" class="mob-nav-link"><i class="fas fa-fire"></i> Ongoing</a>
    <a href="/search?status=Completed" class="mob-nav-link"><i class="fas fa-check-circle"></i> Completed</a>
    <a href="/search?type=Movie" class="mob-nav-link"><i class="fas fa-film"></i> Movies</a>
    <a href="/schedule" class="mob-nav-link"><i class="fas fa-calendar-alt"></i> Schedule</a>
    <div class="mob-sep"></div>
    <div style="padding: 8px 16px 6px; font-size:10px; text-transform:uppercase; letter-spacing:1px; color:var(--text4); font-weight:700;">Genres</div>
    <a href="/search?genre=Action" class="mob-nav-link"><i class="fas fa-bolt"></i> Action</a>
    <a href="/search?genre=Fantasy" class="mob-nav-link"><i class="fas fa-hat-wizard"></i> Fantasy</a>
    <a href="/search?genre=Adventure" class="mob-nav-link"><i class="fas fa-map-marked-alt"></i> Adventure</a>
    <a href="/search?genre=Martial+Arts" class="mob-nav-link"><i class="fas fa-fist-raised"></i> Martial Arts</a>
    <a href="/search?genre=Historical" class="mob-nav-link"><i class="fas fa-landmark"></i> Historical</a>
    <a href="/search?genre=Romance" class="mob-nav-link"><i class="fas fa-heart"></i> Romance</a>
  </div>
</div>

<!-- ==================== MAIN CONTENT ==================== -->
<main class="site-main">
<!-- Broadcast Banner -->
<div id="broadcastBanner" style="display:none;"></div>
${content}
</main>

<!-- ==================== FOOTER ==================== -->
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/" class="footer-logo" aria-label="${siteName}">
          <img src="/static/logo.png" alt="${siteName}" class="site-logo-img footer-logo-img" id="footerSiteName"
               width="90" height="36" decoding="async" loading="lazy"
               style="height:36px;width:auto;max-width:160px;max-height:36px;object-fit:contain;display:block"
               onerror="this.onerror=null;this.style.display='none';">
        </a>
        <p class="footer-tagline" id="footerTagline">Your ultimate destination for anime streaming.<br>Free, HD, updated daily.</p>
        <div class="footer-social" id="footerSocial">
          <!-- Populated dynamically from DB settings -->
        </div>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Browse</h4>
          <a href="/search?status=Ongoing"><i class="fas fa-circle" style="font-size:7px; color:var(--green); margin-right:5px;"></i>Ongoing</a>
          <a href="/search?status=Completed">Completed</a>
          <a href="/search?type=Movie">Movies</a>
          <a href="/search?type=ONA">ONA Series</a>
          <a href="/schedule">Schedule</a>
        </div>
        <div class="footer-col">
          <h4>Genres</h4>
          <a href="/search?genre=Action">Action</a>
          <a href="/search?genre=Fantasy">Fantasy</a>
          <a href="/search?genre=Adventure">Adventure</a>
          <a href="/search?genre=Historical">Historical</a>
          <a href="/search?genre=Martial+Arts">Martial Arts</a>
          <a href="/search?genre=Romance">Romance</a>
        </div>
        <div class="footer-col">
          <h4>Account</h4>
          <a href="/user/register">Register</a>
          <a href="/user/login">Sign In</a>
          <a href="/user/watchlist">Watchlist</a>
          <a href="/user/history">History</a>
          <a href="/user/profile">Profile</a>
        </div>
        <div class="footer-col">
          <h4>Info</h4>
          <a href="/about">About Us</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <a href="/dmca">DMCA</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p id="footerCopy">© 2026 ${siteName}. All rights reserved.</p>
      <p>This site only provides web page services and does not store any content on its servers.</p>
    </div>
  </div>
</footer>

<!-- ==================== BOTTOM NAV (MOBILE ONLY) ==================== -->
<nav class="bottom-nav" id="bottomNav">
  <a href="/" class="bnav-item" id="bnav-home">
    <i class="fas fa-home"></i>
    <span>Home</span>
  </a>
  <a href="/search" class="bnav-item" id="bnav-browse">
    <i class="fas fa-compass"></i>
    <span>Browse</span>
  </a>
  <button class="bnav-item bnav-search-wrap" id="bnav-search" onclick="toggleSearchOverlay()">
    <div class="bnav-search-btn">
      <i class="fas fa-search"></i>
    </div>
    <span>Search</span>
  </button>
  <a href="/user/watchlist" class="bnav-item" id="bnav-watchlist">
    <i class="fas fa-bookmark"></i>
    <span>Watchlist</span>
  </a>
  <a href="/user/login" class="bnav-item" id="bnav-profile">
    <i class="fas fa-user"></i>
    <span>Profile</span>
  </a>
</nav>

<!-- ==================== TOAST CONTAINER ==================== -->
<div class="toast-container" id="toastContainer"></div>

<!-- ==================== SCRIPTS ==================== -->
<script src="/static/app.js"></script>

<!-- ==================== PWA: INSTALL MODAL + FAB ==================== -->
<!-- Install Modal — Mobile Only, shows on first Android Chrome visit -->
<div id="pwaInstallModal" style="display:none;" aria-modal="true" role="dialog" aria-label="Install App">
  <div class="pwa-modal-backdrop" id="pwaModalBackdrop"></div>
  <div class="pwa-modal-sheet">
    <div class="pwa-modal-handle"></div>
    <div class="pwa-modal-content">
      <img src="/static/icon.png" alt="${siteName} icon" class="pwa-modal-icon">
      <div class="pwa-modal-text">
        <h2 class="pwa-modal-title" id="pwaModalTitle">${siteName}</h2>
        <p class="pwa-modal-desc">Install the app for the best experience — watch offline, faster loading, and no browser bar.</p>
      </div>
      <div class="pwa-modal-features">
        <div class="pwa-feature-item"><span class="pwa-feature-icon">⚡</span><span>Faster loading</span></div>
        <div class="pwa-feature-item"><span class="pwa-feature-icon">📴</span><span>Works offline</span></div>
        <div class="pwa-feature-item"><span class="pwa-feature-icon">🖥️</span><span>Fullscreen mode</span></div>
      </div>
      <button class="pwa-install-btn" id="pwaInstallBtn" onclick="triggerPwaInstall()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Install App
      </button>
      <button class="pwa-dismiss-btn" id="pwaDismissBtn" onclick="dismissPwaModal()">Not Now</button>
    </div>
  </div>
</div>

<!-- Floating Install FAB — mobile only, appears when not installed -->
<button class="pwa-fab" id="pwaFab" style="display:none;" onclick="openPwaModal()" title="Install App" aria-label="Install App">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  <span class="pwa-fab-label">Install</span>
</button>

<style>
/* ── PWA Install Modal ──────────────────────────────────── */
#pwaInstallModal {
  position: fixed; inset: 0; z-index: 99999;
  pointer-events: none;
}
#pwaInstallModal.open {
  pointer-events: auto;
}
.pwa-modal-backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  opacity: 0; transition: opacity 0.3s ease;
}
#pwaInstallModal.open .pwa-modal-backdrop { opacity: 1; }

.pwa-modal-sheet {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(160deg, #16162a 0%, #0f0f1e 100%);
  border-top: 1px solid rgba(124,58,237,0.3);
  border-radius: 24px 24px 0 0;
  padding: 12px 24px 40px;
  box-shadow: 0 -12px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15);
  transform: translateY(100%);
  transition: transform 0.38s cubic-bezier(0.32,0.72,0,1);
}
#pwaInstallModal.open .pwa-modal-sheet { transform: translateY(0); }

.pwa-modal-handle {
  width: 44px; height: 5px;
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
  margin: 0 auto 24px;
}

.pwa-modal-content { display: flex; flex-direction: column; align-items: center; gap: 16px; }

.pwa-modal-icon {
  width: 88px; height: 88px;
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(124,58,237,0.5);
  border: 2px solid rgba(124,58,237,0.35);
}

.pwa-modal-text { text-align: center; }
.pwa-modal-title {
  font-size: 22px; font-weight: 800;
  color: #fff; margin-bottom: 8px;
  letter-spacing: -0.3px;
}
.pwa-modal-desc {
  font-size: 14px; color: #9090b0; line-height: 1.6;
  max-width: 300px; margin: 0 auto;
}

.pwa-modal-features {
  display: flex; gap: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 14px 18px;
  width: 100%; justify-content: center;
}
.pwa-feature-item {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  font-size: 11px; color: #8080a0; flex: 1; text-align: center;
}
.pwa-feature-icon { font-size: 22px; }

.pwa-install-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  color: #fff; border: none;
  padding: 15px 24px;
  border-radius: 14px;
  font-size: 16px; font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(124,58,237,0.5);
  transition: transform 0.15s, box-shadow 0.15s;
}
.pwa-install-btn:active { transform: scale(0.97); box-shadow: 0 3px 12px rgba(124,58,237,0.4); }

.pwa-dismiss-btn {
  width: 100%; background: none; border: none;
  color: #6060a0; font-size: 14px; font-weight: 500;
  padding: 10px; cursor: pointer;
  border-radius: 10px; transition: color 0.2s, background 0.2s;
}
.pwa-dismiss-btn:hover { color: #9090c0; background: rgba(255,255,255,0.04); }

/* ── PWA Floating FAB ───────────────────────────────────── */
.pwa-fab {
  position: fixed;
  bottom: calc(var(--bnav, 62px) + 16px);
  right: 16px;
  z-index: 9990;
  display: flex; align-items: center; gap: 7px;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  color: #fff; border: none;
  padding: 12px 18px 12px 14px;
  border-radius: 50px;
  font-size: 13px; font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(124,58,237,0.55), 0 2px 8px rgba(0,0,0,0.4);
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.3s;
  animation: pwaFabIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
}
@keyframes pwaFabIn {
  from { transform: scale(0.5) translateY(20px); opacity: 0; }
  to   { transform: scale(1) translateY(0);       opacity: 1; }
}
.pwa-fab:hover { transform: scale(1.06); box-shadow: 0 6px 28px rgba(124,58,237,0.65), 0 2px 8px rgba(0,0,0,0.5); }
.pwa-fab:active { transform: scale(0.95); }
.pwa-fab-label { font-size: 13px; font-weight: 700; }

/* ── Hide PWA elements on desktop ───────────────────────── */
@media (min-width: 769px) {
  #pwaInstallModal { display: none !important; }
  .pwa-fab { display: none !important; }
}
</style>

<script>
/* ──────────────────────────────────────────────────────────
   PWA Install System — production-grade
   · Captures BeforeInstallPrompt (Android Chrome)
   · Shows bottom-sheet modal on first visit
   · 3-day snooze on dismiss
   · Never shows again after install
   · Floating FAB as persistent fallback
────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const STORAGE_KEY   = 'pwa_install_dismissed_at';
  const INSTALLED_KEY = 'pwa_installed';
  const SNOOZE_MS     = 3 * 24 * 60 * 60 * 1000; // 3 days
  const SHOW_DELAY_MS = 2500; // wait before auto-showing

  let deferredPrompt = null;

  // ── Detect if already installed (standalone mode) ────────
  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  // ── Detect mobile ────────────────────────────────────────
  function isMobile() {
    return window.innerWidth <= 768 ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  // ── Check if we should show the modal ────────────────────
  function shouldShow() {
    if (!isMobile())                                return false;
    if (isStandalone())                             return false;
    if (localStorage.getItem(INSTALLED_KEY))        return false;
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < SNOOZE_MS)                      return false;
    }
    return true;
  }

  // ── Open Modal ───────────────────────────────────────────
  window.openPwaModal = function () {
    var modal = document.getElementById('pwaInstallModal');
    if (!modal) return;
    // Update title dynamically from page <title>
    var titleEl = document.getElementById('pwaModalTitle');
    if (titleEl) {
      var pageTitle = document.title.split('|')[0].split('-')[0].trim();
      // headerSiteName is an <img>; use its alt attribute as the site name
      var headerName = document.getElementById('headerSiteName');
      var siteName = '';
      if (headerName) {
        if (headerName.tagName === 'IMG') {
          siteName = (headerName.getAttribute('alt') || '').trim();
        } else {
          siteName = (headerName.textContent || '').trim();
        }
      }
      titleEl.textContent = siteName || pageTitle;
    }
    modal.style.display = 'block';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        modal.classList.add('open');
      });
    });
    // Hide FAB while modal is open
    var fab = document.getElementById('pwaFab');
    if (fab) fab.style.opacity = '0';
  };

  // ── Close Modal ──────────────────────────────────────────
  function closeModal() {
    var modal = document.getElementById('pwaInstallModal');
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(function () { modal.style.display = 'none'; }, 380);
    // Restore FAB
    var fab = document.getElementById('pwaFab');
    if (fab && deferredPrompt) fab.style.opacity = '1';
  }

  // ── Dismiss (snooze 3 days) ──────────────────────────────
  window.dismissPwaModal = function () {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    closeModal();
  };

  // ── Trigger native install ───────────────────────────────
  window.triggerPwaInstall = async function () {
    if (!deferredPrompt) {
      // Fallback: close modal, user may use browser menu
      closeModal();
      return;
    }
    try {
      deferredPrompt.prompt();
      var result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        localStorage.setItem(INSTALLED_KEY, '1');
        localStorage.removeItem(STORAGE_KEY);
        // Hide FAB permanently
        var fab = document.getElementById('pwaFab');
        if (fab) { fab.style.display = 'none'; }
      } else {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      }
    } catch (e) {
      console.warn('[PWA] Install prompt error:', e);
    }
    deferredPrompt = null;
    closeModal();
  };

  // ── Backdrop click closes modal ──────────────────────────
  var backdrop = document.getElementById('pwaModalBackdrop');
  if (backdrop) backdrop.addEventListener('click', window.dismissPwaModal);

  // ── Listen for BeforeInstallPrompt ───────────────────────
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;

    if (!isMobile() || isStandalone()) return;

    // Show FAB
    var fab = document.getElementById('pwaFab');
    if (fab) fab.style.display = 'flex';

    // Auto-show modal if conditions met
    if (shouldShow()) {
      setTimeout(window.openPwaModal, SHOW_DELAY_MS);
    }
  });

  // ── Listen for successful install ────────────────────────
  window.addEventListener('appinstalled', function () {
    localStorage.setItem(INSTALLED_KEY, '1');
    deferredPrompt = null;
    var modal = document.getElementById('pwaInstallModal');
    var fab   = document.getElementById('pwaFab');
    if (modal) { modal.classList.remove('open'); modal.style.display = 'none'; }
    if (fab)   { fab.style.display = 'none'; }
  });

  // ── Register Service Worker ──────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          console.log('[SW] Registered, scope:', reg.scope);
          // Check for updates on navigation
          reg.addEventListener('updatefound', function () {
            var newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', function () {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] Update available — will apply on next load.');
              }
            });
          });
        })
        .catch(function (err) { console.warn('[SW] Registration failed:', err); });
    });
  }

  // ── Hide FAB if already installed ───────────────────────
  if (isStandalone() || localStorage.getItem(INSTALLED_KEY)) {
    document.addEventListener('DOMContentLoaded', function () {
      var fab = document.getElementById('pwaFab');
      if (fab) fab.style.display = 'none';
    });
  }
})();
</script>

<!-- ==================== /PWA ==================== -->
</body>
</html>`
}
