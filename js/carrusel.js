/**
 * carrusel.js — Salus CMA  |  LOTE 2  (versión mejorada)
 * ============================================================
 * Misma función initCarrusel() del original, extendida con:
 *   - Clase "slide-activo" en el slide visible
 *     (activa animaciones Ken Burns + entrada del caption en CSS)
 *   - Pausa del autoplay al hacer hover sobre el carrusel
 *   - Soporte de teclado (← →)
 *   - Código limpio y comentado
 *
 * Uso desde la API (index.js):
 *   1. Vaciar #carrusel-track e inyectar nuevos slides
 *   2. Regenerar #carrusel-dots con los nuevos data-dot
 *   3. Llamar initCarrusel()
 * ============================================================
 */

function initCarrusel() {
    /* ----------------------------------------------------------
       Referencias al DOM
    ---------------------------------------------------------- */
    const track        = document.getElementById('carrusel-track');
    const dotsContainer = document.getElementById('carrusel-dots');
    const btnPrev      = document.getElementById('carrusel-prev');
    const btnNext      = document.getElementById('carrusel-next');
    const carruselEl   = document.getElementById('carrusel');

    const slides = track.querySelectorAll('.carrusel-slide');
    const dots   = dotsContainer.querySelectorAll('.carrusel-dot');

    let current = 0;
    let timer   = null;

    /* ----------------------------------------------------------
       goTo(i) — navega al slide indicado (índice circular)
    ---------------------------------------------------------- */
    function goTo(i) {
        // Quitar estado activo del slide anterior
        slides[current].classList.remove('slide-activo');

        // Calcular nuevo índice circular
        current = (i + slides.length) % slides.length;

        // Mover la pista horizontalmente
        track.style.transform = `translateX(-${current * 100}%)`;

        // Activar nuevo slide (activa animaciones CSS)
        slides[current].classList.add('slide-activo');

        // Sincronizar dots
        dots.forEach((d, idx) => d.classList.toggle('activo', idx === current));
    }

    /* ----------------------------------------------------------
       Autoplay
    ---------------------------------------------------------- */
    function autoPlay() {
        timer = setInterval(() => goTo(current + 1), 4000);
    }

    function stopAutoPlay() {
        clearInterval(timer);
        timer = null;
    }

    function restartAutoPlay() {
        stopAutoPlay();
        autoPlay();
    }

    /* ----------------------------------------------------------
       Eventos — botones prev / next
    ---------------------------------------------------------- */
    btnPrev.addEventListener('click', () => { goTo(current - 1); restartAutoPlay(); });
    btnNext.addEventListener('click', () => { goTo(current + 1); restartAutoPlay(); });

    /* ----------------------------------------------------------
       Eventos — dots
    ---------------------------------------------------------- */
    dots.forEach(d => {
        d.addEventListener('click', () => {
            goTo(parseInt(d.dataset.dot));
            restartAutoPlay();
        });
    });

    /* ----------------------------------------------------------
       Pausa automática al hacer hover sobre el carrusel
    ---------------------------------------------------------- */
    carruselEl.addEventListener('mouseenter', stopAutoPlay);
    carruselEl.addEventListener('mouseleave', autoPlay);

    /* ----------------------------------------------------------
       Soporte de teclado (← →) cuando el carrusel tiene foco
    ---------------------------------------------------------- */
    carruselEl.setAttribute('tabindex', '0');
    carruselEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  { goTo(current - 1); restartAutoPlay(); }
        if (e.key === 'ArrowRight') { goTo(current + 1); restartAutoPlay(); }
    });

    /* ----------------------------------------------------------
       Inicialización — primer slide
    ---------------------------------------------------------- */
    goTo(0);
    autoPlay();
}

/* Arrancar cuando el DOM esté listo */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarrusel);
} else {
    initCarrusel();
}
