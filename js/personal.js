document.addEventListener('DOMContentLoaded', async () => {
    const listaPersonal = document.getElementById('lista-personal');
    const msgSinPersonal = document.getElementById('msg-sin-personal');
    const botonesPaginacion = document.getElementById('contenedor-botones');

    try {
        const res = await fetch(`${API_BASE}/trabajadores`); 
        if (!res.ok) throw new Error("Error al obtener personal");

        const personal = await res.json();

        if (personal.length === 0) {
            msgSinPersonal.style.display = 'block';
            botonesPaginacion.style.display = 'none';
            return;
        }

        listaPersonal.innerHTML = ''; 
        
        personal.forEach(trabajador => {
            const article = document.createElement('article');
            article.className = 'articleTrabajador';
            article.setAttribute('data-id', trabajador.id_personal);

            article.innerHTML = `
                <h2>${trabajador.especialidad || 'Especialidad'}</h2><br>
                <div class="contenido-superior">
                    <img src="${trabajador.foto || '../img/perfil-default.png'}" alt="${trabajador.nombre}">
                    <ul>
                        <li><strong>${trabajador.nombre}</strong></li>
                        <li>Correo: ${trabajador.correo}</li>
                    </ul>
                </div>
                <button class="btnVerMas" 
                        onclick="window.location.href='detalleTrabajador.html?id=${trabajador.id_personal}'">
                    Ver más
                </button>
            `;
            listaPersonal.appendChild(article);
        });

        if (personal.length > 0) {
            botonesPaginacion.style.display = 'flex';
        }

    } catch (error) {
        console.error("Error:", error);
        msgSinPersonal.innerText = "Error al conectar con el servidor.";
        msgSinPersonal.style.display = 'block';
    }
});