document.addEventListener("DOMContentLoaded", () => {
  // CONFIGURAÇÕES
  const API_URL = "http://localhost:3000/ocorrencias";
  const MAP_CENTER_BH = [-19.9191, -43.9386];

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

  // DATA ATUAL NO TOPO DO FORMULÁRIO
  if (document.getElementById("dataAtual")) {
    document.getElementById("dataAtual").textContent = new Date().toLocaleDateString("pt-BR");
  }

  // ESTADO DA APLICAÇÃO
  const estadoOcorrencia = {
    latitude: null,
    longitude: null,
    bairro: "Não informado",
    fotos: []
  };

  let marcador = null;

  // CORREÇÃO DOS ÍCONES PADRÃO DO LEAFLET (Garante o visual bonito do Pin)
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  // CONFIGURAÇÃO DO MAPA
  const mapa = L.map("mapa").setView(MAP_CENTER_BH, 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap'
  }).addTo(mapa);

  // FUNÇÃO DE GEOCODING REVERSO (Clique -> Endereço por extenso)
  const atualizarMarcador = (lat, lng, atualizarTextoEndereco = false) => {
    estadoOcorrencia.latitude = lat;
    estadoOcorrencia.longitude = lng;
    coordenadas.textContent = `Lat: ${lat.toFixed(5)} | Lng: ${lng.toFixed(5)}`;
    coordenadas.classList.remove("text-danger");
    erroMapa.style.display = "none";

    if (marcador) {
      marcador.setLatLng([lat, lng]);
    } else {
      marcador = L.marker([lat, lng], { draggable: true }).addTo(mapa);
      marcador.on("dragend", (e) => atualizarMarcador(e.target.getLatLng().lat, e.target.getLatLng().lng, true));
    }

    mapa.panTo([lat, lng]);

    // Busca o endereço e o bairro automaticamente ao clicar no mapa
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(dados => {
        if (dados?.address) {
          estadoOcorrencia.bairro = dados.address.suburb || dados.address.neighbourhood || dados.address.village || "Centro";
          
          if (atualizarTextoEndereco) {
            const rua = dados.address.road || "";
            const numero = dados.address.house_number || "";
            // Preenche o input do formulário com o endereço real da rua clicada
            endereco.value = numero ? `${rua}, ${numero}` : rua;
          }
        }
      })
      .catch(err => console.error("Erro ao buscar endereço:", err));
  };

  // EVENTO DE CLIQUE NO MAPA
  mapa.on("click", (e) => {
    atualizarMarcador(e.latlng.lat, e.latlng.lng, true);
  });

  // GEOLOCALIZAÇÃO INICIAL DO USUÁRIO
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => atualizarMarcador(pos.coords.latitude, pos.coords.longitude, true),
      () => console.log("Geolocalização não ativada.")
    );
  }

  // BUSCA POR TEXTO (Botão "Buscar" do input)
  btnBuscar?.addEventListener("click", () => {
    const textoBusca = endereco.value.trim();
    if (!textoBusca) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textoBusca)}&limit=1`)
      .then(res => res.json())
      .then(resultados => {
        if (resultados?.length > 0) {
          atualizarMarcador(parseFloat(resultados[0].lat), parseFloat(resultados[0].lon), false);
        }
      });
  });

  // CONTADOR DE CARACTERES da Descrição
  descricao?.addEventListener("input", () => {
    contadorDescricao.textContent = `${descricao.value.length}/500`;
    if (descricao.value.length >= 20) {
      erroDescricao.style.display = "none";
      descricao.classList.remove("is-invalid");
    }
  });

  // MANIPULAÇÃO DE FOTOS (Sem alertas)
  dragDrop?.addEventListener("click", () => inputFotos.click());
  
  dragDrop?.addEventListener("dragover", (e) => {
    e.preventDefault();
    dragDrop.style.borderColor = "#00684a";
    dragDrop.style.background = "#f0f7f4";
  });

  const resetarEstiloDragDrop = () => {
    dragDrop.style.borderColor = "#c1cdc9";
    dragDrop.style.background = "transparent";
  };

  dragDrop?.addEventListener("dragleave", resetarEstiloDragDrop);
  dragDrop?.addEventListener("drop", (e) => {
    e.preventDefault();
    resetarEstiloDragDrop();
    processarArquivos(e.dataTransfer.files);
  });

  inputFotos?.addEventListener("change", (e) => processarArquivos(e.target.files));

  const processarArquivos = (arquivos) => {
    if (estadoOcorrencia.fotos.length + arquivos.length > 5) return;

    Array.from(arquivos).forEach(file => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        estadoOcorrencia.fotos.push(base64);

        const thumb = document.createElement("div");
        thumb.className = "photo-thumb position-relative m-1";
        thumb.style.cssText = "width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid #ddd;";
        thumb.innerHTML = `
          <img src="${base64}" style="width:100%; height:100%; object-fit:cover;">
          <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 p-0" style="width:20px; height:20px; border-radius:50%;">&times;</button>
        `;

        thumb.querySelector("button").addEventListener("click", () => {
          estadoOcorrencia.fotos = estadoOcorrencia.fotos.filter(f => f !== base64);
          thumb.remove();
        });

        fotosContainer.appendChild(thumb);
      };
      reader.readAsDataURL(file);
    });
  };

  // VALIDAÇÕES VISUAIS DO BOOTSTRAP (Sem pop-ups incômodos)
  const validarFormulario = () => {
    let valido = true;
    
    const verificarCampo = (campo, condicao) => {
      if (condicao) {
        campo.classList.add("is-invalid");
        valido = false;
      } else {
        campo.classList.remove("is-invalid");
      }
    };

    verificarCampo(tipo, !tipo.value);
    verificarCampo(endereco, !endereco.value.trim());
    verificarCampo(descricao, descricao.value.trim().length < 20);
    
    if (descricao.value.trim().length < 20) {
      erroDescricao.style.display = "block";
    }

    if (!estadoOcorrencia.latitude || !estadoOcorrencia.longitude) {
      erroMapa.style.display = "block";
      coordenadas.add("text-danger");
      valido = false;
    }

    return valido;
  };

  // DISPARO DO FORMULÁRIO (POST)
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const payload = {
      tipo: tipo.value,
      endereco: endereco.value.trim(),
      bairro: estadoOcorrencia.bairro,
      descricao: descricao.value.trim(),
      latitude: estadoOcorrencia.latitude,
      longitude: estadoOcorrencia.longitude,
      fotos: estadoOcorrencia.fotos,
      data: new Date().toLocaleDateString("pt-BR"),
      status: "Pendente"
    };

    if (progress && progressBar) {
      progress.style.display = "block";
      progressBar.style.width = "50%";
    }

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error();
        if (progressBar) progressBar.style.width = "100%";
        
        // Abre o modal estilizado de sucesso nativo do seu HTML
        const modalElement = document.getElementById("modalSucesso");
        if (modalElement) new bootstrap.Modal(modalElement).show();
        
        // Reseta o estado visual do formulário de forma elegante
        form.reset();
        estadoOcorrencia.fotos = [];
        if (fotosContainer) fotosContainer.innerHTML = "";
        if (coordenadas) coordenadas.textContent = "Lat: -- | Lng: --";
        if (marcador) { mapa.removeLayer(marcador); marcador = null; }
        if (contadorDescricao) contadorDescricao.textContent = "0/500";
      })
      .catch(err => console.error("Erro ao enviar dados ao JSON Server:", err))
      .finally(() => {
        if (progress) progress.style.display = "none";
      });
  });
});