# 📊 Guia: ligando o App Gota à planilha (5 minutinhos)

Depois desses passos, **todo registro** que as famílias fizerem no app (água, xixi, tarefas e sinais do dia) cai automaticamente numa planilha do Google, e a Maria Vitória vê tudo bonitinho no `relatorio.html`.

## Passo 1 · Criar a planilha

1. Acesse [sheets.new](https://sheets.new) (logada na conta Google que vai guardar os dados).
2. Dê um nome, por exemplo: **Registros · App Gota**.

## Passo 2 · Colar o código

1. Na planilha, abra o menu **Extensões → Apps Script**.
2. Apague tudo que estiver no editor.
3. Copie o conteúdo inteiro do arquivo **`Code.gs`** (está nesta mesma pasta) e cole lá.
4. Se quiser trocar a senha do relatório, mude a linha `const PIN = '1234'`
   (use a mesma senha que está em `PROFISSIONAL.pin` no `index.html`).
5. Clique no ícone de **disquete 💾** para salvar.

## Passo 3 · Publicar como App da Web

1. No Apps Script, clique em **Implantar → Nova implantação**.
2. Clique na engrenagem ⚙️ e escolha **App da Web**.
3. Preencha assim:
   - **Executar como:** Eu (sua conta)
   - **Quem pode acessar:** Qualquer pessoa
4. Clique em **Implantar**.
5. O Google vai pedir autorização: clique em **Autorizar acesso**, escolha sua conta
   e, se aparecer o aviso "app não verificado", clique em **Avançado → Acessar (não seguro)**.
   (É seguro: o código é o que você acabou de colar.)
6. **Copie a URL do App da Web** que aparece no final (termina com `/exec`).

## Passo 4 · Colar a URL nos dois arquivos

1. **`index.html`** (o app das famílias): procure a linha

   ```js
   const PROFISSIONAL = { nome:'Maria Vitória', whatsapp:'', pin:'1234', planilhaUrl:'' };
   ```

   e cole a URL dentro das aspas de `planilhaUrl`.

2. **`relatorio.html`** (a página da Maria Vitória): procure a linha

   ```js
   const PLANILHA_URL = '';
   ```

   e cole a mesma URL dentro das aspas.

## Passo 5 · Testar

1. Abra o app, registre um copo de água.
2. Olhe a planilha: deve aparecer uma linha nova na aba **Registros** em alguns segundos.
   (A aba e o cabeçalho são criados sozinhos no primeiro registro.)
3. Abra o `relatorio.html`, digite a senha, e pronto! 🎉

## Como a Maria Vitória usa

- Ela só precisa do arquivo `relatorio.html` (pode mandar por WhatsApp/e-mail, ou hospedar junto com o app).
- Ela abre, digita a senha, e vê **todas as crianças**: água e xixi de hoje, gráficos por dia, escapes e sinais do fim do dia.
- O botão **🖨️ Imprimir / PDF** gera um PDF bonito pra arquivar ou compartilhar.

## Se algo der errado

- **"Função de script não encontrada: doGet"**: duas causas comuns —
  1. **O código foi colado dentro do `function myFunction() {}` de exemplo.** Se a linha 1 do editor for `function myFunction() {`, todas as funções ficam presas dentro dela e o Google não acha o `doGet`. Correção: **Ctrl+A → Delete** pra apagar tudo, e cole o `Code.gs` limpo (a 1ª linha tem que ser um comentário `// ===`, sem nenhum `function myFunction`).
  2. A implantação foi publicada antes do código estar salvo.
  Nos dois casos, depois de corrigir: salve no **disquete 💾** e **Implantar → Gerenciar implantações → ✏️ Editar → Versão: Nova versão → Implantar** (a URL continua a mesma).
- **"Senha incorreta"**: o PIN digitado precisa ser igual ao `const PIN` do Apps Script.
- **Nada chega na planilha**: confira se a URL em `planilhaUrl` termina com `/exec` e se a implantação está com acesso "Qualquer pessoa".
- **Mudou o código do Apps Script?** É preciso implantar de novo: **Implantar → Gerenciar implantações → ✏️ Editar → Versão: Nova versão → Implantar** (a URL continua a mesma).
