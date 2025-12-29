document.addEventListener('DOMContentLoaded', function() {
    // --- 1. Definición de variables globales del DOM ---
    const banner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('accept-cookies');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navGroup = document.querySelectorAll('.group')[1]; // El grupo de la derecha del nav

    // --- 2. Lógica de Cookies ---
    if (banner && !localStorage.getItem('cookies-aceptadas')) {
        setTimeout(() => {
            banner.classList.add('active');
        }, 1000);
    }

    if (btnAccept) {
        btnAccept.onclick = function() {
            localStorage.setItem('cookies-aceptadas', 'true');
            banner.classList.remove('active');
        };
    }

    // --- 3. Lógica de Usuario Logueado ---
    if (currentUser && navGroup) {
        // Dibujamos el menú con el nombre y el botón de Salir
        navGroup.innerHTML = `
            <a href="index.html" class="item">Games</a>
            <a href="#" class="item">Services</a>
            <span class="item" style="color: white; margin-left: 20px;">Hola, ${currentUser.username}</span>
            <a href="#" id="logout" class="item signup-btn" style="margin-left: 15px; cursor: pointer;">Salir</a>
        `;

        // Agregamos el evento al botón de logout que acabamos de crear
        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser'); 
                alert('Has cerrado sesión correctamente');
                window.location.href = 'index.html'; 
            });
        }
    }
}); // Aquí termina el DOMContentLoaded correctamente
