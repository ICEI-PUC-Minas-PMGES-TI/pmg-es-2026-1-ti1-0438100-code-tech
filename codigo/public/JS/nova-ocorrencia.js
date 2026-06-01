document.addEventListener("DOMContentLoaded", function () {

  // ELEMENTOS HTML
  const form = document.getElementById("formOcorrencia");
  const endereco = document.getElementById("endereco");
  const tipo = document.getElementById("tipo");
  const descricao = document.getElementById("descricao");
  const contadorDescricao = document.getElementById("contadorDescricao");
  const erroDescricao = document.getElementById("erroDescricao");
  const coordenadas = document.getElementById("coordenadas");
  const erroMapa = document.getElementById("erroMapa");
  const progress = document.getElementById("progress");
  const progressBar = document.getElementById("progressBar");
  const dragDrop = document.getElementById("dragDrop");
  const inputFotos = document.getElementById("inputFotos");
  const fotosContainer = document.getElementById("fotosContainer");

  const btnBuscar = document.querySelector(".input-group .btn-mongodb-primary");

  //Exibição da data

 document.getElementById("dataAtual").textContent =
  new Date().toLocaleDateString("pt-BR");

  // VARIÁVEIS
  let latitude = null;
  let longitude = null;
  let marcador = null;
  let timeout = null;
  let fotos = [];

  // MAPA
  const mapa = L.map("mapa").setView([-19.9167, -43.9345], 7);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(mapa);

  // LIMITA MAPA EM MG
  const limitesMG = L.latLngBounds(
    L.latLng(-22.9068, -46.2576),
    L.latLng(-14.8831, -39.8622)
  );

  mapa.setMaxBounds(limitesMG);

  mapa.on("drag", function () {
    mapa.panInsideBounds(limitesMG, { animate: false });
  });

  // MELHORA A BUSCA
function montarEnderecoBusca(texto) {
  return `${texto}, Minas Gerais, Brasil`;
}

  // FORMATA O ENDEREÇO
  function formatarEndereco(item, textoDigitado = "") {
    const a = item.address || {};

    const rua = a.road || "";
    let numero = a.house_number || "";

    if (!numero) {
      const numeroDigitado = textoDigitado.match(/\d+/);

      if (numeroDigitado) {
        numero = numeroDigitado[0];
      }
    }

    const bairro =
      a.suburb ||
      a.neighbourhood ||
      a.city_district ||
      "";

    const cidade =
      a.city ||
      a.town ||
      a.village ||
      "Contagem";

    const estado =
      a.state ||
      "Minas Gerais";

    return `${rua}${numero ? ", " + numero : ""} - ${bairro}, ${cidade} - ${estado}`;
  }

  // ATUALIZA MAPA E MARCADOR
  function atualizarMapa() {
    mapa.setView([latitude, longitude], 15);

    if (marcador) {
      mapa.removeLayer(marcador);
    }

    marcador = L.marker([latitude, longitude]).addTo(mapa);

    coordenadas.textContent = `Lat: ${latitude.toFixed(4)} | Lng: ${longitude.toFixed(4)}`;
    erroMapa.textContent = "";
  }

  // REMOVE LISTA DE SUGESTÕES
  function removerLista() {
    const lista = document.getElementById("listaSugestoes");

    if (lista) {
      lista.remove();
    }
  }

  // BUSCA ENDEREÇO PELO BOTÃO
  btnBuscar.addEventListener("click", function () {
    const texto = endereco.value.trim();

    if (texto === "") {
      alert("Digite um endereço.");
      return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(montarEnderecoBusca(texto))}&format=json&addressdetails=1&limit=5&countrycodes=br&accept-language=pt-BR`)
  .then(resposta => resposta.json())
  .then(dados => {

    if (dados.length === 0) {
      alert("Endereço não encontrado.");
      return;
    }

    // tenta pegar resultado mais completo
    const resultado =
      dados.find(item =>
        item.address &&
        item.address.road &&
        (
          item.address.city ||
          item.address.town
        )
      ) || dados[0];

    latitude = parseFloat(resultado.lat);
    longitude = parseFloat(resultado.lon);

    endereco.value =
      formatarEndereco(resultado, texto);

    atualizarMapa();

    atualizarProgresso();
  })
  .catch(() => {
    alert("Erro ao buscar endereço.");
  });
});

// BUSCAR AO APERTAR ENTER
endereco.addEventListener("keydown", function (evento) {

  if (evento.key === "Enter") {

    evento.preventDefault();

    btnBuscar.click();
  }
});

  // CLICAR NO MAPA
  mapa.on("click", function (evento) {
    latitude = evento.latlng.lat;
    longitude = evento.latlng.lng;

    atualizarMapa();
    atualizarProgresso();

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`)
      .then(resposta => resposta.json())
      .then(dados => {
        if (dados.address) {
          endereco.value = formatarEndereco(dados);
          atualizarProgresso();
        }
      });
  });

  // PROGRESSO
  function atualizarProgresso() {
    let total = 0;

    if (endereco.value.trim() !== "") total += 25;
    if (tipo.value !== "") total += 25;
    if (descricao.value.trim() !== "") total += 25;
    if (latitude !== null && longitude !== null) total += 15;
    if (fotos.length > 0) total += 10;

    progress.textContent = total;
    progressBar.style.width = total + "%";
  }

 tipo.addEventListener("change", atualizarProgresso);

descricao.addEventListener("input", function () {

  contadorDescricao.textContent = descricao.value.length;

  if (descricao.value.trim().length >= 20) {
    erroDescricao.textContent = "";
  }

  atualizarProgresso();
});

  // UPLOAD DE FOTOS
  dragDrop.addEventListener("click", function () {
    inputFotos.click();
  });

  inputFotos.addEventListener("change", function () {
    adicionarFotos(inputFotos.files);
  });

  dragDrop.addEventListener("dragover", function (evento) {
    evento.preventDefault();
    dragDrop.classList.add("drag-over");
  });

  dragDrop.addEventListener("dragleave", function () {
    dragDrop.classList.remove("drag-over");
  });

  dragDrop.addEventListener("drop", function (evento) {
    evento.preventDefault();
    dragDrop.classList.remove("drag-over");
    adicionarFotos(evento.dataTransfer.files);
  });

  function adicionarFotos(arquivos) {

  if (fotos.length + arquivos.length > 5) {
    alert("Você pode enviar no máximo 5 fotos.");
    return;
  }

  Array.from(arquivos).forEach(arquivo => {

    if (!arquivo.type.startsWith("image/")) return;

    const leitor = new FileReader();

    leitor.onload = function (evento) {
      fotos.push(evento.target.result);
      mostrarFotos();
      atualizarProgresso();
    };

    leitor.readAsDataURL(arquivo);
  });
}

  function mostrarFotos() {
    fotosContainer.innerHTML = "";

    fotos.forEach((foto, index) => {
      const div = document.createElement("div");
      div.className = "col-4";

      div.innerHTML = `
        <div class="photo-thumb">
          <img src="${foto}" alt="Foto">

          <button
            type="button"
            class="btn-remove"
            onclick="removerFoto(${index})"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
      `;

      fotosContainer.appendChild(div);
    });
  }

  window.removerFoto = function (index) {
    fotos.splice(index, 1);
    mostrarFotos();
    atualizarProgresso();
  };

  // CADASTRO
  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (endereco.value.trim() === "") {
      alert("Preencha o endereço.");
      return;
    }

    if (tipo.value === "") {
      alert("Selecione o tipo.");
      return;
    }

  if (descricao.value.trim().length < 20) {
  erroDescricao.textContent =
    "A descrição deve conter pelo menos 20 caracteres.";
  return;
}

    if (latitude === null || longitude === null) {

  erroMapa.textContent =
    "Selecione uma localização no mapa.";

  return;
}

    const ocorrencia = {
      endereco: endereco.value,
      tipo: tipo.value,
      descricao: descricao.value,
      latitude: latitude,
      longitude: longitude,
      fotos: fotos,
      data: new Date().toLocaleString("pt-BR"),
      status: "Pendente"
    };

    const ocorrencias =
      JSON.parse(localStorage.getItem("ocorrencias")) || [];

    ocorrencias.push(ocorrencia);

    localStorage.setItem(
      "ocorrencias",
      JSON.stringify(ocorrencias)
    );

    const modal = new bootstrap.Modal(
      document.getElementById("modalSucesso")
    );

    modal.show();

    form.reset();
    fotos = [];
    fotosContainer.innerHTML = "";
    coordenadas.textContent = "Lat: -- | Lng: --";

    latitude = null;
    longitude = null;

    if (marcador) {
      mapa.removeLayer(marcador);
      marcador = null;
    }

    atualizarProgresso();
  });

  contadorDescricao.textContent = 0;

});


