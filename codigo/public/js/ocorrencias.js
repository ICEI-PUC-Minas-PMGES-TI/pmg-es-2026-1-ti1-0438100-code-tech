document.addEventListener("DOMContentLoaded", () => {
  carregarOcorrencias();
});

function buscarOcorrencias() {
  return JSON.parse(localStorage.getItem("ocorrencias")) || [];
}

function salvarOcorrencias(ocorrencias) {
  localStorage.setItem("ocorrencias", JSON.stringify(ocorrencias));
}

function normalizarOcorrencia(ocorrencia) {
  return {
    id: ocorrencia.id || Date.now(),
    tipo: ocorrencia.tipo || "Não informado",
    endereco: ocorrencia.endereco || ocorrencia.rua || "Não informado",
    bairro: ocorrencia.bairro || "Não informado",
    data: ocorrencia.data || "Sem data",
    status: ocorrencia.status || "Pendente",
    prioridade: ocorrencia.prioridade || "Baixa",
    descricao: ocorrencia.descricao || "Sem descrição",
    curtidas: ocorrencia.curtidas || 0,
    engajamento: ocorrencia.engajamento || 0,
    latitude: ocorrencia.latitude || -19.9167,
    longitude: ocorrencia.longitude || -43.9345
  };
}

function carregarOcorrencias() {
  const ocorrencias = buscarOcorrencias().map(normalizarOcorrencia);
  renderizarTabela(ocorrencias);
}

function renderizarTabela(ocorrencias) {
  const tabela = document.getElementById("tabelaOcorrencias");

  if (!tabela) {
    return;
  }

  tabela.innerHTML = "";

  ocorrencias.forEach((ocorrencia) => {
    const badgeStatus = definirClasseStatus(ocorrencia.status);
    const badgePrioridade = definirClassePrioridade(ocorrencia.prioridade);

    tabela.innerHTML += `
      <tr>
        <td><strong>#${ocorrencia.id}</strong></td>
        <td>${ocorrencia.tipo}</td>
        <td>${ocorrencia.endereco}</td>
        <td>${ocorrencia.bairro}</td>
        <td>${ocorrencia.data}</td>
        <td>
          <span class="badge-status ${badgeStatus}">
            ${ocorrencia.status}
          </span>
        </td>
        <td>
          <span class="badge-priority ${badgePrioridade}">
            ${ocorrencia.prioridade}
          </span>
        </td>
        <td>
          <div class="d-flex gap-2 align-items-center flex-wrap">
            <button
              class="btn btn-outline-dark btn-sm btn-reacao"
              onclick="curtirOcorrencia('${ocorrencia.id}')"
              title="Curtir ocorrência"
            >
              <i class="bi bi-hand-thumbs-up"></i>
              ${ocorrencia.curtidas || 0}
            </button>

            <button
              class="btn btn-outline-secondary btn-sm"
              disabled
              title="Engajamento"
            >
              Eng. ${ocorrencia.engajamento || 0}
            </button>

            <button
              class="action-icon action-icon-delete"
              onclick="excluirOcorrencia('${ocorrencia.id}')"
              title="Excluir ocorrência"
            >
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

function definirClasseStatus(status) {
  if (status === "Em andamento") {
    return "badge-andamento";
  }

  if (status === "Resolvido") {
    return "badge-resolvido";
  }

  return "badge-pendente";
}

function definirClassePrioridade(prioridade) {
  if (prioridade === "Média") {
    return "badge-media";
  }

  if (prioridade === "Alta") {
    return "badge-alta";
  }

  return "badge-baixa";
}

function excluirOcorrencia(id) {
  const confirmar = confirm("Deseja realmente excluir esta ocorrência?");

  if (!confirmar) return;

  let ocorrencias = buscarOcorrencias();

  ocorrencias = ocorrencias.filter(
    ocorrencia => String(ocorrencia.id) !== String(id)
  );

  salvarOcorrencias(ocorrencias);
  carregarOcorrencias();
}

function curtirOcorrencia(id) {
  const ocorrencias = buscarOcorrencias().map(normalizarOcorrencia);

  ocorrencias.forEach((ocorrencia) => {
    if (String(ocorrencia.id) === String(id)) {
      ocorrencia.curtidas = (ocorrencia.curtidas || 0) + 1;
      ocorrencia.engajamento = (ocorrencia.engajamento || 0) + 1;
    }
  });

  salvarOcorrencias(ocorrencias);
  carregarOcorrencias();
}

function filtrarOcorrencias() {
  const tipo = document.getElementById("filtroTipo").value;
  const status = document.getElementById("filtroStatus").value;
  const bairro = document.getElementById("filtroBairro").value.toLowerCase();

  let ocorrencias = buscarOcorrencias().map(normalizarOcorrencia);

  ocorrencias = ocorrencias.filter((ocorrencia) => {
    const bairroOcorrencia = (ocorrencia.bairro || "").toLowerCase();

    return (
      (tipo === "" || ocorrencia.tipo === tipo) &&
      (status === "" || ocorrencia.status === status) &&
      (bairro === "" || bairroOcorrencia.includes(bairro))
    );
  });

  renderizarTabela(ocorrencias);
}

function limparFiltros() {
  document.getElementById("filtroTipo").value = "";
  document.getElementById("textoFiltroTipo").innerText = "Todos";

  document.getElementById("filtroStatus").value = "";
  document.getElementById("textoFiltroStatus").innerText = "Todos";

  document.getElementById("filtroBairro").value = "";

  carregarOcorrencias();
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("sidebar-open");
}

function selecionarTipo(valor, texto) {
  document.getElementById("filtroTipo").value = valor;
  document.getElementById("textoFiltroTipo").innerText = texto;
}

function selecionarStatus(valor, texto) {
  document.getElementById("filtroStatus").value = valor;
  document.getElementById("textoFiltroStatus").innerText = texto;
}