// Al principio de js/profile.js
const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user) {
    window.location.href = 'index.html'; // Si no hay usuario, lo echa al inicio
}

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name').textContent = user.username;
    document.getElementById('user-email').textContent = user.email || "Usuario Local";

    // Animación suave de entrada
    gsap.from(".profile-card", {
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: "back.out(1.7)"
    });
});
