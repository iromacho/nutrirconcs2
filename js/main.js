document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica de Cookies --- (Mantenemos lo anterior)
    const banner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('accept-cookies');

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

    // --- Lógica de Usuario Logueado (CORREGIDA) ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navGroup = document.querySelectorAll('.group')[1]; 

    if (currentUser && navGroup) {
        // En lugar de borrar todo, mantenemos Games y Services y añadimos el usuario
        navGroup.innerHTML = `
            <a href="index.html" class="item">Games</a>
            <a href="#" class="item">Services</a>
            <span class="item" style="color: white; margin-left: 10px;">Hola, ${currentUser.username}</span>
            <a href="#" id="logout" class="item signup-btn" style="margin-left: 5px;">Salir</a>
        `;

        document.getElementById('logout').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser'); 
            window.location.reload(); 
        });
    }
});
