(function () {
  const form = document.getElementById('login-form');
  const nome = document.getElementById('nome');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const message = document.getElementById('login-message');
  const button = document.getElementById('login-button');
  const toggle = document.getElementById('toggle-password');
  const title = document.getElementById('login-title');
  const subtitle = document.getElementById('login-subtitle');
  const nameGroup = document.getElementById('name-group');
  const registerHelper = document.getElementById('register-helper');
  const showLogin = document.getElementById('show-login');
  const showRegister = document.getElementById('show-register');
  const SESSION_KEY = 'infrabh.session';
  let mode = 'login';

  const previous = sessionStorage.getItem(SESSION_KEY);
  if (previous) {
    try {
      const session = JSON.parse(previous);
      window.location.replace(session.usuario.role === 'admin' ? 'Adm/html/dashboard.html' : 'usuario/dashboard.html');
    } catch (_) {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  function setMode(nextMode) {
    mode = nextMode;
    const isRegister = mode === 'register';
    title.textContent = isRegister ? 'Criar conta' : 'Boas-vindas';
    subtitle.textContent = isRegister ? 'Cadastre-se para registrar e acompanhar suas denúncias.' : 'Entre para acessar suas ocorrências.';
    button.querySelector('span').textContent = isRegister ? 'Criar conta' : 'Entrar';
    nameGroup.hidden = !isRegister;
    registerHelper.hidden = !isRegister;
    nome.required = isRegister;
    password.autocomplete = isRegister ? 'new-password' : 'current-password';
    showLogin.classList.toggle('is-active', !isRegister);
    showRegister.classList.toggle('is-active', isRegister);
    showLogin.setAttribute('aria-selected', String(!isRegister));
    showRegister.setAttribute('aria-selected', String(isRegister));
    message.textContent = '';
  }

  showLogin.addEventListener('click', () => setMode('login'));
  showRegister.addEventListener('click', () => setMode('register'));

  toggle.addEventListener('click', function () {
    const hidden = password.type === 'password';
    password.type = hidden ? 'text' : 'password';
    toggle.innerHTML = `<i class="bi bi-eye${hidden ? '-slash' : ''}"></i>`;
    toggle.setAttribute('aria-label', hidden ? 'Ocultar senha' : 'Mostrar senha');
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    message.textContent = '';

    if (!form.checkValidity()) {
      message.textContent = mode === 'register'
        ? 'Informe nome, e-mail válido e senha com pelo menos 8 caracteres.'
        : 'Informe um e-mail válido e uma senha com pelo menos 8 caracteres.';
      form.reportValidity();
      return;
    }

    button.disabled = true;
    button.querySelector('span').textContent = mode === 'register' ? 'Criando...' : 'Entrando...';
    try {
      const endpoint = mode === 'register' ? '/cadastro' : '/login';
      const payload = mode === 'register'
        ? { nome: nome.value, email: email.value, password: password.value }
        : { email: email.value, password: password.value };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensagem || (mode === 'register' ? 'Não foi possível criar a conta.' : 'Não foi possível entrar.'));

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
      window.location.replace(data.usuario.role === 'admin' ? 'Adm/html/dashboard.html' : 'usuario/dashboard.html');
    } catch (error) {
      message.textContent = error.message;
      (mode === 'register' && error.message.includes('nome') ? nome : password).focus();
    } finally {
      button.disabled = false;
      button.querySelector('span').textContent = mode === 'register' ? 'Criar conta' : 'Entrar';
    }
  });
})();
