document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-pacientes');
    const spanPagina = document.getElementById('paginaPaciente');
    const btnPrev = document.getElementById('prevPaciente');
    const btnNext = document.getElementById('nextPaciente');

    let paginaActual = 1;
    const filasPorPagina = 10;
    let todosLosPacientes = [];

    const cargarPacientes = async () => {
        try {
            const res = await fetch(`${API_BASE}/pacientes`);
            if (!res.ok) throw new Error("Error al obtener datos del servidor");
            todosLosPacientes = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error("Error:", error);
            tbody.innerHTML = `<tr><td colspan="9">Error al cargar la información de pacientes.</td></tr>`;
        }
    };

    const renderizarTabla = () => {
        tbody.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginados = todosLosPacientes.slice(inicio, fin);
        const totalPaginas = Math.ceil(todosLosPacientes.length / filasPorPagina) || 1;

        paginados.forEach(pac => {
            const tr = document.createElement('tr');
            tr.className = 'filaPaciente';
            tr.id = `fila-${pac.id_pacientes}`;

            const fecha = pac.fecha_nacimiento ? pac.fecha_nacimiento.split('T')[0] : 'N/A';

            tr.innerHTML = `
                <td>${pac.curp}</td>
                <td>${pac.nombre}</td>
                <td>${pac.apellido_paterno}</td>
                <td>${pac.apellido_materno}</td>
                <td>
                    <label style="margin-right: 5px;">
                        <input type="checkbox" disabled ${pac.sexo === 'H' ? 'checked' : ''}> H
                    </label>
                    <label>
                        <input type="checkbox" disabled ${pac.sexo === 'M' ? 'checked' : ''}> M
                    </label>
                </td>
                <td>${fecha}</td>
                <td>${pac.correo || 'N/A'}</td>
                <td>${pac.usuario || 'N/A'}</td>
                <td>${pac.sexo}</td>
            `;
            tbody.appendChild(tr);
        });

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
        const totalPaginas = Math.ceil(todosLosPacientes.length / filasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    tbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('borrar-btn')) {
            const id = e.target.getAttribute('data-id');
            if (confirm("¿Está seguro de que desea eliminar permanentemente este registro?")) {
                try {
                    const res = await fetch(`${API_BASE}/pacientes/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        alert("Paciente eliminado con éxito.");

                        const totalAntes = todosLosPacientes.length;
                        await cargarPacientes();

                        const nuevoTotalPaginas = Math.ceil((totalAntes - 1) / filasPorPagina);
                        if (paginaActual > nuevoTotalPaginas && paginaActual > 1) {
                            paginaActual = nuevoTotalPaginas;
                        }
                        renderizarTabla();
                    } else {
                        alert("No se pudo eliminar el registro.");
                    }
                } catch (error) {
                    alert("Error de conexión al intentar eliminar.");
                }
            }
        }
    });

    cargarPacientes();
});