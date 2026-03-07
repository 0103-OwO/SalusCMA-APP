(function () {
    const token = localStorage.getItem('token');
    const rol   = parseInt(localStorage.getItem('id_rol'));

    if (!token) {
        window.location.href = 'loginn.html';
        return;
    }

    const scriptTag   = document.currentScript;
    const rolEsperado = scriptTag ? parseInt(scriptTag.getAttribute('data-rol')) : NaN;

    if (!isNaN(rolEsperado) && rol !== rolEsperado) {
        const panel = localStorage.getItem('panel') || 'loginn.html';
        window.location.href = panel;
    }
})();
