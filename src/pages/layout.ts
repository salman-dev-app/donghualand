// Layout template matching donghualand.vip reference exactly

const GOOGLE_TRANSLATE_SCRIPT = `<!-- Hidden Google Translate element -->
<div id="google_translate_element"></div>

<script>
/* ── Google Translate init ──────────────────────────────────── */
function googleTranslateElementInit(){
  new google.translate.TranslateElement({
    pageLanguage:'en',
    autoDisplay:false
  },'google_translate_element');
}
function gtLoadTranslate(){
  var s=document.createElement('script');
  s.async=true;
  s.src='https://cdn.wendycode.com/blogger/widget/google-translate-free.js?cb=googleTranslateElementInit';
  document.body.appendChild(s);
}
(function(){
  var stored=localStorage.getItem('wcGoogleTj');
  if(stored==='true'){ gtLoadTranslate(); return; }
  var done=false;
  function go(){ if(done)return; done=true; gtLoadTranslate(); localStorage.setItem('wcGoogleTj','true'); }
  window.addEventListener('scroll',go,{once:true,passive:true});
  window.addEventListener('click',go,{once:true});
})();

/* ── Custom dropdown that drives Google Translate ───────────── */
(function(){
  var LANGUAGES = [
    {gt:'none',flag:'\\u{1F6AB}', name:'No Translate', group:'No Translate'},
    {gt:'en',  flag:'\\u{1F1FA}\\u{1F1F8}', name:'English', group:'Popular'},
    {gt:'ja',  flag:'\\u{1F1EF}\\u{1F1F5}', name:'\\u65E5\\u672C\\u8A9E', group:'Popular'},
    {gt:'zh-CN',flag:'\\u{1F1E8}\\u{1F1F3}',name:'\\u4E2D\\u6587 (\\u7B80\\u4F53)', group:'Popular'},
    {gt:'zh-TW',flag:'\\u{1F1F9}\\u{1F1FC}',name:'\\u4E2D\\u6587 (\\u7E41\\u9AD4)', group:'Popular'},
    {gt:'ko',  flag:'\\u{1F1F0}\\u{1F1F7}', name:'\\uD55C\\uAD6D\\uC5B4', group:'Popular'},
    {gt:'es',  flag:'\\u{1F1EA}\\u{1F1F8}', name:'Espa\\u00F1ol', group:'Popular'},
    {gt:'pt',  flag:'\\u{1F1E7}\\u{1F1F7}', name:'Portugu\\u00EAs', group:'Popular'},
    {gt:'fr',  flag:'\\u{1F1EB}\\u{1F1F7}', name:'Fran\\u00E7ais', group:'Popular'},
    {gt:'de',  flag:'\\u{1F1E9}\\u{1F1EA}', name:'Deutsch', group:'Popular'},
    {gt:'ar',  flag:'\\u{1F1F8}\\u{1F1E6}', name:'\\u0627\\u0644\\u0639\\u0631\\u0628\\u064A\\u0629', group:'Popular'},
    {gt:'ru',  flag:'\\u{1F1F7}\\u{1F1FA}', name:'\\u0420\\u0443\\u0441\\u0441\\u043A\\u0438\\u0439', group:'Popular'},
    {gt:'tr',  flag:'\\u{1F1F9}\\u{1F1F7}', name:'T\\u00FCrk\\u00E7e', group:'Popular'},
    {gt:'it',  flag:'\\u{1F1EE}\\u{1F1F9}', name:'Italiano', group:'Popular'},
    {gt:'pl',  flag:'\\u{1F1F5}\\u{1F1F1}', name:'Polski', group:'Popular'},
    {gt:'nl',  flag:'\\u{1F1F3}\\u{1F1F1}', name:'Nederlands', group:'Popular'},
    {gt:'hi',  flag:'\\u{1F1EE}\\u{1F1F3}', name:'\\u0939\\u093F\\u0928\\u094D\\u0926\\u0940', group:'Popular'},
    {gt:'id',  flag:'\\u{1F1EE}\\u{1F1E9}', name:'Bahasa Indonesia', group:'Popular'},
    {gt:'sv',  flag:'\\u{1F1F8}\\u{1F1EA}', name:'Svenska', group:'Europe'},
    {gt:'no',  flag:'\\u{1F1F3}\\u{1F1F4}', name:'Norsk', group:'Europe'},
    {gt:'da',  flag:'\\u{1F1E9}\\u{1F1F0}', name:'Dansk', group:'Europe'},
    {gt:'fi',  flag:'\\u{1F1EB}\\u{1F1EE}', name:'Suomi', group:'Europe'},
    {gt:'cs',  flag:'\\u{1F1E8}\\u{1F1FF}', name:'\\u010Ce\\u0161tina', group:'Europe'},
    {gt:'sk',  flag:'\\u{1F1F8}\\u{1F1F0}', name:'Sloven\\u010Dina', group:'Europe'},
    {gt:'hu',  flag:'\\u{1F1ED}\\u{1F1FA}', name:'Magyar', group:'Europe'},
    {gt:'ro',  flag:'\\u{1F1F7}\\u{1F1F4}', name:'Rom\\u00E2n\\u0103', group:'Europe'},
    {gt:'bg',  flag:'\\u{1F1E7}\\u{1F1EC}', name:'\\u0411\\u044A\\u043B\\u0433\\u0430\\u0440\\u0441\\u043A\\u0438', group:'Europe'},
    {gt:'hr',  flag:'\\u{1F1ED}\\u{1F1F7}', name:'Hrvatski', group:'Europe'},
    {gt:'sr',  flag:'\\u{1F1F7}\\u{1F1F8}', name:'Srpski', group:'Europe'},
    {gt:'sl',  flag:'\\u{1F1F8}\\u{1F1EE}', name:'Sloven\\u0161\\u010Dina', group:'Europe'},
    {gt:'uk',  flag:'\\u{1F1FA}\\u{1F1E6}', name:'\\u0423\\u043A\\u0440\\u0430\\u0457\\u043D\\u0441\\u044C\\u043A\\u0430', group:'Europe'},
    {gt:'el',  flag:'\\u{1F1EC}\\u{1F1F7}', name:'\\u0395\\u03BB\\u03BB\\u03B7\\u03BD\\u03B9\\u03BA\\u03AC', group:'Europe'},
    {gt:'lt',  flag:'\\u{1F1F1}\\u{1F1F9}', name:'Lietuvi\\u0173', group:'Europe'},
    {gt:'lv',  flag:'\\u{1F1F1}\\u{1F1FB}', name:'Latvie\\u0161u', group:'Europe'},
    {gt:'et',  flag:'\\u{1F1EA}\\u{1F1EA}', name:'Eesti', group:'Europe'},
    {gt:'fa',  flag:'\\u{1F1EE}\\u{1F1F7}', name:'\\u0641\\u0627\\u0631\\u0633\\u06CC', group:'Middle East'},
    {gt:'he',  flag:'\\u{1F1EE}\\u{1F1F1}', name:'\\u05E2\\u05D1\\u05E8\\u05D9\\u05EA', group:'Middle East'},
    {gt:'ur',  flag:'\\u{1F1F5}\\u{1F1F0}', name:'\\u0627\\u0631\\u062F\\u0648', group:'Middle East'},
    {gt:'ar',  flag:'\\u{1F1F8}\\u{1F1E6}', name:'\\u0627\\u0644\\u0639\\u0631\\u0628\\u064A\\u0629', group:'Middle East'},
    {gt:'bn',  flag:'\\u{1F1E7}\\u{1F1E9}', name:'\\u09AC\\u09BE\\u0982\\u09B2\\u09BE', group:'Asia Pacific'},
    {gt:'ta',  flag:'\\u{1F1EE}\\u{1F1F3}', name:'\\u0BA4\\u0BAE\\u0BBF\\u0BB4\\u0BCD', group:'Asia Pacific'},
    {gt:'th',  flag:'\\u{1F1F9}\\u{1F1ED}', name:'\\u0E20\\u0E32\\u0E29\\u0E32\\u0E44\\u0E17\\u0E22', group:'Asia Pacific'},
    {gt:'vi',  flag:'\\u{1F1FB}\\u{1F1F3}', name:'Ti\\u1EBFng Vi\\u1EC7t', group:'Asia Pacific'},
    {gt:'ms',  flag:'\\u{1F1F2}\\u{1F1FE}', name:'Bahasa Melayu', group:'Asia Pacific'},
    {gt:'tl',  flag:'\\u{1F1F5}\\u{1F1ED}', name:'Filipino', group:'Asia Pacific'},
    {gt:'sw',  flag:'\\u{1F1F0}\\u{1F1EA}', name:'Kiswahili', group:'Africa'},
    {gt:'am',  flag:'\\u{1F1EA}\\u{1F1F9}', name:'\\u12A0\\u121B\\u122D\\u129B', group:'Africa'},
  ];

  var currentLang = localStorage.getItem('gt_lang') || 'en';

  function selectLang(lang){
    currentLang = lang.gt;
    localStorage.setItem('gt_lang', lang.gt);
    var lbl = document.getElementById('gtLangCurrent');
    if(lbl) lbl.textContent = lang.gt.split('-')[0].toUpperCase();
    var sw = document.getElementById('langSwitcher');
    if(sw) sw.classList.remove('open');
    buildList(document.getElementById('gtLangSearch') ? document.getElementById('gtLangSearch').value : '');

    if(lang.gt === 'none' || lang.gt === 'en'){
      var selEn = document.querySelector('.goog-te-combo');
      if(selEn){
        selEn.value = 'en';
        selEn.dispatchEvent(new Event('change'));
      }
      if(lang.gt === 'none'){
        var lbl2 = document.getElementById('gtLangCurrent');
        if(lbl2) lbl2.textContent = 'OFF';
      }
      return;
    }

    function trySwitch(){
      var sel = document.querySelector('.goog-te-combo');
      if(sel){ sel.value = lang.gt; sel.dispatchEvent(new Event('change')); return true; }
      return false;
    }

    if(trySwitch()) return;

    if(localStorage.getItem('wcGoogleTj') !== 'true'){
      gtLoadTranslate();
      localStorage.setItem('wcGoogleTj','true');
    }
    var attempts = 0;
    var iv = setInterval(function(){
      if(trySwitch()){ clearInterval(iv); return; }
      if(++attempts > 60){ clearInterval(iv); }
    }, 100);
  }

  function buildList(filter){
    var list = document.getElementById('gtLangList');
    if(!list) return;
    var q = (filter||'').toLowerCase().trim();
    var filtered = q ? LANGUAGES.filter(function(l){
      return l.name.toLowerCase().includes(q) || l.gt.toLowerCase().includes(q);
    }) : LANGUAGES;

    var groups = {};
    filtered.forEach(function(l){
      (groups[l.group] = groups[l.group]||[]).push(l);
    });

    list.innerHTML = '';
    Object.keys(groups).forEach(function(g){
      if(!q){
        var lbl = document.createElement('div');
        lbl.className = 'lang-group-label';
        lbl.textContent = g;
        list.appendChild(lbl);
      }
      groups[g].forEach(function(l){
        var el = document.createElement('div');
        el.className = 'lang-item notranslate' + (l.gt === 'none' ? ' no-translate' : '') + (l.gt === currentLang ? ' active' : '');
        el.setAttribute('translate', 'no');
        el.innerHTML = '<span class="lang-flag" translate="no">'+l.flag+'</span>'
          +'<span class="lang-name" translate="no">'+l.name+'</span>'
          +'<span class="lang-code-badge" translate="no">'+l.gt+'</span>';
        el.addEventListener('click', function(){ selectLang(l); });
        list.appendChild(el);
      });
    });

    if(!filtered.length){
      list.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted,#888);font-size:13px;">No language found</div>';
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    var sw     = document.getElementById('langSwitcher');
    var btn    = document.getElementById('gtLangBtn');
    var search = document.getElementById('gtLangSearch');
    if(!sw) return;

    var saved = LANGUAGES.find(function(l){ return l.gt === currentLang; }) || LANGUAGES[0];
    var lbl = document.getElementById('gtLangCurrent');
    if(lbl) lbl.textContent = saved.gt.split('-')[0].toUpperCase();

    buildList('');

    if(currentLang && currentLang !== 'en'){
      if(localStorage.getItem('wcGoogleTj') !== 'true'){
        gtLoadTranslate();
        localStorage.setItem('wcGoogleTj','true');
      }
      var autoAttempts = 0;
      var autoIv = setInterval(function(){
        var sel = document.querySelector('.goog-te-combo');
        if(sel){
          sel.value = currentLang;
          sel.dispatchEvent(new Event('change'));
          clearInterval(autoIv);
          return;
        }
        if(++autoAttempts > 80) clearInterval(autoIv);
      }, 100);
    }

    btn.addEventListener('click', function(e){
      e.stopPropagation();
      sw.classList.toggle('open');
      if(sw.classList.contains('open')) setTimeout(function(){ if(search) search.focus(); }, 60);
    });

    if(search){
      search.addEventListener('input', function(){ buildList(this.value); });
      search.addEventListener('keydown', function(e){ e.stopPropagation(); });
    }

    document.addEventListener('click', function(e){
      if(!sw.contains(e.target)) sw.classList.remove('open');
    });
  });
})();
</script>`

const NAVBAR_HTML = `
<script>
function updateHeaderAvatar(url) {
  if (!url) return;
  const btn = document.getElementById('navUserBtn');
  if (btn) {
    let img = btn.querySelector('.nav-user-avatar-img');
    const fallback = btn.querySelector('.nav-user-avatar-fallback, .nav-user-avatar');
    if (img) {
      img.src = url;
      img.style.display = '';
      if (fallback && fallback !== img) fallback.style.display = 'none';
    } else {
      const newImg = document.createElement('img');
      newImg.src = url;
      newImg.alt = 'Avatar';
      newImg.className = 'nav-user-avatar nav-user-avatar-img';
      newImg.setAttribute('data-user-avatar', '');
      newImg.onerror = function(){ this.style.display='none'; if(fallback) fallback.style.display='flex'; };
      if (fallback) {
        fallback.parentNode.insertBefore(newImg, fallback);
        fallback.style.display = 'none';
      } else if (btn.firstChild) {
        btn.insertBefore(newImg, btn.firstChild);
      } else {
        btn.appendChild(newImg);
      }
    }
  }
  const ddAvatar = document.querySelector('.nav-user-dropdown-avatar');
  if (ddAvatar) {
    ddAvatar.src = url;
  } else {
    const info = document.querySelector('.nav-user-info');
    if (info) {
      const img2 = document.createElement('img');
      img2.src = url;
      img2.alt = '';
      img2.className = 'nav-user-dropdown-avatar';
      info.insertBefore(img2, info.firstChild);
    }
  }
}
</script>

<!-- Navigation -->
<nav class="navbar" id="navbar">
  <div class="nav-inner">
    <a href="/" class="nav-logo" id="navLogoLink">
      <img src="https://donghuaplanet.xyz/wp-content/uploads/2026/03/Untitled_design__2_-removebg-preview.png" alt="Donghualand" id="navLogoImg">
    </a>

    <ul class="nav-links" id="navLinks">
      <li><a href="/az-list" style="white-space:nowrap">A-Z</a></li>
      <li><a href="/bookmarks"><i data-lucide="bookmark" class="icon-xs"></i> Bookmarks</a></li>
      <li class="dropdown">
        <a href="#" class="dropdown-toggle">Genre <i data-lucide="chevron-down" class="icon-xs"></i></a>
        <div class="dropdown-menu" id="genreDropdown">
          <div class="genre-loading">Loading...</div>
        </div>
      </li>
    </ul>

    <div class="nav-actions">

      <!-- Desktop: inline search bar -->
      <div class="nav-search" id="navSearch">
        <i data-lucide="search" class="nav-search-icon"></i>
        <input type="text" id="liveSearchInput" placeholder="Search anime..." autocomplete="off">
        <div class="search-results" id="searchResults"></div>
      </div>

      <!-- Mobile: search icon button -->
      <button class="search-icon-btn" id="searchIconBtn" aria-label="Search">
        <i data-lucide="search"></i>
      </button>

      <!-- Theme Toggle -->
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
        <i data-lucide="sun" class="icon-sun"></i>
        <i data-lucide="moon" class="icon-moon"></i>
      </button>
      
      <!-- Language Switcher (Google Translate powered) -->
      <div class="lang-switcher" id="langSwitcher">
        <button class="lang-btn notranslate" id="gtLangBtn" aria-label="Change language" translate="no">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span class="lang-current" id="gtLangCurrent">EN</span>
          <svg class="chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="lang-dropdown notranslate" id="langDropdown" translate="no">
          <div class="lang-search-wrap notranslate" translate="no">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="gtLangSearch" placeholder="Search language..." autocomplete="off">
          </div>
          <div class="lang-list" id="gtLangList"></div>
        </div>
      </div>

      <!-- User Auth -->
      <a href="/user/login" class="btn btn-primary btn-sm nav-login-btn" id="navLoginBtn" aria-label="Sign In">
        <i data-lucide="log-in" style="width:16px;height:16px"></i>
      </a>
      
      <button class="menu-toggle" id="menuToggle" aria-label="Menu">
        <i data-lucide="menu"></i>
      </button>
    </div>
  </div>

  <!-- Mobile: full navbar search overlay -->
  <div class="navbar-search-overlay" id="navbarSearchOverlay">
    <i data-lucide="search" style="color:var(--text-muted);width:18px;height:18px;flex-shrink:0"></i>
    <input type="text" id="overlaySearchInput" placeholder="Search anime..." autocomplete="off">
    <button class="overlay-close" id="overlayClose">
      <i data-lucide="x"></i>
    </button>
  </div>

</nav>

<!-- Mobile search results (full width below navbar) -->
<div class="overlay-search-results" id="overlaySearchResults"></div>`

const FOOTER_HTML = `
<!-- Footer -->
<footer class="site-footer">
  <div class="footer-inner">

    <!-- A-Z List Section (desktop only) -->
    <div class="footer-azlist">
      <div class="footer-azlist-header">
        <span class="footer-azlist-title">A-Z LIST</span>
        <span class="footer-azlist-divider">|</span>
        <span class="footer-azlist-subtitle">Searching order by alphabet name A to Z.</span>
      </div>
      <div class="footer-azlist-letters">
        <a href="/az-list?letter=%23" class="az-letter-btn">#</a>
        <a href="/az-list?letter=0-9" class="az-letter-btn">0-9</a>
        <a href="/az-list?letter=A" class="az-letter-btn">A</a>
        <a href="/az-list?letter=B" class="az-letter-btn">B</a>
        <a href="/az-list?letter=C" class="az-letter-btn">C</a>
        <a href="/az-list?letter=D" class="az-letter-btn">D</a>
        <a href="/az-list?letter=E" class="az-letter-btn">E</a>
        <a href="/az-list?letter=F" class="az-letter-btn">F</a>
        <a href="/az-list?letter=G" class="az-letter-btn">G</a>
        <a href="/az-list?letter=H" class="az-letter-btn">H</a>
        <a href="/az-list?letter=I" class="az-letter-btn">I</a>
        <a href="/az-list?letter=J" class="az-letter-btn">J</a>
        <a href="/az-list?letter=K" class="az-letter-btn">K</a>
        <a href="/az-list?letter=L" class="az-letter-btn">L</a>
        <a href="/az-list?letter=M" class="az-letter-btn">M</a>
        <a href="/az-list?letter=N" class="az-letter-btn">N</a>
        <a href="/az-list?letter=O" class="az-letter-btn">O</a>
        <a href="/az-list?letter=P" class="az-letter-btn">P</a>
        <a href="/az-list?letter=Q" class="az-letter-btn">Q</a>
        <a href="/az-list?letter=R" class="az-letter-btn">R</a>
        <a href="/az-list?letter=S" class="az-letter-btn">S</a>
        <a href="/az-list?letter=T" class="az-letter-btn">T</a>
        <a href="/az-list?letter=U" class="az-letter-btn">U</a>
        <a href="/az-list?letter=V" class="az-letter-btn">V</a>
        <a href="/az-list?letter=W" class="az-letter-btn">W</a>
        <a href="/az-list?letter=X" class="az-letter-btn">X</a>
        <a href="/az-list?letter=Y" class="az-letter-btn">Y</a>
        <a href="/az-list?letter=Z" class="az-letter-btn">Z</a>
      </div>
    </div>

    <div class="footer-top">
      <div class="footer-brand">
        <a href="/" class="footer-logo" id="footerLogoLink">
          Donghualand
        </a>
        <p>Watch anime online</p>
      </div>
      <div class="footer-links">
        <h4>Browse</h4>
        <ul>
          <li><a href="/search?type=TV">TV Series</a></li>
          <li><a href="/search?type=Movie">Movies</a></li>
          <li><a href="/search?type=OVA">OVA</a></li>
          <li><a href="/search?status=Ongoing">Ongoing</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 Donghualand. All rights reserved.</p>
      <p class="footer-note">This site only provides web page services and does not host or store any content.</p>
    </div>
  </div>
</footer>`

const BOTTOM_NAV_HTML = `
<!-- Bottom Navigation (Mobile Only) -->
<nav class="bottom-nav" id="bottomNav">
  <a href="/" class="bnav-item" id="bnav-home">
    <i data-lucide="home"></i>
    <span>Home</span>
  </a>
  <a href="/search" class="bnav-item" id="bnav-browse">
    <i data-lucide="compass"></i>
    <span>Browse</span>
  </a>
  <button class="bnav-item bnav-search-wrap" id="bnav-search" onclick="if(typeof toggleNavSearch==='function')toggleNavSearch();">
    <i data-lucide="search"></i>
    <span>Search</span>
  </button>
  <a href="/bookmarks" class="bnav-item" id="bnav-bookmarks">
    <i data-lucide="bookmark"></i>
    <span>Bookmarks</span>
  </a>
  <a href="/user/login" class="bnav-item" id="bnav-profile">
    <i data-lucide="user"></i>
    <span>Profile</span>
  </a>
</nav>`

export function layout(title: string, content: string, extraHead: string = '', description: string = 'Watch anime online in HD'): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="icon" href="https://donghuaplanet.xyz/wp-content/uploads/2026/03/wp11200837.jpg" type="image/x-icon">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/style.css">
<script>
  (function(){
    const mode = 'both';
    const stored = localStorage.getItem('theme');
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme','dark');
    } else if (mode === 'light') {
      document.documentElement.setAttribute('data-theme','light');
    } else {
      document.documentElement.setAttribute('data-theme', stored || 'dark');
    }
  })();
</script>
<style>
:root {
  --color-primary: #6652ff;
  --color-secondary: #00295c;
}
</style>
${GOOGLE_TRANSLATE_SCRIPT}
${extraHead}
</head>
<body>

${NAVBAR_HTML}

<main class="main-content">
${content}
</main>

${FOOTER_HTML}

${BOTTOM_NAV_HTML}

<!-- Lucide Icons -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script>window.adblockEnabled = false;</script>
<script src="/static/app.js"></script>
</body>
</html>`
}
