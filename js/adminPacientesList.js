document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-pacientes');
    const token = localStorage.getItem('token');

    let paginaActual = 1;
    const filasPorPagina = 5;
    let todosLosPacientes = [];

    //Carga los datos desde /api/pacientes
    const cargarPacientes = async () => {
        try {
            const res = await fetch(`${API_BASE}/pacientes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("No se pudo obtener la lista de pacientes");

            todosLosPacientes = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error("Error al obtener pacientes:", error);
            if (tbody) tbody.innerHTML = `<tr><td colspan="4">Error al cargar datos</td></tr>`;
        }
    };

    //Renderiza la tabla con los nombres exactos de tu BD
    const renderizarTabla = () => {
        if (!tbody) return;
        tbody.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginados = todosLosPacientes.slice(inicio, fin);
        const totalPaginas = Math.ceil(todosLosPacientes.length / filasPorPagina) || 1;

        paginados.forEach(p => {
            const tr = document.createElement('tr');
            tr.className = 'filaPaciente';

            // Limpiamos la fecha
            const fecha = p.fecha_nacimiento ? p.fecha_nacimiento.split('T')[0] : 'N/A';

            tr.innerHTML = `
        <td>${p.curp}</td>
        <td>${p.nombre}</td>
        <td>${p.apellido_paterno}</td>
        <td>${p.apellido_materno}</td>
        <td>${p.sexo}</td>
        <td>${fecha}</td>
        
    `;
            tbody.appendChild(tr);
        });

        // Actualiza indicadores de paginación
        const paginadorTexto = document.getElementById('pagina-paciente');
        if (paginadorTexto) {
            paginadorTexto.innerText = `Página ${paginaActual} de ${totalPaginas}`;
        }

        document.getElementById('prevPaciente').disabled = paginaActual === 1;
        document.getElementById('nextPaciente').disabled = paginaActual === totalPaginas;
    };

    //Eventos de navegación
    document.getElementById('prevPaciente').addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    });

    document.getElementById('nextPaciente').addEventListener('click', () => {
        const totalPaginas = Math.ceil(todosLosPacientes.length / filasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    cargarPacientes();
});