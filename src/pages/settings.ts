import { layout } from './layout'

export function settingsPage(siteName: string = 'DonghuaLand'): string {
  const content = `
<div class="user-page-wrap">
  <div id="settingsNotLoggedIn" class="auth-required hidden">
    <div class="auth-required-inner">
      <i class="fas fa-lock"></i>
      <h2>Sign In Required</h2>
      <p>Please sign in to access settings.</p>
      <a href="/user/login" class="btn-primary-sm">Sign In</a>
    </div>
  </div>

  <div id="settingsMain" class="hidden">
    <div class="user-page-header">
      <h1><i class="fas fa-cog"></i> Account Settings</h1>
      <p>Manage your account preferences</p>
    </div>

    <div class="settings-grid">
      <!-- Profile Section -->
      <div class="settings-card">
        <h3><i class="fas fa-user"></i> Profile</h3>
        <div class="form-group">
          <label>Profile Photo</label>
          <div class="avatar-upload-row">
            <img id="setAvaPreview" src="" class="avatar-preview" alt="Avatar">
            <div style="flex:1;">
              <button class="btn-outline-sm" onclick="document.getElementById('profileImgFile').click()" style="margin-bottom:6px;">
                <i class="fas fa-camera"></i> Change Photo
              </button>
              <input type="file" id="profileImgFile" accept="image/*" style="display:none" onchange="uploadProfilePhoto(this)">
              <p style="font-size:12px; color:var(--text3); margin:0;">PNG, JPG up to 5MB. Hosted on IMGBB.</p>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="setUsername" class="form-inp" placeholder="Username">
          <small>3-30 characters. Letters, numbers, dots, underscores, hyphens only.</small>
        </div>
        <div class="form-group">
          <label>Bio</label>
          <textarea id="setBio" class="form-inp" placeholder="Tell others about yourself..." rows="3" style="resize:vertical; font-family:inherit; min-height:80px;" maxlength="500"></textarea>
          <small><span id="bioCount">0</span>/500 characters</small>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="setEmail" class="form-inp" placeholder="Email address" disabled>
          <small>Email cannot be changed</small>
        </div>
        <button class="btn-primary-sm" onclick="saveProfile()">
          <i class="fas fa-save"></i> Save Profile
        </button>
        <div id="profileSaveStatus" style="margin-top:8px; font-size:12px; display:none;"></div>
      </div>

      <!-- Preferences Section -->
      <div class="settings-card">
        <h3><i class="fas fa-sliders-h"></i> Preferences</h3>
        <div class="form-group">
          <label>Default Video Quality</label>
          <select class="form-sel" id="setPrefQuality">
            <option value="1080p">1080p HD</option>
            <option value="720p" selected>720p</option>
            <option value="480p">480p</option>
            <option value="360p">360p</option>
          </select>
        </div>
        <div class="form-group">
          <label>Autoplay Next Episode</label>
          <div class="toggle-row">
            <span>Automatically play next episode</span>
            <label class="toggle-switch">
              <input type="checkbox" id="setPrefAutoplay" checked>
              <span class="toggle-knob"></span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>Show Subtitles by Default</label>
          <div class="toggle-row">
            <span>Enable subtitles automatically</span>
            <label class="toggle-switch">
              <input type="checkbox" id="setPrefSubs">
              <span class="toggle-knob"></span>
            </label>
          </div>
        </div>
        <button class="btn-primary-sm" onclick="savePrefs()">
          <i class="fas fa-save"></i> Save Preferences
        </button>
      </div>

      <!-- Password Section -->
      <div class="settings-card">
        <h3><i class="fas fa-lock"></i> Change Password</h3>
        <div class="form-group">
          <label>Current Password</label>
          <input type="password" id="setCurPwd" class="form-inp" placeholder="Current password">
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" id="setNewPwd" class="form-inp" placeholder="New password (min 8 chars)">
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <input type="password" id="setConfPwd" class="form-inp" placeholder="Confirm new password">
        </div>
        <button class="btn-primary-sm" onclick="savePassword()">
          <i class="fas fa-key"></i> Update Password
        </button>
        <div id="pwdStatus" style="margin-top:8px; font-size:12px; display:none;"></div>
      </div>

      <!-- Danger Zone -->
      <div class="settings-card danger-zone">
        <h3><i class="fas fa-exclamation-triangle" style="color:var(--red)"></i> Danger Zone</h3>
        <p style="font-size:13px; color:var(--text3); margin-bottom:16px;">These actions are irreversible.</p>
        <button class="btn-danger-sm" onclick="if(confirm('Clear all local data including watchlist and history?')){localStorage.clear(); window.location.href='/'; }">
          <i class="fas fa-trash"></i> Clear All Local Data
        </button>
        <button class="btn-danger-sm" style="margin-left:8px" onclick="window.doLogout()">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>
  </div>
</div>

<style>
.avatar-upload-row { display:flex; align-items:center; gap:14px; margin-bottom:12px; }
</style>

<script>
(function(){
  const token = localStorage.getItem('token');
  let user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) {
    document.getElementById('settingsNotLoggedIn').classList.remove('hidden');
    return;
  }

  document.getElementById('settingsMain').classList.remove('hidden');

  // Bio char count
  const bioEl = document.getElementById('setBio');
  const bioCount = document.getElementById('bioCount');
  if (bioEl) {
    bioEl.addEventListener('input', () => {
      bioCount.textContent = bioEl.value.length;
    });
  }

  function loadUserData(u) {
    document.getElementById('setUsername').value = u.username || '';
    document.getElementById('setEmail').value = u.email || '';
    if (bioEl) bioEl.value = u.bio || '';
    if (bioCount) bioCount.textContent = (u.bio || '').length;

    const avaEl = document.getElementById('setAvaPreview');
    if (avaEl) avaEl.src = u.profile_image || u.avatar ||
      ('https://ui-avatars.com/api/?name=' + encodeURIComponent(u.username) + '&background=6c5ce7&color=fff&size=60&bold=true');
  }

  loadUserData(user);

  // Fetch fresh user data
  fetch('/api/users/me', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json()).then(freshUser => {
      if (freshUser && freshUser.id) {
        user = { ...user, ...freshUser };
        localStorage.setItem('user', JSON.stringify(user));
        loadUserData(user);
      }
    }).catch(() => {});

  // Load prefs
  const prefs = JSON.parse(localStorage.getItem('userPrefs') || '{}');
  if (prefs.quality) document.getElementById('setPrefQuality').value = prefs.quality;
  if (prefs.autoplay === false) document.getElementById('setPrefAutoplay').checked = false;
  if (prefs.subs) document.getElementById('setPrefSubs').checked = true;

  // ==================== PROFILE PHOTO UPLOAD ====================
  window.uploadProfilePhoto = async function(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { window.showToast('Only image files allowed', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { window.showToast('Image must be under 5MB', 'error'); return; }
    
    window.showToast('Uploading profile photo...', 'info');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload/profile-image', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        document.getElementById('setAvaPreview').src = data.url;
        user.profile_image = data.url; user.avatar = data.url;
        localStorage.setItem('user', JSON.stringify(user));
        const ha = document.getElementById('userAva'); if (ha) ha.src = data.url;
        window.showToast('Profile photo updated!', 'success');
      } else {
        window.showToast(data.error || 'Upload failed', 'error');
      }
    } catch(e) { window.showToast('Upload error: ' + e.message, 'error'); }
    input.value = '';
  };

  // ==================== SAVE PROFILE ====================
  window.saveProfile = async function() {
    const newName = document.getElementById('setUsername').value.trim();
    const newBio = bioEl ? bioEl.value.trim() : '';
    if (!newName) { window.showToast('Username cannot be empty', 'error'); return; }
    if (newName.length < 3) { window.showToast('Username must be at least 3 characters', 'error'); return; }
    
    const statusEl = document.getElementById('profileSaveStatus');
    statusEl.style.display = 'block';
    statusEl.style.color = 'var(--text3)';
    statusEl.textContent = 'Saving...';

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ username: newName, bio: newBio })
      });
      const data = await res.json();
      if (data.success) {
        user.username = newName;
        user.bio = newBio;
        if (data.token) localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(user));
        const avaEl = document.getElementById('setAvaPreview');
        if (avaEl && !user.profile_image) avaEl.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(newName) + '&background=6c5ce7&color=fff&size=60&bold=true';
        statusEl.style.color = 'var(--green)';
        statusEl.textContent = '✓ Profile saved successfully!';
        window.showToast('Profile updated!', 'success');
        // Update header username
        const nameLabel = document.getElementById('userNameLabel');
        if (nameLabel) nameLabel.textContent = newName;
      } else {
        statusEl.style.color = 'var(--red)';
        statusEl.textContent = data.error || 'Failed to save';
        window.showToast(data.error || 'Failed to save profile', 'error');
      }
    } catch(e) {
      statusEl.style.color = 'var(--red)';
      statusEl.textContent = 'Network error';
      window.showToast('Network error', 'error');
    }
  };

  window.savePrefs = function() {
    const prefs = {
      quality: document.getElementById('setPrefQuality').value,
      autoplay: document.getElementById('setPrefAutoplay').checked,
      subs: document.getElementById('setPrefSubs').checked,
    };
    localStorage.setItem('userPrefs', JSON.stringify(prefs));
    window.showToast('Preferences saved!', 'success');
  };

  // ==================== CHANGE PASSWORD ====================
  window.savePassword = async function() {
    const curPwd = document.getElementById('setCurPwd').value;
    const newPwd = document.getElementById('setNewPwd').value;
    const confPwd = document.getElementById('setConfPwd').value;
    const statusEl = document.getElementById('pwdStatus');
    
    if (!curPwd) { window.showToast('Current password required', 'error'); return; }
    if (newPwd.length < 8) { window.showToast('New password must be at least 8 characters', 'error'); return; }
    if (newPwd !== confPwd) { window.showToast('Passwords do not match', 'error'); return; }
    
    statusEl.style.display = 'block';
    statusEl.style.color = 'var(--text3)';
    statusEl.textContent = 'Updating password...';

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ current_password: curPwd, new_password: newPwd })
      });
      const data = await res.json();
      if (data.success) {
        statusEl.style.color = 'var(--green)';
        statusEl.textContent = '✓ Password updated successfully!';
        document.getElementById('setCurPwd').value = '';
        document.getElementById('setNewPwd').value = '';
        document.getElementById('setConfPwd').value = '';
        window.showToast('Password updated!', 'success');
      } else {
        statusEl.style.color = 'var(--red)';
        statusEl.textContent = data.error || 'Failed to update password';
        window.showToast(data.error || 'Failed to update password', 'error');
      }
    } catch(e) {
      statusEl.style.color = 'var(--red)';
      statusEl.textContent = 'Network error';
      window.showToast('Network error', 'error');
    }
  };
})();
</script>
`
  return layout(`Settings - ${siteName}`, content, '', siteName)
}
