document.addEventListener('DOMContentLoaded', async function () {
  const page = document.body.dataset.page;
  if (page === 'dashboard') await renderAdminDashboard();
  if (page === 'ocorrencias') await renderAdminOccurrences();
});

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
  const tableBody = document.querySelector('.table-mongodb tbody');
  if (!tableBody) return;
  tableBody.innerHTML = items.map(function (item) {
    const moderation = moderationLabel(item);
    const moderationActions = moderation === 'Aguardando aprovação'
      ? '<button class="action-icon admin-approve" title="Aprovar" style="color:#00684a"><i class="bi bi-check-circle-fill"></i></button><button class="action-icon admin-reject" title="Rejeitar" style="color:#dc3545"><i class="bi bi-x-circle-fill"></i></button>'
      : `<small style="display:block;margin-bottom:6px;font-weight:600;color:${moderation === 'Aprovada' ? '#00684a' : '#dc3545'}">${escapeHtml(moderation)}</small>`;
    return `<tr data-id="${escapeHtml(item.id)}"><td><a href="../../usuario/detalhes.html?id=${encodeURIComponent(item.id)}" style="color:inherit;font-weight:600">${escapeHtml(item.id)}</a></td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(summarizeAddress(item.address, item.bairro))}</td><td>${escapeHtml(item.bairro)}</td><td>${formatDate(item.createdAt)}</td><td><select class="admin-status form-control-mongodb" style="min-width:140px"${moderation !== 'Aprovada' ? ' disabled' : ''}><option${item.status === 'Pendente' ? ' selected' : ''}>Pendente</option><option${item.status === 'Em andamento' ? ' selected' : ''}>Em andamento</option><option${item.status === 'Resolvido' ? ' selected' : ''}>Resolvido</option></select></td><td><span class="badge-priority badge-${normalizePriorityClass(item.priority)}">${escapeHtml(item.priority)}</span></td><td style="min-width:120px">${moderationActions}<button class="action-icon action-icon-delete admin-delete" title="Excluir"><i class="bi bi-trash3-fill"></i></button></td></tr>`;
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

  tableBody.querySelectorAll('.admin-approve').forEach(function (button) {
    button.addEventListener('click', async function () {
      const row = button.closest('tr');
      const item = items.find(current => current.id === row.dataset.id);
      if (!item) return;
      item.moderationStatus = 'Aprovada';
      item.moderationReason = '';
      item.approvedAt = Date.now();
      item.history = (item.history || []).concat([{ time: formatDateTime(Date.now()), message: 'Denúncia aprovada pelo administrador.' }]);
      await updateOcorrencia(item.id, item);
      await renderAdminOccurrences();
    });
  });

  tableBody.querySelectorAll('.admin-reject').forEach(function (button) {
    button.addEventListener('click', async function () {
      const row = button.closest('tr');
      const item = items.find(current => current.id === row.dataset.id);
      if (!item) return;
      const reason = window.prompt('Informe o motivo da rejeição:', 'Informações insuficientes ou fora do padrão do site.');
      if (!reason) return;
      item.moderationStatus = 'Rejeitada';
      item.moderationReason = reason.trim().slice(0, 250);
      item.rejectedAt = Date.now();
      item.history = (item.history || []).concat([{ time: formatDateTime(Date.now()), message: `Denúncia rejeitada: ${item.moderationReason}` }]);
      await updateOcorrencia(item.id, item);
      await renderAdminOccurrences();
    });
  });
}

function statusClass(status) {
  return status === 'Pendente' ? 'pendente' : status === 'Em andamento' ? 'andamento' : 'resolvido';
}

function typeColor(type) {
  return type === 'Vazamento' ? '#006cfa' : type === 'Falta de Água' ? '#ffc107' : type === 'Buraco' ? '#dc3545' : '#5c6c75';
}
