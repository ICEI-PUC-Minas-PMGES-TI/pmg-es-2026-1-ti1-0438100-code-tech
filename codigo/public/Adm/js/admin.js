document.addEventListener('DOMContentLoaded', async function () {
  const page = document.body.dataset.page;
  if (page === 'dashboard') await renderAdminDashboard();
  if (page === 'ocorrencias') await renderAdminOccurrences();
});

async function renderAdminDashboard() {
  const items = await getCurrentOcorrencias();
  const types = ['Buraco', 'Vazamento', 'Falta de Água'];
  const totals = types.map(type => items.filter(item => item.type === type).length);
  totals.push(items.filter(item => !types.includes(item.type)).length);
  document.querySelectorAll('.stat-value').forEach(function (element, index) {
    if (index < totals.length) element.textContent = totals[index];
  });

  const tableBody = document.querySelector('.table-mongodb tbody');
  if (tableBody) {
    tableBody.innerHTML = items.slice(0, 5).map(function (item) {
      return `<tr><td><strong>${escapeHtml(item.id)}</strong></td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(summarizeAddress(item.address, item.bairro))}</td><td>${escapeHtml(item.bairro)}</td><td>${formatDate(item.createdAt)}</td><td><span class="badge-status badge-${statusClass(item.status)}">${escapeHtml(item.status)}</span></td></tr>`;
    }).join('') || '<tr><td colspan="6" style="text-align:center;padding:24px">Nenhuma ocorrência cadastrada.</td></tr>';
  }

  const mapElement = document.querySelector('.map-container');
  if (mapElement && typeof L !== 'undefined') {
    mapElement.innerHTML = '';
    const map = L.map(mapElement).setView([-19.9167, -43.9345], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
    items.forEach(function (item) {
      if (!Number.isFinite(Number(item.lat)) || !Number.isFinite(Number(item.lng))) return;
      L.circleMarker([Number(item.lat), Number(item.lng)], { radius: 7, color: '#fff', weight: 2, fillColor: typeColor(item.type), fillOpacity: .92 })
        .bindPopup(`<strong>${escapeHtml(item.type)}</strong><br>${escapeHtml(item.bairro)}<br>${escapeHtml(item.status)}`)
        .addTo(map);
    });
  }

  const bell = document.querySelector('.notification-bell');
  if (bell) {
    const important = items.filter(item => item.priority === 'Alta' || item.status === 'Pendente').slice(0, 5);
    const badge = bell.querySelector('.badge-dot');
    if (badge) badge.textContent = important.length;
    bell.style.cursor = 'pointer';
    bell.addEventListener('click', function () {
      let panel = document.getElementById('admin-notifications');
      if (panel) { panel.remove(); return; }
      panel = document.createElement('div');
      panel.id = 'admin-notifications';
      panel.style.cssText = 'position:absolute;right:24px;top:66px;z-index:1000;width:min(380px,calc(100vw - 32px));padding:18px;background:white;border:1px solid #dfe7e5;border-radius:14px;box-shadow:0 18px 50px rgba(0,30,43,.18)';
      panel.innerHTML = '<strong>Notificações prioritárias</strong>' + (important.length ? important.map(item => `<a href="../../usuario/detalhes.html?id=${encodeURIComponent(item.id)}" style="display:block;padding:12px 0;border-bottom:1px solid #e8edeb;color:inherit;text-decoration:none"><b>${escapeHtml(item.type)}</b> · ${escapeHtml(item.bairro)}<br><small>${escapeHtml(item.priority)} · ${escapeHtml(item.status)}</small></a>`).join('') : '<p style="margin:12px 0 0">Nenhuma pendência prioritária.</p>');
      document.body.appendChild(panel);
    });
  }
}

async function renderAdminOccurrences() {
  const items = await getCurrentOcorrencias();
  const tableBody = document.querySelector('.table-mongodb tbody');
  if (!tableBody) return;
  tableBody.innerHTML = items.map(function (item) {
    return `<tr data-id="${escapeHtml(item.id)}"><td><a href="../../usuario/detalhes.html?id=${encodeURIComponent(item.id)}" style="color:inherit;font-weight:600">${escapeHtml(item.id)}</a></td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(summarizeAddress(item.address, item.bairro))}</td><td>${escapeHtml(item.bairro)}</td><td>${formatDate(item.createdAt)}</td><td><select class="admin-status form-control-mongodb" style="min-width:140px"><option${item.status === 'Pendente' ? ' selected' : ''}>Pendente</option><option${item.status === 'Em andamento' ? ' selected' : ''}>Em andamento</option><option${item.status === 'Resolvido' ? ' selected' : ''}>Resolvido</option></select></td><td><span class="badge-priority badge-${normalizePriorityClass(item.priority)}">${escapeHtml(item.priority)}</span></td><td><button class="action-icon action-icon-delete admin-delete" title="Excluir"><i class="bi bi-trash3-fill"></i></button></td></tr>`;
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

function statusClass(status) {
  return status === 'Pendente' ? 'pendente' : status === 'Em andamento' ? 'andamento' : 'resolvido';
}

function typeColor(type) {
  return type === 'Vazamento' ? '#006cfa' : type === 'Falta de Água' ? '#ffc107' : type === 'Buraco' ? '#dc3545' : '#5c6c75';
}
