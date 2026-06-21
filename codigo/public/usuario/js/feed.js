document.addEventListener('DOMContentLoaded', async function () {
  const list = document.getElementById('feed-list');
  const summary = document.getElementById('feed-summary');
  const search = document.getElementById('feed-search');
  let items = await getFeedOcorrencias();

  function render() {
    const term = String(search.value || '').trim().toLowerCase();
    const filtered = items.filter(function (item) {
      return !term || `${item.type} ${item.bairro} ${item.address} ${item.description}`.toLowerCase().includes(term);
    });
    summary.textContent = `${filtered.length} denúncia${filtered.length === 1 ? '' : 's'} aprovada${filtered.length === 1 ? '' : 's'}`;
    if (!filtered.length) {
      list.innerHTML = '<div class="feed-empty"><i class="bi bi-inbox" style="font-size:34px"></i><h3>Nenhuma denúncia encontrada</h3><p>As denúncias aparecem aqui depois da aprovação administrativa.</p></div>';
      return;
    }
    list.innerHTML = filtered.map(function (item) {
      const photo = Array.isArray(item.photos) && item.photos[0] ? item.photos[0].src : '';
      const confirmed = localStorage.getItem(`infrabh.confirmed.${item.id}`);
      return `<article class="feed-card" data-id="${escapeHtml(item.id)}">
        <div class="feed-image">${photo ? `<img src="${escapeHtml(photo)}" alt="Foto da ocorrência ${escapeHtml(item.type)}">` : '<i class="bi bi-image"></i>'}</div>
        <div class="feed-body">
          <div class="feed-meta"><strong>${escapeHtml(item.type)}</strong><span class="badge-status badge-${visibleStatusClass(item)}">${escapeHtml(item.status)}</span></div>
          <div class="feed-location"><i class="bi bi-geo-alt"></i> ${escapeHtml(item.bairro)} · ${escapeHtml(summarizeAddress(item.address, item.bairro))}</div>
          <p class="feed-description">${escapeHtml(item.description)}</p>
          <div class="feed-actions"><span><strong class="confirmation-count">${item.confirmacoes || 0}</strong> confirmações</span><button class="btn-mongodb-outline confirm-feed"${confirmed ? ' disabled' : ''}><i class="bi bi-hand-thumbs-up"></i> ${confirmed ? 'Confirmada' : 'Confirmar'}</button></div>
        </div>
      </article>`;
    }).join('');

    list.querySelectorAll('.confirm-feed').forEach(function (button) {
      button.addEventListener('click', async function () {
        const card = button.closest('.feed-card');
        const updated = await confirmOcorrencia(card.dataset.id);
        if (!updated) return;
        localStorage.setItem(`infrabh.confirmed.${updated.id}`, 'true');
        button.disabled = true;
        button.innerHTML = '<i class="bi bi-check2"></i> Confirmada';
        card.querySelector('.confirmation-count').textContent = updated.confirmacoes;
      });
    });
  }

  search.addEventListener('input', render);
  render();
});
