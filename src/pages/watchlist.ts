import { layout } from './layout'
import { animeCard } from './components'

export function watchlistPage(siteName: string = 'DonghuaLand'): string {
  const content = `
<div class="user-page-wrap">
  <div class="user-page-header">
    <h1><i class="fas fa-bookmark"></i> My Watchlist</h1>
    <p>Anime you've saved to watch later</p>
  </div>

  <div id="wlContent">
    <div class="wl-toolbar">
      <div class="wl-count" id="wlCount">0 anime</div>
      <button class="btn-danger-sm" onclick="clearWatchlist()" id="wlClearBtn" style="display:none">
        <i class="fas fa-trash"></i> Clear All
      </button>
    </div>
    <div class="grid-5" id="wlGrid"></div>
    <div class="wl-empty hidden" id="wlEmpty">
      <i class="fas fa-bookmark"></i>
      <h3>Your Watchlist is Empty</h3>
      <p>Browse anime and click the bookmark button to save them here.</p>
      <a href="/search" class="btn-primary-sm"><i class="fas fa-compass"></i> Browse Anime</a>
    </div>
  </div>
</div>

<script>
(function(){
  const grid = document.getElementById('wlGrid');
  const empty = document.getElementById('wlEmpty');
  const count = document.getElementById('wlCount');
  const clearBtn = document.getElementById('wlClearBtn');

  function render() {
    const list = window.getWatchlist ? window.getWatchlist() : JSON.parse(localStorage.getItem('watchlist') || '[]');
    count.textContent = list.length + ' anime';
    if (list.length === 0) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      clearBtn.style.display = 'none';
    } else {
      empty.classList.add('hidden');
      clearBtn.style.display = '';
      grid.innerHTML = list.map(item => \`
        <div class="wl-card-wrap">
          <a href="/anime/\${item.slug}" class="acard">
            <div class="acard-img">
              <img src="\${item.cover || 'https://placehold.co/150x220/0f0f17/6c5ce7?text=?'}" alt="\${item.title}" loading="lazy"
                   onerror="this.src='https://placehold.co/150x220/0f0f17/6c5ce7?text=?'">
              <div class="acard-overlay"><div class="acard-play"><i class="fas fa-play"></i></div></div>
              \${item.type ? \`<div class="acard-type">\${item.type}</div>\` : ''}
            </div>
            <div class="acard-body">
              <div class="acard-name">\${item.title}</div>
              <div class="acard-meta"><span>\${new Date(item.addedAt).toLocaleDateString()}</span></div>
            </div>
          </a>
          <button class="wl-remove-btn" onclick="removeFromWL('\${item.slug}')" title="Remove">
            <i class="fas fa-times"></i>
          </button>
        </div>
      \`).join('');
    }
  }

  window.removeFromWL = function(slug) {
    const list = JSON.parse(localStorage.getItem('watchlist') || '[]');
    localStorage.setItem('watchlist', JSON.stringify(list.filter(i => i.slug !== slug)));
    render();
    if(window.showToast) window.showToast('Removed from watchlist', 'info');
  };

  window.clearWatchlist = function() {
    if(!confirm('Clear your entire watchlist?')) return;
    localStorage.removeItem('watchlist');
    render();
    if(window.showToast) window.showToast('Watchlist cleared', 'info');
  };

  render();
})();
</script>
`
  return layout(`My Watchlist - ${siteName}`, content, '', siteName)
}
