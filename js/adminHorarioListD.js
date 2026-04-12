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
            if (tbody) tbody.innerHTML = `<tr><td colspan="6">Error al cargar datos</td></tr>`;
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
            const formatDay = (dia, ent, sal) => {
                return ent ? `${dia}: ${ent.slice(0, 5)}-${sal.slice(0, 5)}` : null;
            };

            const dias = [
                formatDay('Lun', h.lunes_ent, h.lunes_sal),
                formatDay('Mar', h.martes_ent, h.martes_sal),
                formatDay('Mie', h.miercoles_ent, h.miercoles_sal),
                formatDay('Jue', h.jueves_ent, h.jueves_sal),
                formatDay('Vie', h.viernes_ent, h.viernes_sal)
            ].filter(d => d !== null); 

            tr.innerHTML = `
                <td>${h.nombre_trabajador || 'Sin nombre'}</td>
                <td><strong>${h.nombre_consultorio || '<span style="color:gray">Sin consultorio</span>'}</strong></td>
                <td style="font-size: 0.85em; line-height: 1.2;">
                    ${dias.join('<br>') || '<span style="color:gray">No asignado</span>'}
                </td>
                <td>${h.fecha_inicio}</td>
                <td>${h.fecha_fin}</td>
                <td>
                    <button class="btn-edit" onclick="window.location.href='adminHorarioEdit.html?id=${h.id_horario}'">Editar</button>
            
                    <button class="btn-delete" onclick="eliminarHorario(${h.id_horario})">Borrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Actualización de paginación
        const pTexto = document.getElementById('pagina-horario');
        if (pTexto) pTexto.innerText = `Página ${paginaActual} de ${totalPaginas}`;

        document.getElementById('prevHorario').disabled = paginaActual === 1;
        document.getElementById('nextHorario').disabled = paginaActual === totalPaginas;
    };

    // Función de eliminación
    window.eliminarHorario = async (id) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este horario?")) return;

        try {
            const res = await fetch(`${API_BASE}/horarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                todosLosHorarios = todosLosHorarios.filter(h => h.id_horario !== id);
                // Si la página se queda vacía al borrar, retrocedemos una
                if ((paginaActual - 1) * filasPorPagina >= todosLosHorarios.length && paginaActual > 1) {
                    paginaActual--;
                }
                renderizarTabla();
            } else {
                alert("Error: No se pudo eliminar el registro.");
            }
        } catch (error) {
            console.error("Error al borrar:", error);
        }
    };

    // Eventos de botones
    document.getElementById('prevHorario').onclick = () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    };

    document.getElementById('nextHorario').onclick = () => {
        if (paginaActual < Math.ceil(todosLosHorarios.length / filasPorPagina)) {
            paginaActual++;
            renderizarTabla();
        }
    };

    cargarHorarios();
});