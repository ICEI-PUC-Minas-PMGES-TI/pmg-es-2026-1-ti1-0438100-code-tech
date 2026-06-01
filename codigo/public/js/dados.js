// Fonte unica de dados de ocorrencias.
// Datas em ISO (AAAA-MM-DD) para comparacao; o "hoje" de referencia e 2026-06-01.

const TIPOS = ['Buraco', 'Vazamento', 'Falta de Agua', 'Outros'];

const ocorrenciasBase = [
  { id: 1023, tipo: 'Buraco',        bairro: 'Comiteco',    endereco: 'Rua dos campos, 256',  data: '2026-05-28', status: 'Pendente',     prioridade: 'Alta'  },
  { id: 1022, tipo: 'Vazamento',     bairro: 'Boa Viagem',  endereco: 'Av Alonso Peres, 55',  data: '2026-05-26', status: 'Em andamento', prioridade: 'Media' },
  { id: 1021, tipo: 'Falta de Agua', bairro: 'Pantanal',    endereco: 'Rua das flores, 229',  data: '2026-05-25', status: 'Pendente',     prioridade: 'Alta'  },
  { id: 1020, tipo: 'Vazamento',     bairro: 'Barreto',     endereco: 'Rua da paz, 22',       data: '2026-05-22', status: 'Pendente',     prioridade: 'Baixa' },
  { id: 1019, tipo: 'Buraco',        bairro: 'Queiroz',     endereco: 'Rua Botafogo, 29',     data: '2026-05-21', status: 'Pendente',     prioridade: 'Baixa' },
  { id: 1018, tipo: 'Falta de Agua', bairro: 'Vila Rica',   endereco: 'Rua do sol, 114',      data: '2026-05-20', status: 'Pendente',     prioridade: 'Alta'  },
  { id: 1017, tipo: 'Buraco',        bairro: 'Venda Nova',  endereco: 'Rua A, 10',            data: '2026-05-18', status: 'Resolvido',    prioridade: 'Media' },
  { id: 1016, tipo: 'Buraco',        bairro: 'Venda Nova',  endereco: 'Rua B, 22',            data: '2026-05-15', status: 'Resolvido',    prioridade: 'Alta'  },
  { id: 1015, tipo: 'Buraco',        bairro: 'Pampulha',    endereco: 'Av C, 305',            data: '2026-05-12', status: 'Em andamento', prioridade: 'Alta'  },
  { id: 1014, tipo: 'Buraco',        bairro: 'Centro',      endereco: 'Rua D, 40',            data: '2026-05-10', status: 'Resolvido',    prioridade: 'Media' },
  { id: 1013, tipo: 'Buraco',        bairro: 'Barreiro',    endereco: 'Rua E, 51',            data: '2026-05-08', status: 'Pendente',     prioridade: 'Baixa' },
  { id: 1012, tipo: 'Buraco',        bairro: 'Venda Nova',  endereco: 'Rua F, 62',            data: '2026-05-06', status: 'Resolvido',    prioridade: 'Media' },
  { id: 1011, tipo: 'Buraco',        bairro: 'Pampulha',    endereco: 'Av G, 100',            data: '2026-05-03', status: 'Resolvido',    prioridade: 'Alta'  },
  { id: 1010, tipo: 'Vazamento',     bairro: 'Centro',      endereco: 'Rua H, 71',            data: '2026-05-02', status: 'Resolvido',    prioridade: 'Media' },
  { id: 1009, tipo: 'Vazamento',     bairro: 'Centro',      endereco: 'Rua I, 82',            data: '2026-04-29', status: 'Em andamento', prioridade: 'Alta'  },
  { id: 1008, tipo: 'Vazamento',     bairro: 'Pampulha',    endereco: 'Av J, 93',             data: '2026-04-27', status: 'Pendente',     prioridade: 'Baixa' },
  { id: 1007, tipo: 'Vazamento',     bairro: 'Barreiro',    endereco: 'Rua K, 104',           data: '2026-04-24', status: 'Resolvido',    prioridade: 'Media' },
  { id: 1006, tipo: 'Falta de Agua', bairro: 'Pampulha',    endereco: 'Av L, 115',            data: '2026-04-21', status: 'Resolvido',    prioridade: 'Alta'  },
  { id: 1005, tipo: 'Falta de Agua', bairro: 'Barreiro',    endereco: 'Rua M, 126',           data: '2026-04-18', status: 'Em andamento', prioridade: 'Alta'  },
  { id: 1004, tipo: 'Outros',        bairro: 'Centro',      endereco: 'Praca N, 1',           data: '2026-04-15', status: 'Resolvido',    prioridade: 'Baixa' },
  { id: 1003, tipo: 'Outros',        bairro: 'Pampulha',    endereco: 'Rua O, 12',            data: '2026-04-12', status: 'Pendente',     prioridade: 'Media' },
  { id: 1002, tipo: 'Outros',        bairro: 'Venda Nova',  endereco: 'Rua P, 23',            data: '2026-04-08', status: 'Resolvido',    prioridade: 'Baixa' },
  { id: 1001, tipo: 'Buraco',        bairro: 'Venda Nova',  endereco: 'Rua Q, 34',            data: '2026-04-05', status: 'Resolvido',    prioridade: 'Media' },
  { id: 1000, tipo: 'Buraco',        bairro: 'Pampulha',    endereco: 'Av R, 45',             data: '2026-04-02', status: 'Resolvido',    prioridade: 'Alta'  },
  { id:  999, tipo: 'Vazamento',     bairro: 'Centro',      endereco: 'Rua S, 56',            data: '2026-03-30', status: 'Resolvido',    prioridade: 'Media' },
  { id:  998, tipo: 'Vazamento',     bairro: 'Pampulha',    endereco: 'Av T, 67',             data: '2026-03-25', status: 'Resolvido',    prioridade: 'Baixa' },
  { id:  997, tipo: 'Falta de Agua', bairro: 'Barreiro',    endereco: 'Rua U, 78',            data: '2026-03-20', status: 'Resolvido',    prioridade: 'Alta'  },
  { id:  996, tipo: 'Outros',        bairro: 'Centro',      endereco: 'Rua V, 89',            data: '2026-03-15', status: 'Resolvido',    prioridade: 'Baixa' },
  { id:  995, tipo: 'Buraco',        bairro: 'Venda Nova',  endereco: 'Rua W, 90',            data: '2026-03-10', status: 'Resolvido',    prioridade: 'Media' },
  { id:  994, tipo: 'Buraco',        bairro: 'Venda Nova',  endereco: 'Rua X, 101',           data: '2026-03-05', status: 'Resolvido',    prioridade: 'Alta'  },
];

const STORAGE_KEY = 'infrabh:ocorrencias';
const HOJE_REF = new Date('2026-06-01T00:00:00');

function getOcorrencias() {
  let extras = [];
  try {
    extras = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    extras = [];
  }
  return [...extras, ...ocorrenciasBase];
}

function salvarNovaOcorrencia(o) {
  const lista = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const todosIds = [...lista, ...ocorrenciasBase].map(x => x.id);
  const proximoId = Math.max(...todosIds) + 1;
  lista.unshift({ id: proximoId, ...o });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

function filtrarPorPeriodo(lista, dias) {
  if (!dias) return lista;
  const limite = new Date(HOJE_REF);
  limite.setDate(limite.getDate() - dias);
  return lista.filter(o => new Date(o.data) >= limite);
}

function contarPorTipo(lista) {
  const acc = Object.fromEntries(TIPOS.map(t => [t, 0]));
  for (const o of lista) {
    if (acc[o.tipo] !== undefined) acc[o.tipo]++;
    else acc.Outros++;
  }
  return acc;
}

function contarPorBairro(lista) {
  return lista.reduce((acc, o) => {
    acc[o.bairro] = (acc[o.bairro] || 0) + 1;
    return acc;
  }, {});
}

function categoriaLider(lista) {
  const contagem = contarPorTipo(lista);
  let tipo = TIPOS[0], total = 0;
  for (const [t, n] of Object.entries(contagem)) {
    if (n > total) { tipo = t; total = n; }
  }
  return { tipo, total };
}

function bairroLider(lista) {
  const contagem = contarPorBairro(lista);
  let bairro = '-', total = 0;
  for (const [b, n] of Object.entries(contagem)) {
    if (n > total) { bairro = b; total = n; }
  }
  return { bairro, total };
}

function bairroLiderPorTipo(lista, tipo) {
  return bairroLider(lista.filter(o => o.tipo === tipo));
}

function porcentagemResolvidos(lista) {
  if (!lista.length) return 0;
  const resolvidos = lista.filter(o => o.status === 'Resolvido').length;
  return (resolvidos / lista.length) * 100;
}

function topBairros(lista, n = 5) {
  const contagem = contarPorBairro(lista);
  const ordenado = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
  if (ordenado.length <= n) return ordenado;
  const topo = ordenado.slice(0, n - 1);
  const restoTotal = ordenado.slice(n - 1).reduce((s, [, v]) => s + v, 0);
  return [...topo, ['Outros', restoTotal]];
}
