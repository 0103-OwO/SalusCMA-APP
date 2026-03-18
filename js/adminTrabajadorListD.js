document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-trabajadores');
    const token = localStorage.getItem('token');

    let paginaActual = 1;
    const filasPorPagina = 5;
    let todosLosTrabajadores = [];

    // Carga los datos desde la API
    const cargarTrabajadores = async () => {
        try {
            const res = await fetch(`${API_BASE}/trabajadores`);
            todosLosTrabajadores = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error("Error al obtener trabajadores:", error);
        }
    };

    // Carga las tablas incluyendo la paginación y columnas ocultas
    const renderizarTabla = () => {
        tbody.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginados = todosLosTrabajadores.slice(inicio, fin);
        const totalPaginas = Math.ceil(todosLosTrabajadores.length / filasPorPagina) || 1;

        paginados.forEach(tra => {
            const tr = document.createElement('tr');
            tr.className = 'filaTrabajador';
            tr.id = `fila-${tra.id_trabajador}`;

            tr.innerHTML = `
    <td><img src="${tra.foto}" alt="Foto" width="50" style="border-radius: 5px;"></td>
    <td>${tra.nombre} ${tra.apellido_paterno} ${tra.apellido_materno}</td>
    
    <td class="oculto col-cedula">${tra.cedula}</td>
    <td class="oculto col-rfc">${tra.rfc}</td>
    <td>${tra.correo}</td>
    <td>${tra.telefono}</td>
    <td>${tra.especialidad || 'N/A'}</td>
    <td class="oculto col-informacion">${tra.informacion}</td>
    <td>
        <button type="button" 
            onclick="window.location.href='adminTrabajadorEdit.html?id_trabajador=${tra.id_trabajador}'">
            Editar
        </button>
        <button type="button" class="borrar-btn" data-id="${tra.id_trabajador}">Eliminar</button>
    </td>
`;
            tbody.appendChild(tr);
        });

        // Actualiza la paginación
        document.getElementById('pagina-trabajador').innerText = `Página ${paginaActual} de ${totalPaginas}`;
        document.getElementById('prevTrabajador').disabled = paginaActual === 1;
        document.getElementById('nextTrabajador').disabled = paginaActual === totalPaginas;

        const camposVisibles = document.getElementById('toggleAllCampos').textContent === 'Ocultar datos';
        if (camposVisibles) {
            document.querySelectorAll('.col-cedula, .col-rfc, .col-informacion').forEach(el => el.classList.remove('oculto'));
        }
    };

    // Eventos de la paginación
    document.getElementById('prevTrabajador').addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    });

    document.getElementById('nextTrabajador').addEventListener('click', () => {
        const totalPaginas = Math.ceil(todosLosTrabajadores.length / filasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    // Lógica para eliminar un trabajador
    tbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('borrar-btn')) {
            const id = e.target.getAttribute('data-id');

            if (confirm("¿Estás seguro de que deseas eliminar este trabajador?")) {
                try {
                    const response = await fetch(`${API_BASE}/trabajadores/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        alert("Trabajador eliminado correctamente");

                        const totalAntes = todosLosTrabajadores.length;
                        await cargarTrabajadores();

                        const nuevoTotalPaginas = Math.ceil((totalAntes - 1) / filasPorPagina);
                        if (paginaActual > nuevoTotalPaginas && paginaActual > 1) {
                            paginaActual = nuevoTotalPaginas;
                        }
                        renderizarTabla();
                    } else {
                        const errorData = await response.json();
                        alert("Error: " + (errorData.error || "No se pudo eliminar"));
                    }
                } catch (error) {
                    console.error("Error al eliminar:", error);
                    alert("Ocurrió un error al intentar eliminar.");
                }
            }
        }
    });

    cargarTrabajadores();
});