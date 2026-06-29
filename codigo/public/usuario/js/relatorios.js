document.addEventListener('DOMContentLoaded', async function () {
  const items = await getCurrentOcorrencias();
  const colors = ['#001e2b', '#006cfa', '#00a35c', '#f59e0b', '#7c3aed', '#5c6c75'];

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function percent(part, total) {
    if (!total) return '0%';
    return `${((part / total) * 100).toFixed(1).replace('.', ',')}%`;
  }

  function countBy(field, sourceItems = items) {
    return sourceItems.reduce(function (counts, item) {
      const key = item[field] || 'Não informado';
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }

  function sortedEntries(object) {
    return Object.entries(object).sort(function (a, b) { return b[1] - a[1]; });
  }

  function renderEmptyMessage(canvas, message) {
    const container = canvas ? canvas.closest('.chart-container') : null;
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;color:var(--cool-gray);padding:24px">` +
      `<i class="bi bi-bar-chart" style="font-size:34px;display:block;margin-bottom:8px"></i>${escapeHtml(message)}</div>`;
  }

  function createChart(id, config, emptyMessage) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const hasData = config.data.datasets.some(dataset => dataset.data.some(value => Number(value) > 0));
    if (!hasData) {
      renderEmptyMessage(canvas, emptyMessage || 'Sem dados para exibir.');
      return;
    }
    const currentChart = Chart.getChart ? Chart.getChart(canvas) : null;
    if (currentChart) currentChart.destroy();
    new Chart(canvas, config);
  }

  const total = items.length;
  const resolved = items.filter(item => visibleStatus(item) === 'Resolvido' || item.status === 'Resolvido').length;
  const buracos = items.filter(item => item.type === 'Buraco').length;
  const bairros = getUniqueBairros(items).length;

  setText('report-total', total);
  setText('report-resolved', resolved);
  setText('report-resolved-percent', percent(resolved, total));
  setText('report-buracos', buracos);
  setText('report-buracos-percent', percent(buracos, total));
  setText('report-bairros', bairros);

  if (typeof Chart === 'undefined') {
    ['doughnutChart', 'barChart', 'horizontalBarChart', 'lineChart'].forEach(function (id) {
      renderEmptyMessage(document.getElementById(id), 'Gráfico indisponível no momento.');
    });
    return;
  }

  const categories = sortedEntries(countBy('type'));
  const neighborhoods = sortedEntries(countBy('bairro')).slice(0, 6);
  const statuses = sortedEntries(items.reduce(function (counts, item) {
    const key = visibleStatus(item) || 'Não informado';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {}));
  const priorities = sortedEntries(countBy('priority'));

  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = '#5c6c75';

  createChart('doughnutChart', {
    type: 'doughnut',
    data: {
      labels: categories.map(entry => entry[0]),
      datasets: [{ data: categories.map(entry => entry[1]), backgroundColor: colors, borderWidth: 0 }],
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'right' } } },
  }, 'Nenhuma ocorrência por tipo.');

  createChart('barChart', {
    type: 'bar',
    data: {
      labels: neighborhoods.map(entry => entry[0]),
      datasets: [{ label: 'Ocorrências', data: neighborhoods.map(entry => entry[1]), backgroundColor: '#00684a', borderRadius: 5 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  }, 'Nenhum bairro com ocorrência.');

  createChart('horizontalBarChart', {
    type: 'bar',
    data: {
      labels: statuses.map(entry => entry[0]),
      datasets: [{ label: 'Ocorrências', data: statuses.map(entry => entry[1]), backgroundColor: '#006cfa', borderRadius: 5 }],
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } },
  }, 'Nenhum status registrado.');

  createChart('lineChart', {
    type: 'bar',
    data: {
      labels: priorities.map(entry => entry[0]),
      datasets: [{ label: 'Ocorrências', data: priorities.map(entry => entry[1]), backgroundColor: '#00a35c', borderRadius: 5 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  }, 'Nenhuma prioridade registrada.');
});
