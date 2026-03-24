document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tbody-horarios');
    const token = localStorage.getItem('token');

    const cargarHorarios = async () => {
        try {
            const res = await fetch(`${API_BASE}/horarios/mi-horario`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error al obtener el horario");

            const horarios = await res.json();
            renderizarTabla(horarios);
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="4" style="color:red;">Error al cargar datos.</td></tr>`;
        }
    };

    const renderizarTabla = (horarios) => {
        tbody.innerHTML = '';

        horarios.forEach(h => {
            const dias = [
                { nombre: 'Lunes', ent: h.lunes_ent, sal: h.lunes_sal },
                { nombre: 'Martes', ent: h.martes_ent, sal: h.martes_sal },
                { nombre: 'Miércoles', ent: h.miercoles_ent, sal: h.miercoles_sal },
                { nombre: 'Jueves', ent: h.jueves_ent, sal: h.jueves_sal },
                { nombre: 'Viernes', ent: h.viernes_ent, sal: h.viernes_sal }
            ];

            dias.forEach(dia => {
                if (dia.ent && dia.sal) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${dia.nombre}</td>
                        <td>${dia.ent.slice(0, 5)} - ${dia.sal.slice(0, 5)}</td>
                        <td>${h.fecha_inicio}</td>
                        <td>${h.fecha_fin}</td>
                    `;
                    tbody.appendChild(tr);
                }
            });
        });

        if (tbody.innerHTML === '') {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay horarios activos.</td></tr>`;
        }
    };

    cargarHorarios();
});