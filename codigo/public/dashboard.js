// ESPERAR A PÁGINA CARREGAR
document.addEventListener("DOMContentLoaded", () => {

  // USUARIO LOGADO
  const usuarioLogado = JSON.parse(
    localStorage.getItem("usuarioLogado")
  );

  // VERIFICAR LOGIN
  if (!usuarioLogado) {

    window.location.href = "login.html";
    return;

  }

  // NOME
  document.getElementById("nomeUsuario").innerText =
    usuarioLogado.nome;

  // TIPO
  document.getElementById("tipoUsuario").innerText =
    usuarioLogado.tipo;

  // BEM VINDO
  document.getElementById("bemVindoUsuario").innerText =
    usuarioLogado.nome;

  // ESCONDER RELATORIOS
  if (usuarioLogado.tipo === "usuario") {

    document.getElementById(
      "menuRelatorios"
    ).style.display = "none";

  }

  // MAPA
  const map = L.map("map").setView(
    [-19.9167, -43.9345],
    11
  );

  // OPENSTREETMAP
  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "&copy; OpenStreetMap"
    }
  ).addTo(map);

  // VARIAVEIS
  window.todasOcorrencias = [];
  let marcadores = [];

  // BUSCAR DADOS
  fetch("dashboard.json")

    .then(response => response.json())

    .then(data => {

      window.todasOcorrencias =
        data.ocorrencias;

      renderizarOcorrencias(
        todasOcorrencias
      );

    })

    .catch(error => {

      console.log(error);

      alert(
        "Erro ao carregar ocorrências"
      );

    });

  // RENDERIZAR
  window.renderizarOcorrencias = function (
    ocorrencias
  ) {

    const tabela =
      document.getElementById(
        "tabelaOcorrencias"
      );

    tabela.innerHTML = "";

    // LIMPAR MARCADORES
    marcadores.forEach(
      marcador => {
        map.removeLayer(marcador);
      }
    );

    marcadores = [];

    // CONTADORES
    let totalBuracos = 0;
    let totalVazamentos = 0;
    let totalFaltaAgua = 0;
    let totalOutros = 0;

    ocorrencias.forEach(
      (ocorrencia) => {

        // CONTADORES
        if (
          ocorrencia.tipo === "Buraco"
        ) {

          totalBuracos++;

        }

        else if (
          ocorrencia.tipo === "Vazamento"
        ) {

          totalVazamentos++;

        }

        else if (
          ocorrencia.tipo ===
          "Falta de Água"
        ) {

          totalFaltaAgua++;

        }

        else {

          totalOutros++;

        }

        // COR
        let cor = "red";

        if (
          ocorrencia.tipo ===
          "Vazamento"
        ) {

          cor = "blue";

        }

        else if (
          ocorrencia.tipo ===
          "Falta de Água"
        ) {

          cor = "orange";

        }

        else {

          cor = "gray";

        }

        // MARCADOR
        const marcador =
          L.circleMarker(
            [
              ocorrencia.latitude,
              ocorrencia.longitude
            ],
            {
              radius: 10,
              color: cor,
              fillColor: cor,
              fillOpacity: 0.8
            }
          )

          .addTo(map)

          .bindPopup(`
            <strong>
              ${ocorrencia.tipo}
            </strong>

            <hr>

            <b>Bairro:</b>
            ${ocorrencia.bairro}

            <br>

            <b>Status:</b>
            ${ocorrencia.status}

            <br><br>

            ${ocorrencia.descricao}
          `);

        marcadores.push(
          marcador
        );

        // STATUS
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

        // LINHA TABELA
        const linha =
          document.createElement(
            "tr"
          );

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
            ${ocorrencia.bairro}
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
            <button
              class="
                btn
                btn-dark
                btn-sm
              "
              onclick="
                verOcorrencia(
                  ${ocorrencia.id}
                )
              "
            >
              Ver
            </button>
          </td>
        `;

        tabela.appendChild(
          linha
        );

      });

    // ATUALIZAR CARDS
    document.getElementById(
      "totalBuracos"
    ).innerText = totalBuracos;

    document.getElementById(
      "totalVazamentos"
    ).innerText =
      totalVazamentos;

    document.getElementById(
      "totalFaltaAgua"
    ).innerText =
      totalFaltaAgua;

    document.getElementById(
      "totalOutros"
    ).innerText =
      totalOutros;

  };

});

// VER OCORRENCIA
function verOcorrencia(id) {

  fetch("dashboard.json")

    .then(response =>
      response.json()
    )

    .then(data => {

      const ocorrencia =
        data.ocorrencias.find(
          item => item.id == id
        );

      alert(`
Tipo:
${ocorrencia.tipo}

Descrição:
${ocorrencia.descricao}

Bairro:
${ocorrencia.bairro}

Status:
${ocorrencia.status}
      `);

    });

}

// LOGOUT
function logout() {

  localStorage.removeItem(
    "usuarioLogado"
  );

  window.location.href =
    "login.html";

}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");

  sidebar.classList.toggle("sidebar-open");
}