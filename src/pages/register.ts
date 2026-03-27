import { layout } from './layout'

export function registerPage() {
  const content = `
<div class="auth-page">
  <div class="auth-card">
    <!-- Logo -->
    <a href="/" class="auth-logo">
      <div class="li"><i class="fas fa-dragon"></i></div>
      Donghua<span>Land</span>
    </a>
    <p class="auth-sub">Your world of Chinese anime, unlocked.</p>

    <h2 class="auth-title">Create Account</h2>
    <p style="text-align:center; font-size:13px; color:var(--text3); margin-bottom:24px;">Join the DonghuaLand community today — it's free!</p>

    <!-- Register Form -->
    <form id="registerForm" onsubmit="doRegister(event)">
      <div class="form-group">
        <label class="form-label">Username</label>
        <input type="text" name="username" class="form-input" placeholder="Choose a username" required id="usernameInput" autocomplete="username">
        <div class="form-hint">3-20 characters, letters, numbers, underscore only</div>
      </div>
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" name="email" class="form-input" placeholder="Enter your email" required id="emailInput" autocomplete="email">
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="input-wrap">
          <input type="password" name="password" class="form-input" placeholder="Create a strong password" required id="regPassInput" autocomplete="new-password" minlength="6">
          <i class="fas fa-eye input-eye" onclick="togglePwd('regPassInput', this)"></i>
        </div>
        <div class="form-hint">Minimum 6 characters</div>
      </div>
      <div class="form-group">
        <label class="form-check" style="gap:8px;">
          <input type="checkbox" id="agreeTerms" required>
          I agree to the <a href="/terms" style="color:var(--purple2);">Terms of Service</a> and <a href="/privacy" style="color:var(--purple2);">Privacy Policy</a>
        </label>
      </div>
      <button type="submit" class="btn-submit" id="regBtn">
        Create Account
      </button>
    </form>

    <div class="auth-footer">
      Already have an account? <a href="/user/login">Sign in here</a>
    </div>
  </div>
</div>

<script>
function togglePwd(id, btn) {
  const inp = document.getElementById(id);
  if (inp.type === 'password') { inp.type = 'text'; btn.classList.replace('fa-eye', 'fa-eye-slash'); }
  else { inp.type = 'password'; btn.classList.replace('fa-eye-slash', 'fa-eye'); }
}
async function doRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('regBtn');
  const username = document.getElementById('usernameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('regPassInput').value;
  
  if (!username || !email || !password) { showToast('Please fill all fields', 'error'); return; }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { showToast('Invalid username format', 'error'); return; }
  
  btn.disabled = true; 
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
  
  try {
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('Welcome to DonghuaLand, ' + username + '!', 'success');
      setTimeout(() => { window.location.href = '/'; }, 900);
    } else {
      showToast(data.error || 'Registration failed', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Create Account';
    }
  } catch (err) {
    showToast('Network error, please try again', 'error');
    btn.disabled = false;
    btn.innerHTML = 'Create Account';
  }
}
</script>
`
  return layout('Create Account - Donghualand', content)
}
