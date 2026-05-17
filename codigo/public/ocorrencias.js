// VARIAVEL GLOBAL
let todasOcorrencias = [];

// CARREGAR OCORRENCIAS
function carregarOcorrencias() {

  fetch("dashboard.json")

    .then(response => response.json())

    .then(data => {

      todasOcorrencias =
        data.ocorrencias;

      renderizarTabela(
        todasOcorrencias
      );

    });

}

// RENDERIZAR TABELA
function renderizarTabela(
  ocorrencias
) {

  const tabela =
    document.getElementById(
      "tabelaOcorrencias"
    );

  tabela.innerHTML = "";

  ocorrencias.forEach(
    (ocorrencia) => {

      let classeStatus = "";

      if (
        ocorrencia.status ===
        "Pendente"
      ) {

        classeStatus =
          "badge-pendente";

      }

      else if (
        ocorrencia.status ===
        "Em andamento"
      ) {

        classeStatus =
          "badge-andamento";

      }

      else {

        classeStatus =
          "badge-resolvido";

      }

      const linha =
        document.createElement("tr");

      linha.innerHTML = `
        <td>
          <strong>
            #${ocorrencia.id}
          </strong>
        </td>

        <td>
          ${ocorrencia.tipo}
        </td>

        <td>
          Rua Exemplo
        </td>

        <td>
          ${ocorrencia.bairro}
        </td>

        <td>
          15/05/2026
        </td>

        <td>
          <span class="
            badge-status
            ${classeStatus}
          ">
            ${ocorrencia.status}
          </span>
        </td>

        <td>
          <span class="
            badge-priority
            badge-alta
          ">
            Alta
          </span>
        </td>

        <td>

          <button
            class="
              action-icon
              action-icon-delete
            "
            onclick="
              excluirOcorrencia(
                ${ocorrencia.id}
              )
            "
          >

            <i class="
              bi bi-trash3-fill
            "></i>

          </button>

        </td>
      `;

      tabela.appendChild(
        linha
      );

    });

}

// FILTRAR
function filtrarOcorrencias() {

  const tipo =
    document.getElementById(
      "filtroTipo"
    ).value;

  const status =
    document.getElementById(
      "filtroStatus"
    ).value;

  const bairro =
    document.getElementById(
      "filtroBairro"
    ).value
    .toLowerCase();

  const filtradas =
    todasOcorrencias.filter(
      ocorrencia => {

        const filtroTipo =
          tipo === ""
          ||
          ocorrencia.tipo === tipo;

        const filtroStatus =
          status === ""
          ||
          ocorrencia.status === status;

        const filtroBairro =
          ocorrencia.bairro
            .toLowerCase()
            .includes(bairro);

        return (
          filtroTipo
          &&
          filtroStatus
          &&
          filtroBairro
        );

      }
    );

  renderizarTabela(
    filtradas
  );

}

// LIMPAR FILTROS
function limparFiltros() {

  document.getElementById(
    "filtroTipo"
  ).value = "";

  document.getElementById(
    "filtroStatus"
  ).value = "";

  document.getElementById(
    "filtroBairro"
  ).value = "";

  renderizarTabela(
    todasOcorrencias
  );

}

// EXCLUIR
function excluirOcorrencia(id) {

  const confirmar =
    confirm(
      "Deseja excluir esta ocorrência?"
    );

  if (!confirmar) {

    return;

  }

  todasOcorrencias =
    todasOcorrencias.filter(
      ocorrencia =>
        ocorrencia.id != id
    );

  renderizarTabela(
    todasOcorrencias
  );

}

// INICIAR
carregarOcorrencias();