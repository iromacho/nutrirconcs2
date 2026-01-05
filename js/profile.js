// Al principio de js/profile.js
const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user) {
    window.location.href = 'index.html'; // Si no hay usuario, lo echa al inicio
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener datos del localStorage
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (!user) {
        // Si no hay usuario, mandarlo al login
        window.location.href = 'index.html';
        return;
    }

    // 2. Rellenar los campos con datos reales
    document.getElementById('user-name').textContent = user.username;
    document.getElementById('user-email').textContent = user.email;
    
    // Si la foto de Google existe, la ponemos, si no una por defecto
    if (user.picture) {
        document.getElementById('user-photo').src = user.picture;
    }

    // 3. Animación de entrada con GSAP
    gsap.from(".profile-card", {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power4.out"
    });
});
