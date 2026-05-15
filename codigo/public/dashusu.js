// ESPERAR CARREGAR
document.addEventListener("DOMContentLoaded", () => {

  // MAPA
  const map = L.map("map").setView(
    [-19.9167, -43.9345],
    12
  );

  // MAPA OPENSTREETMAP
  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "&copy; OpenStreetMap"
    }
  ).addTo(map);

  // TABELA
  const tabela =
    document.getElementById("tabelaOcorrencias");

  // BUSCAR OCORRÊNCIAS
  fetch("http://localhost:3000/ocorrencias")

    .then(response => response.json())

    .then(ocorrencias => {

      ocorrencias.forEach((ocorrencia) => {

        // COR STATUS
        let classeStatus = "";

        if (ocorrencia.status === "Pendente") {

          classeStatus = "badge-pendente";

        }

        else if (
          ocorrencia.status === "Em andamento"
        ) {

          classeStatus = "badge-andamento";

        }

        else {

          classeStatus = "badge-resolvido";

        }

        // COR MARCADOR
        let cor = "red";

        if (ocorrencia.tipo === "Vazamento") {

          cor = "blue";

        }

        else if (
          ocorrencia.tipo === "Falta de Água"
        ) {

          cor = "orange";

        }

        // MARCADOR
        const marker = L.circleMarker(

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

        ).addTo(map);

        // POPUP
        marker.bindPopup(`
          <strong>${ocorrencia.tipo}</strong>
          <br>
          Bairro: ${ocorrencia.bairro}
          <br>
          Status: ${ocorrencia.status}
        `);

        // LINHA TABELA
        const linha =
          document.createElement("tr");

        linha.innerHTML = `

          <td>
            <strong>#${ocorrencia.id}</strong>
          </td>

          <td>
            ${ocorrencia.tipo}
          </td>

          <td>
            ${ocorrencia.bairro}
          </td>

          <td>
            <span class="badge-status ${classeStatus}">
              ${ocorrencia.status}
            </span>
          </td>

          <td>

            <button
              class="btn btn-sm btn-dark"
              onclick="verOcorrencia(${ocorrencia.id})"
            >
              Ver
            </button>

          </td>

        `;

        tabela.appendChild(linha);

      });

    })

    .catch(error => {

      console.log(
        "Erro ao buscar ocorrências:",
        error
      );

    });

});

// VER DETALHES
function verOcorrencia(id) {

  fetch(
    `http://localhost:3000/ocorrencias/${id}`
  )

    .then(response => response.json())

    .then(ocorrencia => {

      alert(`

Tipo: ${ocorrencia.tipo}

Bairro: ${ocorrencia.bairro}

Descrição: ${ocorrencia.descricao}

Status: ${ocorrencia.status}

      `);

    });

}

