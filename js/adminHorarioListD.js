document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-horarios');
    const token = localStorage.getItem('token');

    let paginaActual = 1;
    const filasPorPagina = 5;
    let todosLosHorarios = [];

    const cargarHorarios = async () => {
        try {
            const res = await fetch(`${API_BASE}/horarios`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json'
                }
            });

            if (res.status === 401 || res.status === 403) {
                alert("Sesión expirada o no autorizada");
                window.location.href = 'login.html';
                return;
            }

            todosLosHorarios = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error("Error al obtener horarios:", error);
        }
    };

    const renderizarTabla = () => {
        tbody.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginados = todosLosHorarios.slice(inicio, fin);
        const totalPaginas = Math.ceil(todosLosHorarios.length / filasPorPagina) || 1;

        paginados.forEach(h => {
            const tr = document.createElement('tr');
            tr.className = 'filaHorario';
            tr.innerHTML = `
                <td>${h.hora_entrada}</td>
                <td>${h.hora_salida}</td>
                <td>${h.fecha_inicio}</td>
                <td>${h.fecha_fin}</td>
                <td>${h.id_trabajador}</td>
                <td>
                    <button type="button" 
                        onclick="window.location.href='adminHorarioEdit.html?id_horario=${h.id_horario}'">
                        Editar
                    </button>
                    <button type="button" class="borrar-btn" data-id="${h.id_horario}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('pagina-horario').innerText = `Página ${paginaActual} de ${totalPaginas}`;
        document.getElementById('prevHorario').disabled = paginaActual === 1;
        document.getElementById('nextHorario').disabled = paginaActual === totalPaginas;
    };

    document.getElementById('prevHorario').addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    });

    document.getElementById('nextHorario').addEventListener('click', () => {
        const totalPaginas = Math.ceil(todosLosHorarios.length / filasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    cargarHorarios();
});