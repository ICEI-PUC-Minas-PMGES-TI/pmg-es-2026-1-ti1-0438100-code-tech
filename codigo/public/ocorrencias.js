document.addEventListener("DOMContentLoaded", () => {
  carregarOcorrencias();
});

function buscarOcorrencias() {
  return JSON.parse(localStorage.getItem("ocorrencias")) || [];
}

function salvarOcorrencias(ocorrencias) {
  localStorage.setItem("ocorrencias", JSON.stringify(ocorrencias));
}

function carregarOcorrencias() {
  const ocorrencias = buscarOcorrencias();
  renderizarTabela(ocorrencias);
}

function renderizarTabela(ocorrencias) {
  const tabela = document.getElementById("tabelaOcorrencias");

  tabela.innerHTML = "";

  ocorrencias.forEach((ocorrencia) => {
    const badgeStatus = definirClasseStatus(ocorrencia.status);
    const badgePrioridade = definirClassePrioridade(ocorrencia.prioridade);

    tabela.innerHTML += `
      <tr>
        <td>
          <strong>#${ocorrencia.id}</strong>
        </td>

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
              class="btn btn-outline-dark btn-sm"
              onclick="curtirOcorrencia('${ocorrencia.id}')"
            >
              👍 ${ocorrencia.curtidas || 0}
            </button>

            <button
              class="action-icon action-icon-delete"
              onclick="excluirOcorrencia('${ocorrencia.id}')"
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
  const ocorrencias = buscarOcorrencias();

  ocorrencias.forEach((ocorrencia) => {
    if (String(ocorrencia.id) === String(id)) {
      ocorrencia.curtidas = (ocorrencia.curtidas || 0) + 1;
    }
  });

  salvarOcorrencias(ocorrencias);

  carregarOcorrencias();
}

function filtrarOcorrencias() {
  const tipo = document.getElementById("filtroTipo").value;
  const status = document.getElementById("filtroStatus").value;
  const bairro = document.getElementById("filtroBairro").value.toLowerCase();

  let ocorrencias = buscarOcorrencias();

  ocorrencias = ocorrencias.filter((ocorrencia) => {
    return (
      (tipo === "" || ocorrencia.tipo === tipo) &&
      (status === "" || ocorrencia.status === status) &&
      (
        bairro === "" ||
        ocorrencia.bairro.toLowerCase().includes(bairro)
      )
    );
  });

  renderizarTabela(ocorrencias);
}

function limparFiltros() {
  document.getElementById("filtroTipo").value = "";
  document.getElementById("filtroStatus").value = "";
  document.getElementById("filtroBairro").value = "";

  carregarOcorrencias();
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");

  sidebar.classList.toggle("sidebar-open");
}