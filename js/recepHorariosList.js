document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('tbody-horarios');
    const spanPagina = document.getElementById('paginaHorario');
    const mensaje = document.getElementById('mensajeHorario');
    const token = localStorage.getItem('token');

    let todosLosHorarios = [];
    let paginaActual = 0;
    const filasPorPagina = 10;

    const cargarHorariosGlobales = async () => {
        try {
            const response = await fetch(`${API_BASE}/horarios`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error("No se pudieron cargar los horarios");

            todosLosHorarios = await response.json();
            renderizarTabla(0);

        } catch (error) {
            mensaje.style.color = "red";
            mensaje.innerText = error.message;
            tbody.innerHTML = '<tr><td colspan="6">Error de conexión</td></tr>';
        }
    };

    const renderizarTabla = (pagina) => {
        if (!tbody) return;
        tbody.innerHTML = '';
        paginaActual = pagina;

        if (todosLosHorarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No hay horarios registrados en el sistema</td></tr>';
            return;
        }

        const inicio = pagina * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const listaPagina = todosLosHorarios.slice(inicio, fin);
        const totalPaginas = Math.ceil(todosLosHorarios.length / filasPorPagina);

        listaPagina.forEach(h => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${h.nombre_trabajador || 'ID: ' + h.id_trabajador}</strong></td>
                <td>${h.hora_entrada}</td>
                <td>${h.hora_salida}</td>
                <td>${h.fecha_inicio}</td>
                <td>${h.fecha_fin}</td>
                <td><span class="status-tag">${h.estado || 'Activo'}</span></td>
            `;
            tbody.appendChild(tr);
        });

        spanPagina.textContent = `Página ${pagina + 1} de ${totalPaginas}`;
    };

    document.getElementById('prevHorario').onclick = () => {
        if (paginaActual > 0) renderizarTabla(paginaActual - 1);
    };

    document.getElementById('nextHorario').onclick = () => {
        const totalPaginas = Math.ceil(todosLosHorarios.length / filasPorPagina);
        if (paginaActual < totalPaginas - 1) renderizarTabla(paginaActual + 1);
    };

    cargarHorariosGlobales();
});