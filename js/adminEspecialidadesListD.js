document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-especialidades');
    const token = localStorage.getItem('token');

    let paginaActual = 1;
    const filasPorPagina = 5;
    let todasLasEspecialidades = [];

    //Carga los datos
    const cargarEspecialidades = async () => {
        try {
            const res = await fetch(`${API_BASE}/especialidades`);
            todasLasEspecialidades = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error("Error al obtener especialidades:", error);
        }
    };

    //Carga las tablas incluyendido la paginación
    const renderizarTabla = () => {
        tbody.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginadas = todasLasEspecialidades.slice(inicio, fin);
        const totalPaginas = Math.ceil(todasLasEspecialidades.length / filasPorPagina) || 1;

        paginadas.forEach(esp => {
            const tr = document.createElement('tr');
            tr.className = 'filaEspecialidad';
            tr.innerHTML = `
                <td>${esp.especialidad}</td>
                <td>
                    <button type="button" 
                        onclick="window.location.href='adminEspecialidadEdit.html?id_especialidad=${esp.id_especialidad}'">
                        Editar
                    </button>
                    <button type="button" class="borrar-btn" data-id="${esp.id_especialidad}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        //Actualiza la paginacion
        document.getElementById('pagina-especialidad').innerText = `Página ${paginaActual} de ${totalPaginas}`;
        document.getElementById('prevEspecialidad').disabled = paginaActual === 1;
        document.getElementById('nextEspecialidad').disabled = paginaActual === totalPaginas;
    };

    //Eventos de la paginación
    document.getElementById('prevEspecialidad').addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    });

    document.getElementById('nextEspecialidad').addEventListener('click', () => {
        const totalPaginas = Math.ceil(todasLasEspecialidades.length / filasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    //Logica para la parte de eliminar una especilidad
    tbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('borrar-btn')) {
            const id = e.target.getAttribute('data-id');

            if (confirm("¿Estás seguro de que deseas eliminar esta especialidad?")) {
                try {
                    const response = await fetch(`${API_BASE}/especialidades/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        alert("Especialidad eliminada correctamente");
                        cargarEspecialidades(); // Recargar datos
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

    cargarEspecialidades();
});