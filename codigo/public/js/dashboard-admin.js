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

const categorias = {
  "Buraco": {
    nome: "Buraco",
    cor: "#dc3545",
    icone: "img/buraco.png"
  },
  "Vazamento": {
    nome: "Vazamento",
    cor: "#006cfa",
    icone: "img/vazamento.png"
  },
  "Falta de Água": {
    nome: "Falta de Água",
    cor: "#ffc107",
    icone: "img/agua.png"
  },
  "Outros": {
    nome: "Outros",
    cor: "#5c6c75",
    icone: "img/outros.png"
  }
};

let mapaDashboard = null;

function buscarOcorrenciasLocal() {
  return JSON.parse(localStorage.getItem("ocorrencias")) || [];
}

function salvarOcorrenciasLocal(ocorrencias) {
  localStorage.setItem("ocorrencias", JSON.stringify(ocorrencias));
}

function normalizarOcorrencia(ocorrencia) {
  return {
    id: ocorrencia.id || Date.now(),
    usuarioId: ocorrencia.usuarioId || 1,
    tipo: ocorrencia.tipo || "Outros",
    endereco: ocorrencia.endereco || ocorrencia.rua || "Não informado",
    bairro: ocorrencia.bairro || "Não informado",
    data: ocorrencia.data || new Date().toLocaleDateString("pt-BR"),
    status: ocorrencia.status || "Pendente",
    prioridade: ocorrencia.prioridade || "Baixa",
    descricao: ocorrencia.descricao || "Sem descrição",
    curtidas: ocorrencia.curtidas || 0,
    engajamento: ocorrencia.engajamento || 0,
    latitude: ocorrencia.latitude || -19.9167,
    longitude: ocorrencia.longitude || -43.9345
  };
}

function carregarDashboardAdmin() {
  const ocorrenciasLocal = buscarOcorrenciasLocal();

  if (ocorrenciasLocal.length > 0) {
    renderizarDashboardAdmin(ocorrenciasLocal.map(normalizarOcorrencia));
    return;
  }

  fetch("json/dashboard-admin.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Arquivo JSON não encontrado");
      }

      return response.json();
    })
    .then(data => {
      const listaOcorrencias = data.ocorrencias || [];
      const ocorrenciasNormalizadas = listaOcorrencias.map(normalizarOcorrencia);

      salvarOcorrenciasLocal(ocorrenciasNormalizadas);
      renderizarDashboardAdmin(ocorrenciasNormalizadas);
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

  const ocorrenciasOrdenadas = [...ocorrencias]
    .map(normalizarOcorrencia)
    .sort((a, b) => (b.engajamento || 0) - (a.engajamento || 0));

  ocorrenciasOrdenadas.forEach(ocorrencia => {
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
            <button
              class="btn btn-outline-dark btn-sm btn-reacao"
              onclick="curtirDashboard('${ocorrencia.id}')"
              title="Curtir ocorrência"
            >
              <i class="bi bi-hand-thumbs-up"></i>
              ${ocorrencia.curtidas || 0}
            </button>
          </td>
        </tr>
      `;
    }
  });

  const totalBuracosEl = document.getElementById("totalBuracos");
  const totalVazamentosEl = document.getElementById("totalVazamentos");
  const totalFaltaAguaEl = document.getElementById("totalFaltaAgua");
  const totalOutrosEl = document.getElementById("totalOutros");

  if (totalBuracosEl) totalBuracosEl.innerText = totalBuracos;
  if (totalVazamentosEl) totalVazamentosEl.innerText = totalVazamentos;
  if (totalFaltaAguaEl) totalFaltaAguaEl.innerText = totalFaltaAgua;
  if (totalOutrosEl) totalOutrosEl.innerText = totalOutros;
  
  carregarMapa(ocorrenciasOrdenadas);
  atualizarNotificacoes(ocorrenciasOrdenadas);
}

function curtirDashboard(id) {
  const ocorrencias = buscarOcorrenciasLocal().map(normalizarOcorrencia);

  ocorrencias.forEach(ocorrencia => {
    if (String(ocorrencia.id) === String(id)) {
      ocorrencia.curtidas = (ocorrencia.curtidas || 0) + 1;
      ocorrencia.engajamento = (ocorrencia.engajamento || 0) + 1;
    }
  });

  salvarOcorrenciasLocal(ocorrencias);
  renderizarDashboardAdmin(ocorrencias);
}

function criarIconeCategoria(tipo) {
  const categoria = categorias[tipo] || categorias["Outros"];

  return L.divIcon({
    className: "",
    html: `
      <div class="mapa-icone" style="border-color: ${categoria.cor};">
        <img src="${categoria.icone}" alt="${categoria.nome}">
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44]
  });
}

function carregarMapa(ocorrencias) {
  const elementoMapa = document.getElementById("map");

  if (!elementoMapa) {
    console.log("Elemento #map não encontrado.");
    return;
  }

  if (mapaDashboard) {
    mapaDashboard.remove();
  }

  mapaDashboard = L.map("map").setView([-19.9167, -43.9345], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(mapaDashboard);

  ocorrencias.forEach(ocorrencia => {
    if (!ocorrencia.latitude || !ocorrencia.longitude) {
      return;
    }

    const categoria = categorias[ocorrencia.tipo] || categorias["Outros"];

    L.marker(
      [ocorrencia.latitude, ocorrencia.longitude],
      {
        icon: criarIconeCategoria(ocorrencia.tipo)
      }
    )
      .addTo(mapaDashboard)
      .bindPopup(`
        <strong>${categoria.nome}</strong>
        <br>
        Bairro: ${ocorrencia.bairro}
        <br>
        Status: ${ocorrencia.status}
        <br>
        Curtidas: ${ocorrencia.curtidas || 0}
        <br>
        Engajamento: ${ocorrencia.engajamento || 0}
        <br><br>
        ${ocorrencia.descricao}
      `);
  });

  setTimeout(() => {
    mapaDashboard.invalidateSize();
  }, 300);
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("sidebar-open");
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "dashboard-admin.html";
}

function atualizarNotificacoes(ocorrencias) {
  const contador = document.getElementById("contadorNotificacoes");
  const lista = document.getElementById("listaNotificacoes");

  if (!contador || !lista) {
    return;
  }

  const notificacoes = ocorrencias.filter((ocorrencia) => {
    return (
      ocorrencia.status === "Pendente" ||
      ocorrencia.prioridade === "Alta" ||
      ocorrencia.engajamento >= 3
    );
  });

  contador.innerText = notificacoes.length;

  lista.innerHTML = "";

  if (notificacoes.length === 0) {
    lista.innerHTML = `
      <p class="notificacao-vazia">
        Nenhuma notificação no momento.
      </p>
    `;

    return;
  }

  notificacoes.forEach((ocorrencia) => {
    let motivo = "Ocorrência pendente";

    if (ocorrencia.prioridade === "Alta") {
      motivo = "Prioridade alta";
    }

    if (ocorrencia.engajamento >= 3) {
      motivo = "Alta visibilidade";
    }

    lista.innerHTML += `
      <div class="notificacao-item">
        <strong>${motivo}</strong>
        <span>
          #${ocorrencia.id} - ${ocorrencia.tipo}
        </span>
        <small>
          ${ocorrencia.bairro} | ${ocorrencia.status}
        </small>
      </div>
    `;
  });
}

function toggleNotificacoes() {
  const box = document.getElementById("notificacoesBox");

  if (!box) {
    return;
  }

  box.classList.toggle("notificacoes-aberta");
}