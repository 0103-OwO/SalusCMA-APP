document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const nombre = localStorage.getItem('nombre') || 'Usuario';
    
    const path = window.location.pathname;
    const currentFile = path.split('/').pop() || 'index.html';
    const estaEnCarpetaHtml = path.includes('/html/');

    const aRaiz = estaEnCarpetaHtml ? '../' : '';
    const aHtml = estaEnCarpetaHtml ? '' : 'html/';

    const paginasLibres = ['index.html', 'vision.html', 'personal.html', 'contacto.html', 'mapaPrincipal.html', 'loginn.html', 'detalleTrabajador.html'];

    const esAdmin = currentFile.startsWith('admin') && rol !== '7';
    const esMedico = currentFile.startsWith('medico') && rol !== '8';
    const esRecep = currentFile.startsWith('recepcionista') && rol !== '9';
    const esUser = currentFile.startsWith('usuario') && rol !== '19';

    if ((!paginasLibres.includes(currentFile) && !token) || esAdmin || esMedico || esRecep || esUser) {
        window.location.href = aRaiz + "index.html";
        return;
    }

    let panelLink = aHtml + 'loginn.html';
    if (token) {
        switch (rol) {
            case '7': panelLink = aHtml + 'adminPrincipal.html'; break;
            case '8': panelLink = aHtml + 'medicoPrincipal.html'; break;
            case '9': panelLink = aHtml + 'recepcionistaPrincipal.html'; break;
            default:  panelLink = aHtml + 'usuarioPrincipal.html'; break;
        }
    }

    const perfilContainer = document.getElementById('perfil-dinamico');
    const saludo = document.getElementById('saludo-bienvenida');

    if (token) {
       
        if (saludo) saludo.innerText = `Bienvenido, ${nombre}`;
        
        if (perfilContainer) {
            perfilContainer.innerHTML = `
                <nav>
                    <ul>
                        <li class="item-con-submenu">
                            <a href="#">
                                <img id="perfil" src="${aRaiz}img/perfil.png" alt="Perfil">
                                <p>${nombre}</p>
                            </a>
                            <ul class="submenu">
                                <li><a href="${panelLink}">Mi Perfil</a></li>
                                <li><a href="#" id="btn-logout">Cerrar sesión</a></li>
                            </ul>
                        </li>
                    </ul>
                </nav>`;
            
            document.getElementById('btn-logout').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.clear();
                window.location.href = aRaiz + "index.html";
            });
        }
    } else {
        if (saludo) saludo.innerText = "Bienvenido a Salus CMA";
        
        if (perfilContainer) {
            perfilContainer.innerHTML = `
                <a href="${aHtml}loginn.html">
                    <img id="perfil" src="${aRaiz}img/perfil.png" alt="Perfil">
                    <p>Iniciar sesión</p>
                </a>`;
        }
    }
});