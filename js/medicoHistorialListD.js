document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('tbody-historiales');
    const spanPaginaHistorial = document.getElementById('pagina-historial');
    const btnPrev = document.getElementById('prevHistorial');
    const btnNext = document.getElementById('nextHistorial');

    const filasPorPaginaHistorial = 10;
    let paginaActualHistorial = 0;
    let todosLosHistoriales = [];

    const cargarHistoriales = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'loginn.html';
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/historiales/mis-historiales`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al obtener datos');

            todosLosHistoriales = await response.json();
            renderizarTabla(0);
        } catch (error) {
            console.error("Error cargando historiales:", error);
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; color:red;">Error al cargar los historiales médicos.</td></tr>`;
            }
        }
    };

    const renderizarTabla = (pagina) => {
        if (!tbody) return;

        paginaActualHistorial = pagina;
        tbody.innerHTML = '';

        if (todosLosHistoriales.length === 0) {
            tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;">No hay registros activos</td></tr>`;
            spanPaginaHistorial.textContent = `Página 1 de 1`;
            return;
        }

        const totalPaginas = Math.ceil(todosLosHistoriales.length / filasPorPaginaHistorial);
        const inicio = pagina * filasPorPaginaHistorial;
        const fin = inicio + filasPorPaginaHistorial;
        const historialesPagina = todosLosHistoriales.slice(inicio, fin);

        historialesPagina.forEach(h => {
            const tr = document.createElement('tr');
            tr.className = 'filaHistorial';
            tr.innerHTML = `
                <td>${h.numero_cita}</td>
                <td>${h.curp_paciente}</td>
                <td>${h.nombre_medico}</td>
                <td>${h.nombre_consultorio || 'N/A'}</td>
                <td>${h.fecha}</td>
                <td>${h.hora}</td>
                <td>${h.tension_arterial}</td>
                <td>${h.peso}</td>
                <td>${h.talla}</td>
                <td>${h.temperatura}</td>
                <td>${h.descripcion}</td>
                <td>
                    <button type="button" class="btn-editar" data-id="${h.id_historial}">Editar</button>
                    <button type="button" class="borrar-btn" data-id="${h.id_historial}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        asignarEventosBotones();

        spanPaginaHistorial.textContent = `Página ${pagina + 1} de ${totalPaginas}`;
    };

    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                window.location.href = `medicoHistorialActualizar.html?id_historial=${id}`;
            };
        });

        document.querySelectorAll('.borrar-btn').forEach(btn => {
            btn.onclick = () => eliminarHistorial(btn.getAttribute('data-id'));
        });
    };

    const eliminarHistorial = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este historial?')) return;

        try {
            const response = await fetch(`${API_BASE}/historiales/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                todosLosHistoriales = todosLosHistoriales.filter(h => h.id_historial != id);
                renderizarTabla(paginaActualHistorial);
            } else {
                alert("No se pudo eliminar el registro.");
            }
        } catch (error) {
            alert("Error de conexión al eliminar.");
        }
    };

    if (btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => {
            if (paginaActualHistorial > 0) renderizarTabla(paginaActualHistorial - 1);
        });

        btnNext.addEventListener('click', () => {
            const totalPaginas = Math.ceil(todosLosHistoriales.length / filasPorPaginaHistorial);
            if (paginaActualHistorial < totalPaginas - 1) renderizarTabla(paginaActualHistorial + 1);
        });
    }

    cargarHistoriales();
});