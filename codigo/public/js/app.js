const STORAGE_KEY = 'tiaw_ocorrencias_v1';

const defaultStatus = 'Pendente';

function getStoredOcorrencias() {
  var raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function saveStoredOcorrencias(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function generateOcorrenciaId() {
  return `OC${Date.now()}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatDateTime(date) {
  const dt = new Date(date);
  return `${dt.toLocaleDateString('pt-BR')} às ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

function normalizePriorityClass(priority) {
  return String(priority || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function summarizeAddress(address, bairro) {
  if (!address) return '';

  var cleaned = address.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/,\s*(brasil|brazil|br)\.?$/i, '');

  var parts = cleaned.split(',').map(function(part) {
    return part.trim();
  }).filter(Boolean);

  var cepIndex = parts.findIndex(function(part) {
    return /(?:cep\s*)?\d{5}-?\d{3}/i.test(part);
  });

  if (cepIndex !== -1) {
    parts = parts.slice(0, cepIndex + 1);
  } else if (parts.length > 5) {
    parts = parts.slice(0, 5);
  }

  if (bairro && !parts.some(function(part) {
    return part.toLowerCase().includes(bairro.toLowerCase());
  })) {
    if (parts.length > 1) {
      parts.splice(1, 0, bairro);
    } else {
      parts.push(bairro);
    }
  }

  return parts.join(', ');
}

function getQueryParam(name) {
  var search = window.location.search.substring(1);
  var params = search ? search.split('&') : [];
  for (var i = 0; i < params.length; i++) {
    var pair = params[i].split('=');
    if (pair[0] === name) {
      return decodeURIComponent(pair[1] || '');
    }
  }
  return null;
}

function buildDetailsLink(id) {
  return 'detalhes.html?id=' + encodeURIComponent(id);
}

function getCurrentOcorrencias() {
  return getStoredOcorrencias().sort(function(a, b) { return b.createdAt - a.createdAt; });
}

function parseFilterDate(value) {
  if (!value) return null;
  if (value.indexOf('/') !== -1) {
    return new Date(value.split('/').reverse().join('-')).getTime();
  }
  return new Date(value).getTime();
}

function getValue(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}

function applyFilters(items) {
  var typeFilter = getValue('filter-type') || 'todos';
  var statusFilter = getValue('filter-status') || 'todos';
  var bairroFilter = getValue('filter-bairro') || 'todos';
  var startDate = getValue('filter-start');
  var endDate = getValue('filter-end');
  var addressFilter = getValue('filter-address').toLowerCase() || '';
  var searchFilter = getValue('search-text').toLowerCase() || '';

  return items.filter(function(item) {
    if (typeFilter !== 'todos' && item.type !== typeFilter) return false;
    if (statusFilter !== 'todos' && item.status !== statusFilter) return false;
    if (bairroFilter !== 'todos' && item.bairro !== bairroFilter) return false;
    if (addressFilter && item.address.toLowerCase().indexOf(addressFilter) === -1) return false;
    if (searchFilter && (item.id + ' ' + item.type + ' ' + item.address + ' ' + item.bairro + ' ' + item.description).toLowerCase().indexOf(searchFilter) === -1) return false;
    if (startDate) {
      var start = parseFilterDate(startDate);
      if (item.createdAt < start) return false;
    }
    if (endDate) {
      var end = parseFilterDate(endDate) + 24 * 60 * 60 * 1000 - 1;
      if (item.createdAt > end) return false;
    }
    return true;
  });
}

function renderOcorrenciasList() {
  const rowsContainer = document.getElementById('ocorrencias-table-body');
  const items = getCurrentOcorrencias();
  if (!rowsContainer) return;

  const filtered = applyFilters(items);
  rowsContainer.innerHTML = '';

  if (!filtered.length) {
    rowsContainer.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 24px; color: var(--cool-gray);">
          Nenhuma ocorrência encontrada. Registre sua primeira ocorrência.
        </td>
      </tr>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.id}</strong></td>
      <td>${item.type}</td>
      <td>${summarizeAddress(item.address, item.bairro)}</td>
      <td>${item.bairro}</td>
      <td>${formatDate(item.createdAt)}</td>
      <td><span class="badge-status badge-${item.status === 'Pendente' ? 'pendente' : item.status === 'Em andamento' ? 'andamento' : 'resolvido'}">${item.status}</span></td>
      <td><span class="badge-priority badge-${normalizePriorityClass(item.priority)}">${item.priority}</span></td>
      <td><a href="${buildDetailsLink(item.id)}" class="btn-mongodb-outline" style="padding: 6px 12px; font-size: 12px;">Ver detalhes</a></td>
    `;
    fragment.appendChild(row);
  });

  rowsContainer.appendChild(fragment);
}

function renderDashboardOverview() {
  const items = getCurrentOcorrencias();
  const counts = {
    buraco: 0,
    vazamento: 0,
    faltaDeAgua: 0,
    outros: 0,
  };

  items.forEach(item => {
    switch (item.type) {
      case 'Buraco': counts.buraco += 1; break;
      case 'Vazamento': counts.vazamento += 1; break;
      case 'Falta de Água': counts.faltaDeAgua += 1; break;
      default: counts.outros += 1; break;
    }
  });

  var countBuracos = document.getElementById('count-buracos');
  var countVazamentos = document.getElementById('count-vazamentos');
  var countFaltaAgua = document.getElementById('count-falta-agua');
  var countOutros = document.getElementById('count-outros');
  if (countBuracos) countBuracos.textContent = counts.buraco;
  if (countVazamentos) countVazamentos.textContent = counts.vazamento;
  if (countFaltaAgua) countFaltaAgua.textContent = counts.faltaDeAgua;
  if (countOutros) countOutros.textContent = counts.outros;

  var dashboardBody = document.getElementById('dashboard-recent-body');
  if (!dashboardBody) return;
  dashboardBody.innerHTML = '';

  const recent = items.slice(0, 3);
  if (!recent.length) {
    dashboardBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 24px; color: var(--cool-gray);">Nenhuma ocorrência registrada ainda.</td>
      </tr>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  recent.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.id}</strong></td>
      <td>${item.type}</td>
      <td>${item.address}</td>
      <td>${item.bairro}</td>
      <td>${formatDate(item.createdAt)}</td>
      <td><span class="badge-status badge-${item.status === 'Pendente' ? 'pendente' : item.status === 'Em andamento' ? 'andamento' : 'resolvido'}">${item.status}</span></td>
    `;
    fragment.appendChild(row);
  });
  dashboardBody.appendChild(fragment);
    initDashboardMap();
}

  let dashboardMap;
  let dashboardMarkers = [];

  function initDashboardMap() {
    var mapContainer = document.getElementById('dashboard-map');
    if (!mapContainer || typeof L === 'undefined') return;

    if (!dashboardMap) {
      dashboardMap = L.map(mapContainer).setView([-19.920, -43.940], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(dashboardMap);
      setTimeout(function() { if (dashboardMap && typeof dashboardMap.invalidateSize === 'function') dashboardMap.invalidateSize(); }, 100);
    }

    dashboardMarkers.forEach(function(m) { try { dashboardMap.removeLayer(m); } catch (e) {} });
    dashboardMarkers = [];

    var items = getCurrentOcorrencias();
    items.forEach(function(item) {
      if (!item.lat || !item.lng) return;
      var lat = parseFloat(item.lat);
      var lng = parseFloat(item.lng);
      if (isNaN(lat) || isNaN(lng)) return;
      try {
        var color = item.type === 'Vazamento' ? '#006cfa' : item.type === 'Falta de Água' ? '#ffc107' : item.type === 'Buraco' ? '#dc3545' : '#5c6c75';
        var marker = L.circleMarker([lat, lng], { radius: 6, fillColor: color, color: '#fff', weight: 1, fillOpacity: 0.9 }).addTo(dashboardMap);
        marker.bindPopup('<strong>' + item.id + '</strong><br/>' + item.type + '<br/>' + item.bairro);
        dashboardMarkers.push(marker);
      } catch (e) {}
    });
  }

function populateDetailPage() {
  const detailId = getQueryParam('id');
  if (!detailId) return;
  const items = getStoredOcorrencias();
  const ocorrencia = items.find(item => item.id === detailId);
  if (!ocorrencia) {
    const area = document.querySelector('.content-area');
    if (area) {
      area.innerHTML = `<div style="padding: 32px; text-align: center;"><h2>Ocorrência não encontrada</h2><p>Verifique se o link está correto ou volte para a lista de ocorrências.</p><a href="ocorrencias.html" class="btn-mongodb-primary">Voltar para minhas ocorrências</a></div>`;
    }
    return;
  }

  var detailIdElement = document.getElementById('detail-id');
  var detailTypeElement = document.getElementById('detail-type');
  var detailAddressElement = document.getElementById('detail-address');
  var detailBairroElement = document.getElementById('detail-bairro');
  var detailDateElement = document.getElementById('detail-date');
  var detailPriorityElement = document.getElementById('detail-priority');
  var detailStatusElement = document.getElementById('detail-status');
  var detailDescriptionElement = document.getElementById('detail-description');
  var detailReportedElement = document.getElementById('detail-reported');
  var detailLocationElement = document.getElementById('detail-location');

  if (detailIdElement) detailIdElement.textContent = ocorrencia.id;
  if (detailTypeElement) detailTypeElement.textContent = ocorrencia.type;
  if (detailAddressElement) detailAddressElement.textContent = ocorrencia.address;
  if (detailBairroElement) detailBairroElement.textContent = ocorrencia.bairro;
  if (detailDateElement) detailDateElement.textContent = formatDateTime(ocorrencia.createdAt);
  if (detailPriorityElement) detailPriorityElement.innerHTML = '<span class="badge-priority badge-' + normalizePriorityClass(ocorrencia.priority) + '">' + ocorrencia.priority + '</span>';
  if (detailStatusElement) detailStatusElement.innerHTML = '<span class="badge-status badge-' + (ocorrencia.status === 'Pendente' ? 'pendente' : ocorrencia.status === 'Em andamento' ? 'andamento' : 'resolvido') + '">' + ocorrencia.status + '</span>';
  if (detailDescriptionElement) detailDescriptionElement.textContent = ocorrencia.description;
  if (detailReportedElement) detailReportedElement.textContent = 'Você';
  if (detailLocationElement) detailLocationElement.textContent = ocorrencia.bairro + ' — ' + ocorrencia.address;

  const historyContainer = document.getElementById('detail-history');
  if (historyContainer) {
    historyContainer.innerHTML = '';
    const history = ocorrencia.history || [];
    if (!history.length) {
      historyContainer.innerHTML = '<div style="color: var(--cool-gray);">Sem histórico adicional.</div>';
    } else {
      history.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `<span class="time">${entry.time}</span> ${entry.message}`;
        historyContainer.appendChild(item);
      });
    }
  }

  const cancelButton = document.getElementById('btn-cancel-occurrence');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      const filtered = items.filter(item => item.id !== ocorrencia.id);
      saveStoredOcorrencias(filtered);
      window.location.href = 'ocorrencias.html';
    });
  }
}

let locationMap;
let locationMarker;

function setLocationFields(latlng) {
  const latInput = document.getElementById('input-lat');
  const lngInput = document.getElementById('input-lng');
  if (latInput) latInput.value = latlng.lat.toFixed(6);
  if (lngInput) lngInput.value = latlng.lng.toFixed(6);
}

function updateLocationMarker(latlng) {
  if (!locationMap) return;
  if (locationMarker) {
    locationMarker.setLatLng(latlng);
  } else {
    locationMarker = L.marker(latlng, { draggable: true }).addTo(locationMap);
    locationMarker.on('dragend', function() {
      var position = locationMarker.getLatLng();
      setLocationFields(position);
    });
  }
  locationMap.setView(latlng, 16);
  if (typeof locationMap.invalidateSize === 'function') {
    locationMap.invalidateSize();
  }
  setLocationFields(latlng);
}

async function searchAddress() {
  var addressInput = document.getElementById('input-address');
  var query = addressInput ? addressInput.value.trim() : '';
  if (!query) {
    alert('Digite um endereço para buscar no mapa.');
    return;
  }

  try {
    var response = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(query) + '&countrycodes=br');
    var results = await response.json();

    if (!results || !results.length) {
      alert('Endereço não encontrado. Tente outro termo.');
      return;
    }

    var place = results[0];
    var latlng = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    updateLocationMarker(latlng);
    if (addressInput) {
      addressInput.value = place.display_name;
    }
  } catch (error) {
    console.error(error);
    alert('Não foi possível buscar o endereço. Tente novamente em alguns segundos.');
  }
}

function initLocationMap() {
  var mapContainer = document.getElementById('ocorrencia-map');
  if (!mapContainer || typeof L === 'undefined') return;

  locationMap = L.map(mapContainer).setView([-19.920, -43.940], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(locationMap);

  locationMap.on('click', function(event) {
    updateLocationMarker(event.latlng);
  });

  updateLocationMarker(locationMap.getCenter());

  setTimeout(function() {
    if (locationMap) {
      locationMap.invalidateSize();
    }
  }, 100);
}

function bindRegisterForm() {
  var button = document.getElementById('btn-register-occurrence');
  if (!button) return;
  button.addEventListener('click', function() {
    var addressInput = document.getElementById('input-address');
    var bairroInput = document.getElementById('input-bairro');
    var typeInput = document.getElementById('input-type');
    var priorityInput = document.getElementById('input-priority');
    var descriptionInput = document.getElementById('input-description');

    var address = addressInput ? addressInput.value.trim() : '';
    var bairro = bairroInput ? bairroInput.value : '';
    var type = typeInput ? typeInput.value : '';
    var priority = priorityInput ? priorityInput.value : '';
    var description = descriptionInput ? descriptionInput.value.trim() : '';

    if (!address || !bairro || !type || !priority || !description) {
      alert('Por favor, preencha todos os campos antes de registrar a ocorrência.');
      return;
    }

    var lat = '';
    var lng = '';
    if (locationMarker && typeof locationMarker.getLatLng === 'function') {
      var pos = locationMarker.getLatLng();
      lat = pos ? pos.lat : '';
      lng = pos ? pos.lng : '';
    } else {
      var latInput = document.getElementById('input-lat');
      var lngInput = document.getElementById('input-lng');
      lat = latInput ? latInput.value : '';
      lng = lngInput ? lngInput.value : '';
    }

    var items = getStoredOcorrencias();
    var newItem = {
      id: generateOcorrenciaId(),
      type: type,
      address: address,
      bairro: bairro,
      priority: priority,
      status: defaultStatus,
      description: description,
      lat: lat,
      lng: lng,
      createdAt: Date.now(),
      history: [{ time: formatDateTime(Date.now()), message: 'Ocorrência registrada.' }],
    };

    items.unshift(newItem);
    saveStoredOcorrencias(items);
    window.location.href = 'ocorrencias.html';
  });
}

function bindLocationSearch() {
  const searchButton = document.getElementById('btn-search-address');
  if (searchButton) {
    searchButton.addEventListener('click', searchAddress);
  }

  initLocationMap();
}

function resetFilters() {
  const inputs = ['filter-type', 'filter-status', 'filter-bairro', 'filter-start', 'filter-end', 'filter-address', 'search-text'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'SELECT') {
      el.selectedIndex = 0;
    } else {
      el.value = '';
    }
  });
  renderOcorrenciasList();
}

function bindFilterEvents() {
  ['filter-type', 'filter-status', 'filter-bairro', 'filter-start', 'filter-end', 'filter-address', 'search-text'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', renderOcorrenciasList);
      el.addEventListener('change', renderOcorrenciasList);
    }
  });

  const clearLink = document.getElementById('clear-filters');
  if (clearLink) {
    clearLink.addEventListener('click', event => {
      event.preventDefault();
      resetFilters();
    });
  }
}
