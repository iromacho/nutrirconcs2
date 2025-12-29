console.log("Web de juegos cargada");

function filterGames() {
    // 1. Obtener lo que el usuario escribe
    let input = document.getElementById('gameSearch').value.toLowerCase();
    
    // 2. Seleccionar todas las tarjetas de juegos
    let cards = document.getElementsByClassName('game-card');

    // 3. Recorrer cada tarjeta
    for (let i = 0; i < cards.length; i++) {
        let title = cards[i].getElementsByTagName('span')[0].innerText.toLowerCase();
        
        // 4. Si el título incluye lo que escribimos, se muestra; si no, se oculta
        if (title.includes(input)) {
            cards[i].style.display = "flex";
        } else {
            cards[i].style.display = "none";
        }
    }
}

window.onload = function() {
    const banner = document.getElementById('cookie-banner');
    const btn = document.getElementById('accept-cookies');

    // Comprobar si el usuario ya aceptó las cookies anteriormente
    if (!localStorage.getItem('cookies-aceptadas')) {
        // Si no las ha aceptado, mostrar el banner después de 1 segundo
        setTimeout(() => {
            banner.classList.add('active');
        }, 1000);
    }

    // Al hacer clic en aceptar
    btn.onclick = function() {
        // Guardar la elección en el navegador del usuario
        localStorage.setItem('cookies-aceptadas', 'true');
        // Ocultar el banner
        banner.classList.remove('active');
    };
};

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navGroup = document.querySelectorAll('.group')[1]; // El grupo donde están los botones

    if (currentUser) {
        // Si hay un usuario logueado, cambiamos los botones por su nombre y un botón de salir
        navGroup.innerHTML = `
            <span class="item">Hola, ${currentUser.username}</span>
            <a href="#" id="logout" class="item signup-btn">Salir</a>
        `;

        document.getElementById('logout').addEventListener('click', function() {
            localStorage.removeItem('currentUser'); // Borra la sesión activa
            window.location.reload(); // Recarga la página
        });
    }
});
