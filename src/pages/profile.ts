import { layout } from './layout'

export function profilePage(siteName: string = 'DonghuaLand'): string {
  const content = `
<div class="user-page-wrap">
  <div id="profileNotLoggedIn" class="auth-required hidden">
    <div class="auth-required-inner">
      <i class="fas fa-user-lock"></i>
      <h2>Sign In Required</h2>
      <p>Please sign in to view your profile.</p>
      <a href="/user/login" class="btn-primary-sm">Sign In</a>
      <a href="/user/register" class="btn-outline-sm" style="margin-left:8px">Register</a>
    </div>
  </div>

  <div id="profileMain" class="hidden">
    <!-- Profile Header -->
    <div class="profile-hero" id="profileHero">
      <div class="profile-meta-row" style="padding:20px 16px 16px;">
        <!-- Profile Picture -->
        <div class="profile-ava-wrap" style="position:relative; cursor:pointer;" onclick="triggerProfileUpload()" title="Click to change profile photo">
          <img id="profileAva" src="" alt="Avatar" class="profile-ava">
          <div class="profile-ava-overlay">
            <i class="fas fa-camera"></i>
          </div>
        </div>
        <input type="file" id="profileImageInput" accept="image/*" style="display:none" onchange="uploadProfileImage(this)">

        <div class="profile-meta">
          <div class="profile-username" id="profileUsername">Username</div>
          <div class="profile-role" id="profileRole">Member</div>
          <div class="profile-joined" id="profileJoined"></div>
          <div id="profileBio" style="font-size:13px; color:var(--text3); margin-top:4px; max-width:400px;"></div>
        </div>
        <div class="profile-actions">
          <a href="/user/settings" class="btn-outline-sm"><i class="fas fa-cog"></i> Settings</a>
        </div>
      </div>
    </div>

    <!-- Upload progress -->
    <div id="uploadProgress" style="display:none; background:var(--bg3); border:1px solid var(--border); border-radius:8px; padding:12px 16px; margin-bottom:12px; align-items:center; gap:10px;">
      <i class="fas fa-spinner fa-spin" style="color:var(--purple2);"></i>
      <span id="uploadProgressText" style="font-size:13px; color:var(--text2);">Uploading image...</span>
    </div>

    <div class="profile-stats-row">
      <div class="profile-stat">
        <div class="profile-stat-val" id="statWatchlist">0</div>
        <div class="profile-stat-lbl">Watchlist</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-val" id="statHistory">0</div>
        <div class="profile-stat-lbl">Watched</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-val">∞</div>
        <div class="profile-stat-lbl">Episodes</div>
      </div>
    </div>

    <div class="profile-tabs-wrap">
      <div class="profile-tabs">
        <button class="profile-tab active" data-tab="watchlist">Watchlist</button>
        <button class="profile-tab" data-tab="history">History</button>
        <button class="profile-tab" data-tab="info">Account Info</button>
      </div>

      <!-- Watchlist Tab -->
      <div class="profile-tab-content active" id="tab-watchlist">
        <div class="grid-5" id="profileWLGrid"></div>
        <div class="wl-empty hidden" id="profileWLEmpty">
          <i class="fas fa-bookmark"></i>
          <p>Nothing in your watchlist yet. <a href="/search">Browse anime</a></p>
        </div>
      </div>

      <!-- History Tab -->
      <div class="profile-tab-content hidden" id="tab-history">
        <div class="history-list" id="historyList"></div>
        <div class="wl-empty hidden" id="historyEmpty">
          <i class="fas fa-history"></i>
          <p>No watch history yet. <a href="/">Start watching</a></p>
        </div>
      </div>

      <!-- Account Info Tab -->
      <div class="profile-tab-content hidden" id="tab-info">
        <div class="info-card">
          <div class="info-row"><span>Username</span><strong id="infoUsername">—</strong></div>
          <div class="info-row"><span>Email</span><strong id="infoEmail">—</strong></div>
          <div class="info-row"><span>Role</span><strong id="infoRole">Member</strong></div>
          <div class="info-row"><span>Member Since</span><strong id="infoSince">—</strong></div>
          <div class="info-row"><span>Status</span><strong style="color:var(--green)"><i class="fas fa-circle" style="font-size:8px"></i> Active</strong></div>
          <div style="margin-top:20px; display:flex; gap:10px; flex-wrap:wrap;">
            <a href="/user/settings" class="btn-outline-sm"><i class="fas fa-cog"></i> Settings</a>
            <button onclick="window.doLogout()" class="btn-danger-sm"><i class="fas fa-sign-out-alt"></i> Logout</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
.profile-ava-wrap { position:relative; display:inline-block; }
.profile-ava-overlay {
  position:absolute; inset:0; border-radius:50%;
  background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center;
  opacity:0; transition:opacity 0.2s; color:#fff; font-size:18px; flex-direction:column; gap:2px;
}
.profile-ava-wrap:hover .profile-ava-overlay { opacity:1; }
#uploadProgress { display:flex; }
</style>

<script>
(function(){
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) {
    document.getElementById('profileNotLoggedIn').classList.remove('hidden');
    return;
  }

  document.getElementById('profileMain').classList.remove('hidden');

  // Fill profile
  function refreshProfile(u) {
    const ava = u.profile_image || u.avatar || 
      ('https://ui-avatars.com/api/?name=' + encodeURIComponent(u.username) + '&background=6c5ce7&color=fff&size=80&bold=true');
    document.getElementById('profileAva').src = ava;

    document.getElementById('profileUsername').textContent = u.username || 'User';
    document.getElementById('profileRole').textContent = u.role === 'admin' ? '🛡 Admin' : 'Member';
    document.getElementById('infoUsername').textContent = u.username || '—';
    document.getElementById('infoEmail').textContent = u.email || '—';
    document.getElementById('infoRole').textContent = u.role === 'admin' ? 'Admin' : 'Member';
    
    const joined = u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Demo User';
    document.getElementById('profileJoined').textContent = 'Joined ' + joined;
    document.getElementById('infoSince').textContent = joined;
    
    if (u.bio) {
      document.getElementById('profileBio').textContent = u.bio;
    }

    // Stats
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    document.getElementById('statWatchlist').textContent = watchlist.length;
    document.getElementById('statHistory').textContent = history.length;
  }

  refreshProfile(user);

  // Fetch fresh user data from API
  fetch('/api/users/me', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => r.json()).then(freshUser => {
    if (freshUser && freshUser.id) {
      const merged = { ...user, ...freshUser };
      localStorage.setItem('user', JSON.stringify(merged));
      refreshProfile(merged);
    }
  }).catch(() => {});

  // Watchlist grid
  const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
  const wlGrid = document.getElementById('profileWLGrid');
  const wlEmpty = document.getElementById('profileWLEmpty');
  if (watchlist.length === 0) {
    wlEmpty.classList.remove('hidden');
  } else {
    wlGrid.innerHTML = watchlist.slice(0,12).map(item => \`
      <a href="/anime/\${item.slug}" class="acard">
        <div class="acard-img">
          <img src="\${item.cover || 'https://placehold.co/150x220/0f0f17/6c5ce7?text=?'}" alt="\${item.title}" loading="lazy" onerror="this.src='https://placehold.co/150x220/0f0f17/6c5ce7?text=?'">
          <div class="acard-overlay"><div class="acard-play"><i class="fas fa-play"></i></div></div>
        </div>
        <div class="acard-body"><div class="acard-name">\${item.title}</div></div>
      </a>\`).join('');
  }

  // History list
  const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
  const historyList = document.getElementById('historyList');
  const historyEmpty = document.getElementById('historyEmpty');
  if (history.length === 0) {
    historyEmpty.classList.remove('hidden');
  } else {
    historyList.innerHTML = history.slice(0,20).map(item => \`
      <a href="\${item.href || '/anime/' + item.slug}" class="history-item">
        <img src="\${item.cover || 'https://placehold.co/50x70/0f0f17/6c5ce7?text=?'}" alt="\${item.title}" onerror="this.src='https://placehold.co/50x70/0f0f17/6c5ce7?text=?'">
        <div class="history-info">
          <div class="history-title">\${item.title}</div>
          <div class="history-ep">\${item.ep ? 'Episode ' + item.ep : ''}</div>
          <div class="history-date">\${item.date ? new Date(item.date).toLocaleDateString() : ''}</div>
        </div>
        <i class="fas fa-play-circle" style="color:var(--purple2); font-size:20px;"></i>
      </a>\`).join('');
  }

  // Tab switching
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.add('hidden'));
      tab.classList.add('active');
      const content = document.getElementById('tab-' + tab.dataset.tab);
      if (content) content.classList.remove('hidden');
    });
  });

  // ==================== IMAGE UPLOAD HELPERS ====================
  function showUploadProgress(msg) {
    const el = document.getElementById('uploadProgress');
    document.getElementById('uploadProgressText').textContent = msg || 'Uploading...';
    el.style.display = 'flex';
  }
  function hideUploadProgress() {
    document.getElementById('uploadProgress').style.display = 'none';
  }

  window.triggerProfileUpload = function() {
    document.getElementById('profileImageInput').click();
  };

  window.uploadProfileImage = async function(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { window.showToast('Only image files allowed', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { window.showToast('Image must be under 5MB', 'error'); return; }
    
    showUploadProgress('Uploading profile photo...');
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
        document.getElementById('profileAva').src = data.url;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.profile_image = data.url;
        user.avatar = data.url;
        localStorage.setItem('user', JSON.stringify(user));
        // Update header avatar too
        const headerAva = document.getElementById('userAva');
        if (headerAva) headerAva.src = data.url;
        window.showToast('Profile photo updated!', 'success');
      } else {
        window.showToast(data.error || 'Upload failed. Make sure IMGBB_API_KEY is configured.', 'error');
      }
    } catch(e) {
      window.showToast('Upload failed: ' + e.message, 'error');
    } finally {
      hideUploadProgress();
      input.value = '';
    }
  };

})();
</script>
`
  return layout(`My Profile - ${siteName}`, content, '', siteName)
}
