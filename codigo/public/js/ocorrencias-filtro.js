document.addEventListener('DOMContentLoaded', function () {
  const tipoSelect = document.getElementById('filter-tipo');
  const clearLink = document.getElementById('clear-filtros');
  const rows = Array.from(document.querySelectorAll('.table-mongodb tbody tr'));

  if (!tipoSelect || rows.length === 0) {
    return;
  }

  function filterByTipo() {
    const selectedTipo = tipoSelect.value.trim().toLowerCase();

    rows.forEach(function (row) {
      const tipoCell = row.querySelector('td:nth-child(2)');
      if (!tipoCell) {
        return;
      }

      const tipoText = tipoCell.textContent.trim().toLowerCase();
      const matchesTipo = selectedTipo === 'todos' || selectedTipo === '' || tipoText === selectedTipo;

      row.style.display = matchesTipo ? '' : 'none';
    });
  }

  tipoSelect.addEventListener('change', filterByTipo);

  if (clearLink) {
    clearLink.addEventListener('click', function (event) {
      event.preventDefault();
      tipoSelect.value = 'todos';
      filterByTipo();
    });
  }

  // Aplica o filtro imediatamente caso já exista um valor selecionado
  filterByTipo();
});
