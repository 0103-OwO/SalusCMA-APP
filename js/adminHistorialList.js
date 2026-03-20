document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-historial');
    const token = localStorage.getItem('token');

    let paginaActual = 1;
    const filasPorPagina = 5;
    let todoElHistorial = [];

    const cargarHistorial = async () => {
        try {
            const res = await fetch(`${API_BASE}/historial`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json'
                }
            });

            if (res.status === 401) {
                window.location.href = 'login.html';
                return;
            }

            todoElHistorial = await res.json();
            renderizarTabla();
        } catch (error) {
            console.error("Error al obtener historial:", error);
        }
    };

    const renderizarTabla = () => {
        tbody.innerHTML = '';

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginados = todoElHistorial.slice(inicio, fin);
        const totalPaginas = Math.ceil(todoElHistorial.length / filasPorPagina) || 1;

        paginados.forEach(h => {
            const tr = document.createElement('tr');
            tr.className = 'filaHistorial';
            tr.innerHTML = `
                <td>${h.numero_cita}</td>
                <td>${h.id_paciente}</td>
                <td>${h.id_medico}</td>
                <td>${h.id_consultorio || 'N/A'}</td>
                <td>${h.fecha}</td>
                <td>${h.hora}</td>
                <td>${h.tension_arterial}</td>
                <td>${h.peso}kg</td>
                <td>${h.talla}cm</td>
                <td>${h.temperatura}°C</td>
                <td>${h.descripcion}</td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('pagina-historial').innerText = `Página ${paginaActual} de ${totalPaginas}`;
        document.getElementById('prevHistorial').disabled = paginaActual === 1;
        document.getElementById('nextHistorial').disabled = paginaActual === totalPaginas;
    };

    document.getElementById('prevHistorial').addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    });

    document.getElementById('nextHistorial').addEventListener('click', () => {
        const totalPaginas = Math.ceil(todoElHistorial.length / filasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    cargarHistorial();
});