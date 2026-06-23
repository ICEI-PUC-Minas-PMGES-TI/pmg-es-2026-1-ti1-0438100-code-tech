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

  // Exibição da data atual no topo do formulário
  if (document.getElementById("dataAtual")) {
    document.getElementById("dataAtual").textContent = new Date().toLocaleDateString("pt-BR");
  }

  // VARIÁVEIS DE CONTROLO
  let latitude = null;
  let longitude = null;
  let bairroExtraido = "Não informado"; // Importante para a tabela do dashboard/ocorrências dos teus colegas
  let marcador = null;
  let fotos = [];

  // SISTEMA DE NOTIFICAÇÕES PROFISSIONAL
  function criarNotificacao(tipo, mensagem) {
    const antigas = document.querySelectorAll(".alert-flutuante");
    antigas.forEach(a => a.remove()); // Remove anteriores para não acumular

    const notificacao = document.createElement("div");
    notificacao.className = `alert alert-${tipo} alert-dismissible fade show alert-flutuante`;
    notificacao.setAttribute("role", "alert");
    notificacao.style.position = "fixed";
    notificacao.style.top = "20px";
    notificacao.style.right = "20px";
    notificacao.style.zIndex = "9999";
    notificacao.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";

    notificacao.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <i class="bi ${tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}"></i>
        <div>${mensagem}</div>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(notificacao);

    setTimeout(() => {
      notificacao.classList.remove("show");
      setTimeout(() => notificacao.remove(), 300);
    }, 4000);
  }

  // CONFIGURAÇÃO DO MAPA (LEAFLET)
  const mapa = L.map("mapa").setView([-19.9191, -43.9386], 13); // BH Centro por padrão

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(mapa);

  // Função para atualizar marcador e buscar dados do endereço (Geocoding Reverso)
  function atualizarMarcador(lat, lng, atualizarTextoEndereco = false) {
    latitude = lat;
    longitude = lng;
    coordenadas.textContent = `Lat: ${lat.toFixed(5)} | Lng: ${lng.toFixed(5)}`;
    coordenadas.classList.remove("text-danger");
    erroMapa.style.display = "none";

    if (marcador) {
      marcador.setLatLng([lat, lng]);
    } else {
      marcador = L.marker([lat, lng], { draggable: true }).addTo(mapa);
      marcador.on("dragend", function (e) {
        const pos = e.target.getLatLng();
        atualizarMarcador(pos.lat, pos.lng, true);
      });
    }

    mapa.panTo([lat, lng]);

    // Busca o Bairro automaticamente via API do OpenStreetMap (Nominatim)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(dados => {
        if (dados && dados.address) {
          // Extrai o bairro de forma robusta dependendo de como a API retorna
          bairroExtraido = dados.address.suburb || dados.address.neighbourhood || dados.address.village || "Centro";
          
          if (atualizarTextoEndereco) {
            const rua = dados.address.road || "";
            const numero = dados.address.house_number || "";
            endereco.value = numero ? `${rua}, ${numero}` : rua;
          }
        }
      })
      .catch(err => console.error("Erro na busca reversa do endereço:", err));
  }

  // Clique direto no mapa
  mapa.on("click", function (e) {
    atualizarMarcador(e.latlng.lat, e.latlng.lng, true);
  });

  // Tenta obter a localização real do utilizador ao abrir a página
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        atualizarMarcador(pos.coords.latitude, pos.coords.longitude, true);
      },
      () => { console.log("Geolocalização não permitida ou indisponível."); }
    );
  }

  // BOTÃO BUSCAR ENDEREÇO (Geocoding)
  if (btnBuscar) {
    btnBuscar.addEventListener("click", function () {
      const textoBusca = endereco.value.trim();
      if (!textoBusca) {
        criarNotificacao("warning", "Introduza um endereço para pesquisar.");
        return;
      }

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textoBusca)}&limit=1`)
        .then(res => res.json())
        .then(resultados => {
          if (resultados && resultados.length > 0) {
            const local = resultados[0];
            atualizarMarcador(parseFloat(local.lat), parseFloat(local.lon), false);
          } else {
            criarNotificacao("danger", "Endereço não localizado. Tente marcar clicando diretamente no mapa.");
          }
        })
        .catch(() => criarNotificacao("danger", "Erro ao comunicar com o serviço de mapas."));
    });
  }

  // CONTADOR DE CARACTERES DA DESCRIÇÃO
  if (descricao && contadorDescricao) {
    descricao.addEventListener("input", function () {
      const total = descricao.value.length;
      contadorDescricao.textContent = `${total}/250`;
      if (total >= 20) {
        erroDescricao.style.display = "none";
        descricao.classList.remove("is-invalid");
      }
    });
  }

  // GESTÃO DE ARRASTAR E SOLTAR FOTOS (Base64)
  if (dragDrop && inputFotos) {
    dragDrop.addEventListener("click", () => inputFotos.click());

    dragDrop.addEventListener("dragover", (e) => {
      e.preventDefault();
      dragDrop.style.borderColor = "#00684a";
      dragDrop.style.background = "#f0f7f4";
    });

    dragDrop.addEventListener("dragleave", () => {
      dragDrop.style.borderColor = "#c1cdc9";
      dragDrop.style.background = "transparent";
    });

    dragDrop.addEventListener("drop", (e) => {
      e.preventDefault();
      dragDrop.style.borderColor = "#c1cdc9";
      dragDrop.style.background = "transparent";
      processarArquivos(e.dataTransfer.files);
    });

    inputFotos.addEventListener("change", (e) => {
      processarArquivos(e.target.files);
    });
  }

  function processarArquivos(arquivos) {
    if (fotos.length + arquivos.length > 3) {
      criarNotificacao("warning", "Pode enviar no máximo 3 fotografias por ocorrência.");
      return;
    }

    Array.from(arquivos).forEach(file => {
      if (!file.type.startsWith("image/")) {
        criarNotificacao("danger", "Apenas ficheiros de imagem são permitidos.");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const base64 = e.target.result;
        fotos.push(base64);

        // Cria miniatura na interface
        const thumb = document.createElement("div");
        thumb.className = "photo-thumb position-relative m-1";
        thumb.style.width = "80px";
        thumb.style.height = "80px";
        thumb.style.borderRadius = "8px";
        thumb.style.overflow = "hidden";
        thumb.style.border = "1px solid #ddd";

        thumb.innerHTML = `
          <img src="${base64}" style="width:100%; height:100%; object-fit:cover;">
          <button type="button" class="btn-remove btn btn-danger btn-sm p-0 position-absolute top-0 end-0" 
                  style="width:20px; height:20px; font-size:12px; border-radius:50%; line-height:1;">&times;</button>
        `;

        thumb.querySelector(".btn-remove").addEventListener("click", function () {
          const idx = fotos.indexOf(base64);
          if (idx > -1) fotos.splice(idx, 1);
          thumb.remove();
        });

        fotosContainer.appendChild(thumb);
      };
      reader.readAsDataURL(file);
    });
  }

  // SUBMISSÃO DO FORMULÁRIO (POST COMPLETO PARA O JSON-SERVER)
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let valido = true;

      // Validação do Tipo/Categoria
      if (!tipo.value) {
        tipo.classList.add("is-invalid");
        valido = false;
      } else {
        tipo.classList.remove("is-invalid");
      }

      // Validação do Endereço escrito
      if (!endereco.value.trim()) {
        endereco.classList.add("is-invalid");
        valido = false;
      } else {
        endereco.classList.remove("is-invalid");
      }

      // Validação do tamanho mínimo do relato
      if (descricao.value.trim().length < 20) {
        descricao.classList.add("is-invalid");
        erroDescricao.style.display = "block";
        valido = false;
      } else {
        descricao.classList.remove("is-invalid");
        erroDescricao.style.display = "none";
      }

      // Validação da seleção do Local no mapa
      if (!latitude || !longitude) {
        erroMapa.style.display = "block";
        coordenadas.classList.add("text-danger");
        valido = false;
      }

      if (!valido) {
        criarNotificacao("danger", "Por favor, corrija os erros no formulário antes de enviar.");
        return;
      }

      // COMO REMOVESTE O INDEX.JS, ENVIAMOS A DATA E STATUS DIRETAMENTE AQUI:
      const ocorrencia = {
        tipo: tipo.value,
        endereco: endereco.value.trim(),
        bairro: bairroExtraido, 
        descricao: descricao.value.trim(),
        latitude: latitude,
        longitude: longitude,
        fotos: fotos,
        data: new Date().toLocaleDateString("pt-BR"), // Adicionado aqui no Frontend!
        status: "Pendente"                          // Adicionado aqui no Frontend!
      };

      // Ativa efeito visual da barra de progresso
      if (progress && progressBar) {
        progress.style.display = "block";
        progressBar.style.width = "40%";
      }

      // Envia para a rota padrão do json-server
      fetch("http://localhost:3000/ocorrencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(ocorrencia)
      })
        .then(resposta => {
          if (!resposta.ok) throw new Error("Falha ao salvar a ocorrência.");
          if (progressBar) progressBar.style.width = "100%";
          return resposta.json();
        })
        .then(dados => {
          console.log("Sucesso no JSON Server:", dados);

          // Dispara o Modal de Sucesso original do teu HTML
          const modalElement = document.getElementById("modalSucesso");
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          } else {
            criarNotificacao("success", "Ocorrência enviada com sucesso!");
          }

          // Limpa todos os campos para um novo cadastro
          form.reset();
          fotos = [];
          if (fotosContainer) fotosContainer.innerHTML = "";
          if (coordenadas) coordenadas.textContent = "Lat: -- | Lng: --";
          latitude = null;
          longitude = null;
          bairroExtraido = "Não informado";

          if (marcador) {
            mapa.removeLayer(marcador);
            marcador = null;
          }

          if (progress) progress.style.display = "none";
        })
        .catch(erro => {
          console.error(erro);
          criarNotificacao("danger", "Erro de conexão. Certifica-te de que o JSON Server está ligado na porta 3000!");
          if (progress) progress.style.display = "none";
        });
    });
  }
});