(function () {
  const BRL  = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const toNum = (s) => parseFloat(String(s || '').replace(/\./g, '').replace(',', '.')) || 0;

  window.processarZip = async function () {
    const input = document.getElementById('zipInput');
    const file = input?.files?.[0];
    if (!file) {
      alert('Por favor, selecione um arquivo ZIP.');
      return;
    }

    try {
      const zip = await JSZip.loadAsync(file);
      const files = Object.keys(zip.files).filter(f => f.toLowerCase().endsWith('.xml'));
      if (!files.length) {
        alert('Nenhum arquivo XML encontrado no ZIP.');
        return;
      }

      let totalNotas = 0;
      let totalISS   = 0;
      let PIS_R      = 0;
      let COFINS_R   = 0;
      let CSLL_R     = 0;
      let IRPJ_R     = 0;

      for (const name of files) {
        const xmlText = await zip.files[name].async('string');
        const doc = new DOMParser().parseFromString(xmlText, 'application/xml');

        // Total da nota (NFSe variantes)
        const totalStr =
          doc.querySelector('valorTotalNota')?.textContent ||
          doc.querySelector('valotTotalNota')?.textContent ||
          doc.querySelector('Servico > Valores > ValorServicos')?.textContent ||
          '0';
        totalNotas += toNum(totalStr);

        // ISS retido
        const tipoRec = (doc.querySelector('tipoRecolhimento')?.textContent ||
                         doc.querySelector('Servico > Valores > IssRetido')?.textContent ||
                         '').toUpperCase();

        if (tipoRec.includes('RET') || tipoRec === '1') {
          const issStr = doc.querySelector('valorTotalISS')?.textContent ||
                         doc.querySelector('Servico > Valores > ValorIss')?.textContent ||
                         '0';
          totalISS += toNum(issStr);
        }

        // Impostos retidos (PIS/COFINS/CSLL/IRPJ)
        const impostos = [];
        doc.querySelectorAll('valorImposto, Imposto').forEach(n => {
          const nomeAttr = (typeof n.getAttribute === 'function') ? n.getAttribute('nome') : null;
          const nomeNode = n.querySelector('Nome') ? n.querySelector('Nome').textContent : '';
          const nome = (nomeAttr || nomeNode || '').toUpperCase();
          const valor = toNum(n.textContent);
          impostos.push({ nome, valor });
        });

        const get = (k) => {
          const item = impostos.find(i => i.nome.includes(k));
          return item ? item.valor : 0;
        };

        PIS_R    += get('PIS');
        COFINS_R += get('COFINS');
        CSLL_R   += get('CSLL');
        IRPJ_R   += get('IRPJ');
      } // fim do for

      // Apuração padrão serviço presumido
      const basePres = 0.32;
      const pis_Ap   = totalNotas * 0.0065;
      const cofins_Ap= totalNotas * 0.03;
      const csll_Ap  = totalNotas * basePres * 0.09;
      const irpj_Ap  = totalNotas * basePres * 0.15;

      const pis_Rec   = pis_Ap - PIS_R;
      const cofins_Rec= cofins_Ap - COFINS_R;
      const csll_Rec  = csll_Ap - CSLL_R;
      const irpj_Rec  = irpj_Ap - IRPJ_R;
      const ISS_Rec   = (totalNotas * 0.05) - totalISS; // parametrizável futuramente

      // Saída
      document.getElementById('totalNotas').textContent          = BRL(totalNotas);
      document.getElementById('totalISS').textContent            = BRL(totalISS);
      document.getElementById('totalPIS_Retido').textContent     = BRL(PIS_R);
      document.getElementById('totalCOFINS_Retido').textContent  = BRL(COFINS_R);
      document.getElementById('totalCSLL_Retido').textContent    = BRL(CSLL_R);
      document.getElementById('totalIRPJ_Retido').textContent    = BRL(IRPJ_R);

      document.getElementById('totalISS_Recolher').textContent   = BRL(ISS_Rec);
      document.getElementById('totalPIS_Recolher').textContent   = BRL(pis_Rec);
      document.getElementById('totalCOFINS_Recolher').textContent= BRL(cofins_Rec);
      document.getElementById('totalCSLL_Recolher').textContent  = BRL(csll_Rec);
      document.getElementById('totalIRPJ_Recolher').textContent  = BRL(irpj_Rec);

      document.getElementById('resultadoImpostos').style.display = 'block';
    } catch (err) {
      console.error('Erro ao processar o arquivo ZIP:', err);
      alert('Ocorreu um erro ao processar o arquivo ZIP. Por favor, tente novamente.');
    }
  };
})();
