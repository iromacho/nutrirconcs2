/**
 * 1. FUNCIÓN DE BÚSQUEDA
 */
function filterGames() {
    const input = document.getElementById('gameSearch');
    if (!input) return;

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
 * 2. FUNCIÓN DE FONDO AURORA (Usando GSAP)
 */
function initAurora() {
    const container = document.getElementById('aurora-container');
    if (!container) return;

    const colors = ['#ff7300', '#ff00f7', '#5227ff', '#00d4ff'];

    colors.forEach((color) => {
        const blob = document.createElement('div');
        blob.className = 'aurora-blob';
        blob.style.backgroundColor = color;
        container.appendChild(blob);

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
 * 3. FUNCIÓN PARA ENVIAR DATOS A GOOGLE SHEETS
 */
async function enviarAExcel(userData) {
    const URL_EXCEL = "https://script.google.com/macros/s/AKfycbx-UMJPEEKE0xsQQfCjuCWBBiX0wcy0tsO5T5d2ua2DBoEUv_ujlBwNv9pTDUkDzB-aLA/exec";
    
    // Verificamos si ya los enviamos en esta sesión para no duplicar filas cada vez que recargue
    if (sessionStorage.getItem('excel_enviado')) return;

    try {
        await fetch(URL_EXCEL, {
            method: 'POST',
            mode: 'no-cors', // Necesario para Google Scripts
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        sessionStorage.setItem('excel_enviado', 'true');
        console.log("Datos sincronizados con Excel");
    } catch (error) {
        console.error("Error al sincronizar con Excel:", error);
    }
}

/**
 * 4. LÓGICA PRINCIPAL AL CARGAR EL DOM
 */
document.addEventListener('DOMContentLoaded', function() {
    
    initAurora();

    const banner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('accept-cookies');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navGroup = document.querySelectorAll('.group')[1];

    // --- Lógica de Cookies ---
    if (banner && !localStorage.getItem('cookies-aceptadas')) {
        setTimeout(() => { banner.classList.add('active'); }, 1000);
    }

    if (btnAccept) {
        btnAccept.onclick = function() {
            localStorage.setItem('cookies-aceptadas', 'true');
            banner.classList.remove('active');
        };
    }

    // --- Lógica de Usuario Logueado ---
    if (currentUser && navGroup) {
        // Enviar datos al Excel automáticamente si existen
        enviarAExcel(currentUser);

        navGroup.innerHTML = `
        <a href="games.html" class="item">Games</a>
        <a href="services.html" class="item">Services</a>
        
        <a href="profile.html" class="item profile-link-box">
            👤 ${currentUser.username}
        </a>

        <a href="#" id="logout" class="item signup-btn">Salir</a>
    `;

        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser'); 
                sessionStorage.removeItem('excel_enviado'); // Reset para el próximo login
                alert('Has cerrado sesión correctamente');
                window.location.href = 'index.html'; 
            });
        }
    }
});


window.addEventListener('load', function() {
    const loader = document.getElementById('loader');
    if (loader) {
        // Añadimos un pequeño retraso de 500ms para que la transición no sea brusca
        setTimeout(() => {
            loader.classList.add('fade-out');
        }, 500);
    }
});
