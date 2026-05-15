// ESPERAR A PÁGINA CARREGAR
document.addEventListener("DOMContentLoaded", () => {

  // MAPA
  const map = L.map("map").setView([-19.9167, -43.9345], 12);

  // OPENSTREETMAP
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  // TABELA
  const tabela = document.getElementById("tabelaOcorrencias");

  // BUSCAR OCORRÊNCIAS
  fetch("http://localhost:3000/ocorrencias")
    .then(response => response.json())

    .then(ocorrencias => {

      ocorrencias.forEach((ocorrencia) => {

        // MARCADOR
        L.marker([
          ocorrencia.latitude,
          ocorrencia.longitude
        ])
        .addTo(map)
        .bindPopup(`
          <strong>${ocorrencia.tipo}</strong><br>
          Bairro: ${ocorrencia.bairro}<br>
          Status: ${ocorrencia.status}
        `);

        // CLASSE STATUS
        let classeStatus = "";

        if (ocorrencia.status === "Pendente") {
          classeStatus = "badge-pendente";
        }

        else if (ocorrencia.status === "Em andamento") {
          classeStatus = "badge-andamento";
        }

        else {
          classeStatus = "badge-resolvido";
        }

        // CRIAR LINHA
        const linha = document.createElement("tr");

        linha.innerHTML = `
          <td>
            <strong>#${ocorrencia.id}</strong>
          </td>

          <td>${ocorrencia.tipo}</td>

          <td>${ocorrencia.bairro}</td>

          <td>
            <span class="badge-status ${classeStatus}">
              ${ocorrencia.status}
            </span>
          </td>

          <td>
            <button
              class="btn-mongodb-outline"
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
      console.log("Erro ao buscar ocorrências:", error);
    });

});

// VER DETALHES
function verOcorrencia(id) {

  fetch(`http://localhost:3000/ocorrencias/${id}`)

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

