document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("formOcorrencia");
  const endereco = document.getElementById("endereco");
  const tipo = document.getElementById("tipo");
  const descricao = document.getElementById("descricao");
  const coordenadas = document.getElementById("coordenadas");
  const progress = document.getElementById("progress");
  const progressBar = document.getElementById("progressBar");
  const dragDrop = document.getElementById("dragDrop");
  const inputFotos = document.getElementById("inputFotos");
  const fotosContainer = document.getElementById("fotosContainer");

  const btnBuscar = document.querySelector(".input-group .btn-mongodb-primary");

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

});

const limitesMG = L.latLngBounds(
  L.latLng(-22.9068, -46.2576),
  L.latLng(-14.8831, -39.8622)
);

mapa.setMaxBounds(limitesMG);

mapa.on("drag", function () {
  mapa.panInsideBounds(limitesMG, { animate: false });
});

function atualizarMapa() {

  mapa.setView([latitude, longitude], 15);

  if (marcador) {
    mapa.removeLayer(marcador);
  }

  marcador = L.marker([latitude, longitude]).addTo(mapa);

  coordenadas.textContent = `
    Lat: ${latitude.toFixed(4)} |
    Lng: ${longitude.toFixed(4)}
  `;
}

function montarEnderecoBusca(texto) {
  return `${texto}, Riacho das Pedras, Contagem, Minas Gerais, Brasil`;
}

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

btnBuscar.addEventListener("click", function () {

  const texto = endereco.value.trim();

  if (texto === "") {
    alert("Digite um endereço.");
    return;
  }

  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(montarEnderecoBusca(texto))}&format=json&addressdetails=1&limit=1&countrycodes=br&accept-language=pt-BR`)
    .then(resposta => resposta.json())
    .then(dados => {

      if (dados.length === 0) {
        alert("Endereço não encontrado.");
        return;
      }

      latitude = parseFloat(dados[0].lat);
      longitude = parseFloat(dados[0].lon);

      endereco.value =
        formatarEndereco(dados[0], texto);

      atualizarMapa();
    })
    .catch(() => {
      alert("Erro ao buscar endereço.");
    });
});

function removerLista() {

  const lista = document.getElementById("listaSugestoes");

  if (lista) {
    lista.remove();
  }
}

endereco.addEventListener("input", function () {

  clearTimeout(timeout);

  const texto = endereco.value.trim();

  if (texto.length < 3) {
    removerLista();
    return;
  }

  timeout = setTimeout(function () {

    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(montarEnderecoBusca(texto))}&format=json&addressdetails=1&limit=8&countrycodes=br&accept-language=pt-BR`)
      .then(resposta => resposta.json())
      .then(dados => {

        removerLista();

        if (dados.length === 0) return;

        const lista = document.createElement("div");

        lista.id = "listaSugestoes";
        lista.className = "lista-sugestoes";

        dados.forEach(item => {

          const enderecoFormatado =
            formatarEndereco(item, texto);

          const opcao = document.createElement("div");

          opcao.className = "item-sugestao";

          opcao.innerHTML = `
            <i class="bi bi-geo-alt"></i>
            ${enderecoFormatado}
          `;

          opcao.addEventListener("click", function () {

            latitude = parseFloat(item.lat);
            longitude = parseFloat(item.lon);

            endereco.value = enderecoFormatado;

            removerLista();

            atualizarMapa();
          });

          lista.appendChild(opcao);
        });

        endereco.parentElement.style.position = "relative";
        endereco.parentElement.appendChild(lista);
      });

  }, 500);
});

mapa.on("click", function (evento) {

  latitude = evento.latlng.lat;
  longitude = evento.latlng.lng;

  atualizarMapa();

  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`)
    .then(resposta => resposta.json())
    .then(dados => {

      if (dados.address) {

        endereco.value =
          formatarEndereco(dados);
      }
    });
});

mapa.on("click", function (evento) {

  latitude = evento.latlng.lat;
  longitude = evento.latlng.lng;

  atualizarMapa();

  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`)
    .then(resposta => resposta.json())
    .then(dados => {

      if (dados.address) {

        endereco.value =
          formatarEndereco(dados);
      }
    });
});

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

endereco.addEventListener("input", atualizarProgresso);
tipo.addEventListener("change", atualizarProgresso);
descricao.addEventListener("input", atualizarProgresso);

dragDrop.addEventListener("click", function () {
  inputFotos.click();
});

inputFotos.addEventListener("change", function () {
  adicionarFotos(inputFotos.files);
});

function adicionarFotos(arquivos) {

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
