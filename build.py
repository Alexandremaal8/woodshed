import pathlib, json
src = pathlib.Path('src'); dist = pathlib.Path('.')
VERSION = '1.7.0'
css = (src/'styles.css').read_text()
js = '\n'.join((src/f).read_text() for f in ['music.js','audio.js','content.js','content2.js','store.js','ui.js','components.js','views.js','library.js','teacher.js','app.js'])
html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#120f0d">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Woodshed">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="manifest" href="manifest.webmanifest">
<title>Woodshed</title>
<style>{css}</style>
</head>
<body>
<div id="app"></div>
<script>
{js}
</script>
</body>
</html>
'''
(dist/'index.html').write_text(html)
manifest = {"name":"Woodshed","short_name":"Woodshed","description":"Guitar practice: theory, ear training, backing tracks and recording.","start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#120f0d","theme_color":"#120f0d",
  "icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}
(dist/'manifest.webmanifest').write_text(json.dumps(manifest, indent=2))
sw = f'''const CACHE = 'woodshed-{VERSION}';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {{ e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); }});
self.addEventListener('activate', e => {{ e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); }});
// Network first (so updates arrive), cache fallback (so it works offline)
self.addEventListener('fetch', e => {{
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => {{ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }}).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
}});
'''
(dist/'sw.js').write_text(sw)
print('built', len(html)//1024, 'KB')
