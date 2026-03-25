document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-citas');
    const spanPagina = document.getElementById('paginaCitaUsuario');
    const btnPrev = document.getElementById('prevCitaUsuario');
    const btnNext = document.getElementById('nextCitaUsuario');

    const token = localStorage.getItem('token');

    let paginaActual = 1;
    const filasPorPagina = 10;
    let todasLasCitas = [];

    const cargarCitas = async () => {
        try {
            const res = await fetch(`${API_BASE}/citas/citas-paciente`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error("Error al obtener las citas del servidor");
            
            todasLasCitas = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error("Error:", error);
            tbody.innerHTML = `<tr><td colspan="6">Error al cargar la información de sus citas.</td></tr>`;
        }
    };

    const renderizarTabla = () => {
        tbody.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginadas = todasLasCitas.slice(inicio, fin);
        const totalPaginas = Math.ceil(todasLasCitas.length / filasPorPagina) || 1;

        if (paginadas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No tienes citas agendadas actualmente.</td></tr>`;
        } else {
            paginadas.forEach(cita => {
                const tr = document.createElement('tr');
                tr.className = 'filaCitaUsuario';

                tr.innerHTML = `
                    <td>${cita.fecha}</td>
                    <td>${cita.hora}</td>
                    <td>${cita.curp_paciente}</td>
                    <td>${cita.nombre_medico}</td>
                    <td>${cita.nombre_consultorio || 'No asignado'}</td>
                    <td>
                        <span class="badge-estado estado-${cita.estado.toLowerCase().replace(/\s+/g, '-')}">
                            ${cita.estado}
                        </span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        spanPagina.innerText = `Página ${paginaActual} de ${totalPaginas}`;
        btnPrev.disabled = paginaActual === 1;
        btnNext.disabled = paginaActual === totalPaginas;
    };

    btnPrev.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    });

    btnNext.addEventListener('click', () => {
        const totalPaginas = Math.ceil(todasLasCitas.length / filasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    cargarCitas();
});