import { layout } from './layout'

export function loginPage(error?: string) {
  const content = `
<div class="auth-page">
  <div class="auth-card">
    <!-- Logo -->
    <a href="/" class="auth-logo">
      <div class="li"><i class="fas fa-dragon"></i></div>
      Donghua<span>Land</span>
    </a>
    <p class="auth-sub">Your world of Chinese anime, unlocked.</p>

    <h2 class="auth-title">Sign In</h2>
    <p style="text-align:center; font-size:13px; color:var(--text3); margin-bottom:24px;">Welcome back! Sign in to your account.</p>

    ${error ? `<div style="background:rgba(232,64,64,0.1); border:1px solid rgba(232,64,64,0.3); border-radius:var(--r8); padding:12px; font-size:13px; color:var(--red); margin-bottom:16px; display:flex; align-items:center; gap:8px;"><i class="fas fa-exclamation-circle"></i>${error}</div>` : ''}

    <!-- Login Form -->
    <form id="loginForm" onsubmit="doLogin(event)">
      <div class="form-group">
        <label class="form-label">Email or Username</label>
        <input type="text" name="login" class="form-input" placeholder="Enter email or username" id="loginInput" autocomplete="username">
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="input-wrap">
          <input type="password" name="password" class="form-input" placeholder="Enter your password" id="passInput" autocomplete="current-password">
          <i class="fas fa-eye input-eye" onclick="togglePwd('passInput', this)"></i>
        </div>
      </div>
      <div class="form-bottom">
        <label class="form-check">
          <input type="checkbox" id="rememberMe"> Remember me
        </label>
        <a href="/user/forgot" class="forgot-link">Forgot password?</a>
      </div>
      <button type="submit" class="btn-submit" id="loginBtn">
        Sign In
      </button>
    </form>

    <div class="auth-footer">
      Don't have an account? <a href="/user/register">Create one free</a>
    </div>
  </div>
</div>

<script>
function togglePwd(id, btn) {
  const inp = document.getElementById(id);
  if (inp.type === 'password') { inp.type = 'text'; btn.classList.replace('fa-eye', 'fa-eye-slash'); }
  else { inp.type = 'password'; btn.classList.replace('fa-eye-slash', 'fa-eye'); }
}

async function doLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const login = (document.getElementById('loginInput').value || '').trim();
  const password = (document.getElementById('passInput').value || '');

  if (!login || !password) { showToast('Please enter credentials', 'error'); return; }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: login, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('Welcome back, ' + data.user.username + '!', 'success');
      
      setTimeout(() => { 
        if (data.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }, 800);
    } else {
      showToast(data.error || 'Invalid credentials', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
    }
  } catch (err) {
    showToast('Network error, please try again', 'error');
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
  }
}
</script>
`
  return layout('Sign In - Donghualand', content)
}
