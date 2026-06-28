document.addEventListener('DOMContentLoaded', function () {
  const session = window.InfraBHAuth ? window.InfraBHAuth.getSession() : null;
  if (!session || !session.token) return;

  const form = document.getElementById('formOcorrencia');
  const endereco = document.getElementById('endereco');
  const bairro = document.getElementById('bairro');
  const tipo = document.getElementById('tipo');
  const prioridade = document.getElementById('prioridade');
  const descricao = document.getElementById('descricao');
  const contadorDescricao = document.getElementById('contadorDescricao');
  const erroDescricao = document.getElementById('erroDescricao');
  const coordenadas = document.getElementById('coordenadas');
  const erroMapa = document.getElementById('erroMapa');
  const progress = document.getElementById('progress');
  const progressBar = document.getElementById('progressBar');
  const dragDrop = document.getElementById('dragDrop');
  const inputFotos = document.getElementById('inputFotos');
  const fotosContainer = document.getElementById('fotosContainer');
  const btnBuscar = document.getElementById('btnBuscarEndereco');
  const submitButton = document.getElementById('btnRegistrarOcorrencia');
  const dataAtual = document.getElementById('dataAtual');

  if (!form) return;
  if (dataAtual) dataAtual.textContent = new Date().toLocaleDateString('pt-BR');

  let latitude = null;
  let longitude = null;
  let marcador = null;
  let fotos = [];

  function criarNotificacao(tipoAlerta, mensagem) {
    const notificacao = document.createElement('div');
    notificacao.className = `alert alert-${tipoAlerta} alert-dismissible fade show`;
    notificacao.setAttribute('role', 'alert');
    notificacao.style.position = 'fixed';
    notificacao.style.top = '20px';
    notificacao.style.right = '20px';
    notificacao.style.zIndex = '9999';
    notificacao.style.minWidth = '300px';
    notificacao.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

    const icones = {
      danger: 'bi-exclamation-circle',
      warning: 'bi-exclamation-triangle',
      info: 'bi-info-circle',
      success: 'bi-check-circle',
    };

    notificacao.innerHTML = `
      <i class="bi ${icones[tipoAlerta] || 'bi-info-circle'}"></i>
      <strong>${escapeHtml(mensagem)}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;

    document.body.appendChild(notificacao);
    setTimeout(function () { notificacao.remove(); }, 5000);
  }

  function extrairBairro(address) {
    if (!address) return '';
    return address.suburb ||
      address.neighbourhood ||
      address.city_district ||
      address.quarter ||
      address.village ||
      '';
  }

  function montarEnderecoBusca(texto) {
    return `${texto}, Minas Gerais, Brasil`;
  }

  function formatarEndereco(item, textoDigitado = '') {
    const address = item.address || {};
    const rua = address.road || address.pedestrian || address.path || '';
    let numero = address.house_number || '';

    if (!numero) {
      const numeroDigitado = textoDigitado.match(/\d+/);
      if (numeroDigitado) numero = numeroDigitado[0];
    }

    const bairroEncontrado = extrairBairro(address);
    const cidade = address.city || address.town || address.village || address.municipality || 'Belo Horizonte';
    const estado = address.state || 'Minas Gerais';

    return [rua + (numero ? `, ${numero}` : ''), bairroEncontrado, cidade, estado]
      .filter(Boolean)
      .join(', ');
  }

  function atualizarMapa() {
    mapa.setView([latitude, longitude], 15);

    if (marcador) mapa.removeLayer(marcador);
    marcador = L.marker([latitude, longitude]).addTo(mapa);

    coordenadas.textContent = `Lat: ${latitude.toFixed(4)} | Lng: ${longitude.toFixed(4)}`;
    erroMapa.textContent = '';
  }

  function atualizarProgresso() {
    let total = 0;
    if (endereco.value.trim()) total += 20;
    if (bairro.value.trim()) total += 15;
    if (tipo.value) total += 15;
    if (prioridade.value) total += 15;
    if (descricao.value.trim().length >= 20) total += 20;
    if (latitude !== null && longitude !== null) total += 10;
    if (fotos.length > 0) total += 5;

    progress.textContent = total;
    progressBar.style.width = `${total}%`;
  }

  function limparFormulario() {
    form.reset();
    fotos = [];
    fotosContainer.innerHTML = '';
    coordenadas.textContent = 'Lat: -- | Lng: --';
    erroDescricao.textContent = '';
    erroMapa.textContent = '';
    latitude = null;
    longitude = null;
    contadorDescricao.textContent = '0';

    if (marcador) {
      mapa.removeLayer(marcador);
      marcador = null;
    }

    atualizarProgresso();
  }

  const mapa = L.map('mapa').setView([-19.9167, -43.9345], 12);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(mapa);

  const limitesMG = L.latLngBounds(
    L.latLng(-22.9068, -46.2576),
    L.latLng(-14.8831, -39.8622)
  );

  mapa.setMaxBounds(limitesMG);
  mapa.on('drag', function () {
    mapa.panInsideBounds(limitesMG, { animate: false });
  });

  btnBuscar.addEventListener('click', function () {
    const texto = endereco.value.trim();

    if (!texto) {
      criarNotificacao('warning', 'Digite um endereço.');
      return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(montarEnderecoBusca(texto))}&format=json&addressdetails=1&limit=5&countrycodes=br&accept-language=pt-BR`)
      .then(resposta => resposta.json())
      .then(dados => {
        if (!dados.length) {
          criarNotificacao('danger', 'Endereço não encontrado.');
          return;
        }

        const resultado = dados.find(item => item.address && (item.address.road || item.address.suburb || item.address.neighbourhood)) || dados[0];

        latitude = Number(resultado.lat);
        longitude = Number(resultado.lon);
        endereco.value = formatarEndereco(resultado, texto);

        const bairroEncontrado = extrairBairro(resultado.address || {});
        if (bairroEncontrado && !bairro.value.trim()) bairro.value = bairroEncontrado;

        atualizarMapa();
        atualizarProgresso();
      })
      .catch(function () {
        criarNotificacao('danger', 'Erro ao buscar endereço. Você ainda pode clicar manualmente no mapa.');
      });
  });

  endereco.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      btnBuscar.click();
    }
  });

  mapa.on('click', function (evento) {
    latitude = evento.latlng.lat;
    longitude = evento.latlng.lng;
    atualizarMapa();
    atualizarProgresso();

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`)
      .then(resposta => resposta.json())
      .then(dados => {
        if (!dados.address) return;
        endereco.value = formatarEndereco(dados);
        const bairroEncontrado = extrairBairro(dados.address);
        if (bairroEncontrado && !bairro.value.trim()) bairro.value = bairroEncontrado;
        atualizarProgresso();
      })
      .catch(function () {
        criarNotificacao('info', 'Localização marcada. Preencha o endereço manualmente se necessário.');
      });
  });

  [endereco, bairro, tipo, prioridade].forEach(function (elemento) {
    elemento.addEventListener('input', atualizarProgresso);
    elemento.addEventListener('change', atualizarProgresso);
  });

  descricao.addEventListener('input', function () {
    contadorDescricao.textContent = String(descricao.value.length);
    if (descricao.value.trim().length >= 20) erroDescricao.textContent = '';
    atualizarProgresso();
  });

  dragDrop.addEventListener('click', function () {
    inputFotos.click();
  });

  inputFotos.addEventListener('change', function () {
    adicionarFotos(inputFotos.files);
    inputFotos.value = '';
  });

  dragDrop.addEventListener('dragover', function (evento) {
    evento.preventDefault();
    dragDrop.classList.add('drag-over');
  });

  dragDrop.addEventListener('dragleave', function () {
    dragDrop.classList.remove('drag-over');
  });

  dragDrop.addEventListener('drop', function (evento) {
    evento.preventDefault();
    dragDrop.classList.remove('drag-over');
    adicionarFotos(evento.dataTransfer.files);
  });

  function adicionarFotos(arquivos) {
    const lista = Array.from(arquivos || []);

    if (fotos.length + lista.length > 5) {
      criarNotificacao('warning', 'Você pode enviar no máximo 5 fotos.');
      return;
    }

    lista.forEach(function (arquivo) {
      if (!arquivo.type.startsWith('image/')) {
        criarNotificacao('warning', 'Envie apenas arquivos de imagem.');
        return;
      }

      if (arquivo.size > 1024 * 1024) {
        criarNotificacao('warning', `A foto ${arquivo.name} passou de 1 MB.`);
        return;
      }

      const leitor = new FileReader();
      leitor.onload = function (evento) {
        fotos.push({ name: arquivo.name, src: evento.target.result });
        mostrarFotos();
        atualizarProgresso();
      };
      leitor.readAsDataURL(arquivo);
    });
  }

  function mostrarFotos() {
    fotosContainer.innerHTML = '';

    fotos.forEach(function (foto, index) {
      const div = document.createElement('div');
      div.className = 'col-4';

      div.innerHTML = `
        <div class="photo-thumb">
          <img src="${foto.src}" alt="Foto anexada ${index + 1}">
          <button type="button" class="btn-remove" data-index="${index}" aria-label="Remover foto">
            <i class="bi bi-x"></i>
          </button>
        </div>
      `;

      fotosContainer.appendChild(div);
    });
  }

  fotosContainer.addEventListener('click', function (evento) {
    const button = evento.target.closest('.btn-remove');
    if (!button) return;
    fotos.splice(Number(button.dataset.index), 1);
    mostrarFotos();
    atualizarProgresso();
  });

  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const addressValue = endereco.value.trim();
    const bairroValue = bairro.value.trim();
    const typeValue = tipo.value;
    const priorityValue = prioridade.value;
    const descriptionValue = descricao.value.trim();

    if (!addressValue || addressValue.length < 5) {
      criarNotificacao('warning', 'Preencha um endereço válido.');
      endereco.focus();
      return;
    }

    if (!bairroValue || bairroValue.length < 2) {
      criarNotificacao('warning', 'Preencha o bairro da ocorrência.');
      bairro.focus();
      return;
    }

    if (!typeValue) {
      criarNotificacao('warning', 'Selecione o tipo da ocorrência.');
      tipo.focus();
      return;
    }

    if (!priorityValue) {
      criarNotificacao('warning', 'Selecione a prioridade.');
      prioridade.focus();
      return;
    }

    if (descriptionValue.length < 20) {
      erroDescricao.textContent = 'A descrição deve conter pelo menos 20 caracteres.';
      descricao.focus();
      return;
    }

    if (latitude === null || longitude === null) {
      erroMapa.textContent = 'Selecione uma localização no mapa.';
      return;
    }

    if (!fotos.length) {
      criarNotificacao('warning', 'Anexe pelo menos uma foto do problema.');
      return;
    }

    const ocorrencia = {
      type: typeValue,
      address: addressValue,
      bairro: bairroValue,
      priority: priorityValue,
      status: 'Pendente',
      description: descriptionValue,
      photos: fotos,
      lat: latitude,
      lng: longitude,
    };

    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Enviando...';

    const saved = await addOcorrencia(ocorrencia);

    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="bi bi-check-lg"></i> Registrar Ocorrência';

    if (!saved) {
      criarNotificacao('danger', lastApiError || 'Não foi possível registrar a ocorrência.');
      return;
    }

    const modalElement = document.getElementById('modalSucesso');
    if (modalElement && window.bootstrap) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      criarNotificacao('success', 'Ocorrência enviada para aprovação.');
    }

    limparFormulario();
  });

  contadorDescricao.textContent = '0';
  atualizarProgresso();
});
