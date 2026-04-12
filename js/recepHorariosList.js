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
            // CORRECCIÓN: Colspan a 6 para cubrir toda la tabla
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

            // Formateo del resumen semanal
            const resumen = [];
            // Usamos una función auxiliar para no repetir código y manejar nulos
            const formatDay = (dia, ent, sal) => {
                return ent ? `${dia}: ${ent.slice(0, 5)}-${sal.slice(0, 5)}` : null;
            };

            const dias = [
                formatDay('Lun', h.lunes_ent, h.lunes_sal),
                formatDay('Mar', h.martes_ent, h.martes_sal),
                formatDay('Mie', h.miercoles_ent, h.miercoles_sal),
                formatDay('Jue', h.jueves_ent, h.jueves_sal),
                formatDay('Vie', h.viernes_ent, h.viernes_sal)
            ].filter(d => d !== null); // Quitamos los días que el médico no trabaja

            tr.innerHTML = `
                <td>${h.nombre_trabajador || 'Sin nombre'}</td>
                <td>${h.nombre_consultorio || 'Sin consultorio'}</td>
                <td style="font-size: 0.85em; line-height: 1.2;">
                    ${dias.join('<br>') || '<span style="color:gray">No asignado</span>'}
                </td>
                <td>${h.fecha_inicio}</td>
                <td>${h.fecha_fin}</td>
            `;
            tbody.appendChild(tr);
        });

        // Actualización de paginación
        const pTexto = document.getElementById('pagina-horario');
        if (pTexto) pTexto.innerText = `Página ${paginaActual} de ${totalPaginas}`;

        document.getElementById('prevHorario').disabled = paginaActual === 1;
        document.getElementById('nextHorario').disabled = paginaActual === totalPaginas;
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