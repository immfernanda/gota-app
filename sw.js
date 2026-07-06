// Service worker do App Gota 💧
// - HTML: "rede primeiro" (sempre pega a versão nova quando online; cai no cache offline).
// - Outros arquivos: "stale-while-revalidate" (mostra rápido do cache e atualiza por baixo).
// - Cache versionado: ao subir a versão, o cache antigo é apagado no activate.
// Ao mudar arquivos, suba o número da versão para forçar a atualização.
const CACHE = 'gota-v3';

const APP_SHELL = [
  './',
  './index.html',
  './relatorio.html',
  './manifest.webmanifest',
  './img/icons/icon-192.png',
  './img/icons/icon-512.png',
  './img/gota-heroi.png',
  './img/gota-triste.png'
];

const FONTES = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll falha tudo se um arquivo faltar; aqui cada um é opcional
      .then(c => Promise.all(APP_SHELL.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Permite que a página peça para o SW novo assumir na hora
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return; // POSTs (sincronização com a planilha) passam direto
  const url = new URL(req.url);
  const mesmaOrigem = url.origin === self.location.origin;
  const ehFonte = FONTES.includes(url.origin);

  // Navegação / HTML: rede primeiro (pega atualizações), cai pro cache se estiver offline
  if (req.mode === 'navigate' || (mesmaOrigem && req.destination === 'document')) {
    e.respondWith(
      fetch(req)
        .then(resp => { atualizaCache(req, resp.clone()); return resp; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Estáticos (imagens, manifest, fontes): stale-while-revalidate
  if (mesmaOrigem || ehFonte) {
    e.respondWith(
      caches.match(req).then(cacheado => {
        const rede = fetch(req)
          .then(resp => { atualizaCache(req, resp.clone()); return resp; })
          .catch(() => cacheado);
        return cacheado || rede;
      })
    );
    return;
  }
  // Resto (ex.: Google Apps Script): deixa a rede cuidar, sem cache
});

function atualizaCache(req, resp) {
  if (resp && resp.ok) caches.open(CACHE).then(c => c.put(req, resp));
}

// ===================== NOTIFICAÇÕES =====================
// Recebe o push (item 5 - Web Push) e mostra a notificação mesmo com o app fechado.
self.addEventListener('push', e => {
  let dados = {};
  try { dados = e.data ? e.data.json() : {}; } catch (err) { dados = { corpo: e.data && e.data.text() }; }
  const titulo = dados.titulo || 'Gota 💧';
  const opcoes = {
    body: dados.corpo || dados.body || 'Hora de cuidar da rotina!',
    icon: dados.icon || './img/icons/icon-192.png',
    badge: dados.badge || './img/icons/icon-192.png',
    vibrate: [120, 60, 120],
    tag: dados.tag || 'gota-lembrete',
    renotify: true,
    data: { url: dados.url || './index.html' }
  };
  e.waitUntil(self.registration.showNotification(titulo, opcoes));
});

// Ao tocar na notificação, abre/foca o app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const destino = (e.notification.data && e.notification.data.url) || './index.html';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientes => {
      for (const c of clientes) {
        if ('focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(destino);
    })
  );
});
