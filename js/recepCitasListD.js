document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('tbody-citas');
    const spanPagina = document.getElementById('pagina-cita');
    const mensaje = document.getElementById('mensajeCita');
    const token = localStorage.getItem('token');

    let todasLasCitas = [];
    let paginaActual = 0;
    const filasPorPagina = 10;

    const cargarCitas = async () => {
        try {
            const response = await fetch(`${API_BASE}/citas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Error al obtener las citas");

            todasLasCitas = await response.json();
            renderizarTabla(0);
        } catch (error) {
            mensaje.style.color = "red";
            mensaje.innerText = error.message;
        }
    };

    const renderizarTabla = (pagina) => {
        tbody.innerHTML = '';
        paginaActual = pagina;

        if (todasLasCitas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No hay citas registradas.</td></tr>';
            return;
        }

        const inicio = pagina * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const listaPagina = todasLasCitas.slice(inicio, fin);
        const totalPaginas = Math.ceil(todasLasCitas.length / filasPorPagina);

        listaPagina.forEach(c => {
            const tr = document.createElement('tr');
            
            let colorEstado = "#555";
            if (c.estado === 'No asistió') colorEstado = "#e74c3c"; // Rojo
            if (c.estado === 'Pendiente') colorEstado = "#f39c12";  // Naranja

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
        vincularBotonesEliminar();
    };

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
                        mensaje.style.color = "green";
                        mensaje.innerText = "Cita eliminada correctamente";
                        cargarCitas(); 
                    } else {
                        throw new Error("No se pudo eliminar");
                    }
                } catch (error) {
                    mensaje.style.color = "red";
                    mensaje.innerText = error.message;
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