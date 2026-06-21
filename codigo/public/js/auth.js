(function () {
  const SESSION_KEY = 'infrabh.session';

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch (_) {
      return null;
    }
  }

  function isAdminPage() {
    return window.location.pathname.toLowerCase().includes('/adm/');
  }

  function loginUrl() {
    return isAdminPage() ? '../../index.html' : '../index.html';
  }

  function protectPage() {
    const session = getSession();
    if (!session || !session.token || !session.usuario) {
      window.location.replace(loginUrl());
      return null;
    }
    if (isAdminPage() && session.usuario.role !== 'admin') {
      window.location.replace('../../usuario/dashboard.html');
      return null;
    }

    document.querySelectorAll('[data-user-name]').forEach(function (element) {
      element.textContent = session.usuario.nome;
    });
    document.querySelectorAll('[data-user-role]').forEach(function (element) {
      element.textContent = session.usuario.role === 'admin' ? 'Administrador' : 'Cidadão';
    });
    createMobileNavigation(session.usuario.role);
    return session;
  }

  function createMobileNavigation(role) {
    if (document.querySelector('.mobile-nav')) return;
    const admin = role === 'admin' && isAdminPage();
    const prefix = admin ? '' : '';
    const links = admin
      ? [['dashboard.html', 'bi-grid-1x2', 'Painel'], ['ocorrencias.html', 'bi-list-ul', 'Ocorrências'], ['../../usuario/nova-ocorrencia.html', 'bi-plus-circle', 'Nova'], ['relatorios.html', 'bi-bar-chart-line', 'Relatórios']]
      : [['dashboard.html', 'bi-house-door', 'Início'], ['ocorrencias.html', 'bi-list-ul', 'Ocorrências'], ['nova-ocorrencia.html', 'bi-plus-circle', 'Nova'], ['relatorios.html', 'bi-bar-chart-line', 'Relatórios']];
    const navigation = document.createElement('nav');
    navigation.className = 'mobile-nav';
    navigation.setAttribute('aria-label', 'Navegação móvel');
    navigation.innerHTML = links.map(function (link) {
      return `<a href="${prefix + link[0]}"><i class="bi ${link[1]}"></i><span>${link[2]}</span></a>`;
    }).join('');
    document.body.appendChild(navigation);
  }

  function logout(event) {
    if (event) event.preventDefault();
    sessionStorage.removeItem(SESSION_KEY);
    window.location.replace(loginUrl());
  }

  window.InfraBHAuth = { getSession, protectPage, logout, SESSION_KEY };
  window.logout = logout;
  document.addEventListener('DOMContentLoaded', protectPage);
})();
