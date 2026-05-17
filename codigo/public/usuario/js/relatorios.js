document.addEventListener('DOMContentLoaded', function() {
  const colors = {
    forestBlack: '#001e2b',
    mongoGreen: '#00ed64',
    darkGreen: '#00684a',
    actionBlue: '#006cfa',
    coolGray: '#5c6c75',
    silverTeal: '#b8c4c2',
    lightInput: '#e8edeb',
  };

  const chartFont = {
    family: "'Source Code Pro', 'Inter', monospace",
    size: 11,
    weight: 500,
  };

  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = colors.coolGray;

  new Chart(document.getElementById('doughnutChart'), {
    type: 'doughnut',
    data: {
      labels: ['Buracos', 'Vazamento', 'Água', 'Outros'],
      datasets: [{
        data: [42, 25, 18, 15],
        backgroundColor: [
          colors.forestBlack,
          colors.coolGray,
          colors.silverTeal,
          colors.lightInput,
        ],
        borderWidth: 0,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 13, weight: 400 },
          }
        }
      }
    }
  });

  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: ['Venda nova', 'Pampulha', 'Centro', 'Barreiro', 'Outros'],
      datasets: [{
        data: [32, 30, 26, 24, 22],
        backgroundColor: colors.coolGray,
        borderRadius: 4,
        barThickness: 36,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: 40,
          ticks: { stepSize: 10, font: chartFont },
          grid: { color: '#f0f0f0' },
          border: { display: false },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
          border: { display: false },
        }
      }
    }
  });

  new Chart(document.getElementById('horizontalBarChart'), {
    type: 'bar',
    data: {
      labels: ['Venda Nova', 'Pampulha', 'Centro', 'Barreiro'],
      datasets: [{
        data: [50, 42, 38, 18],
        backgroundColor: colors.coolGray,
        borderRadius: 4,
        barThickness: 20,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          beginAtZero: true,
          max: 60,
          ticks: { stepSize: 10, font: chartFont },
          grid: { color: '#f0f0f0' },
          border: { display: false },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 12 } },
          border: { display: false },
        }
      }
    }
  });

  new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: ['01/04', '05/04', '10/04', '15/04', '20/04', '25/04', '30/04'],
      datasets: [{
        data: [30, 45, 42, 70, 65, 55, 48],
        borderColor: colors.coolGray,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointBackgroundColor: colors.coolGray,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: 80,
          ticks: { stepSize: 20, font: chartFont },
          grid: { color: '#f0f0f0' },
          border: { display: false },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
          border: { display: false },
        }
      }
    }
  });
});
