import { layout } from './layout'

export function notFoundPage(siteName: string = 'DonghuaLand'): string {
  const content = `
<div class="error-page">
  <div>
    <div class="code">404</div>
    <h1>Page Not Found</h1>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <a href="/" class="btn-home"><i class="fas fa-home"></i> Back to Home</a>
    <div style="margin-top:16px;">
      <a href="/search" style="color:var(--purple2); font-size:13px; margin-right:16px;">Browse Anime</a>
      <a href="/search?status=Ongoing" style="color:var(--text3); font-size:13px;">Ongoing Shows</a>
    </div>
  </div>
</div>
`
  return layout(`404 - Page Not Found - ${siteName}`, content, '', siteName)
}
