// ============================================================
// 📊 App Gota · Código da planilha (Google Apps Script)
// Cole este arquivo inteiro no editor do Apps Script da planilha
// (Extensões → Apps Script), salve e implante como App da Web.
// O passo a passo completo está no arquivo GUIA-PLANILHA.md.
// ============================================================

// Senha usada pelo relatório para ler os dados.
// Use a MESMA senha que está em PROFISSIONAL.pin no index.html.
const PIN = '2611';

const NOME_ABA = 'Registros';
const CABECALHO = ['Recebido em', 'Data', 'Hora', 'Criança', 'Responsável', 'Tipo', 'Detalhe', 'Meta de copos', 'Copo (mL)'];

function aba_() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(NOME_ABA);
  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA);
    aba.appendRow(CABECALHO);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, CABECALHO.length).setFontWeight('bold').setBackground('#E8F4D9');
  }
  return aba;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Recebe cada registro enviado pelo app das famílias
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    // Apagar dados de uma criança (usado pelo botão 🗑️ do relatório)
    if (d.action === 'apagar') return apagar_(d);
    const aba = aba_();
    const linha = aba.getLastRow() + 1;
    // Guarda Data (col 2) e Hora (col 3) como TEXTO puro, senão o Sheets
    // converte "2026-07-03" numa célula de data e bagunça o relatório.
    aba.getRange(linha, 2, 1, 2).setNumberFormat('@');
    aba.getRange(linha, 1, 1, 9).setValues([[
      new Date(),
      String(d.data || ''),
      String(d.hora || ''),
      String(d.crianca || ''),
      String(d.responsavel || ''),
      String(d.tipo || ''),
      String(d.detalhe || ''),
      d.meta || '',
      d.copoMl || ''
    ]]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, erro: String(err) });
  }
}

// Apaga todas as linhas de uma criança (protegido por PIN)
function apagar_(d) {
  if (String(d.pin || '') !== PIN) return json_({ ok: false, erro: 'PIN incorreto' });
  const aba = aba_();
  const valores = aba.getDataRange().getValues();
  let apagadas = 0;
  // de baixo para cima, para os índices não mudarem ao deletar
  for (let i = valores.length - 1; i >= 1; i--) {
    const l = valores[i];
    const mesmaCrianca = String(l[3]) === String(d.crianca || '');
    const mesmoResp = (d.responsavel == null) || String(l[4]) === String(d.responsavel);
    if (mesmaCrianca && mesmoResp) { aba.deleteRow(i + 1); apagadas++; }
  }
  return json_({ ok: true, apagadas: apagadas });
}

// Entrega os dados para o relatorio.html (protegido por PIN)
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (String(p.pin || '') !== PIN) {
    return json_({ ok: false, erro: 'PIN incorreto' });
  }
  const dias = Math.min(Math.max(parseInt(p.dias, 10) || 30, 1), 120);
  const desde = new Date(Date.now() - dias * 24 * 3600 * 1000);
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  // Se alguma linha antiga ficou salva como data/hora (não texto), reformata
  const txtData = v => (v instanceof Date) ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : String(v);
  const txtHora = v => (v instanceof Date) ? Utilities.formatDate(v, tz, 'HH:mm') : String(v);

  const valores = aba_().getDataRange().getValues();
  const registros = [];
  for (let i = 1; i < valores.length; i++) {
    const linha = valores[i];
    const recebido = new Date(linha[0]);
    if (isNaN(recebido) || recebido < desde) continue;
    registros.push({
      ts: recebido.getTime(),
      data: txtData(linha[1]),
      hora: txtHora(linha[2]),
      crianca: String(linha[3]),
      responsavel: String(linha[4]),
      tipo: String(linha[5]),
      detalhe: String(linha[6]),
      meta: linha[7] === '' ? null : Number(linha[7]),
      copoMl: linha[8] === '' ? null : Number(linha[8])
    });
  }
  return json_({ ok: true, dias: dias, geradoEm: new Date().toISOString(), registros: registros });
}
