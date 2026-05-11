// conta quantos problemas tem em cada categoria
// problema = objeto com propriedade categoria (string)

function contarPorCategoria(lista) {
  const contagem = {};

  for (let i = 0; i < lista.length; i++) {
    const cat = lista[i].categoria;
    if (!cat) continue;
    if (contagem[cat] === undefined) {
      contagem[cat] = 1;
    } else {
      contagem[cat] = contagem[cat] + 1;
    }
  }

  return contagem;
}

// transforma objeto contagem em arrays pro chart.js
function contagemParaChart(contagem) {
  const labels = [];
  const valores = [];
  const chaves = Object.keys(contagem);

  for (let j = 0; j < chaves.length; j++) {
    const k = chaves[j];
    labels.push(k);
    valores.push(contagem[k]);
  }

  return { labels: labels, data: valores };
}
