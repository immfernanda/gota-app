# 🌐 Publicar o App Gota na Hostinger (com domínio próprio)

O Gota é um PWA (site que vira app). Publicar na Hostinger dá pra vocês um
**link bonito com domínio próprio** e o **cadeado (HTTPS)** que o app precisa.

## Passo 1 · Ter um domínio

- No painel da Hostinger (hPanel), veja em **Domínios** se seu plano **já inclui um domínio grátis** (muitos incluem no 1º ano).
- Se sim, registre o nome que quiser (ex.: `gotaosite.com.br`, `appgota.com`).
- Se não, dá pra comprar um ali mesmo, ou usar um subdomínio grátis pra testar.

## Passo 2 · Enviar os arquivos do app

Você vai subir os arquivos para a pasta **`public_html`** do domínio.

1. No hPanel, abra **Gerenciador de Arquivos** (File Manager) e entre em `public_html`.
   - Se tiver um `index.html` de exemplo da Hostinger ali, pode apagar.
2. Envie **o conteúdo da pasta `gota-master`** (a de dentro, onde está o `index.html`):
   - `index.html`
   - `relatorio.html`
   - `manifest.webmanifest`
   - `sw.js`
   - `.htaccess`
   - a pasta `img/` (inteira, com `icons/` e `avatars/`)
   - > A pasta `planilha/` e os arquivos `.md` (guias) **não precisam** ser enviados.
3. Dica: comprima tudo num `.zip`, envie o zip e use **Extrair** no próprio File Manager (bem mais rápido que arrastar arquivo por arquivo).

## Passo 3 · Ligar o HTTPS (cadeado)

- No hPanel, vá em **Segurança → SSL** e ative o **SSL grátis** para o domínio (às vezes já vem ligado).
- O `.htaccess` que enviamos já força o site a abrir sempre em `https://`.

## Passo 4 · Testar

- Abra `https://seudominio.com` no celular. O Gota deve carregar direto (sem `/index.html`, sem barra sobrando).
- No Android: menu do navegador → **Instalar aplicativo**. No iPhone: **Compartilhar → Adicionar à Tela de Início**.
- Relatório da profissional: `https://seudominio.com/relatorio.html` (senha 2611).

## Se atualizar o app depois

É só reenviar os arquivos alterados para `public_html` (substituindo). O `.htaccess`
já evita que o service worker fique preso numa versão antiga.

## Observações

- **Não precisa mudar nada no código** — os caminhos são relativos e funcionam na raiz.
- A **planilha** (Google) continua igual, é independente da hospedagem.
- Depois de publicado, dá pra apontar o mesmo domínio pra cá e aposentar o link do GitHub.
