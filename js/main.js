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
