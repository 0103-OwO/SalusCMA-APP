document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-horarios');
    const token = localStorage.getItem('token');

    let paginaActual = 1;
    const filasPorPagina = 5;
    let todosLosHorarios = [];

    const cargarHorarios = async () => {
        try {
            const res = await fetch(`${API_BASE}/horarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error al obtener horarios");

            todosLosHorarios = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error(error);
            if (tbody) tbody.innerHTML = `<tr><td colspan="5">Error al cargar datos</td></tr>`;
        }
    };

    const renderizarTabla = () => {
        if (!tbody) return;
        tbody.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginados = todosLosHorarios.slice(inicio, fin);
        const totalPaginas = Math.ceil(todosLosHorarios.length / filasPorPagina) || 1;

        paginados.forEach(h => {
            const tr = document.createElement('tr');

            const resumen = [];
            if (h.lunes_ent) resumen.push(`Lun: ${h.lunes_ent.slice(0, 5)}-${h.lunes_sal.slice(0, 5)}`);
            if (h.martes_ent) resumen.push(`Mar: ${h.martes_ent.slice(0, 5)}-${h.martes_sal.slice(0, 5)}`);
            if (h.miercoles_ent) resumen.push(`Mie: ${h.miercoles_ent.slice(0, 5)}-${h.miercoles_sal.slice(0, 5)}`);
            if (h.jueves_ent) resumen.push(`Jue: ${h.jueves_ent.slice(0, 5)}-${h.jueves_sal.slice(0, 5)}`);
            if (h.viernes_ent) resumen.push(`Vie: ${h.viernes_ent.slice(0, 5)}-${h.viernes_sal.slice(0, 5)}`);

            tr.innerHTML = `
                <td>${h.nombre_trabajador}</td>
                <td style="font-size: 0.85em;">${resumen.join('<br>') || 'Sin horario'}</td>
                <td>${h.fecha_inicio}</td>
                <td>${h.fecha_fin}</td>
                <td>
                    <button class="btn-edit" onclick="window.location.href='adminHorarioEdit.html?id=${h.id_horario}'">Editar</button>
                </td>
                <td>
                    <button class="btn-delete" onclick="eliminarHorario(${h.id_horario})">Borrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('pagina-horario').innerText = `Página ${paginaActual} de ${totalPaginas}`;
        document.getElementById('prevHorario').disabled = paginaActual === 1;
        document.getElementById('nextHorario').disabled = paginaActual === totalPaginas;
    };

    window.eliminarHorario = async (id) => {
        if (!confirm("¿Estás seguro de eliminar este horario?")) return;

        try {
            const res = await fetch(`${API_BASE}/horarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                todosLosHorarios = todosLosHorarios.filter(h => h.id_horario !== id);
                renderizarTabla();
            } else {
                alert("No se pudo eliminar el horario");
            }
        } catch (error) {
            console.error(error);
        }
    };

    document.getElementById('prevHorario').onclick = () => { if (paginaActual > 1) { paginaActual--; renderizarTabla(); } };
    document.getElementById('nextHorario').onclick = () => {
        if (paginaActual < Math.ceil(todosLosHorarios.length / filasPorPagina)) { paginaActual++; renderizarTabla(); }
    };

    cargarHorarios();
});