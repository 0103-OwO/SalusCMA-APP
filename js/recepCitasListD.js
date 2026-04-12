document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('tbody-citas');
    const spanPagina = document.getElementById('pagina-cita');
    const token = localStorage.getItem('token');

    let todasLasCitas = [];
    let paginaActual = 0;
    const filasPorPagina = 10;
    let ordenAsc = true;

    const cargarCitas = async () => {
        try {
            const response = await fetch(`${API_BASE}/citas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Error al obtener las citas");

            todasLasCitas = await response.json();
            renderizarTabla(0);
        } catch (error) {
            console.error("Error:", error.message);
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error al cargar los datos.</td></tr>';
        }
    };

    const renderizarTabla = (pagina) => {
        tbody.innerHTML = '';
        paginaActual = pagina;

        if (todasLasCitas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay citas registradas.</td></tr>';
            document.getElementById('prevCita').disabled = true;
            document.getElementById('nextCita').disabled = true;
            spanPagina.textContent = `Página 1 de 1`;
            return;
        }

        const inicio = pagina * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const listaPagina = todasLasCitas.slice(inicio, fin);
        const totalPaginas = Math.ceil(todasLasCitas.length / filasPorPagina);

        listaPagina.forEach(c => {
            const tr = document.createElement('tr');
            let colorEstado = "#555";
            if (c.estado === 'No asistió') colorEstado = "#e74c3c";
            if (c.estado === 'Pendiente') colorEstado = "#f39c12";

            tr.innerHTML = `
                <td>${c.fecha}</td>
                <td>${c.hora}</td>
                <td>${c.curp_paciente}</td>
                <td>${c.nombre_medico}</td>
                <td>${c.nombre_consultorio || 'N/A'}</td>
                <td style="color: ${colorEstado}; font-weight: bold;">${c.estado}</td>
                <td>
                    <button type="button" onclick="window.location.href='recepcionistaCitaEdit.html?id_cita=${c.id_cita}'">Editar</button>
                    <button type="button" class="btn-borrar" data-id="${c.id_cita}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        spanPagina.textContent = `Página ${pagina + 1} de ${totalPaginas}`;
        document.getElementById('prevCita').disabled = (paginaActual === 0);
        document.getElementById('nextCita').disabled = (paginaActual >= totalPaginas - 1);
        vincularBotonesEliminar();
    };

    const ordenarCitas = (columna) => {
        ordenAsc = !ordenAsc;
        todasLasCitas.sort((a, b) => {
            let valA = a[columna] ? a[columna].toString().toLowerCase() : '';
            let valB = b[columna] ? b[columna].toString().toLowerCase() : '';

            if (columna === 'fecha' && valA.includes('-')) {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            if (valA < valB) return ordenAsc ? -1 : 1;
            if (valA > valB) return ordenAsc ? 1 : -1;
            return 0;
        });
        renderizarTabla(0);
    };

    document.querySelectorAll('#tablaCitas thead th[data-column]').forEach(th => {
        th.style.cursor = 'pointer';
        th.onclick = () => ordenarCitas(th.getAttribute('data-column'));
    });

    const vincularBotonesEliminar = () => {
        document.querySelectorAll('.btn-borrar').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-id');
                if (!confirm("¿Seguro que deseas eliminar esta cita?")) return;

                try {
                    const response = await fetch(`${API_BASE}/citas/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        alert("Cita eliminada correctamente");
                        cargarCitas();
                    } else {
                        const errorData = await response.json();
                        alert("Error: " + (errorData.error || "No se pudo eliminar"));
                    }
                } catch (error) {
                    alert("Ocurrió un error al intentar eliminar.");
                }
            };
        });
    };

    document.getElementById('prevCita').onclick = () => {
        if (paginaActual > 0) renderizarTabla(paginaActual - 1);
    };

    document.getElementById('nextCita').onclick = () => {
        const totalPaginas = Math.ceil(todasLasCitas.length / filasPorPagina);
        if (paginaActual < totalPaginas - 1) renderizarTabla(paginaActual + 1);
    };

    cargarCitas();
});