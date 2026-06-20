// ============================================================
// PWA Routes — manifest.json + service-worker + icon serving
// Dynamic: reads site settings so nothing is hardcoded.
// ============================================================
import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  SITE_NAME: string
  THEME_COLOR?: string
  BG_COLOR?: string
}

const pwa = new Hono<{ Bindings: Bindings }>()

// ── Helpers ──────────────────────────────────────────────────
async function getSiteName(db: D1Database | undefined, envName?: string): Promise<string> {
  if (envName) return envName
  if (!db) return 'Anime World'
  try {
    const row = await db.prepare("SELECT value FROM settings WHERE key='site_name'").first() as any
    return row?.value || 'Anime World'
  } catch { return 'Anime World' }
}

async function getSiteDescription(db: D1Database | undefined): Promise<string> {
  if (!db) return 'Stream anime online for free in HD — new episodes daily.'
  try {
    const row = await db.prepare("SELECT value FROM settings WHERE key='site_description'").first() as any
    return row?.value || 'Stream anime online for free in HD — new episodes daily.'
  } catch { return 'Stream anime online for free in HD — new episodes daily.' }
}

// ── /manifest.json ────────────────────────────────────────────
pwa.get('/manifest.json', async (c) => {
  const db = c.env?.DB
  const siteName = await getSiteName(db, c.env?.SITE_NAME)
  const description = await getSiteDescription(db)

  // Dynamic short name: first word or first 12 chars
  const shortName = siteName.split(/\s+/)[0].slice(0, 12) || siteName.slice(0, 12)

  const manifest = {
    name: siteName,
    short_name: shortName,
    description: description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    theme_color: '#7c3aed',
    background_color: '#080810',
    lang: 'en',
    categories: ['entertainment', 'video'],
    icons: [
      { src: '/static/icon-72x72.png',   sizes: '72x72',   type: 'image/png', purpose: 'any' },
      { src: '/static/icon-96x96.png',   sizes: '96x96',   type: 'image/png', purpose: 'any' },
      { src: '/static/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
      { src: '/static/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
      { src: '/static/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
      { src: '/static/icon-167x167.png', sizes: '167x167', type: 'image/png', purpose: 'any' },
      { src: '/static/icon-180x180.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
      { src: '/static/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/static/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
      { src: '/static/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: 'Browse Anime',
        url: '/search',
        description: 'Browse all anime',
        icons: [{ src: '/static/icon-96x96.png', sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Schedule',
        url: '/schedule',
        description: 'View airing schedule',
        icons: [{ src: '/static/icon-96x96.png', sizes: '96x96', type: 'image/png' }],
      },
    ],
    prefer_related_applications: false,
  }

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})

// ── /sw.js — Service Worker ───────────────────────────────────
pwa.get('/sw.js', async (c) => {
  const swContent = `
// ============================================================
// Service Worker — Offline-first with stale-while-revalidate
// Auto-versioned from build time for safe cache busting.
// ============================================================

const CACHE_VERSION = '${Date.now()}';
const CACHE_NAME    = 'anime-pwa-v' + CACHE_VERSION;
const STATIC_CACHE  = 'anime-static-v' + CACHE_VERSION;
const IMAGE_CACHE   = 'anime-images-v1';  // images use longer TTL

const STATIC_ASSETS = [
  '/',
  '/static/style.css',
  '/static/app.js',
  '/static/icon.png',
  '/static/logo.png',
  '/manifest.json',
];

// ── Install: pre-cache critical assets ──────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ───────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== IMAGE_CACHE && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch Strategy ───────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass: non-GET, external, API calls, admin panel
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/admin')) return;

  // Images: Cache-first with long TTL
  if (
    request.destination === 'image' ||
    /\\.(png|jpg|jpeg|webp|gif|svg|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirstImage(request));
    return;
  }

  // Static assets (CSS, JS, fonts): Stale-while-revalidate
  if (
    url.pathname.startsWith('/static/') ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // HTML pages: Network-first with offline fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstHtml(request));
    return;
  }

  // Default: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
});

// ── Cache Strategies ─────────────────────────────────────────

async function cacheFirstImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      cache.put(request, clone);
    }
    return response;
  } catch {
    return new Response('', { status: 404 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

async function networkFirstHtml(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Offline fallback: return cached home page
    const fallback = await cache.match('/');
    if (fallback) return fallback;
    return new Response(offlinePage(), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function offlinePage() {
  return \`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#080810;color:#e8e8f0;font-family:system-ui,sans-serif;
       min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
  .wrap{text-align:center;max-width:380px}
  .icon{font-size:64px;margin-bottom:20px}
  h1{font-size:26px;font-weight:800;margin-bottom:10px;color:#fff}
  p{font-size:14px;color:#8080a0;line-height:1.7;margin-bottom:24px}
  button{background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;
         border:none;padding:12px 28px;border-radius:50px;font-size:15px;
         font-weight:600;cursor:pointer}
</style>
</head>
<body>
<div class="wrap">
  <div class="icon">🐉</div>
  <h1>You're Offline</h1>
  <p>No internet connection. Previously visited pages are available from cache.</p>
  <button onclick="window.location.reload()">Try Again</button>
</div>
</body>
</html>\`;
}
`

  return new Response(swContent, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  })
})

export { pwa }
