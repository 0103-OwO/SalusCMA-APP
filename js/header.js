(function () {
    const nombre = localStorage.getItem('nombre');
    const panel  = localStorage.getItem('panel') || 'loginn.html';

    const container = document.getElementById('perfil-container');
    if (!container) return;

    if (nombre) {
        container.innerHTML = `
            <nav>
                <ul>
                    <li>
                        <a href="#">
                            <img id="perfil" src="img/perfil.png" alt="Perfil">
                            <p>${nombre}</p>
                        </a>
                        <ul class="submenu">
                            <li><a href="${panel}" class="perfil">Perfil</a></li>
                            <li><a href="cambiarContrasena.html?redirect=${panel}" class="cambiar-contrasena">Cambiar contraseña</a></li>
                            <li><a href="logout.html" class="cerrar-sesion">Cerrar sesion</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>
        `;
    } else {
        container.innerHTML = `
            <a href="loginn.html">
                <img id="perfil" src="img/perfil.png" alt="Perfil">
                <p>Iniciar sesión</p>
            </a>
        `;
    }

    const logo = document.getElementById('logo');
    if (logo && !logo.src.includes('logo.png')) {
        logo.src = 'img/logo.png';
    }

    const imgPrincipal = document.getElementById('principal');
    if (imgPrincipal) {
        imgPrincipal.src = 'img/default.png';
    }

    const bienvenida = document.getElementById('nombre-bienvenida');
    if (bienvenida && nombre) {
        bienvenida.textContent = `Bienvenido ${nombre}`;
    }

    const saludoAdmin = document.getElementById('saludo-bienvenida');
    if (saludoAdmin && nombre) {
        saludoAdmin.textContent = `Bienvenido, ${nombre}`;
    }
})();
