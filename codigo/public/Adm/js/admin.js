document.addEventListener('DOMContentLoaded', async function () {
  const page = document.body.dataset.page;
  if (page === 'dashboard') await renderAdminDashboard();
  if (page === 'aprovacoes') await renderApprovalQueue();
  if (page === 'ocorrencias') {
    await renderAdminOccurrences();
    bindAdminOccurrenceFilters();
  }
  if (page === 'detalhes') await renderAdminDetail();
});

async function renderAdminDetail() {
  const id = getQueryParam('id');
  const area = document.querySelector('.content-area');
  const title = document.querySelector('.page-header h1');
  const item = id ? await getOcorrenciaById(id) : null;
  if (!area || !item) {
    if (area) area.innerHTML = '<div class="card-mongodb" style="text-align:center;padding:48px"><h2>Ocorrência não encontrada</h2><a href="ocorrencias.html" class="btn-mongodb-primary">Voltar à lista</a></div>';
    return;
  }
  if (title) title.innerHTML = `Denúncia <span class="accent-underline">${escapeHtml(item.id)}</span>`;
  const photo = Array.isArray(item.photos) && item.photos[0] ? item.photos[0].src : '';
  area.innerHTML = `<div class="detail-grid mb-4">
    <div class="card-mongodb" style="padding:0;overflow:hidden;min-height:300px;display:grid;place-items:center;background:var(--light-input)">${photo ? `<img src="${escapeHtml(photo)}" alt="Evidência da denúncia" style="width:100%;height:100%;max-height:420px;object-fit:cover">` : '<i class="bi bi-image" style="font-size:64px;color:var(--silver-teal)"></i>'}</div>
    <div class="card-mongodb"><p class="leafy-label">Dados da denúncia</p><h2 style="font-size:24px">${escapeHtml(item.type)}</h2><p><i class="bi bi-geo-alt"></i> ${escapeHtml(item.address)} · ${escapeHtml(item.bairro)}</p><p><strong>Prioridade:</strong> ${escapeHtml(item.priority)}</p><p><strong>Atendimento:</strong> ${escapeHtml(item.status)}</p><p><strong>Moderação:</strong> ${escapeHtml(moderationLabel(item))}</p>${item.moderationReason ? `<p><strong>Motivo:</strong> ${escapeHtml(item.moderationReason)}</p>` : ''}<p><strong>Enviada em:</strong> ${formatDateTime(item.createdAt)}</p></div>
  </div><div class="card-mongodb mb-4"><h3 style="font-size:16px">Descrição</h3><p style="line-height:1.7">${escapeHtml(item.description)}</p></div>
  <div class="card-mongodb"><h3 style="font-size:16px">Histórico</h3>${(item.history || []).map(entry => `<div style="padding:10px 0;border-bottom:1px solid var(--light-input)"><small>${escapeHtml(entry.time)}</small><br>${escapeHtml(entry.message)}</div>`).join('') || '<p>Sem histórico.</p>'}</div>
  <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px"><a href="ocorrencias.html" class="btn-mongodb-outline">Voltar</a>${moderationLabel(item) === 'Aguardando aprovação' ? '<a href="aprovacoes.html" class="btn-mongodb-primary"><i class="bi bi-shield-check"></i> Abrir fila de aprovação</a>' : ''}</div>`;
}

async function renderApprovalQueue() {
  const queue = document.getElementById('approval-queue');
  const count = document.getElementById('approval-count');
  const search = document.getElementById('approval-search');
  const allItems = await getCurrentOcorrencias();
  let pending = allItems.filter(item => moderationLabel(item) === 'Aguardando aprovação');

  async function moderate(item, decision, reason) {
    item.moderationStatus = decision;
    item.moderationReason = reason || '';
    item[decision === 'Aprovada' ? 'approvedAt' : 'rejectedAt'] = Date.now();
    item.history = (item.history || []).concat([{ time: formatDateTime(Date.now()), message: decision === 'Aprovada' ? 'Denúncia aprovada e publicada no feed.' : `Denúncia rejeitada: ${reason}` }]);
    const updated = await updateOcorrencia(item.id, item);
    if (!updated) return;
    pending = pending.filter(current => current.id !== item.id);
    render();
  }

  function render() {
    const term = String(search.value || '').trim().toLowerCase();
    const visible = pending.filter(item => !term || `${item.type} ${item.bairro} ${item.address} ${item.description}`.toLowerCase().includes(term));
    count.textContent = `${pending.length} aguardando`;
    if (!visible.length) {
      queue.innerHTML = '<div class="col-12"><div class="card-mongodb" style="text-align:center;padding:48px"><i class="bi bi-shield-check" style="font-size:40px;color:var(--dark-green)"></i><h3 style="margin-top:12px">Fila de aprovação vazia</h3><p style="color:var(--cool-gray)">Novas denúncias enviadas por cidadãos aparecerão aqui.</p></div></div>';
      return;
    }
    queue.innerHTML = visible.map(function (item) {
      const photo = Array.isArray(item.photos) && item.photos[0] ? item.photos[0].src : '';
      return `<div class="col-12 col-xl-6"><article class="card-mongodb" data-id="${escapeHtml(item.id)}" style="height:100%">
        <div style="display:grid;grid-template-columns:minmax(130px,200px) 1fr;gap:18px">
          <div style="height:180px;border-radius:12px;overflow:hidden;background:var(--light-input);display:grid;place-items:center">${photo ? `<img src="${escapeHtml(photo)}" alt="Evidência enviada" style="width:100%;height:100%;object-fit:cover">` : '<i class="bi bi-image" style="font-size:42px;color:var(--silver-teal)"></i>'}</div>
          <div><div style="display:flex;justify-content:space-between;gap:10px"><strong>${escapeHtml(item.type)}</strong><span class="badge-priority badge-${normalizePriorityClass(item.priority)}">${escapeHtml(item.priority)}</span></div><p style="margin:8px 0;color:var(--cool-gray);font-size:13px"><i class="bi bi-geo-alt"></i> ${escapeHtml(item.bairro)} · ${escapeHtml(summarizeAddress(item.address, item.bairro))}</p><p style="line-height:1.5">${escapeHtml(item.description)}</p><small style="color:var(--cool-gray)">Enviada em ${formatDateTime(item.createdAt)}</small></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px;padding-top:16px;border-top:1px solid var(--light-input)"><button class="btn-mongodb-outline reject-approval" style="color:#b42318"><i class="bi bi-x-lg"></i> Rejeitar</button><button class="btn-mongodb-primary approve-approval"><i class="bi bi-check-lg"></i> Aprovar e publicar</button></div>
      </article></div>`;
    }).join('');

    queue.querySelectorAll('.approve-approval').forEach(function (button) {
      button.addEventListener('click', function () {
        const item = pending.find(current => current.id === button.closest('article').dataset.id);
        if (item) moderate(item, 'Aprovada', '');
      });
    });
    queue.querySelectorAll('.reject-approval').forEach(function (button) {
      button.addEventListener('click', function () {
        const reason = window.prompt('Motivo da rejeição:', 'Informações insuficientes ou fora do padrão do site.');
        const item = pending.find(current => current.id === button.closest('article').dataset.id);
        if (item && reason && reason.trim()) moderate(item, 'Rejeitada', reason.trim().slice(0, 250));
      });
    });
  }

  search.addEventListener('input', render);
  render();
}

async function renderAdminDashboard() {
  const items = await getCurrentOcorrencias();
  const approvedItems = items.filter(item => moderationLabel(item) === 'Aprovada');
  const types = ['Buraco', 'Vazamento', 'Falta de Água'];
  const totals = types.map(type => approvedItems.filter(item => item.type === type).length);
  totals.push(approvedItems.filter(item => !types.includes(item.type)).length);
  document.querySelectorAll('.stat-value').forEach(function (element, index) {
    if (index < totals.length) element.textContent = totals[index];
  });

  const tableBody = document.querySelector('.table-mongodb tbody');
  if (tableBody) {
    const ordered = items.slice().sort((a, b) => (moderationLabel(a) === 'Aguardando aprovação' ? -1 : 1) - (moderationLabel(b) === 'Aguardando aprovação' ? -1 : 1));
    tableBody.innerHTML = ordered.slice(0, 5).map(function (item) {
      return `<tr><td><strong>${escapeHtml(item.id)}</strong></td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(summarizeAddress(item.address, item.bairro))}</td><td>${escapeHtml(item.bairro)}</td><td>${formatDate(item.createdAt)}</td><td><span class="badge-status badge-${visibleStatusClass(item)}">${escapeHtml(visibleStatus(item))}</span></td></tr>`;
    }).join('') || '<tr><td colspan="6" style="text-align:center;padding:24px">Nenhuma ocorrência cadastrada.</td></tr>';
  }

  const mapElement = document.querySelector('.map-container');
  if (mapElement && typeof L !== 'undefined') {
    mapElement.innerHTML = '';
    const map = L.map(mapElement).setView([-19.9167, -43.9345], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
    approvedItems.forEach(function (item) {
      if (!Number.isFinite(Number(item.lat)) || !Number.isFinite(Number(item.lng))) return;
      L.circleMarker([Number(item.lat), Number(item.lng)], { radius: 7, color: '#fff', weight: 2, fillColor: typeColor(item.type), fillOpacity: .92 })
        .bindPopup(`<strong>${escapeHtml(item.type)}</strong><br>${escapeHtml(item.bairro)}<br>${escapeHtml(item.status)}`)
        .addTo(map);
    });
  }

  const bell = document.querySelector('.notification-bell');
  if (bell) {
    const important = items.filter(item => moderationLabel(item) === 'Aguardando aprovação' || item.priority === 'Alta').slice(0, 5);
    const badge = bell.querySelector('.badge-dot');
    if (badge) badge.textContent = important.length;
    bell.style.cursor = 'pointer';
    bell.addEventListener('click', function () {
      let panel = document.getElementById('admin-notifications');
      if (panel) { panel.remove(); return; }
      panel = document.createElement('div');
      panel.id = 'admin-notifications';
      panel.style.cssText = 'position:absolute;right:24px;top:66px;z-index:1000;width:min(380px,calc(100vw - 32px));padding:18px;background:white;border:1px solid #dfe7e5;border-radius:14px;box-shadow:0 18px 50px rgba(0,30,43,.18)';
      panel.innerHTML = '<strong>Fila de moderação e prioridades</strong>' + (important.length ? important.map(item => `<a href="ocorrencias.html" style="display:block;padding:12px 0;border-bottom:1px solid #e8edeb;color:inherit;text-decoration:none"><b>${escapeHtml(item.type)}</b> · ${escapeHtml(item.bairro)}<br><small>${escapeHtml(moderationLabel(item))} · ${escapeHtml(item.priority)}</small></a>`).join('') : '<p style="margin:12px 0 0">Nenhuma denúncia aguardando análise.</p>');
      document.body.appendChild(panel);
    });
  }
}

async function renderAdminOccurrences() {
  const items = await getCurrentOcorrencias();
  const tableBody = document.getElementById('admin-ocorrencias-table-body') || document.querySelector('.table-mongodb tbody');
  if (!tableBody) return;
  populateBairroFilter(items);
  const filtered = applyFilters(items);

  tableBody.innerHTML = filtered.map(function (item) {
    const moderation = moderationLabel(item);
    const moderationActions = moderation === 'Aguardando aprovação'
      ? '<a href="aprovacoes.html" class="btn-mongodb-outline" style="padding:6px 10px;font-size:12px"><i class="bi bi-shield-check"></i> Analisar</a>'
      : `<small style="display:block;margin-bottom:6px;font-weight:600;color:${moderation === 'Aprovada' ? '#00684a' : '#dc3545'}">${escapeHtml(moderation)}</small>`;
    return `<tr data-id="${escapeHtml(item.id)}"><td><a href="detalhes.html?id=${encodeURIComponent(item.id)}" style="color:inherit;font-weight:600">${escapeHtml(item.id)}</a></td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(summarizeAddress(item.address, item.bairro))}</td><td>${escapeHtml(item.bairro)}</td><td>${formatDate(item.createdAt)}</td><td><select class="admin-status form-control-mongodb" style="min-width:140px"${moderation !== 'Aprovada' ? ' disabled' : ''}><option${item.status === 'Pendente' ? ' selected' : ''}>Pendente</option><option${item.status === 'Em andamento' ? ' selected' : ''}>Em andamento</option><option${item.status === 'Resolvido' ? ' selected' : ''}>Resolvido</option></select></td><td><span class="badge-priority badge-${normalizePriorityClass(item.priority)}">${escapeHtml(item.priority)}</span></td><td style="min-width:120px">${moderationActions}<button class="action-icon action-icon-delete admin-delete" title="Excluir"><i class="bi bi-trash3-fill"></i></button></td></tr>`;
  }).join('') || '<tr><td colspan="8" style="text-align:center;padding:24px">Nenhuma ocorrência cadastrada.</td></tr>';

  tableBody.querySelectorAll('.admin-status').forEach(function (select) {
    select.addEventListener('change', async function () {
      const row = select.closest('tr');
      const item = items.find(current => current.id === row.dataset.id);
      if (!item) return;
      item.status = select.value;
      item.history = (item.history || []).concat([{ time: formatDateTime(Date.now()), message: `Status alterado para ${select.value} pelo administrador.` }]);
      await updateOcorrencia(item.id, item);
    });
  });

  tableBody.querySelectorAll('.admin-delete').forEach(function (button) {
    button.addEventListener('click', async function () {
      const row = button.closest('tr');
      if (!window.confirm('Excluir esta ocorrência permanentemente?')) return;
      await deleteOcorrencia(row.dataset.id);
      row.remove();
    });
  });

}

function resetAdminOccurrenceFilters() {
  ['filter-type', 'filter-status', 'filter-bairro', 'filter-start', 'filter-end', 'filter-address', 'search-text'].forEach(function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'SELECT') {
      el.value = 'todos';
    } else {
      el.value = '';
    }
  });
  renderAdminOccurrences();
}

function bindAdminOccurrenceFilters() {
  ['filter-type', 'filter-status', 'filter-bairro', 'filter-start', 'filter-end', 'filter-address', 'search-text'].forEach(function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', renderAdminOccurrences);
    el.addEventListener('change', renderAdminOccurrences);
  });

  const clearLink = document.getElementById('clear-filters');
  if (clearLink) {
    clearLink.addEventListener('click', function(event) {
      event.preventDefault();
      resetAdminOccurrenceFilters();
    });
  }
}

function statusClass(status) {
  return status === 'Pendente' ? 'pendente' : status === 'Em andamento' ? 'andamento' : 'resolvido';
}

function typeColor(type) {
  return type === 'Vazamento' ? '#006cfa' : type === 'Falta de Água' ? '#ffc107' : type === 'Buraco' ? '#dc3545' : '#5c6c75';
}
