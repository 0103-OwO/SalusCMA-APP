document.addEventListener('DOMContentLoaded', async () => {
    const main = document.getElementById('contenedor-principal');
    const msgSinPersonal = document.getElementById('msg-sin-personal');
    const botonesPaginacion = document.getElementById('contenedor-botones');

    if (!main) return;

    try {
        const res = await fetch(`${API_BASE}/trabajadores`);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

        const personal = await res.json();

        const articulosExistentes = main.querySelectorAll('.articleTrabajador');
        articulosExistentes.forEach(art => art.remove());

        if (!personal || personal.length === 0) {
            if (msgSinPersonal) msgSinPersonal.style.display = 'block';
            if (botonesPaginacion) botonesPaginacion.style.display = 'none';
            return;
        }

        personal.forEach(trabajador => {
            const article = document.createElement('article');
            article.className = 'articleTrabajador';

            const nombreCompleto = `${trabajador.nombre} ${trabajador.apellido_paterno}`;

            article.innerHTML = `
                <h2>${trabajador.especialidad || 'Médico General'}</h2><br>
                <div class="contenido-superior">
                    <img src="${trabajador.foto || '../img/perfil-default.png'}" alt="${trabajador.nombre}">
                    <ul>
                        <li><strong>${nombreCompleto}</strong></li>
                        <li>Correo: ${trabajador.correo}</li>
                    </ul>
                </div>
                <button class="btnVerMas" 
                        onclick="window.location.href='detalleTrabajador.html?id=${trabajador.id_trabajador}'">
                    Ver más
                </button>
            `;
            main.insertBefore(article, msgSinPersonal);
        });

        if (msgSinPersonal) msgSinPersonal.style.display = 'none';
        if (botonesPaginacion) {
            botonesPaginacion.style.display = 'flex';
        }

    } catch (error) {
        console.error("Error al cargar personal:", error);
        if (msgSinPersonal) {
            msgSinPersonal.innerText = "No se pudo cargar el personal en este momento.";
            msgSinPersonal.style.display = 'block';
        }
    }
});