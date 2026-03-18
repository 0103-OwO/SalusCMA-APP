document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-consultorios');
    const token = localStorage.getItem('token');

    let paginaActual = 1;
    const filasPorPagina = 5;
    let todosLosConsultorios = [];

    // Carga los datos desde la API
    const cargarConsultorios = async () => {
        try {
            const res = await fetch(`${API_BASE}/consultorio`);
            todosLosConsultorios = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error("Error al obtener consultorios:", error);
        }
    };

    // Carga las tablas incluyendo la paginación
    const renderizarTabla = () => {
        tbody.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginados = todosLosConsultorios.slice(inicio, fin);
        const totalPaginas = Math.ceil(todosLosConsultorios.length / filasPorPagina) || 1;

        paginados.forEach(con => {
            const tr = document.createElement('tr');
            tr.className = 'filaConsultorio';
            tr.innerHTML = `
                <td>${con.nombre}</td>
                <td>${con.descripcion}</td>
                <td>${con.area}</td>
                <td>${con.piso}</td>
                <td>
                    <button type="button" 
                        onclick="window.location.href='adminConsultorioEdit.html?id_consultorio=${con.id_consultorio}'">
                        Editar
                    </button>
                    <button type="button" class="borrar-btn" data-id="${con.id_consultorio}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Actualiza la paginación
        document.getElementById('pagina-consultorio').innerText = `Página ${paginaActual} de ${totalPaginas}`;
        document.getElementById('prevConsultorio').disabled = paginaActual === 1;
        document.getElementById('nextConsultorio').disabled = paginaActual === totalPaginas;
    };

    // Eventos de la paginación
    document.getElementById('prevConsultorio').addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    });

    document.getElementById('nextConsultorio').addEventListener('click', () => {
        const totalPaginas = Math.ceil(todosLosConsultorios.length / filasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    // Lógica para la parte de eliminar un consultorio
    tbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('borrar-btn')) {
            const id = e.target.getAttribute('data-id');

            if (confirm("¿Estás seguro de que deseas eliminar este consultorio?")) {
                try {
                    const response = await fetch(`${API_BASE}/consultorio/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        alert("Consultorio eliminado correctamente");
                        
                        // Ajuste de página si se elimina el último elemento de una página
                        const totalAntes = todosLosConsultorios.length;
                        await cargarConsultorios(); 
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

    cargarConsultorios();
});