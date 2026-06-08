// Contagem de problemas por categoria.
// Os dados vêm do JSON Server (recurso /ocorrencias do db.json), não mais de um array fixo.

const API_OCORRENCIAS = 'http://localhost:3000/ocorrencias';

// "Hoje" de referência usado para o filtro de período (mesmo valor do restante do app).
const HOJE_REF_CATEGORIA = new Date('2026-06-01T00:00:00');

// Busca todas as ocorrências na API do JSON Server.
async function buscarOcorrencias() {
  const resposta = await fetch(API_OCORRENCIAS);
  if (!resposta.ok) {
    throw new Error('Falha ao buscar ocorrências na API: ' + resposta.status);
  }
  return resposta.json();
}

// Filtra a lista pelos últimos `dias` (0 = todos os períodos), usando dataRegistro.
function filtrarPorPeriodoData(lista, dias) {
  if (!dias) return lista;
  const limite = new Date(HOJE_REF_CATEGORIA);
  limite.setDate(limite.getDate() - dias);
  return lista.filter(o => new Date(o.dataRegistro) >= limite);
}

// Conta quantas ocorrências existem em cada categoria.
function contarPorCategoria(lista) {
  return lista.reduce((acc, o) => {
    const categoria = o.categoria || 'Outros';
    acc[categoria] = (acc[categoria] || 0) + 1;
    return acc;
  }, {});
}

// Retorna a categoria com mais ocorrências e seu total.
function categoriaLiderPorContagem(contagem) {
  let categoria = '-', total = 0;
  for (const [cat, n] of Object.entries(contagem)) {
    if (n > total) { categoria = cat; total = n; }
  }
  return { categoria, total };
}
