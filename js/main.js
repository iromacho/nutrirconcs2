// 1. FILTRO DE BUSQUEDA
function filterGames() {
    let input = document.getElementById('gameSearch').value.toLowerCase();
    let cards = document.getElementsByClassName('game-card');

    for (let i = 0; i < cards.length; i++) {
        let title = cards[i].getElementsByTagName('span')[0].innerText.toLowerCase();
        if (title.includes(input)) {
            cards[i].style.display = "flex";
        } else {
            cards[i].style.display = "none";
        }
    }
}

// 2. CONTROL DE CARGA (COOKIES Y LOGIN)
document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica de Cookies ---
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

    // --- Lógica de Usuario Logueado ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navGroup = document.querySelectorAll('.group')[1]; 

    if (currentUser && navGroup) {
        navGroup.innerHTML = `
            <span class="item" style="color: white;">Hola, ${currentUser.username}</span>
            <a href="#" id="logout" class="item signup-btn">Salir</a>
        `;

        document.getElementById('logout').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser'); 
            window.location.reload(); 
        });
    }
});
