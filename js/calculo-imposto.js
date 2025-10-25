(function(){
const BRL = (n)=> Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const toNum = (s)=> parseFloat(String(s||'').replace(/\./g,'').replace(',','.'))||0;


document.getElementById('calcularImpostosBtn')?.addEventListener('click', async ()=>{
const file = document.getElementById('zipInputImpostos')?.files?.[0];
const out = document.getElementById('resultadoZipImpostos');
if(!file){ out.textContent='Nenhum arquivo selecionado.'; return; }
const base = parseFloat(document.getElementById('basePresuncao')?.value || '0.32');


try{
const zip = await JSZip.loadAsync(file);
let count=0, totalNotas=0;
const tasks=[];
zip.forEach((_,entry)=>{
if(!entry.name.toLowerCase().endsWith('.xml')) return;
count++;
tasks.push(entry.async('string').then(xml=>{
const doc = new DOMParser().parseFromString(xml,'application/xml');
const v = doc.querySelector('total > ICMSTot > vNF')?.textContent || doc.querySelector('vNF')?.textContent || '0';
totalNotas += toNum(v);
}));
});
await Promise.all(tasks);


const PIS = totalNotas * 0.0065;
const COFINS = totalNotas * 0.03;
const CSLL = (totalNotas * base) * 0.09;
const IRPJ = (totalNotas * base) * 0.15;


out.innerHTML = `
<table class="tabela-impostos">
<thead><tr><th>Imposto</th><th>Valor</th></tr></thead>
<tbody>
<tr><td>Total de Arquivos XML</td><td>${count}</td></tr>
<tr><td>Total das Notas Fiscais</td><td>${BRL(totalNotas)}</td></tr>
<tr><td>PIS (0,65%)</td><td>${BRL(PIS)}</td></tr>
<tr><td>COFINS (3%)</td><td>${BRL(COFINS)}</td></tr>
<tr><td>CSLL (9% sobre ${base*100}%)</td><td>${BRL(CSLL)}</td></tr>
<tr><td>IRPJ (15% sobre ${base*100}%)</td><td>${BRL(IRPJ)}</td></tr>
</tbody>
</table>`;
}catch(err){ out.textContent='Erro ao ler o ZIP: '+err; }
});
})();