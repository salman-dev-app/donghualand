// Layout template

export function layout(title: string, content: string, extraHead: string = '', siteName: string = 'DonghuaLand'): string {
  const siteDesc = 'Stream anime online for free in HD — new episodes daily, no subscription needed. Watch your favorite anime anytime, anywhere.'
  const ogImage = '/static/og-banner.jpg'
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
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${siteDesc}">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
<link rel="stylesheet" href="/static/style.css">
${extraHead}
</head>
<body>

<!-- ==================== HEADER ==================== -->
<header class="site-header" id="siteHeader">
  <div class="header-inner">

    <!-- Logo -->
    <a href="/" class="logo">
      <div class="logo-icon"><i class="fas fa-dragon"></i></div>
      <div class="logo-text" id="headerSiteName">${siteName}</div>
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
      <a href="/" class="nav-link">Home</a>
      <div class="nav-dropdown">
        <a class="nav-link">Browse <i class="fas fa-chevron-down" style="font-size:9px;"></i></a>
        <div class="nav-dropdown-menu">
          <a href="/search?status=Ongoing" class="nav-drop-item"><i class="fas fa-circle" style="color:var(--green);font-size:8px;"></i> Ongoing</a>
          <a href="/search?status=Completed" class="nav-drop-item"><i class="fas fa-check-circle"></i> Completed</a>
          <a href="/search?type=ONA" class="nav-drop-item"><i class="fas fa-video"></i> ONA</a>
          <a href="/search?type=Movie" class="nav-drop-item"><i class="fas fa-film"></i> Movies</a>
          <div class="nav-divider"></div>
          <a href="/search?genre=Action" class="nav-drop-item">Action</a>
          <a href="/search?genre=Fantasy" class="nav-drop-item">Fantasy</a>
          <a href="/search?genre=Adventure" class="nav-drop-item">Adventure</a>
          <a href="/search?genre=Historical" class="nav-drop-item">Historical</a>
          <a href="/search?genre=Martial+Arts" class="nav-drop-item">Martial Arts</a>
          <a href="/search?genre=Romance" class="nav-drop-item">Romance</a>
        </div>
      </div>
      <a href="/schedule" class="nav-link">Schedule</a>
    </nav>

    <!-- Header right actions -->
    <div class="header-right">
      <!-- Desktop search toggle icon (shown on desktop, triggers search box) -->
      <button class="desktop-search-btn" id="desktopSearchBtn" onclick="toggleDesktopSearch()" title="Search">
        <i class="fas fa-search"></i>
      </button>

      <!-- Desktop: Sign In / Join buttons (hidden when logged in) -->
      <a href="/user/login" class="btn-signin" id="headerSignIn">Sign In</a>
      <a href="/user/register" class="btn-join" id="headerJoin">Join Free</a>

      <!-- Mobile: Search Icon Button → opens search overlay -->
      <button class="mob-search-btn" id="mobSearchBtn" onclick="toggleSearchOverlay()" title="Search">
        <i class="fas fa-search"></i>
      </button>

      <!-- Mobile: Login/Register Icon (shown when logged out) -->
      <a href="/user/login" class="mob-auth-btn" id="mobAuthBtn" title="Sign In">
        <i class="fas fa-sign-in-alt"></i>
      </a>

      <!-- User menu (shown when logged in - both desktop and mobile) -->
      <div class="user-wrap hidden" id="userMenuWrap">
        <button class="user-btn" id="userMenuBtn">
          <img src="" alt="" class="user-ava" id="userAva">
          <span id="userNameLabel" class="user-name-label"></span>
          <i class="fas fa-chevron-down" style="font-size:10px; color:var(--text3);"></i>
        </button>
        <div class="user-drop" id="userDrop">
          <a href="/user/profile" class="user-drop-item"><i class="fas fa-user"></i> Profile</a>
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

<!-- ==================== SEARCH OVERLAY (used by header btn + bottom nav) ==================== -->
<div class="search-overlay" id="searchOverlay" onclick="handleSearchOverlayClick(event)">
  <div class="search-overlay-box">
    <div class="search-overlay-header">
      <i class="fas fa-search search-overlay-icon"></i>
      <input type="text" id="overlaySearchInput" class="search-overlay-input"
             placeholder="Search anime title..." autocomplete="off" autofocus>
      <button class="search-overlay-close" onclick="closeSearchOverlay()" title="Close">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="search-overlay-drop" id="searchOverlayDrop"></div>
    <div class="search-overlay-footer">
      <span>Press <kbd>Enter</kbd> to search all results · <kbd>Esc</kbd> to close</span>
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
    <a href="/search" class="mob-nav-link"><i class="fas fa-compass"></i> Browse</a>
    <a href="/search?status=Ongoing" class="mob-nav-link"><i class="fas fa-fire"></i> Ongoing</a>
    <a href="/search?status=Completed" class="mob-nav-link"><i class="fas fa-check-circle"></i> Completed</a>
    <a href="/schedule" class="mob-nav-link"><i class="fas fa-calendar-alt"></i> Schedule</a>
    <div class="mob-sep"></div>
    <a href="/search?genre=Action" class="mob-nav-link"><i class="fas fa-bolt"></i> Action</a>
    <a href="/search?genre=Fantasy" class="mob-nav-link"><i class="fas fa-hat-wizard"></i> Fantasy</a>
    <a href="/search?genre=Adventure" class="mob-nav-link"><i class="fas fa-map-marked-alt"></i> Adventure</a>
    <a href="/search?genre=Martial+Arts" class="mob-nav-link"><i class="fas fa-fist-raised"></i> Martial Arts</a>
  </div>
</div>

<!-- ==================== MAIN CONTENT ==================== -->
<main class="site-main">
<!-- ==================== BROADCAST BANNER ==================== -->
<div id="broadcastBanner" style="display:none;"></div>
${content}
</main>

<!-- ==================== FOOTER ==================== -->
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/" class="footer-logo">
          <div class="fli"><i class="fas fa-dragon"></i></div>
          <span id="footerSiteName">${siteName}</span>
        </a>
        <p class="footer-tagline" id="footerTagline">Your world of anime, unlocked.</p>
        <div class="footer-social" id="footerSocial">
          <!-- Populated dynamically from DB settings -->
        </div>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Browse</h4>
          <a href="/search?status=Ongoing">Ongoing</a>
          <a href="/search?status=Completed">Completed</a>
          <a href="/search?type=Movie">Movies</a>
          <a href="/schedule">Schedule</a>
        </div>
        <div class="footer-col">
          <h4>Genres</h4>
          <a href="/search?genre=Action">Action</a>
          <a href="/search?genre=Fantasy">Fantasy</a>
          <a href="/search?genre=Adventure">Adventure</a>
          <a href="/search?genre=Historical">Historical</a>
          <a href="/search?genre=Martial+Arts">Martial Arts</a>
        </div>
        <div class="footer-col">
          <h4>Account</h4>
          <a href="/user/register">Register</a>
          <a href="/user/login">Sign In</a>
          <a href="/user/watchlist">Watchlist</a>
          <a href="/user/membership">Membership</a>
        </div>
        <div class="footer-col">
          <h4>Support</h4>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms</a>
          <a href="/dmca">DMCA</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p id="footerCopy">© 2026 ${siteName}. All rights reserved.</p>
      <p>This site only provides web page services and does not store any content.</p>
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
</body>
</html>`
}
