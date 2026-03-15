(function () {
  const ACCESS_KEY_PREFIX = 'nutrirconcs2_access_granted';
  const ACCESS_PASSWORD = 'N2#rC9!a';
  const accessKeyByHost = `${ACCESS_KEY_PREFIX}:${window.location.host}`;

  function hasAccessSaved() {
    return (
      localStorage.getItem(accessKeyByHost) === 'true' ||
      sessionStorage.getItem(accessKeyByHost) === 'true'
    );
  }

  function saveAccess() {
    localStorage.setItem(accessKeyByHost, 'true');
    sessionStorage.setItem(accessKeyByHost, 'true');
  }

  function createGate() {
    const overlay = document.createElement('div');
    overlay.id = 'access-gate-overlay';
    overlay.innerHTML = `
      <div class="access-gate-card">
        <a href="#" class="access-gate-logo">Nutrir Concs 2</a>
        <h2>Acceso Protegido</h2>
        <p class="access-gate-subtitle">Ingresa la contraseña para continuar</p>
        <form id="access-gate-form">
          <div class="access-gate-input-group">
            <label for="access-gate-password">Contraseña</label>
            <input id="access-gate-password" type="password" minlength="8" maxlength="8" required autocomplete="off" placeholder="••••••••" />
          </div>
          <button type="submit" class="access-gate-btn">Entrar</button>
          <p id="access-gate-error" class="access-gate-error" aria-live="polite"></p>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('access-gate-lock');

    const form = document.getElementById('access-gate-form');
    const input = document.getElementById('access-gate-password');
    const error = document.getElementById('access-gate-error');

    input.focus();

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (input.value === ACCESS_PASSWORD) {
        saveAccess();
        overlay.classList.add('access-gate-hide');
        document.body.classList.remove('access-gate-lock');
        setTimeout(function () {
          overlay.remove();
        }, 250);
      } else {
        error.textContent = 'Contraseña incorrecta. Intenta nuevamente.';
        input.value = '';
        input.focus();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (hasAccessSaved()) return;
    createGate();
  });
})();
