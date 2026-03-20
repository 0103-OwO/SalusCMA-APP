document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-usuarios');
    const token = localStorage.getItem('token');

    let paginaActual = 1;
    const filasPorPagina = 5;
    let todosLosUsuarios = [];

    // Carga los datos desde la API
    const cargarUsuarios = async () => {
        try {
            const res = await fetch(`${API_BASE}/usuarios`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            todosLosUsuarios = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    // Renderiza la tabla con paginación
    const renderizarTabla = () => {
        tbody.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginados = todosLosUsuarios.slice(inicio, fin);
        const totalPaginas = Math.ceil(todosLosUsuarios.length / filasPorPagina) || 1;

        paginados.forEach(u => {
            const tr = document.createElement('tr');
            tr.className = 'filaUsuario';
            tr.innerHTML = `
                <td>${u.usuario}</td>
                <td>${u.nombre_rol}</td>
                <td>${u.nombre_trabajador}</td>
                <td>
                    <button type="button" 
                        onclick="window.location.href='adminUsuarioEdit.html?id_usuario=${u.id_usuario}'">
                        Editar
                    </button>
                    <button type="button" class="borrar-btn" data-id="${u.id_usuario}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Actualiza indicadores de paginación
        document.getElementById('pagina-usuario').innerText = `Página ${paginaActual} de ${totalPaginas}`;
        document.getElementById('prevUsuario').disabled = paginaActual === 1;
        document.getElementById('nextUsuario').disabled = paginaActual === totalPaginas;
    };

    // Eventos de la paginación
    document.getElementById('prevUsuario').addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    });

    document.getElementById('nextUsuario').addEventListener('click', () => {
        const totalPaginas = Math.ceil(todosLosUsuarios.length / filasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    // Lógica para eliminar un usuario
    tbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('borrar-btn')) {
            const id = e.target.getAttribute('data-id');

            if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
                try {
                    const response = await fetch(`${API_BASE}/usuarios/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        alert("Usuario eliminado correctamente");
                        
                        const totalAntes = todosLosUsuarios.length;
                        await cargarUsuarios(); 
                        
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

    cargarUsuarios();
});