(function(){
document.getElementById('zipBuscaInput')?.addEventListener('change', async (event)=>{
const file = event.target.files?.[0];
const out = document.getElementById('mensagemBusca');
if(!file){ out.textContent='Nenhum arquivo selecionado.'; return; }
try{ zipBusca = await JSZip.loadAsync(file); out.innerHTML = `<div class="alert alert-success">ZIP carregado! Digite o número da nota.</div>`; }
catch(err){ out.innerHTML = `<div class="alert alert-error">Erro ao ler o ZIP: ${err}</div>`; }
});


document.getElementById('buscarNota')?.addEventListener('click', async ()=>{
const numero = (document.getElementById('numeroNota')?.value || '').trim();
const out = document.getElementById('mensagemBusca');
if(!zipBusca){ out.innerHTML = `<div class="alert alert-error">Selecione um ZIP primeiro.</div>`; return; }
if(!numero){ out.innerHTML = `<div class="alert alert-error">Digite o número da nota.</div>`; return; }


let encontrado=false; const tasks=[];
zipBusca.forEach((_,entry)=>{
if(!entry.name.toLowerCase().endsWith('.xml')) return;
tasks.push(entry.async('string').then(content=>{
if(content.includes(`<nNF>${numero}</nNF>`)){
encontrado=true;
const xml = new DOMParser().parseFromString(content,'application/xml');
const pick = (sel)=> xml.querySelector(sel)?.textContent || 'Não disponível';
const razao = pick('emit > xNome');
const cnpj = pick('emit > CNPJ');
const endereco = [pick('enderEmit > xLgr'), pick('enderEmit > nro'), pick('enderEmit > xBairro')].filter(Boolean).join(', ');
const ie = pick('emit > IE');
const dest = pick('dest > xNome');
const cnpjDest = pick('dest > CNPJ') || pick('dest > CPF');
const itens = [...xml.querySelectorAll('det')].map(det=>({
descricao: det.querySelector('prod > xProd')?.textContent || '',
q: det.querySelector('prod > qCom')?.textContent || '0',
vu: det.querySelector('prod > vUnCom')?.textContent || '0',
vt: det.querySelector('prod > vProd')?.textContent || '0',
}));
const tot = itens.reduce((s,i)=> s + parseBR(i.vt), 0);


const esc = (s)=> String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const win = window.open('', '_blank');
if(!win){ out.innerHTML = `<div class="alert alert-error">Popup bloqueado. Habilite popups para visualizar a nota.</div>`; return; }
win.document.write(`<!DOCTYPE html><html lang=pt-BR><head><meta charset=UTF-8><meta name=viewport content=\"width=device-width, initial-scale=1\">`+
`<title>Nota Fiscal</title><style>*{box-sizing:border-box;font-family:Inter,system-ui,Arial}body{background:#0b1220;color:#e2e8f0}`+
`.wrap{max-width:1000px;margin:24px auto;background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:24px}`+
`table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #1e293b;padding:10px}th{background:#0b223b}`+
`</style></head><body><div class=wrap>`+
`<h1>Nota Fiscal Eletrônica</h1>`+
`<p><strong>Razão Social:</strong> ${esc(razao)}</p>`+
`<p><strong>CNPJ:</strong> ${esc(cnpj)}</p>`+
`<p><strong>Endereço:</strong> ${esc(endereco||'Não disponível')}</p>`+
`<p><strong>Inscrição Estadual:</strong> ${esc(ie)}</p>`+
`<p><strong>Destinatário:</strong> ${esc(dest)}</p>`+
`<p><strong>CNPJ/CPF do Destinatário:</strong> ${esc(cnpjDest)}</p>`+
`<h2>Itens</h2><table><thead><tr><th>Descrição</th><th>Qtd</th><th>Vlr Unit</th><th>Total</th></tr></thead><tbody>`+
itens.map(i=>`<tr><td>${esc(i.descricao)}</td><td>${i.q}</td><td>${BRL(parseBR(i.vu))}</td><td>${BRL(parseBR(i.vt))}</td></tr>`).join('')+
`</tbody></table><h3>Total de Itens: ${BRL(tot)}</h3></div></body></html>`);
}
}));
});


await Promise.all(tasks);
if(!encontrado){ out.innerHTML = `<div class="alert alert-error">Nota ${numero} não encontrada no ZIP.</div>`; }
});
})();