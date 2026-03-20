document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-citas');
    const token = localStorage.getItem('token');

    let paginaActual = 1;
    const filasPorPagina = 5;
    let todasLasCitas = [];

    const cargarCitas = async () => {
        try {
            const res = await fetch(`${API_BASE}/citas`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.status === 401) {
                window.location.href = 'login.html';
                return;
            }

            todasLasCitas = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error("Error al obtener citas:", error);
        }
    };

    const renderizarTabla = () => {
        tbody.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginadas = todasLasCitas.slice(inicio, fin);
        const totalPaginas = Math.ceil(todasLasCitas.length / filasPorPagina) || 1;

        paginadas.forEach(c => {
            const tr = document.createElement('tr');
            tr.className = 'filaCita';
            tr.innerHTML = `
        <td>${c.fecha}</td>
        <td>${c.hora}</td>
        <td><code class="text-dark">${c.curp_paciente}</code></td>
        <td>${c.nombre_medico}</td>
        <td>${c.nombre_consultorio || 'No asignado'}</td>
        <td>
            <button type="button" 
                onclick="window.location.href='adminCitasEdit.html?id_cita=${c.id_cita}'">
                Editar
            </button>
            <button type="button" class="borrar-btn" data-id="${c.id_cita}">Eliminar</button>
        </td>
    `;
            tbody.appendChild(tr);
        });

        document.getElementById('pagina-cita').innerText = `Página ${paginaActual} de ${totalPaginas}`;
        document.getElementById('prevCita').disabled = paginaActual === 1;
        document.getElementById('nextCita').disabled = paginaActual === totalPaginas;
    };

    document.getElementById('prevCita').addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    });

    document.getElementById('nextCita').addEventListener('click', () => {
        const totalPaginas = Math.ceil(todasLasCitas.length / filasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    cargarCitas();
});