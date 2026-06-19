// Admin Login Page - shown at /admin
export function adminLoginPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login</title>
<link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a0f;
  --bg2: #0f0f17;
  --bg3: #13131e;
  --bg4: #1a1a2e;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.12);
  --purple: #6c5ce7;
  --purple2: #a29bfe;
  --text1: #f0f0f5;
  --text2: #c0c0d0;
  --text3: #808090;
  --text4: #505060;
  --red: #e84040;
  --green: #00d084;
  --r8: 8px;
  --r12: 12px;
}
body {
  background: var(--bg);
  color: var(--text1);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.login-wrap {
  width: 100%;
  max-width: 400px;
}
.login-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.login-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 8px;
  text-decoration: none;
}
.login-logo-icon {
  width: 42px; height: 42px;
  background: linear-gradient(135deg, var(--purple), #8b5cf6);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: #fff;
}
.login-logo-text {
  font-size: 22px; font-weight: 800; color: var(--text1);
}
.login-logo-text span { color: var(--purple2); }
.login-badge {
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--text3);
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.login-badge::before, .login-badge::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}
h1.login-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text1);
  text-align: center;
  margin-bottom: 6px;
}
.login-sub {
  font-size: 13px;
  color: var(--text3);
  text-align: center;
  margin-bottom: 24px;
}
.form-group {
  margin-bottom: 16px;
}
.form-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text2);
  margin-bottom: 7px;
}
.input-wrap { position: relative; }
.form-input {
  width: 100%;
  background: var(--bg4);
  border: 1px solid var(--border2);
  border-radius: var(--r8);
  padding: 11px 14px;
  color: var(--text1);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}
.form-input:focus { border-color: var(--purple); }
.form-input::placeholder { color: var(--text4); }
.input-eye {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text3);
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
}
.input-eye:hover { color: var(--text1); }
.btn-login {
  width: 100%;
  background: linear-gradient(135deg, var(--purple), #8b5cf6);
  color: #fff;
  border: none;
  border-radius: var(--r8);
  padding: 13px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  margin-top: 8px;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-login:hover { opacity: 0.9; }
.btn-login:active { transform: scale(0.99); }
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
.error-msg {
  background: rgba(232,64,64,0.1);
  border: 1px solid rgba(232,64,64,0.3);
  border-radius: var(--r8);
  padding: 12px;
  font-size: 13px;
  color: var(--red);
  margin-bottom: 16px;
  display: none;
  align-items: center;
  gap: 8px;
}
.error-msg.show { display: flex; }
.back-link {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: var(--text3);
}
.back-link a {
  color: var(--purple2);
  text-decoration: none;
}
.back-link a:hover { text-decoration: underline; }
.security-note {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(108,92,231,0.08);
  border: 1px solid rgba(108,92,231,0.2);
  border-radius: var(--r8);
  padding: 10px 12px;
  font-size: 11px;
  color: var(--text3);
  margin-top: 20px;
}
.security-note i { color: var(--purple2); font-size: 12px; flex-shrink: 0; }
</style>
</head>
<body>
<div class="login-wrap">
  <div class="login-card">
    <a href="/" class="login-logo">
      <div class="login-logo-icon"><i class="fas fa-dragon"></i></div>
      <div class="login-logo-text">Admin<span>Panel</span></div>
    </a>
    <div class="login-badge">Admin Panel</div>

    <h1 class="login-title">Welcome Back, Admin</h1>
    <p class="login-sub">Sign in to manage your anime platform</p>

    <div class="error-msg" id="errorMsg">
      <i class="fas fa-exclamation-circle"></i>
      <span id="errorText">Invalid credentials</span>
    </div>

    <form id="adminLoginForm" onsubmit="doAdminLogin(event)">
      <div class="form-group">
        <label class="form-label">Username</label>
        <input type="text" class="form-input" id="adminUser" placeholder="Admin username"
               autocomplete="username" required>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="input-wrap">
          <input type="password" class="form-input" id="adminPass" placeholder="Admin password"
                 autocomplete="current-password" required>
          <i class="fas fa-eye input-eye" id="eyeIcon" onclick="togglePwd()"></i>
        </div>
      </div>
      <button type="submit" class="btn-login" id="loginBtn">
        <i class="fas fa-lock-open"></i> Sign In to Admin Panel
      </button>
    </form>

    <div class="security-note">
      <i class="fas fa-shield-alt"></i>
      Credentials are loaded from server environment variables. Contact your server administrator if you cannot log in.
    </div>

    <div class="back-link">
      <a href="/"><i class="fas fa-arrow-left"></i> Back to Site</a>
    </div>
  </div>
</div>

<script>
function togglePwd() {
  const inp = document.getElementById('adminPass');
  const eye = document.getElementById('eyeIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    eye.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    inp.type = 'password';
    eye.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

async function doAdminLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const errEl = document.getElementById('errorMsg');
  const errText = document.getElementById('errorText');
  const username = document.getElementById('adminUser').value.trim();
  const password = document.getElementById('adminPass').value;

  if (!username || !password) {
    errText.textContent = 'Please enter both username and password';
    errEl.classList.add('show');
    return;
  }

  errEl.classList.remove('show');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success && data.token) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      btn.innerHTML = '<i class="fas fa-check"></i> Logged in! Redirecting...';
      setTimeout(() => { window.location.href = '/admin/panel'; }, 600);
    } else {
      errText.textContent = data.error || 'Invalid credentials. Please check username and password.';
      errEl.classList.add('show');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-lock-open"></i> Sign In to Admin Panel';
    }
  } catch (err) {
    errText.textContent = 'Connection error. Please try again.';
    errEl.classList.add('show');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock-open"></i> Sign In to Admin Panel';
  }
}

// If already logged in as admin, redirect to panel
const existingToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
if (existingToken) {
  fetch('/api/admin/verify', {
    headers: { 'Authorization': 'Bearer ' + existingToken }
  }).then(r => r.json()).then(d => {
    if (d.success) window.location.href = '/admin/panel';
  }).catch(() => {});
}
</script>
</body>
</html>`
}

// Admin Panel Page - shown at /admin/panel (requires JS auth check)
export function adminPanelPage(section: string = 'dashboard') {
  const nav = [
    { id: 'dashboard', icon: 'fas fa-chart-pie', label: 'Dashboard' },
    { id: 'anime', icon: 'fas fa-dragon', label: 'Anime List' },
    { id: 'add-anime', icon: 'fas fa-plus-circle', label: 'Add Anime' },
    { id: 'episodes', icon: 'fas fa-film', label: 'Episodes' },
    { id: 'users', icon: 'fas fa-users', label: 'Users' },
    { id: 'comments', icon: 'fas fa-comments', label: 'Comments' },
    { id: 'schedule', icon: 'fas fa-calendar-alt', label: 'Schedule' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Settings' },
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Panel</title>
<link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
<link rel="stylesheet" href="/static/style.css">
<style>
.admin-layout { display:flex; min-height:100vh; }
.admin-sidebar {
  width:220px; flex-shrink:0;
  background:var(--bg2); border-right:1px solid var(--border);
  padding:16px 0; overflow-y:auto;
  position:fixed; top:0; left:0; bottom:0;
  z-index:100;
}
.admin-logo-row { padding:4px 18px 18px; border-bottom:1px solid var(--border); margin-bottom:8px; }
.admin-logo-row a { font-size:16px; font-weight:800; color:var(--text1); display:flex; align-items:center; gap:8px; text-decoration:none; }
.admin-logo-row a i { color:var(--purple2); }
.admin-logo-row .sub { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:1px; margin-top:3px; font-weight:700; }
.admin-nav-item {
  display:flex; align-items:center; gap:10px;
  padding:9px 18px; font-size:13px; font-weight:500; color:var(--text3);
  cursor:pointer; transition:all 0.15s;
  border-right: 2px solid transparent;
}
.admin-nav-item:hover { color:var(--text1); background:rgba(255,255,255,0.04); }
.admin-nav-item.active { color:var(--purple2); background:var(--purple-dim); border-right:2px solid var(--purple); }
.admin-nav-item i { width:16px; text-align:center; font-size:13px; }
.admin-nav-sep { height:1px; background:var(--border); margin:8px 0; }
.admin-main { flex:1; margin-left:220px; padding:24px; min-width:0; background:var(--bg); min-height:100vh; }
.admin-page { display:none; }
.admin-page.active { display:block; }
.admin-page-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; flex-wrap:wrap; gap:12px; }
.admin-page-title { font-size:20px; font-weight:800; color:var(--text1); }
.admin-btn {
  display:inline-flex; align-items:center; gap:7px;
  padding:8px 18px; border-radius:var(--r8);
  font-size:13px; font-weight:700; cursor:pointer; transition:all 0.15s;
  font-family:inherit;
}
.admin-btn-purple { background:var(--purple); color:#fff; border:none; }
.admin-btn-purple:hover { background:var(--purple2); }
.admin-btn-outline { background:transparent; color:var(--text2); border:1px solid var(--border2); }
.admin-btn-outline:hover { border-color:var(--purple); color:var(--purple2); }
.admin-btn-danger { background:rgba(232,64,64,0.1); color:var(--red); border:1px solid rgba(232,64,64,0.3); }
.admin-btn-danger:hover { background:var(--red); color:#fff; }
.stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:14px; margin-bottom:28px; }
.stat-card { background:var(--bg3); border:1px solid var(--border); border-radius:var(--r12); padding:18px; display:flex; align-items:center; gap:14px; }
.stat-icon { width:46px; height:46px; border-radius:var(--r10); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
.si-purple { background:var(--purple-dim); color:var(--purple2); }
.si-green  { background:rgba(0,208,132,0.12); color:var(--green); }
.si-blue   { background:rgba(52,152,219,0.12); color:var(--blue); }
.si-gold   { background:rgba(241,196,15,0.12); color:var(--gold); }
.stat-num { font-size:28px; font-weight:900; color:var(--text1); line-height:1; }
.stat-desc { font-size:12px; color:var(--text3); margin-top:2px; }
.admin-table-card { background:var(--bg3); border:1px solid var(--border); border-radius:var(--r12); overflow:hidden; margin-bottom:20px; }
.admin-tc-head { padding:14px 18px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
.admin-tc-title { font-size:14px; font-weight:700; color:var(--text1); }
.admin-tbl { width:100%; border-collapse:collapse; }
.admin-tbl th { padding:10px 14px; text-align:left; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:var(--text3); border-bottom:1px solid var(--border); background:var(--bg4); }
.admin-tbl td { padding:11px 14px; border-bottom:1px solid var(--border); font-size:13px; color:var(--text2); vertical-align:middle; }
.admin-tbl tr:last-child td { border-bottom:none; }
.admin-tbl tr:hover td { background:var(--bg4); }
.anime-cell-wrap { display:flex; align-items:center; gap:10px; }
.cell-poster { width:36px; height:50px; border-radius:4px; object-fit:cover; flex-shrink:0; }
.cell-name { font-size:13px; font-weight:600; color:var(--text1); }
.cell-native { font-size:11px; color:var(--text3); }
.tbl-act { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.tbl-btn { padding:5px 10px; border-radius:var(--r6); font-size:11px; font-weight:700; cursor:pointer; transition:all 0.15s; white-space:nowrap; border:1px solid transparent; font-family:inherit; }
.tbl-edit { background:var(--purple-dim); color:var(--purple2); border-color:rgba(108,92,231,0.3); }
.tbl-edit:hover { background:var(--purple); color:#fff; }
.tbl-del { background:rgba(232,64,64,0.08); color:var(--red); border-color:rgba(232,64,64,0.25); }
.tbl-del:hover { background:var(--red); color:#fff; }
.tbl-ep { background:rgba(52,152,219,0.1); color:var(--blue); border-color:rgba(52,152,219,0.3); }
.tbl-ep:hover { background:var(--blue); color:#fff; }
.tbl-unban { background:rgba(0,208,132,0.1); color:var(--green); border-color:rgba(0,208,132,0.3); }
.tbl-unban:hover { background:var(--green); color:#fff; }
.admin-search-row { display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
.admin-search-input { flex:1; min-width:200px; background:var(--bg4); border:1px solid var(--border2); border-radius:var(--r8); padding:9px 14px; color:var(--text1); font-size:13px; outline:none; transition:border-color 0.2s; font-family:inherit; }
.admin-search-input:focus { border-color:var(--purple); }
.admin-select { background:var(--bg4); border:1px solid var(--border2); border-radius:var(--r8); padding:9px 12px; color:var(--text1); font-size:13px; outline:none; font-family:inherit; }
.admin-form-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.admin-form-grid .full { grid-column:1/-1; }
.admin-fg { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
.admin-fg:last-child { margin-bottom:0; }
.admin-lbl { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--text2); }
.admin-inp, .admin-sel, .admin-ta {
  background:var(--bg4); border:1px solid var(--border2); border-radius:var(--r8);
  padding:10px 12px; color:var(--text1); font-size:13px; outline:none;
  transition:border-color 0.2s; width:100%; font-family:inherit;
}
.admin-inp:focus, .admin-sel:focus, .admin-ta:focus { border-color:var(--purple); }
.admin-ta { min-height:100px; resize:vertical; }
.admin-sel option { background:var(--bg4); }
.admin-check { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text2); cursor:pointer; }
.admin-check input { accent-color:var(--purple); width:16px; height:16px; }
.form-section-title { font-size:13px; font-weight:800; color:var(--text1); margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid var(--border); }
.tmdb-panel { background:var(--bg4); border:1px solid var(--border); border-radius:var(--r10); padding:16px; margin-bottom:20px; }
.tmdb-hd { font-size:13px; font-weight:700; color:var(--text1); margin-bottom:12px; display:flex; align-items:center; gap:7px; }
.tmdb-hd i { color:var(--gold); }
.tmdb-inp-row { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
.tmdb-inp { flex:1; min-width:180px; background:var(--bg5,#1e1e30); border:1px solid var(--border2); border-radius:var(--r8); padding:9px 12px; color:var(--text1); font-size:13px; outline:none; font-family:inherit; }
.tmdb-inp:focus { border-color:var(--purple); }
.tmdb-results { display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:8px; max-height:280px; overflow-y:auto; margin-top:10px; }
.tmdb-r { background:var(--bg5,#1e1e30); border:1px solid var(--border); border-radius:var(--r8); overflow:hidden; cursor:pointer; transition:all 0.15s; }
.tmdb-r:hover { border-color:var(--purple); }
.tmdb-r img { width:100%; aspect-ratio:2/3; object-fit:cover; }
.tmdb-r-name { padding:5px 7px; font-size:11px; font-weight:600; color:var(--text1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tmdb-r-year { padding:0 7px 6px; font-size:10px; color:var(--text3); }
.img-upload-area { border:2px dashed var(--border2); border-radius:var(--r10); padding:20px; text-align:center; cursor:pointer; transition:all 0.15s; }
.img-upload-area:hover { border-color:var(--purple); background:var(--purple-dim); }
.img-upload-area i { font-size:28px; color:var(--text4); display:block; margin-bottom:8px; }
.img-upload-area p { font-size:13px; color:var(--text3); margin-bottom:4px; }
.img-upload-area span { font-size:11px; color:var(--text4); }
.settings-card { background:var(--bg3); border:1px solid var(--border); border-radius:var(--r12); padding:20px; margin-bottom:16px; }
.settings-title { font-size:14px; font-weight:700; color:var(--text1); margin-bottom:16px; }
.setting-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border); }
.setting-row:last-child { border-bottom:none; }
.setting-info .setting-name { font-size:13px; font-weight:600; color:var(--text1); }
.setting-info .setting-desc { font-size:12px; color:var(--text3); margin-top:2px; }
.page-btn { padding:6px 12px; background:var(--bg4); border:1px solid var(--border2); border-radius:var(--r6); color:var(--text2); font-size:12px; cursor:pointer; font-family:inherit; }
.page-btn.active { background:var(--purple); border-color:var(--purple); color:#fff; }
.page-btn:hover:not(.active) { border-color:var(--purple); color:var(--purple2); }
.badge { display:inline-flex; align-items:center; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:700; }
.badge-green { background:rgba(0,208,132,0.15); color:var(--green); }
.badge-blue { background:rgba(52,152,219,0.15); color:var(--blue); }
.badge-gray { background:rgba(255,255,255,0.07); color:var(--text3); }
.badge-purple { background:var(--purple-dim); color:var(--purple2); }
.toast-container { position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:8px; }
.toast { padding:12px 16px; border-radius:var(--r8); font-size:13px; font-weight:600; display:flex; align-items:center; gap:10px; animation:slideIn 0.3s ease; box-shadow:0 4px 20px rgba(0,0,0,0.4); max-width:320px; }
.toast-success { background:#1a3a2a; border:1px solid rgba(0,208,132,0.4); color:var(--green); }
.toast-error { background:#3a1a1a; border:1px solid rgba(232,64,64,0.4); color:var(--red); }
.toast-info { background:#1a1a3a; border:1px solid rgba(108,92,231,0.4); color:var(--purple2); }
@keyframes slideIn { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
@media(max-width:768px){
  .admin-sidebar { position:static; width:100%; height:auto; display:flex; overflow-x:auto; padding:6px 6px 0; border-right:none; border-bottom:1px solid var(--border); flex-shrink:0; }
  .admin-logo-row { display:none; }
  .admin-nav-item { flex-direction:column; gap:2px; font-size:9px; padding:8px 12px; flex-shrink:0; white-space:nowrap; border-right:none!important; border-bottom:2px solid transparent; }
  .admin-nav-item.active { border-bottom:2px solid var(--purple); background:var(--purple-dim); }
  .admin-nav-item i { font-size:18px; width:auto; }
  .admin-nav-sep { display:none; }
  .admin-layout { flex-direction:column; }
  .admin-main { margin-left:0; padding:14px 12px; }
  .admin-form-grid { grid-template-columns:1fr; }
  .admin-form-grid .full { grid-column:1; }
}
</style>
</head>
<body>

<div id="adminAuthCheck" style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-size:14px;color:var(--text3);">
  <div style="text-align:center;">
    <i class="fas fa-spinner fa-spin" style="font-size:28px;color:var(--purple);margin-bottom:12px;display:block;"></i>
    Verifying authentication...
  </div>
</div>

<div class="admin-layout" id="adminLayout" style="display:none;">

  <!-- Sidebar -->
  <aside class="admin-sidebar">
    <div class="admin-logo-row">
      <a href="/"><i class="fas fa-dragon"></i> DonghuaLand</a>
      <div class="sub">Admin Panel</div>
    </div>
    ${nav.map(item => `
    <div class="admin-nav-item" onclick="showPage('${item.id}')" id="nav-${item.id}">
      <i class="${item.icon}"></i> ${item.label}
    </div>`).join('')}
    <div class="admin-nav-sep"></div>
    <div class="admin-nav-item" onclick="window.open('/', '_blank')">
      <i class="fas fa-external-link-alt"></i> View Site
    </div>
    <div class="admin-nav-item" style="color:var(--red);" onclick="adminLogout()">
      <i class="fas fa-sign-out-alt"></i> Logout
    </div>
  </aside>

  <!-- Main content -->
  <div class="admin-main">

    <!-- ===== DASHBOARD ===== -->
    <div class="admin-page" id="admin-dashboard">
      <div class="admin-page-hd">
        <div class="admin-page-title">Dashboard</div>
        <span style="font-size:12px; color:var(--text3);" id="dashDate"></span>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon si-purple"><i class="fas fa-dragon"></i></div>
          <div><div class="stat-num" id="sAnime">—</div><div class="stat-desc">Total Anime</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon si-blue"><i class="fas fa-film"></i></div>
          <div><div class="stat-num" id="sEps">—</div><div class="stat-desc">Episodes</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon si-green"><i class="fas fa-users"></i></div>
          <div><div class="stat-num" id="sUsers">—</div><div class="stat-desc">Users</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon si-gold"><i class="fas fa-eye"></i></div>
          <div><div class="stat-num" id="sViews">—</div><div class="stat-desc">Total Views</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(52,231,219,0.1);color:#34e7db;"><i class="fas fa-comments"></i></div>
          <div><div class="stat-num" id="sComments">—</div><div class="stat-desc">Comments</div></div>
        </div>
      </div>
      <div class="admin-table-card">
        <div class="admin-tc-head">
          <div class="admin-tc-title">Recent Anime</div>
          <button class="admin-btn admin-btn-purple" onclick="showPage('add-anime')"><i class="fas fa-plus"></i> Add Anime</button>
        </div>
        <div style="overflow-x:auto;">
          <table class="admin-tbl">
            <thead><tr><th>Anime</th><th>Status</th><th>Episodes</th><th>Rating</th><th>Actions</th></tr></thead>
            <tbody id="dashRecentBody"><tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text3);"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== ANIME LIST ===== -->
    <div class="admin-page" id="admin-anime">
      <div class="admin-page-hd">
        <div class="admin-page-title">Anime List</div>
        <button class="admin-btn admin-btn-purple" onclick="showPage('add-anime')"><i class="fas fa-plus"></i> Add Anime</button>
      </div>
      <div class="admin-search-row">
        <input type="text" class="admin-search-input" placeholder="Search anime..." oninput="filterAnimeList(this.value)" id="animeListSearch">
        <select class="admin-select" onchange="filterAnimeStatus(this.value)">
          <option value="">All Status</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Upcoming">Upcoming</option>
        </select>
      </div>
      <div class="admin-table-card">
        <div style="overflow-x:auto;">
          <table class="admin-tbl">
            <thead><tr><th>Anime</th><th>Type</th><th>Status</th><th>Year</th><th>Rating</th><th>EPs</th><th>Actions</th></tr></thead>
            <tbody id="animeListBody"><tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text3);"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr></tbody>
          </table>
        </div>
      </div>
      <div id="animeListPager" style="display:flex;gap:8px;justify-content:center;padding:16px 0;flex-wrap:wrap;"></div>
    </div>

    <!-- ===== ADD / EDIT ANIME ===== -->
    <div class="admin-page" id="admin-add-anime">
      <div class="admin-page-hd">
        <div class="admin-page-title" id="addAnimeTitle">Add Anime</div>
        <button class="admin-btn admin-btn-outline" onclick="resetAnimeForm()"><i class="fas fa-undo"></i> Reset</button>
      </div>
      <input type="hidden" id="editAnimeId" value="">

      <div class="tmdb-panel">
        <div class="tmdb-hd"><i class="fas fa-magic"></i> Auto-fill from TMDB</div>
        <div class="tmdb-inp-row">
          <input type="text" class="tmdb-inp" id="tmdbQuery" placeholder="Search anime title in TMDB..." style="flex:2;">
          <button class="admin-btn admin-btn-purple" onclick="tmdbSearch()"><i class="fas fa-search"></i> Search TMDB</button>
        </div>
        <div style="font-size:11px; color:var(--text3);">TMDB API key is stored as a server secret.
          <a href="https://www.themoviedb.org/settings/api" target="_blank" style="color:var(--purple2);">Get free key →</a>
        </div>
        <div class="tmdb-results" id="tmdbResults"></div>
      </div>

      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r12);padding:22px;">
        <div class="form-section-title">Basic Information</div>
        <div class="admin-form-grid">
          <div class="admin-fg full"><label class="admin-lbl">Title *</label><input type="text" class="admin-inp" id="fTitle" placeholder="e.g. Renegade Immortal"></div>
          <div class="admin-fg"><label class="admin-lbl">Native Title</label><input type="text" class="admin-inp" id="fTitleNative" placeholder="e.g. 仙逆"></div>
          <div class="admin-fg"><label class="admin-lbl">English Title</label><input type="text" class="admin-inp" id="fTitleEnglish" placeholder="e.g. Renegade Immortal"></div>
          <div class="admin-fg"><label class="admin-lbl">Slug (URL) *</label><input type="text" class="admin-inp" id="fSlug" placeholder="e.g. renegade-immortal"></div>
          <div class="admin-fg"><label class="admin-lbl">Type *</label>
            <select class="admin-sel" id="fType">
              <option value="ONA">ONA</option><option value="TV">TV</option>
              <option value="Movie">Movie</option><option value="OVA">OVA</option>
              <option value="Special">Special</option><option value="Donghua">Donghua</option>
            </select>
          </div>
          <div class="admin-fg"><label class="admin-lbl">Status *</label>
            <select class="admin-sel" id="fStatus">
              <option value="Ongoing">Ongoing</option><option value="Completed">Completed</option><option value="Upcoming">Upcoming</option>
            </select>
          </div>
          <div class="admin-fg"><label class="admin-lbl">Release Year</label><input type="number" class="admin-inp" id="fYear" placeholder="2024" min="1990" max="2030"></div>
          <div class="admin-fg"><label class="admin-lbl">Rating (0-10)</label><input type="number" class="admin-inp" id="fRating" placeholder="8.5" step="0.1" min="0" max="10"></div>
          <div class="admin-fg full"><label class="admin-lbl">Genres (comma-separated)</label><input type="text" class="admin-inp" id="fGenres" placeholder="Action, Fantasy, Adventure"></div>
          <div class="admin-fg"><label class="admin-lbl">Studios (comma-separated)</label><input type="text" class="admin-inp" id="fStudios" placeholder="Studio Name"></div>
          <div class="admin-fg"><label class="admin-lbl">Country</label><input type="text" class="admin-inp" id="fCountry" placeholder="China" value="China"></div>
          <div class="admin-fg"><label class="admin-lbl">Duration</label><input type="text" class="admin-inp" id="fDuration" placeholder="24 min/ep"></div>
          <div class="admin-fg full"><label class="admin-lbl">Description / Synopsis *</label><textarea class="admin-ta" id="fDescription" rows="5" placeholder="Enter synopsis..."></textarea></div>
        </div>

        <div class="form-section-title" style="margin-top:20px;">Images & Media</div>
        <div class="admin-form-grid">
          <div class="admin-fg">
            <label class="admin-lbl">Cover Image URL</label>
            <input type="text" class="admin-inp" id="fCoverImage" placeholder="https://..." oninput="previewImg('fCoverImage','prevCover')">
            <div style="margin-top:8px;"><img id="prevCover" src="" style="width:80px;border-radius:8px;display:none;aspect-ratio:2/3;object-fit:cover;" alt="Cover"></div>
            <div class="img-upload-area" style="margin-top:8px;" onclick="document.getElementById('coverUpload').click()">
              <i class="fas fa-image"></i><p>Or upload image file</p><span>PNG, JPG, WEBP accepted</span>
            </div>
            <input type="file" id="coverUpload" accept="image/*" style="display:none" onchange="handleImgUpload(this,'fCoverImage','prevCover')">
          </div>
          <div class="admin-fg">
            <label class="admin-lbl">Banner Image URL</label>
            <input type="text" class="admin-inp" id="fBannerImage" placeholder="https://..." oninput="previewImg('fBannerImage','prevBanner')">
            <div style="margin-top:8px;"><img id="prevBanner" src="" style="width:100%;max-height:100px;border-radius:8px;display:none;object-fit:cover;" alt="Banner"></div>
            <div class="img-upload-area" style="margin-top:8px;" onclick="document.getElementById('bannerUpload').click()">
              <i class="fas fa-panorama"></i><p>Or upload banner file</p><span>Wide image (16:9 recommended)</span>
            </div>
            <input type="file" id="bannerUpload" accept="image/*" style="display:none" onchange="handleImgUpload(this,'fBannerImage','prevBanner',true)">
          </div>
          <div class="admin-fg full"><label class="admin-lbl">Trailer URL (YouTube or direct)</label><input type="text" class="admin-inp" id="fTrailer" placeholder="https://youtube.com/watch?v=..."></div>
        </div>

        <div class="form-section-title" style="margin-top:20px;">Feature Flags</div>
        <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:20px;">
          <label class="admin-check"><input type="checkbox" id="fFeatured"> Featured (hero slider)</label>
          <label class="admin-check"><input type="checkbox" id="fTrending"> Trending</label>
          <label class="admin-check"><input type="checkbox" id="fPopular"> Popular</label>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="admin-btn admin-btn-purple" onclick="saveAnime()" id="saveAnimeBtn"><i class="fas fa-save"></i> Save Anime</button>
          <button class="admin-btn admin-btn-outline" onclick="resetAnimeForm()"><i class="fas fa-undo"></i> Reset</button>
        </div>
      </div>
    </div>

    <!-- ===== EPISODES ===== -->
    <div class="admin-page" id="admin-episodes">
      <div class="admin-page-hd"><div class="admin-page-title">Episodes</div></div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r12);padding:18px;margin-bottom:20px;">
        <div class="admin-fg" style="margin-bottom:14px;">
          <label class="admin-lbl">Select Anime</label>
          <select class="admin-sel" id="epAnimeSelect" onchange="loadAnimeEpisodes(this.value)" style="width:100%;">
            <option value="">-- Choose Anime --</option>
          </select>
        </div>
        <div id="epAnimeInfo" style="display:none;padding:12px;background:var(--bg4);border-radius:var(--r8);margin-bottom:16px;align-items:center;gap:12px;">
          <img id="epAnimeThumb" src="" style="width:50px;aspect-ratio:2/3;object-fit:cover;border-radius:6px;" alt="">
          <div>
            <div id="epAnimeTitle" style="font-weight:700;font-size:14px;"></div>
            <div id="epAnimeCount" style="font-size:12px;color:var(--text3);"></div>
          </div>
        </div>

        <div class="form-section-title" id="addEpCard">Add / Edit Episode</div>
        <div class="admin-form-grid">
          <div class="admin-fg"><label class="admin-lbl">Episode Number *</label><input type="number" class="admin-inp" id="epNum" placeholder="1" min="1"></div>
          <div class="admin-fg"><label class="admin-lbl">Episode Title</label><input type="text" class="admin-inp" id="epTitle" placeholder="Optional title"></div>
          <div class="admin-fg full"><label class="admin-lbl">Embed URL (iframe src)</label><input type="text" class="admin-inp" id="epEmbed" placeholder="https://streamtape.com/e/... or any embed URL"></div>
          <div class="admin-fg full"><label class="admin-lbl">Direct Video URL (mp4)</label><input type="text" class="admin-inp" id="epVideo" placeholder="https://cdn.example.com/video.mp4"></div>
          <div class="admin-fg"><label class="admin-lbl">Air Date</label><input type="date" class="admin-inp" id="epDate"></div>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:4px;">
          <label class="admin-check"><input type="checkbox" id="epMembers"> Members Only</label>
          <button class="admin-btn admin-btn-purple" id="addEpBtn" onclick="addEpisode()"><i class="fas fa-plus"></i> Add Episode</button>
          <button class="admin-btn admin-btn-outline" onclick="resetEpForm()"><i class="fas fa-undo"></i> Reset</button>
        </div>
      </div>

      <div class="admin-table-card" id="epListCard" style="display:none;">
        <div class="admin-tc-head">
          <div class="admin-tc-title" id="epListTitle">Episodes</div>
        </div>
        <div style="overflow-x:auto;">
          <table class="admin-tbl">
            <thead><tr><th>#</th><th>Title</th><th>Embed</th><th>Video</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody id="epListBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== USERS ===== -->
    <div class="admin-page" id="admin-users">
      <div class="admin-page-hd"><div class="admin-page-title">Users</div></div>
      <div class="admin-table-card">
        <div style="overflow-x:auto;">
          <table class="admin-tbl">
            <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Plan</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody id="usersBody"><tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text3);"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== COMMENTS ===== -->
    <div class="admin-page" id="admin-comments">
      <div class="admin-page-hd"><div class="admin-page-title">Comments</div></div>
      <div class="admin-search-row">
        <select class="admin-select" onchange="loadComments(1,this.value)" id="commentFilter">
          <option value="all">All Comments</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div class="admin-table-card">
        <div style="overflow-x:auto;">
          <table class="admin-tbl">
            <thead><tr><th>User</th><th>Comment</th><th>Anime</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody id="commentsBody"><tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text3);"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr></tbody>
          </table>
        </div>
      </div>
      <div id="commentsPager" style="display:flex;gap:8px;justify-content:center;padding:16px 0;flex-wrap:wrap;"></div>
    </div>

    <!-- ===== SCHEDULE ===== -->
    <div class="admin-page" id="admin-schedule">
      <div class="admin-page-hd">
        <div class="admin-page-title"><i class="fas fa-calendar-alt" style="color:var(--purple2);margin-right:8px;"></i>Schedule Manager</div>
        <div style="display:flex;gap:8px;">
          <button class="admin-btn admin-btn-outline" onclick="loadSchedulePage()"><i class="fas fa-sync-alt"></i> Refresh</button>
          <a href="/schedule" target="_blank" class="admin-btn admin-btn-outline"><i class="fas fa-external-link-alt"></i> View Schedule</a>
        </div>
      </div>

      <!-- Info banner -->
      <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.22);border-radius:var(--r10);padding:12px 16px;margin-bottom:18px;display:flex;align-items:flex-start;gap:10px;">
        <i class="fas fa-info-circle" style="color:var(--purple2);margin-top:1px;flex-shrink:0;"></i>
        <div style="font-size:12px;color:var(--text2);line-height:1.6;">
          The schedule controls what appears in the <strong style="color:var(--text1);">Weekly Schedule</strong> section on the homepage and schedule page.
          Each anime can be assigned a <strong style="color:var(--text1);">broadcast day</strong> and <strong style="color:var(--text1);">air time</strong>.
          Episode-level air times can be set per-episode in the Episodes section.
        </div>
      </div>

      <!-- Add / Edit Schedule Form -->
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r12);padding:20px;margin-bottom:20px;">
        <div class="form-section-title" id="schedFormTitle"><i class="fas fa-plus-circle" style="color:var(--purple2);margin-right:7px;"></i>Add Anime to Schedule</div>
        <input type="hidden" id="schedEditId" value="">
        <div class="admin-form-grid">
          <div class="admin-fg">
            <label class="admin-lbl">Anime <span style="color:var(--red);">*</span></label>
            <select class="admin-sel" id="schedAnime" style="width:100%;">
              <option value="">-- Select Anime --</option>
            </select>
          </div>
          <div class="admin-fg">
            <label class="admin-lbl">Day of Week <span style="color:var(--red);">*</span></label>
            <select class="admin-sel" id="schedDay" style="width:100%;" onchange="syncDateToDay()">
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div class="admin-fg">
            <label class="admin-lbl">Air Time <span style="color:var(--text3);font-weight:400;text-transform:none;">(HH:MM, 24h)</span></label>
            <input type="time" class="admin-inp" id="schedTime" placeholder="e.g. 20:00">
          </div>
          <div class="admin-fg">
            <label class="admin-lbl">Next Episode Air Date <span style="color:var(--text3);font-weight:400;text-transform:none;">(specific date)</span></label>
            <input type="date" class="admin-inp" id="schedAirDate" onchange="syncDayToDate()">
            <div style="font-size:10px;color:var(--text4);margin-top:4px;"><i class="fas fa-info-circle"></i> When set, schedule card will show this exact date and auto-highlight on that day</div>
          </div>
          <div class="admin-fg">
            <label class="admin-lbl">Next Episode Number <span style="color:var(--text3);font-weight:400;text-transform:none;">(shows on card)</span></label>
            <input type="number" class="admin-inp" id="schedNextEp" placeholder="e.g. 13" min="1">
            <div style="font-size:10px;color:var(--text4);margin-top:4px;"><i class="fas fa-play-circle"></i> Episode badge displayed on schedule card</div>
          </div>
          <div class="admin-fg">
            <label class="admin-lbl">Next Episode Title <span style="color:var(--text3);font-weight:400;text-transform:none;">(optional)</span></label>
            <input type="text" class="admin-inp" id="schedNextEpTitle" placeholder="e.g. The Final Battle">
          </div>
          <div class="admin-fg full">
            <label class="admin-lbl">Notes / Season Info <span style="color:var(--text3);font-weight:400;text-transform:none;">(optional)</span></label>
            <input type="text" class="admin-inp" id="schedNotes" placeholder="e.g. Season 2 — airs every Friday at 20:00 CST">
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;">
          <button class="admin-btn admin-btn-purple" onclick="saveSchedule()" id="schedSaveBtn">
            <i class="fas fa-plus"></i> Add to Schedule
          </button>
          <button class="admin-btn admin-btn-outline" onclick="resetSchedForm()" id="schedResetBtn">
            <i class="fas fa-undo"></i> Reset
          </button>
        </div>
      </div>

      <!-- Schedule by day tabs -->
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r12);overflow:hidden;margin-bottom:20px;">
        <div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div style="font-size:14px;font-weight:700;color:var(--text1);">Current Schedule</div>
          <div style="display:flex;gap:7px;overflow-x:auto;" id="schedDayFilterTabs">
            <button class="admin-btn admin-btn-purple" style="padding:5px 14px;font-size:11px;" onclick="filterSchedByDay('all',this)">All</button>
            <button class="admin-btn admin-btn-outline" style="padding:5px 12px;font-size:11px;" onclick="filterSchedByDay('Monday',this)">Mon</button>
            <button class="admin-btn admin-btn-outline" style="padding:5px 12px;font-size:11px;" onclick="filterSchedByDay('Tuesday',this)">Tue</button>
            <button class="admin-btn admin-btn-outline" style="padding:5px 12px;font-size:11px;" onclick="filterSchedByDay('Wednesday',this)">Wed</button>
            <button class="admin-btn admin-btn-outline" style="padding:5px 12px;font-size:11px;" onclick="filterSchedByDay('Thursday',this)">Thu</button>
            <button class="admin-btn admin-btn-outline" style="padding:5px 12px;font-size:11px;" onclick="filterSchedByDay('Friday',this)">Fri</button>
            <button class="admin-btn admin-btn-outline" style="padding:5px 12px;font-size:11px;" onclick="filterSchedByDay('Saturday',this)">Sat</button>
            <button class="admin-btn admin-btn-outline" style="padding:5px 12px;font-size:11px;" onclick="filterSchedByDay('Sunday',this)">Sun</button>
          </div>
        </div>
        <div style="overflow-x:auto;">
          <table class="admin-tbl" id="schedTable">
            <thead>
              <tr>
                <th>Anime</th>
                <th>Day</th>
                <th>Air Date</th>
                <th>Air Time</th>
                <th>Next EP</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="schedBody">
              <tr><td colspan="7" style="text-align:center;padding:28px;color:var(--text3);">
                <i class="fas fa-spinner fa-spin"></i> Loading schedule...
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick-add via anime list -->
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r12);padding:20px;">
        <div class="form-section-title"><i class="fas fa-bolt" style="color:var(--gold);margin-right:7px;"></i>Quick-Add Ongoing Anime to Schedule</div>
        <p style="font-size:12px;color:var(--text3);margin-bottom:14px;">Ongoing anime not yet in the schedule. Click to quickly add them.</p>
        <div id="schedQuickAddList" style="display:flex;flex-wrap:wrap;gap:8px;">
          <span style="color:var(--text3);font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Loading...</span>
        </div>
      </div>
    </div>

    <!-- ===== SETTINGS ===== -->
    <div class="admin-page" id="admin-settings">
      <div class="admin-page-hd"><div class="admin-page-title">Settings</div></div>

      <!-- General Settings -->
      <div class="settings-card">
        <div class="settings-title"><i class="fas fa-globe" style="color:var(--purple2);margin-right:8px;"></i> General Settings</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px;">
          <label class="admin-check"><input type="checkbox" id="setRegistration"> Allow User Registration</label>
          <label class="admin-check"><input type="checkbox" id="setMaintenance"> Maintenance Mode</label>
        </div>
        <button class="admin-btn admin-btn-purple" onclick="saveGeneralSettings()"><i class="fas fa-save"></i> Save General Settings</button>
      </div>

      <!-- Email Settings -->
      <div class="settings-card">
        <div class="settings-title"><i class="fas fa-envelope" style="color:var(--purple2);margin-right:8px;"></i> Email Addresses</div>
        <p style="font-size:12px;color:var(--text3);margin-bottom:16px;">These emails appear on the Contact, DMCA, Privacy, and About pages. All fields load from the database.</p>
        <div class="admin-form-grid">
          <div class="admin-fg"><label class="admin-lbl">Contact Email</label><input type="email" class="admin-inp" id="setContactEmail" placeholder="contact@yourdomain.com"></div>
          <div class="admin-fg"><label class="admin-lbl">DMCA Email</label><input type="email" class="admin-inp" id="setDmcaEmail" placeholder="dmca@yourdomain.com"></div>
          <div class="admin-fg"><label class="admin-lbl">Privacy Email</label><input type="email" class="admin-inp" id="setPrivacyEmail" placeholder="privacy@yourdomain.com"></div>
          <div class="admin-fg"><label class="admin-lbl">About/General Email</label><input type="email" class="admin-inp" id="setAboutEmail" placeholder="hello@yourdomain.com"></div>
        </div>
        <button class="admin-btn admin-btn-purple" onclick="saveEmailSettings()"><i class="fas fa-save"></i> Save Email Settings</button>
      </div>

      <!-- Social Media Links -->
      <div class="settings-card">
        <div class="settings-title"><i class="fas fa-share-alt" style="color:var(--purple2);margin-right:8px;"></i> Social Media Links</div>
        <p style="font-size:12px;color:var(--text3);margin-bottom:16px;">Social links appear in the website footer. Enter full URLs (e.g. https://discord.gg/invite) or just the handle (e.g. yourusername).</p>
        <div class="admin-form-grid">
          <div class="admin-fg">
            <label class="admin-lbl"><i class="fab fa-discord" style="color:#5865F2;margin-right:5px;"></i> Discord</label>
            <input type="text" class="admin-inp" id="setSocialDiscord" placeholder="https://discord.gg/yourserver or invite code">
          </div>
          <div class="admin-fg">
            <label class="admin-lbl"><i class="fab fa-twitter" style="color:#1DA1F2;margin-right:5px;"></i> Twitter / X</label>
            <input type="text" class="admin-inp" id="setSocialTwitter" placeholder="https://twitter.com/yourhandle or @handle">
          </div>
          <div class="admin-fg">
            <label class="admin-lbl"><i class="fab fa-reddit" style="color:#FF4500;margin-right:5px;"></i> Reddit</label>
            <input type="text" class="admin-inp" id="setSocialReddit" placeholder="https://reddit.com/r/yoursubreddit or r/name">
          </div>
          <div class="admin-fg">
            <label class="admin-lbl"><i class="fab fa-telegram" style="color:#229ED9;margin-right:5px;"></i> Telegram</label>
            <input type="text" class="admin-inp" id="setSocialTelegram" placeholder="https://t.me/yourchannel or @channel">
          </div>
          <div class="admin-fg">
            <label class="admin-lbl"><i class="fab fa-facebook" style="color:#1877F2;margin-right:5px;"></i> Facebook</label>
            <input type="text" class="admin-inp" id="setSocialFacebook" placeholder="https://facebook.com/yourpage">
          </div>
          <div class="admin-fg">
            <label class="admin-lbl"><i class="fab fa-youtube" style="color:#FF0000;margin-right:5px;"></i> YouTube</label>
            <input type="text" class="admin-inp" id="setSocialYoutube" placeholder="https://youtube.com/c/yourchannel">
          </div>
          <div class="admin-fg">
            <label class="admin-lbl"><i class="fab fa-instagram" style="color:#E1306C;margin-right:5px;"></i> Instagram</label>
            <input type="text" class="admin-inp" id="setSocialInstagram" placeholder="https://instagram.com/yourhandle">
          </div>
          <div class="admin-fg">
            <label class="admin-lbl"><i class="fab fa-tiktok" style="color:var(--text2);margin-right:5px;"></i> TikTok</label>
            <input type="text" class="admin-inp" id="setSocialTiktok" placeholder="https://tiktok.com/@yourhandle">
          </div>
        </div>
        <button class="admin-btn admin-btn-purple" onclick="saveSocialSettings()"><i class="fas fa-save"></i> Save Social Links</button>
      </div>

      <!-- System Broadcasts -->
      <div class="settings-card">
        <div class="settings-title"><i class="fas fa-bullhorn" style="color:var(--purple2);margin-right:8px;"></i> System Broadcasts</div>
        <p style="font-size:12px;color:var(--text3);margin-bottom:16px;">Broadcasts are shown as a banner to all site visitors. Active broadcasts display at the top of every page.</p>
        <div class="admin-fg">
          <label class="admin-lbl">Broadcast Message</label>
          <textarea class="admin-ta" id="broadcastMsg" rows="3" placeholder="Enter announcement message for all visitors..."></textarea>
        </div>
        <div class="admin-fg">
          <label class="admin-lbl">Message Type</label>
          <select class="admin-sel" id="broadcastType">
            <option value="info">ℹ️ Info (blue)</option>
            <option value="success">✅ Success (green)</option>
            <option value="warning">⚠️ Warning (yellow)</option>
            <option value="error">🚨 Alert (red)</option>
          </select>
        </div>
        <button class="admin-btn admin-btn-purple" onclick="sendBroadcast()" style="margin-bottom:16px;"><i class="fas fa-bullhorn"></i> Send Broadcast</button>

        <div class="form-section-title" style="margin-top:4px;">Active Broadcasts</div>
        <div id="broadcastList" style="min-height:60px;">
          <div style="color:var(--text3);font-size:13px;text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading broadcasts...</div>
        </div>
      </div>

      <!-- Change Admin Password -->
      <div class="settings-card">
        <div class="settings-title"><i class="fas fa-shield-alt" style="color:var(--purple2);margin-right:8px;"></i> Change Admin Password</div>
        <p style="font-size:12px;color:var(--text3);margin-bottom:16px;">
          Note: The primary credentials come from your Cloudflare environment variables (ADMIN_USERNAME, ADMIN_PASSWORD).
          You can change the DB password here as a secondary option.
        </p>
        <div class="admin-fg"><label class="admin-lbl">Current Password</label><input type="password" class="admin-inp" id="pwdCurrent" placeholder="Current password"></div>
        <div class="admin-fg"><label class="admin-lbl">New Password</label><input type="password" class="admin-inp" id="pwdNew" placeholder="New password (min 8 chars)"></div>
        <div class="admin-fg"><label class="admin-lbl">Confirm New Password</label><input type="password" class="admin-inp" id="pwdConfirm" placeholder="Confirm new password"></div>
        <button class="admin-btn admin-btn-purple" onclick="changePassword()"><i class="fas fa-key"></i> Change Password</button>
      </div>

      <!-- IMGBB Status -->
      <div class="settings-card">
        <div class="settings-title"><i class="fas fa-image" style="color:var(--purple2);margin-right:8px;"></i> IMGBB Image Upload Status</div>
        <div id="imgbbStatus" style="font-size:13px;color:var(--text3);">Checking...</div>
        <div style="font-size:12px;color:var(--text4);margin-top:10px;">
          IMGBB is used for all image uploads (anime covers, banners, episode thumbnails, profile pictures).
          Get a free API key at <a href="https://api.imgbb.com/" target="_blank" style="color:var(--purple2);">api.imgbb.com →</a>
          Then add <code style="background:var(--bg4);padding:2px 6px;border-radius:4px;font-size:11px;">IMGBB_API_KEY</code> as a Cloudflare secret.
        </div>
      </div>

      <!-- API Keys Status -->
      <div class="settings-card">
        <div class="settings-title"><i class="fas fa-database" style="color:var(--purple2);margin-right:8px;"></i> API Keys Status</div>
        <div id="apiKeysStatus" style="font-size:13px;color:var(--text3);">API keys are configured as Cloudflare environment secrets and are never exposed here for security. Check Cloudflare dashboard for configuration.</div>
      </div>
    </div>

  </div><!-- end admin-main -->
</div><!-- end admin-layout -->

<div class="toast-container" id="toastContainer"></div>

<script src="/static/admin.js"></script>
<script>
// Auth check on load
(async function() {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (!token) {
    window.location.href = '/admin';
    return;
  }
  try {
    const res = await fetch('/api/admin/verify', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (!data.success) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      window.location.href = '/admin';
      return;
    }
    // Show panel
    document.getElementById('adminAuthCheck').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'flex';
    // Load initial page
    showPage('${section}');
  } catch(e) {
    window.location.href = '/admin';
  }
})();
</script>
</body>
</html>`
}
