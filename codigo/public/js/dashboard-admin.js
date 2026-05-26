document.addEventListener("DOMContentLoaded", () => {
  const nomeAdmin = "Admin";
  const tipoAdmin = "Administrador";

  const nomeUsuario = document.getElementById("nomeUsuario");
  const tipoUsuario = document.getElementById("tipoUsuario");
  const bemVindoUsuario = document.getElementById("bemVindoUsuario");

  if (nomeUsuario) nomeUsuario.innerText = nomeAdmin;
  if (tipoUsuario) tipoUsuario.innerText = tipoAdmin;
  if (bemVindoUsuario) bemVindoUsuario.innerText = nomeAdmin;

  carregarDashboardAdmin();
});

function carregarDashboardAdmin() {
  fetch("json/dashboard-admin.json")
    .then(response => response.json())
    .then(data => {
      renderizarDashboardAdmin(data.ocorrencias);
    })
    .catch(error => {
      console.log("Erro ao carregar dashboard:", error);
      alert("Erro ao carregar ocorrências.");
    });
}

function renderizarDashboardAdmin(ocorrencias) {
  const tabela = document.getElementById("tabelaOcorrencias");

  if (tabela) {
    tabela.innerHTML = "";
  }

  let totalBuracos = 0;
  let totalVazamentos = 0;
  let totalFaltaAgua = 0;
  let totalOutros = 0;

  ocorrencias.forEach(ocorrencia => {
    if (ocorrencia.tipo === "Buraco") {
      totalBuracos++;
    } else if (ocorrencia.tipo === "Vazamento") {
      totalVazamentos++;
    } else if (ocorrencia.tipo === "Falta de Água") {
      totalFaltaAgua++;
    } else {
      totalOutros++;
    }

    if (tabela) {
      tabela.innerHTML += `
        <tr>
          <td><strong>#${ocorrencia.id}</strong></td>
          <td>${ocorrencia.tipo}</td>
          <td>${ocorrencia.bairro}</td>
          <td>${ocorrencia.status}</td>
          <td>
            <button class="btn btn-dark btn-sm">
              Ver
            </button>
          </td>
        </tr>
      `;
    }
  });

  document.getElementById("totalBuracos").innerText = totalBuracos;
  document.getElementById("totalVazamentos").innerText = totalVazamentos;
  document.getElementById("totalFaltaAgua").innerText = totalFaltaAgua;
  document.getElementById("totalOutros").innerText = totalOutros;

  carregarMapa(ocorrencias);
}

function carregarMapa(ocorrencias) {
  const elementoMapa = document.getElementById("map");

  if (!elementoMapa) {
    console.log("Elemento #map não encontrado.");
    return;
  }

  const map = L.map("map").setView([-19.9167, -43.9345], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  ocorrencias.forEach(ocorrencia => {
    if (!ocorrencia.latitude || !ocorrencia.longitude) {
      return;
    }

    let cor = "gray";

    if (ocorrencia.tipo === "Buraco") {
      cor = "red";
    } else if (ocorrencia.tipo === "Vazamento") {
      cor = "blue";
    } else if (ocorrencia.tipo === "Falta de Água") {
      cor = "orange";
    }

    L.circleMarker(
      [ocorrencia.latitude, ocorrencia.longitude],
      {
        radius: 10,
        color: cor,
        fillColor: cor,
        fillOpacity: 0.8
      }
    )
      .addTo(map)
      .bindPopup(`
        <strong>${ocorrencia.tipo}</strong>
        <br>
        Bairro: ${ocorrencia.bairro}
        <br>
        Status: ${ocorrencia.status}
        <br><br>
        ${ocorrencia.descricao}
      `);
  });

  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");

  sidebar.classList.toggle("sidebar-open");
}