import { layout } from './layout'

export function historyPage(siteName: string = 'DonghuaLand'): string {
  const content = `
<div class="user-page-wrap">
  <div class="user-page-header">
    <h1><i class="fas fa-history"></i> Watch History</h1>
    <p>Episodes you've recently watched</p>
  </div>
  <div class="wl-toolbar">
    <div class="wl-count" id="histCount">0 episodes</div>
    <button class="btn-danger-sm" onclick="clearHistory()" id="histClearBtn" style="display:none">
      <i class="fas fa-trash"></i> Clear History
    </button>
  </div>
  <div class="history-list" id="historyList"></div>
  <div class="wl-empty hidden" id="histEmpty">
    <i class="fas fa-history"></i>
    <h3>No Watch History</h3>
    <p>Episodes you watch will appear here.</p>
    <a href="/" class="btn-primary-sm"><i class="fas fa-home"></i> Go Home</a>
  </div>
</div>

<script>
(function(){
  const list = document.getElementById('historyList');
  const empty = document.getElementById('histEmpty');
  const count = document.getElementById('histCount');
  const clearBtn = document.getElementById('histClearBtn');

  function render() {
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    count.textContent = history.length + ' episodes';
    if (history.length === 0) {
      list.innerHTML = '';
      empty.classList.remove('hidden');
      clearBtn.style.display = 'none';
    } else {
      empty.classList.add('hidden');
      clearBtn.style.display = '';
      list.innerHTML = history.map((item, i) => \`
        <a href="\${item.href}" class="history-item">
          <img src="\${item.cover || 'https://placehold.co/60x84/0f0f17/6c5ce7?text=?'}" alt="\${item.title}"
               onerror="this.src='https://placehold.co/60x84/0f0f17/6c5ce7?text=?'">
          <div class="history-info">
            <div class="history-title">\${item.title}</div>
            <div class="history-ep">\${item.ep ? 'Episode ' + item.ep : ''}</div>
            <div class="history-date">\${item.date ? new Date(item.date).toLocaleString() : ''}</div>
          </div>
          <i class="fas fa-play-circle" style="color:var(--purple2); font-size:22px; flex-shrink:0;"></i>
        </a>
      \`).join('');
    }
  }

  window.clearHistory = function() {
    if (!confirm('Clear your entire watch history?')) return;
    localStorage.removeItem('watchHistory');
    render();
    if(window.showToast) window.showToast('History cleared', 'info');
  };

  render();
})();
</script>
`
  return layout(`Watch History - ${siteName}`, content, '', siteName)
}
