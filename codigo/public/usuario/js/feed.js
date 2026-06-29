document.addEventListener('DOMContentLoaded', async function () {
  const list = document.getElementById('feed-list');
  const summary = document.getElementById('feed-summary');
  const search = document.getElementById('feed-search');
  const total = document.getElementById('feed-total');
  const bairros = document.getElementById('feed-bairros');
  const confirmacoes = document.getElementById('feed-confirmacoes');
  const chips = document.querySelectorAll('.feed-chip');
  let items = await getFeedOcorrencias();
  let typeFilter = 'todos';

  function fallbackPhoto(type) {
    if (type === 'Vazamento') return 'https://loremflickr.com/900/600/water,leak?lock=102';
    if (type === 'Falta de Água') return 'https://loremflickr.com/900/600/water,shortage?lock=103';
    if (type === 'Buraco') return 'https://loremflickr.com/900/600/pothole,road?lock=101';
    return 'https://loremflickr.com/900/600/city,street?lock=104';
  }

  function typeIcon(type) {
    if (type === 'Vazamento') return 'bi-droplet-fill';
    if (type === 'Falta de Água') return 'bi-exclamation-triangle-fill';
    if (type === 'Buraco') return 'bi-exclamation-circle';
    return 'bi-question-circle';
  }

  function renderStats() {
    const uniqueBairros = new Set(items.map(item => String(item.bairro || '').trim()).filter(Boolean));
    if (total) total.textContent = items.length;
    if (bairros) bairros.textContent = uniqueBairros.size;
    if (confirmacoes) confirmacoes.textContent = items.reduce((sum, item) => sum + Number(item.confirmacoes || 0), 0);
  }

  function render() {
    const term = String(search.value || '').trim().toLowerCase();
    const filtered = items.filter(function (item) {
      const matchType = typeFilter === 'todos' || item.type === typeFilter;
      const matchTerm = !term || `${item.type} ${item.bairro} ${item.address} ${item.description}`.toLowerCase().includes(term);
      return matchType && matchTerm;
    });
    summary.textContent = `${filtered.length} denúncia${filtered.length === 1 ? '' : 's'} aprovada${filtered.length === 1 ? '' : 's'}`;
    if (!filtered.length) {
      list.innerHTML = '<div class="feed-empty"><i class="bi bi-inbox" style="font-size:34px"></i><h3>Nenhuma denúncia encontrada</h3><p>As denúncias aparecem aqui depois da aprovação administrativa.</p></div>';
      return;
    }
    list.innerHTML = filtered.map(function (item) {
      const photo = Array.isArray(item.photos) && item.photos[0] ? item.photos[0].src : fallbackPhoto(item.type);
      const confirmed = localStorage.getItem(`infrabh.confirmed.${item.id}`) === 'true';
      return `<article class="feed-card" data-id="${escapeHtml(item.id)}">
        <div class="feed-image">
          <img src="${escapeHtml(photo)}" alt="Foto da ocorrência ${escapeHtml(item.type)}" loading="lazy">
          <span class="feed-type-pill"><i class="bi ${typeIcon(item.type)}"></i> ${escapeHtml(item.type)}</span>
        </div>
        <div class="feed-body">
          <div class="feed-meta"><strong>${escapeHtml(item.type)}</strong><span class="badge-status badge-${visibleStatusClass(item)}">${escapeHtml(item.status)}</span></div>
          <div class="feed-location"><i class="bi bi-geo-alt"></i> ${escapeHtml(item.bairro)} · ${escapeHtml(summarizeAddress(item.address, item.bairro))}</div>
          <p class="feed-description">${escapeHtml(item.description)}</p>
          <div class="feed-actions"><span><strong class="confirmation-count">${item.confirmacoes || 0}</strong> confirmações</span><button class="btn-mongodb-outline confirm-feed${confirmed ? ' is-confirmed' : ''}"><i class="bi ${confirmed ? 'bi-check2' : 'bi-hand-thumbs-up'}"></i> ${confirmed ? 'Desconfirmar' : 'Confirmar'}</button></div>
        </div>
      </article>`;
    }).join('');

    list.querySelectorAll('.confirm-feed').forEach(function (button) {
      button.addEventListener('click', async function () {
        const card = button.closest('.feed-card');
        const key = `infrabh.confirmed.${card.dataset.id}`;
        const isConfirmed = localStorage.getItem(key) === 'true';
        button.disabled = true;
        const updated = await confirmOcorrencia(card.dataset.id, !isConfirmed);
        if (!updated) {
          button.disabled = false;
          return;
        }
        if (isConfirmed) {
          localStorage.removeItem(key);
          button.classList.remove('is-confirmed');
          button.innerHTML = '<i class="bi bi-hand-thumbs-up"></i> Confirmar';
        } else {
          localStorage.setItem(key, 'true');
          button.classList.add('is-confirmed');
          button.innerHTML = '<i class="bi bi-check2"></i> Desconfirmar';
        }
        const item = items.find(current => String(current.id) === String(updated.id));
        if (item) item.confirmacoes = updated.confirmacoes;
        card.querySelector('.confirmation-count').textContent = updated.confirmacoes;
        button.disabled = false;
        renderStats();
      });
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      typeFilter = chip.dataset.type || 'todos';
      chips.forEach(current => current.classList.toggle('active', current === chip));
      render();
    });
  });

  search.addEventListener('input', render);
  renderStats();
  render();
});
