import { layout } from './layout'
import { breadcrumb, genresFromJson } from './components'

export function watchPage(data: { anime: any, episode: any, allEpisodes: any[], prevEp: any, nextEp: any, siteName?: string }) {
  const { anime, episode, allEpisodes, prevEp, nextEp, siteName = 'DonghuaLand' } = data
  const genres = genresFromJson(anime.genres)

  // Determine what video source to show
  const hasEmbed = episode.embed_url && episode.embed_url.trim()
  const hasVideo = episode.video_url && episode.video_url.trim()

  let playerHTML = ''
  if (hasEmbed) {
    playerHTML = `<iframe 
      src="${episode.embed_url}" 
      allowfullscreen 
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      scrolling="no"
      frameborder="0"
      style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
    ></iframe>`
  } else if (hasVideo) {
    playerHTML = `<video controls style="position:absolute;top:0;left:0;width:100%;height:100%;background:#000;">
      <source src="${episode.video_url}" type="video/mp4">
      Your browser does not support video playback.
    </video>`
  } else {
    // No video source - show placeholder
    playerHTML = `
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;">
      <i class="fas fa-video-slash" style="font-size:48px;color:var(--text4);"></i>
      <div style="text-align:center;padding:0 20px;">
        <div style="font-size:16px;font-weight:700;color:var(--text2);margin-bottom:8px;">Video Not Available</div>
        <div style="font-size:13px;color:var(--text3);">This episode has no video source configured yet.</div>
        <div style="font-size:12px;color:var(--text4);margin-top:8px;">Admin can add an embed URL or video URL via the admin panel.</div>
      </div>
    </div>`
  }

  // Sort episodes ascending
  const sortedEpisodes = [...allEpisodes].sort((a, b) => a.episode_number - b.episode_number)

  const content = `
${breadcrumb([
  { label: 'Browse', href: '/search' },
  { label: anime.title, href: `/anime/${anime.slug}` },
  { label: `Episode ${episode.episode_number}` }
])}

<div class="watch-wrap">

  <!-- ====== VIDEO PLAYER SECTION ====== -->
  <div class="player-section">

    <!-- Episode Nav -->
    <div class="ep-nav-row">
      ${prevEp
        ? `<a href="/watch/${anime.slug}-episode-${prevEp.episode_number}" class="ep-nav-btn"><i class="fas fa-chevron-left"></i> Prev</a>`
        : `<span class="ep-nav-btn disabled"><i class="fas fa-chevron-left"></i> Prev</span>`}
      <a href="/anime/${anime.slug}" class="ep-nav-btn ep-nav-mid">
        <i class="fas fa-list"></i> All Episodes
      </a>
      ${nextEp
        ? `<a href="/watch/${anime.slug}-episode-${nextEp.episode_number}" class="ep-nav-btn">Next <i class="fas fa-chevron-right"></i></a>`
        : `<span class="ep-nav-btn disabled">Next <i class="fas fa-chevron-right"></i></span>`}
    </div>

    <!-- Video Player Box -->
    <div class="player-box" id="playerBox">
      <div style="position:relative; width:100%; height:100%;">
        ${playerHTML}
      </div>
    </div>

    <!-- Server Selector -->
    <div class="server-row">
      <div class="server-label"><i class="fas fa-server" style="color:var(--purple2); margin-right:4px;"></i> Video Servers</div>
      <div class="server-btns" id="serverBtns">
        ${hasEmbed ? `<button class="s-btn active"><i class="fas fa-play"></i> Server 1</button>` : ''}
        ${hasVideo ? `<button class="s-btn${!hasEmbed ? ' active' : ''}"><i class="fas fa-film"></i> Direct</button>` : ''}
        ${!hasEmbed && !hasVideo ? `<span style="font-size:12px;color:var(--text3);"><i class="fas fa-exclamation-circle"></i> No video source</span>` : ''}
      </div>
    </div>

    <!-- Watch Meta Card -->
    <div class="watch-meta-card">
      <div class="wm-head">
        <img src="${anime.cover_image || ''}" alt="${anime.title}" class="wm-poster"
             onerror="this.style.display='none'">
        <div class="wm-info">
          <a href="/anime/${anime.slug}" class="wm-title" style="transition:color 0.2s;"
             onmouseover="this.style.color='var(--purple2)'" onmouseout="this.style.color=''">${anime.title}</a>
          <div class="wm-badges">
            <span class="badge badge-purple" style="font-size:9px;">${anime.type || 'ONA'}</span>
            <span class="badge ${anime.status === 'Ongoing' ? 'badge-green' : 'badge-blue'}" style="font-size:9px;">${anime.status || 'Ongoing'}</span>
            ${anime.release_year ? `<span class="badge badge-gray" style="font-size:9px;">${anime.release_year}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="wm-actions">
        <button class="wm-action-btn" id="wlBtn" data-slug="${anime.slug}" onclick="addToWatchlist()">
          <i class="fas fa-bookmark"></i> Watchlist
        </button>
        <button class="wm-action-btn" onclick="reportIssue()">
          <i class="fas fa-flag"></i> Report
        </button>
        <button class="wm-action-btn" onclick="shareLink()">
          <i class="fas fa-share-alt"></i> Share
        </button>
        ${nextEp ? `
        <a href="/watch/${anime.slug}-episode-${nextEp.episode_number}" 
           class="wm-action-btn" style="margin-left:auto; border-color:rgba(108,92,231,0.4); color:var(--purple2);">
          <i class="fas fa-forward"></i> Next EP
        </a>` : ''}
      </div>
    </div>

    <!-- Synopsis snippet -->
    ${anime.description ? `
    <div style="background:var(--bg3); border:1px solid var(--border); border-radius:var(--r10); padding:14px; margin-bottom:12px;">
      <div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:var(--text3); margin-bottom:8px;">About</div>
      <p style="font-size:13px; color:var(--text2); line-height:1.7; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${anime.description}</p>
    </div>` : ''}

  </div><!-- end .player-section -->

  <!-- ====== EPISODE LIST BOX (Crunchyroll style) ====== -->
  <div class="cr-ep-box">
    <div class="cr-ep-head">
      <div class="cr-ep-head-left">
        <i class="fas fa-th-list" style="color:var(--purple2);"></i>
        <span>Episodes</span>
        <span class="cr-ep-total">${sortedEpisodes.length} eps</span>
      </div>
      <div class="cr-ep-head-right">
        <div class="cr-ep-search-wrap">
          <i class="fas fa-search cr-ep-search-icon"></i>
          <input type="text" class="cr-ep-search" id="crEpSearch"
            placeholder="Search episode..." autocomplete="off"
            oninput="filterCrEpisodes(this.value)">
        </div>
      </div>
    </div>
    <div class="cr-ep-list" id="crEpList">
      ${sortedEpisodes.map(ep => {
        const isActive = ep.episode_number === episode.episode_number
        const thumb = anime.cover_image || ''
        const title = ep.title || `Episode ${ep.episode_number}`
        return `
        <a href="/watch/${anime.slug}-episode-${ep.episode_number}"
           class="cr-ep-item${isActive ? ' active' : ''}"
           data-epnum="${ep.episode_number}"
           data-eptitle="${title.toLowerCase()}"
           title="${title}">
          <div class="cr-ep-thumb-wrap">
            <img src="${thumb}" alt="EP ${ep.episode_number}" class="cr-ep-thumb"
                 onerror="this.parentElement.style.background='var(--bg5)'">
            ${isActive ? `<div class="cr-ep-playing"><i class="fas fa-volume-up"></i></div>` : ''}
            <div class="cr-ep-num-badge">EP ${ep.episode_number}</div>
          </div>
          <div class="cr-ep-info">
            <div class="cr-ep-title">${title}</div>
            <div class="cr-ep-sub">${anime.title}</div>
          </div>
        </a>`
      }).join('')}
    </div>
    <div class="cr-ep-empty" id="crEpEmpty" style="display:none;">
      <i class="fas fa-search" style="margin-right:6px;"></i> No episodes found
    </div>
  </div><!-- end .cr-ep-box -->

  <!-- ====== COMMENTS BOX ====== -->
  <div class="comments-section" id="commentsSection">
    <div class="comments-hd">
      <span><i class="fas fa-comments" style="color:var(--purple2);margin-right:6px;"></i> Comments</span>
      <span class="comments-count" id="commentsCount" style="font-size:12px;color:var(--text3);"></span>
    </div>

    <!-- Post Comment Box -->
    <div class="comment-post-box" id="commentPostBox">
      <div id="commentLoginNotice" style="display:none; text-align:center; padding:14px; background:var(--bg4); border-radius:var(--r8); font-size:13px; color:var(--text3);">
        <a href="/user/login" style="color:var(--purple2);">Sign in</a> to leave a comment.
      </div>
      <div id="commentForm" style="display:none;">
        <div style="display:flex; gap:10px; align-items:flex-start;">
          <img id="commentUserAva" src="" alt="" style="width:36px;height:36px;border-radius:50%;flex-shrink:0;object-fit:cover;">
          <div style="flex:1;">
            <textarea id="commentInput" placeholder="Share your thoughts about this episode..." 
              style="width:100%;min-height:80px;background:var(--bg4);border:1px solid var(--border2);border-radius:var(--r8);padding:10px;color:var(--text1);font-size:13px;resize:vertical;font-family:inherit;outline:none;transition:border-color 0.2s;"
              onfocus="this.style.borderColor='var(--purple)'" onblur="this.style.borderColor='var(--border2)'"
              maxlength="2000"></textarea>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;flex-wrap:wrap;gap:8px;">
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text3);cursor:pointer;">
                <input type="checkbox" id="commentSpoiler" style="accent-color:var(--purple);">
                Mark as spoiler
              </label>
              <div style="display:flex;gap:8px;align-items:center;">
                <span id="commentCharCount" style="font-size:11px;color:var(--text4);">0/2000</span>
                <button onclick="postComment()" id="commentSubmitBtn"
                  style="padding:8px 18px;background:var(--purple);color:#fff;border:none;border-radius:var(--r8);font-size:13px;font-weight:700;cursor:pointer;">
                  <i class="fas fa-paper-plane"></i> Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comments List -->
    <div id="commentsList" style="margin-top:12px;">
      <div style="text-align:center;padding:20px;color:var(--text3);font-size:13px;" id="commentsLoading">
        <i class="fas fa-spinner fa-spin"></i> Loading comments...
      </div>
    </div>
    <div id="commentsLoadMore" style="text-align:center;padding:12px;display:none;">
      <button onclick="loadMoreComments()" style="background:var(--bg4);border:1px solid var(--border2);border-radius:var(--r8);padding:8px 20px;color:var(--text2);font-size:13px;cursor:pointer;">
        Load More Comments
      </button>
    </div>
  </div><!-- end .comments-section -->

</div><!-- end .watch-wrap -->

<script>
// Save to watch history
(function(){
  try {
    const hist = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const item = {
      slug: '${anime.slug}',
      title: '${anime.title.replace(/'/g, "\\'")}',
      cover: '${(anime.cover_image || '').replace(/'/g, "\\'")}',
      ep: ${episode.episode_number},
      href: '/watch/${anime.slug}-episode-${episode.episode_number}',
      date: new Date().toISOString()
    };
    const idx = hist.findIndex(h => h.slug === item.slug && h.ep === item.ep);
    if (idx >= 0) hist.splice(idx, 1);
    hist.unshift(item);
    localStorage.setItem('watchHistory', JSON.stringify(hist.slice(0, 100)));
  } catch(e) {}
})();

function addToWatchlist() {
  if (window.toggleWatchlist) {
    window.toggleWatchlist(
      '${anime.slug}',
      '${anime.title.replace(/'/g, "\\'")}',
      '${(anime.cover_image || '').replace(/'/g, "\\'")}',
      '${anime.type || 'ONA'}'
    );
  } else {
    window.showToast('Added to watchlist!', 'success');
  }
}
function reportIssue() { window.showToast('Issue reported. Thank you!', 'info'); }
function shareLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => window.showToast('Link copied!', 'success'))
    .catch(() => window.showToast('Copy: ' + window.location.href, 'info'));
}

// Episode search filter
function filterCrEpisodes(val) {
  const q = val.trim().toLowerCase();
  const items = document.querySelectorAll('.cr-ep-item');
  let found = 0;
  items.forEach(function(item) {
    const num = item.getAttribute('data-epnum') || '';
    const title = item.getAttribute('data-eptitle') || '';
    const match = !q || num.includes(q) || title.includes(q);
    item.style.display = match ? '' : 'none';
    if (match) found++;
  });
  const empty = document.getElementById('crEpEmpty');
  if (empty) empty.style.display = found === 0 ? 'block' : 'none';
}

// Auto-scroll to active episode on load
document.addEventListener('DOMContentLoaded', function() {
  const active = document.querySelector('.cr-ep-item.active');
  if (active) {
    active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  if (window.initWatchlistBtn) window.initWatchlistBtn();
  initComments();
});

// ==================== COMMENTS ====================
const EPISODE_ID = ${episode.id || 'null'};
const ANIME_ID = ${anime.id || 'null'};
let commentsPage = 1;
let totalComments = 0;
const COMMENTS_PER_PAGE = 10;
let replyingTo = null;

function initComments() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const loginNotice = document.getElementById('commentLoginNotice');
  const form = document.getElementById('commentForm');
  
  if (token && user) {
    if (form) form.style.display = 'block';
    if (loginNotice) loginNotice.style.display = 'none';
    const ava = document.getElementById('commentUserAva');
    if (ava) ava.src = user.profile_image || user.avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username) + '&background=6c5ce7&color=fff&size=36&bold=true');
    
    const input = document.getElementById('commentInput');
    const charCount = document.getElementById('commentCharCount');
    if (input && charCount) {
      input.addEventListener('input', function() { charCount.textContent = input.value.length + '/2000'; });
    }
  } else {
    if (loginNotice) loginNotice.style.display = 'block';
    if (form) form.style.display = 'none';
  }
  
  loadComments(1);
}

async function loadComments(page) {
  const loading = document.getElementById('commentsLoading');
  const list = document.getElementById('commentsList');
  
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(COMMENTS_PER_PAGE) });
    if (EPISODE_ID) params.set('episode_id', String(EPISODE_ID));
    else if (ANIME_ID) params.set('anime_id', String(ANIME_ID));
    
    const res = await fetch('/api/comments?' + params);
    const data = await res.json();
    
    if (loading) loading.style.display = 'none';
    
    totalComments = data.total || 0;
    const countEl = document.getElementById('commentsCount');
    if (countEl) countEl.textContent = totalComments + ' comment' + (totalComments !== 1 ? 's' : '');
    
    if (page === 1) list.innerHTML = '';
    
    if (!data.data || data.data.length === 0) {
      if (page === 1) list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px;"><i class="fas fa-comment-slash"></i> No comments yet. Be the first!</div>';
    } else {
      data.data.forEach(c => list.appendChild(buildCommentEl(c)));
      commentsPage = page;
    }
    
    const loadMoreBtn = document.getElementById('commentsLoadMore');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = (data.totalPages && page < data.totalPages) ? 'block' : 'none';
    }
  } catch(e) {
    if (loading) loading.style.display = 'none';
    if (list && page === 1) list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px;">Failed to load comments.</div>';
  }
}

function buildCommentEl(c) {
  const div = document.createElement('div');
  div.className = 'comment-item';
  div.dataset.id = c.id;
  
  const ava = c.user_avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(c.username || '?') + '&background=6c5ce7&color=fff&size=36&bold=true');
  const isAdmin = c.user_role === 'admin';
  const date = c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '';
  
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const canDelete = currentUser && (currentUser.id === c.user_id || currentUser.role === 'admin');
  
  const repliesHtml = (c.replies || []).map(r => buildReplyHtml(r)).join('');
  
  div.innerHTML = \`
    <div class="comment-main">
      <img src="\${ava}" alt="\${c.username || 'User'}" class="comment-ava" onerror="this.src='https://ui-avatars.com/api/?name=?&background=333&color=fff&size=36'">
      <div class="comment-body">
        <div class="comment-meta">
          <span class="comment-user">\${escHtmlC(c.username || 'User')}\${isAdmin ? ' <span class="comment-admin-badge">Admin</span>' : ''}</span>
          <span class="comment-date">\${date}</span>
          \${c.is_spoiler ? '<span class="comment-spoiler-tag">Spoiler</span>' : ''}
        </div>
        \${c.is_spoiler
          ? \`<div class="comment-spoiler-wrap">
               <div class="comment-spoiler-blur" onclick="this.parentElement.classList.add('revealed')">
                 <i class="fas fa-eye-slash"></i> Spoiler — click to reveal
               </div>
               <p class="comment-text comment-spoiler-text">\${escHtmlC(c.content || '')}</p>
             </div>\`
          : \`<p class="comment-text">\${escHtmlC(c.content || '')}</p>\`
        }
        <div class="comment-actions">
          <button onclick="likeComment(\${c.id}, this)" class="comment-action-btn">
            <i class="fas fa-heart"></i> <span class="like-count">\${c.likes || 0}</span>
          </button>
          <button onclick="startReply(\${c.id}, '\${escHtmlC(c.username || 'User')}')" class="comment-action-btn">
            <i class="fas fa-reply"></i> Reply
          </button>
          \${canDelete ? \`<button onclick="deleteComment(\${c.id}, this)" class="comment-action-btn comment-delete-btn"><i class="fas fa-trash"></i></button>\` : ''}
        </div>
        <div class="reply-form-wrap" id="replyForm-\${c.id}" style="display:none;margin-top:10px;"></div>
        \${repliesHtml ? \`<div class="comment-replies">\${repliesHtml}</div>\` : ''}
      </div>
    </div>\`;
  return div;
}

function buildReplyHtml(r) {
  const ava = r.user_avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(r.username || '?') + '&background=6c5ce7&color=fff&size=30&bold=true');
  const isAdmin = r.user_role === 'admin';
  const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '';
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const canDelete = currentUser && (currentUser.id === r.user_id || currentUser.role === 'admin');
  
  return \`<div class="comment-reply" data-id="\${r.id}">
    <img src="\${ava}" alt="" class="comment-ava-sm" onerror="this.src='https://ui-avatars.com/api/?name=?&background=333&color=fff&size=30'">
    <div class="comment-body">
      <div class="comment-meta">
        <span class="comment-user">\${escHtmlC(r.username || 'User')}\${isAdmin ? ' <span class="comment-admin-badge">Admin</span>' : ''}</span>
        <span class="comment-date">\${date}</span>
      </div>
      <p class="comment-text">\${escHtmlC(r.content || '')}</p>
      <div class="comment-actions">
        <button onclick="likeComment(\${r.id}, this)" class="comment-action-btn"><i class="fas fa-heart"></i> <span class="like-count">\${r.likes||0}</span></button>
        \${canDelete ? \`<button onclick="deleteComment(\${r.id}, this.closest('.comment-reply'))" class="comment-action-btn comment-delete-btn"><i class="fas fa-trash"></i></button>\` : ''}
      </div>
    </div>
  </div>\`;
}

function escHtmlC(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function startReply(parentId, username) {
  document.querySelectorAll('.reply-form-wrap').forEach(function(el) { el.style.display = 'none'; el.innerHTML = ''; });
  
  replyingTo = parentId;
  const wrap = document.getElementById('replyForm-' + parentId);
  if (!wrap) return;
  
  const token = localStorage.getItem('token');
  if (!token) { window.showToast('Please sign in to reply', 'info'); return; }
  
  wrap.style.display = 'block';
  wrap.innerHTML = \`
    <div style="display:flex;gap:8px;align-items:flex-start;">
      <div style="flex:1;">
        <div style="font-size:11px;color:var(--purple2);margin-bottom:5px;">Replying to @\${escHtmlC(username)}</div>
        <textarea id="replyInput-\${parentId}" placeholder="Write a reply..." maxlength="1000"
          style="width:100%;min-height:60px;background:var(--bg5);border:1px solid var(--border2);border-radius:var(--r8);padding:8px;color:var(--text1);font-size:13px;resize:vertical;font-family:inherit;outline:none;"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px;">
          <button onclick="cancelReply(\${parentId})" style="padding:6px 12px;background:transparent;border:1px solid var(--border2);border-radius:var(--r8);color:var(--text2);font-size:12px;cursor:pointer;">Cancel</button>
          <button onclick="submitReply(\${parentId})" style="padding:6px 14px;background:var(--purple);border:none;border-radius:var(--r8);color:#fff;font-size:12px;font-weight:700;cursor:pointer;"><i class="fas fa-paper-plane"></i> Reply</button>
        </div>
      </div>
    </div>\`;
  document.getElementById('replyInput-' + parentId)?.focus();
}

function cancelReply(parentId) {
  const wrap = document.getElementById('replyForm-' + parentId);
  if (wrap) { wrap.style.display = 'none'; wrap.innerHTML = ''; }
  replyingTo = null;
}

async function submitReply(parentId) {
  const input = document.getElementById('replyInput-' + parentId);
  if (!input) return;
  const content = input.value.trim();
  if (!content) { window.showToast('Reply cannot be empty', 'error'); return; }
  
  const token = localStorage.getItem('token');
  try {
    const body = { content, parent_id: parentId };
    if (EPISODE_ID) body.episode_id = EPISODE_ID;
    else if (ANIME_ID) body.anime_id = ANIME_ID;
    
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      cancelReply(parentId);
      window.showToast('Reply posted!', 'success');
      loadComments(1);
    } else {
      window.showToast(data.error || 'Failed to post reply', 'error');
    }
  } catch(e) { window.showToast('Error: ' + e.message, 'error'); }
}

async function postComment() {
  const input = document.getElementById('commentInput');
  const spoilerEl = document.getElementById('commentSpoiler');
  const token = localStorage.getItem('token');
  
  if (!token) { window.showToast('Please sign in to comment', 'info'); return; }
  if (!input || !input.value.trim()) { window.showToast('Comment cannot be empty', 'error'); return; }
  
  const btn = document.getElementById('commentSubmitBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
  
  try {
    const body = {
      content: input.value.trim(),
      is_spoiler: spoilerEl ? spoilerEl.checked : false,
    };
    if (EPISODE_ID) body.episode_id = EPISODE_ID;
    else if (ANIME_ID) body.anime_id = ANIME_ID;
    
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      input.value = '';
      if (spoilerEl) spoilerEl.checked = false;
      const cc = document.getElementById('commentCharCount');
      if (cc) cc.textContent = '0/2000';
      window.showToast(data.is_approved ? 'Comment posted!' : 'Comment submitted for review', 'success');
      loadComments(1);
    } else {
      window.showToast(data.error || 'Failed to post comment', 'error');
    }
  } catch(e) { window.showToast('Error: ' + e.message, 'error'); }
  finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Post'; }
  }
}

async function likeComment(id, btn) {
  const token = localStorage.getItem('token');
  if (!token) { window.showToast('Sign in to like comments', 'info'); return; }
  
  try {
    const res = await fetch('/api/comments/' + id + '/like', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (data.success) {
      const countEl = btn.querySelector('.like-count');
      if (countEl) {
        const cur = parseInt(countEl.textContent) || 0;
        countEl.textContent = data.action === 'liked' ? cur + 1 : Math.max(0, cur - 1);
      }
      btn.style.color = data.action === 'liked' ? 'var(--red)' : '';
    }
  } catch(e) {}
}

async function deleteComment(id, el) {
  if (!confirm('Delete this comment?')) return;
  const token = localStorage.getItem('token');
  
  try {
    const res = await fetch('/api/comments/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (data.success) {
      if (el && el.closest) el.closest('.comment-item, .comment-reply')?.remove();
      window.showToast('Comment deleted', 'success');
      totalComments = Math.max(0, totalComments - 1);
      const countEl = document.getElementById('commentsCount');
      if (countEl) countEl.textContent = totalComments + ' comment' + (totalComments !== 1 ? 's' : '');
    }
  } catch(e) { window.showToast('Failed to delete', 'error'); }
}

window.loadMoreComments = function() {
  loadComments(commentsPage + 1);
};
</script>

<style>
/* ===== Comments Styles ===== */
.comments-section { background:var(--bg3); border:1px solid var(--border); border-radius:var(--r12); padding:18px; margin-top:14px; }
.comments-hd { display:flex; align-items:center; justify-content:space-between; font-size:14px; font-weight:700; color:var(--text1); margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid var(--border); }
.comment-post-box { margin-bottom:16px; }
.comment-item { padding:12px 0; border-bottom:1px solid var(--border); }
.comment-item:last-child { border-bottom:none; }
.comment-main { display:flex; gap:10px; }
.comment-ava { width:36px; height:36px; border-radius:50%; flex-shrink:0; object-fit:cover; }
.comment-ava-sm { width:28px; height:28px; border-radius:50%; flex-shrink:0; object-fit:cover; }
.comment-body { flex:1; min-width:0; }
.comment-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:5px; }
.comment-user { font-size:13px; font-weight:700; color:var(--text1); }
.comment-admin-badge { background:var(--purple-dim); color:var(--purple2); font-size:9px; padding:1px 6px; border-radius:20px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
.comment-date { font-size:11px; color:var(--text4); }
.comment-spoiler-tag { background:rgba(241,196,15,0.15); color:var(--gold); font-size:9px; padding:1px 6px; border-radius:20px; font-weight:700; text-transform:uppercase; }
.comment-text { font-size:13px; color:var(--text2); line-height:1.6; white-space:pre-wrap; word-break:break-word; margin:0; }
.comment-spoiler-wrap { position:relative; }
.comment-spoiler-blur { position:absolute; inset:0; backdrop-filter:blur(8px); background:rgba(var(--bg3-rgb,15,15,23),0.8); display:flex; align-items:center; justify-content:center; gap:6px; font-size:12px; color:var(--text3); cursor:pointer; border-radius:4px; z-index:1; }
.comment-spoiler-wrap.revealed .comment-spoiler-blur { display:none; }
.comment-actions { display:flex; align-items:center; gap:8px; margin-top:6px; }
.comment-action-btn { background:none; border:none; color:var(--text4); font-size:12px; cursor:pointer; padding:3px 7px; border-radius:var(--r6); transition:all 0.15s; display:flex; align-items:center; gap:4px; }
.comment-action-btn:hover { background:var(--bg4); color:var(--text2); }
.comment-delete-btn:hover { color:var(--red) !important; }
.comment-replies { margin-top:10px; padding-left:16px; border-left:2px solid var(--border); display:flex; flex-direction:column; gap:8px; }
.comment-reply { display:flex; gap:8px; }
</style>
`

  return layout(`Watch ${anime.title} Episode ${episode.episode_number} - ${siteName}`, content, '', siteName)
}
