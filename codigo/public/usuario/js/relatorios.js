document.addEventListener('DOMContentLoaded', async function () {
  const items = await getCurrentOcorrencias();
  const colors = ['#001e2b', '#006cfa', '#00a35c', '#f59e0b', '#7c3aed', '#5c6c75'];

  function countBy(field) {
    return items.reduce(function (counts, item) {
      const key = item[field] || 'Não informado';
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }

  function sortedEntries(object) {
    return Object.entries(object).sort(function (a, b) { return b[1] - a[1]; });
  }

  function createChart(id, config) {
    const canvas = document.getElementById(id);
    if (canvas) new Chart(canvas, config);
  }

  const categories = sortedEntries(countBy('type'));
  const neighborhoods = sortedEntries(countBy('bairro')).slice(0, 6);
  const statuses = sortedEntries(countBy('status'));
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
  });

  createChart('barChart', {
    type: 'bar',
    data: {
      labels: neighborhoods.map(entry => entry[0]),
      datasets: [{ label: 'Ocorrências', data: neighborhoods.map(entry => entry[1]), backgroundColor: '#00684a', borderRadius: 5 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });

  createChart('horizontalBarChart', {
    type: 'bar',
    data: {
      labels: statuses.map(entry => entry[0]),
      datasets: [{ label: 'Ocorrências', data: statuses.map(entry => entry[1]), backgroundColor: '#006cfa', borderRadius: 5 }],
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } },
  });

  createChart('lineChart', {
    type: 'bar',
    data: {
      labels: priorities.map(entry => entry[0]),
      datasets: [{ label: 'Ocorrências', data: priorities.map(entry => entry[1]), backgroundColor: '#00a35c', borderRadius: 5 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
});
