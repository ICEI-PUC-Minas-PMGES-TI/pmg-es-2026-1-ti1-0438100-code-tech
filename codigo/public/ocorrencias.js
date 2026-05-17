document.addEventListener("DOMContentLoaded", () => {

  carregarOcorrencias();

});

function carregarOcorrencias() {

  const tabela =
    document.getElementById(
      "tabelaOcorrencias"
    );

  tabela.innerHTML = "";

  const ocorrencias =
    JSON.parse(
      localStorage.getItem(
        "ocorrencias"
      )
    ) || [];

  ocorrencias.forEach(
    (ocorrencia) => {

      let badgeStatus =
        "badge-pendente";

      if (
        ocorrencia.status ===
        "Em andamento"
      ) {

        badgeStatus =
          "badge-andamento";

      }

      else if (
        ocorrencia.status ===
        "Resolvido"
      ) {

        badgeStatus =
          "badge-resolvido";

      }

      let badgePrioridade =
        "badge-baixa";

      if (
        ocorrencia.prioridade ===
        "Média"
      ) {

        badgePrioridade =
          "badge-media";

      }

      else if (
        ocorrencia.prioridade ===
        "Alta"
      ) {

        badgePrioridade =
          "badge-alta";

      }

      tabela.innerHTML += `

        <tr>

          <td>
            <strong>
              #${ocorrencia.id}
            </strong>
          </td>

          <td>
            ${ocorrencia.tipo}
          </td>

          <td>
            ${ocorrencia.endereco}
          </td>

          <td>
            ${ocorrencia.bairro}
          </td>

          <td>
            ${ocorrencia.data}
          </td>

          <td>
            <span class="
              badge-status
              ${badgeStatus}
            ">
              ${ocorrencia.status}
            </span>
          </td>

          <td>
            <span class="
              badge-priority
              ${badgePrioridade}
            ">
              ${ocorrencia.prioridade}
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

        </tr>

      `;

    });

}

function excluirOcorrencia(id) {

  let ocorrencias =
    JSON.parse(
      localStorage.getItem(
        "ocorrencias"
      )
    ) || [];

  ocorrencias =
    ocorrencias.filter(
      ocorrencia =>
        ocorrencia.id !== id
    );

  localStorage.setItem(
    "ocorrencias",
    JSON.stringify(ocorrencias)
  );

  carregarOcorrencias();

}

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
    ).value.toLowerCase();

  let ocorrencias =
    JSON.parse(
      localStorage.getItem(
        "ocorrencias"
      )
    ) || [];

  ocorrencias =
    ocorrencias.filter(
      ocorrencia => {

        return (

          (tipo === "" ||
            ocorrencia.tipo === tipo)

          &&

          (status === "" ||
            ocorrencia.status === status)

          &&

          (
            bairro === "" ||

            ocorrencia.bairro
              .toLowerCase()
              .includes(bairro)
          )

        );

      }
    );

  renderizarFiltro(
    ocorrencias
  );

}

function renderizarFiltro(
  ocorrencias
) {

  const tabela =
    document.getElementById(
      "tabelaOcorrencias"
    );

  tabela.innerHTML = "";

  ocorrencias.forEach(
    (ocorrencia) => {

      tabela.innerHTML += `

        <tr>

          <td>
            <strong>
              #${ocorrencia.id}
            </strong>
          </td>

          <td>
            ${ocorrencia.tipo}
          </td>

          <td>
            ${ocorrencia.endereco}
          </td>

          <td>
            ${ocorrencia.bairro}
          </td>

          <td>
            ${ocorrencia.data}
          </td>

          <td>
            ${ocorrencia.status}
          </td>

          <td>
            ${ocorrencia.prioridade}
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

        </tr>

      `;

    });

}

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

  carregarOcorrencias();

}