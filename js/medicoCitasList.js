document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-citas');
    const token = localStorage.getItem('token');
    
    let paginaActual = 1;
    const filasPorPagina = 5;
    let todasLasCitas = [];

    const cargarCitas = async () => {
        try {
            const res = await fetch(`${API_BASE}/citas/mis-citas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error al obtener las citas");

            todasLasCitas = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="5" style="color:red;">Error al cargar las citas programadas.</td></tr>`;
        }
    };

    const renderizarTabla = () => {
        if (!tbody) return;
        tbody.innerHTML = '';

        if (todasLasCitas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No tiene citas programadas.</td></tr>`;
            actualizarBotones(1);
            return;
        }

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginadas = todasLasCitas.slice(inicio, fin);
        const totalPaginas = Math.ceil(todasLasCitas.length / filasPorPagina);

        paginadas.forEach(cita => {
            const tr = document.createElement('tr');
            const fechaFormateada = cita.fecha.split('T')[0];

            tr.innerHTML = `
                <td>${fechaFormateada}</td>
                <td>${cita.hora.slice(0, 5)}</td>
                <td>${cita.curp_paciente}</td>
                <td>${cita.nombre_medico}</td>
                <td>${cita.consultorio || 'N/A'}</td>
            `;
            tbody.appendChild(tr);
        });

        actualizarBotones(totalPaginas);
    };

    const actualizarBotones = (totalPaginas) => {
        document.getElementById('pagina-cita').innerText = `Página ${paginaActual} de ${totalPaginas}`;
        document.getElementById('prevCita').disabled = paginaActual === 1;
        document.getElementById('nextCita').disabled = paginaActual === totalPaginas || todasLasCitas.length === 0;
    };

    document.getElementById('prevCita').onclick = () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    };

    document.getElementById('nextCita').onclick = () => {
        if (paginaActual < Math.ceil(todasLasCitas.length / filasPorPagina)) {
            paginaActual++;
            renderizarTabla();
        }
    };

    cargarCitas();
});