document.addEventListener('DOMContentLoaded', async () => {
    const formEdit = document.getElementById('formEditHorario');
    const selectTrabajador = document.getElementById('select-trabajador');
    const mensajeEdit = document.getElementById('mensajeEdit');
    const token = localStorage.getItem('token');

    const urlParams = new URLSearchParams(window.location.search);
    const horarioId = urlParams.get('id');

    if (!horarioId) {
        alert("ID de horario no proporcionado");
        window.location.href = 'adminHorarioList.html';
        return;
    }

    const inicializarPagina = async () => {
        try {
            const resMedicos = await fetch(`${API_BASE}/trabajadores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const medicos = await resMedicos.json();
            
            selectTrabajador.innerHTML = '<option value="" disabled>Seleccione un trabajador</option>';
            medicos.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id_trabajador;
                opt.textContent = `${m.nombre} ${m.apellido_paterno} ${m.apellido_materno}`;
                selectTrabajador.appendChild(opt);
            });

            const resHorario = await fetch(`${API_BASE}/horarios/${horarioId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resHorario.json();

            if (resHorario.ok) {
                llenarFormulario(data);
            } else {
                throw new Error("No se pudo obtener el horario");
            }

        } catch (error) {
            console.error(error);
            mensajeEdit.innerText = "Error al cargar los datos.";
        }
    };

    const llenarFormulario = (data) => {
        document.getElementById('input-id-horario').value = data.id_horario;
        document.getElementById('finicio').value = data.fecha_inicio.split('T')[0];
        document.getElementById('ffin').value = data.fecha_fin.split('T')[0];
        selectTrabajador.value = data.id_trabajador;

        const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
        dias.forEach(dia => {
            document.getElementById(`${dia}_ent`).value = data[`${dia}_ent`] || "";
            document.getElementById(`${dia}_sal`).value = data[`${dia}_sal`] || "";
        });
    };

    formEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(formEdit);
        const datosActualizados = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE}/horarios/${horarioId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosActualizados)
            });

            if (response.ok) {
                alert("Horario actualizado correctamente");
                window.location.href = 'adminHorarioList.html';
            } else {
                const errorData = await response.json();
                mensajeEdit.innerText = errorData.error || "Error al actualizar";
            }
        } catch (error) {
            console.error("Error:", error);
            mensajeEdit.innerText = "Error de conexión con el servidor.";
        }
    });

    inicializarPagina();
});