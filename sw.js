// Service worker do App Gota 💧
// Faz o app abrir offline e permite instalar na tela inicial.
// Ao mudar arquivos, suba o número da versão para forçar atualização.
const CACHE = 'gota-v2';

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

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return; // POSTs (sincronização com a planilha) passam direto
  const url = new URL(req.url);
  const mesmaOrigem = url.origin === self.location.origin;
  const ehFonte = FONTES.includes(url.origin);

  // Navegação: rede primeiro (pega atualizações), cai pro cache se estiver offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(resp => { atualizaCache(req, resp.clone()); return resp; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Estáticos (imagens, manifest, fontes): cache primeiro, senão rede
  if (mesmaOrigem || ehFonte) {
    e.respondWith(
      caches.match(req).then(cacheado =>
        cacheado || fetch(req).then(resp => { atualizaCache(req, resp.clone()); return resp; })
      )
    );
    return;
  }
  // Resto (ex.: Google Apps Script): deixa a rede cuidar, sem cache
});

function atualizaCache(req, resp) {
  if (resp && resp.ok) caches.open(CACHE).then(c => c.put(req, resp));
}
