(function () {
  const form = document.getElementById('login-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const message = document.getElementById('login-message');
  const button = document.getElementById('login-button');
  const toggle = document.getElementById('toggle-password');
  const SESSION_KEY = 'infrabh.session';

  const previous = sessionStorage.getItem(SESSION_KEY);
  if (previous) {
    try {
      const session = JSON.parse(previous);
      window.location.replace(session.usuario.role === 'admin' ? 'Adm/html/dashboard.html' : 'usuario/dashboard.html');
    } catch (_) {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

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
      message.textContent = 'Informe um e-mail válido e uma senha com pelo menos 8 caracteres.';
      form.reportValidity();
      return;
    }

    button.disabled = true;
    button.querySelector('span').textContent = 'Entrando...';
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, password: password.value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensagem || 'Não foi possível entrar.');

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
      window.location.replace(data.usuario.role === 'admin' ? 'Adm/html/dashboard.html' : 'usuario/dashboard.html');
    } catch (error) {
      message.textContent = error.message;
      password.focus();
    } finally {
      button.disabled = false;
      button.querySelector('span').textContent = 'Entrar';
    }
  });
})();
