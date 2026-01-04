/**
 * 1. FUNCION DE BUSQUEDA
 * Se mantiene fuera de DOMContentLoaded para que sea accesible desde el HTML (onkeyup)
 */
function filterGames() {
    const input = document.getElementById('gameSearch');
    if (!input) return; // Evita errores si no existe el buscador en la página actual

    const filter = input.value.toLowerCase();
    const cards = document.getElementsByClassName('game-card');

    for (let i = 0; i < cards.length; i++) {
        const titleSpan = cards[i].querySelector('span');
        if (titleSpan) {
            const title = titleSpan.innerText.toLowerCase();
            if (title.includes(filter)) {
                cards[i].style.display = "flex";
            } else {
                cards[i].style.display = "none";
            }
        }
    }
}

/**
 * 2. FUNCION DE FONDO AURORA (Usando GSAP)
 */
function initAurora() {
    const container = document.getElementById('aurora-container');
    if (!container) return;

    // Colores: Naranja, Rosa, Morado, Azul
    const colors = ['#ff7300', '#ff00f7', '#5227ff', '#00d4ff'];

    colors.forEach((color) => {
        const blob = document.createElement('div');
        blob.className = 'aurora-blob';
        blob.style.backgroundColor = color;
        container.appendChild(blob);

        // Animación con GSAP (Esto es lo que las mueve)
        gsap.fromTo(blob, 
            {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 1
            },
            {
                x: "random(0, " + window.innerWidth + ")",
                y: "random(0, " + window.innerHeight + ")",
                scale: "random(1.5, 2.5)",
                duration: "random(15, 30)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            }
        );
    });
}
/**
 * 3. LOGICA PRINCIPAL AL CARGAR EL DOM
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // --- Iniciar Fondo Aurora ---
    initAurora();

    // --- Definición de variables del DOM ---
    const banner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('accept-cookies');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navGroup = document.querySelectorAll('.group')[1];

    // --- Lógica de Cookies ---
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

    // --- Lógica de Usuario Logueado ---
    if (currentUser && navGroup) {
        // Reconstruimos el menú para que no se borren Games y Services
        navGroup.innerHTML = `
            <a href="games.html" class="item">Games</a>
            <a href="services.html" class="item">Services</a>
            <span class="item" style="color: white; margin-left: 20px;">Hola, ${currentUser.username}</span>
            <a href="#" id="logout" class="item signup-btn" style="margin-left: 15px; cursor: pointer;">Salir</a>
        `;

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
});
