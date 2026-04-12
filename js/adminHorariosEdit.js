document.addEventListener('DOMContentLoaded', async () => {
    const formEdit = document.getElementById('formEditHorario');
    const selectTrabajador = document.getElementById('select-trabajador');
    const selectConsultorio = document.getElementById('select-consultorio');
    const mensaje = document.getElementById('mensajeEdit');
    const btnActualizar = document.getElementById('btnActualizar');
    const token = localStorage.getItem('token');

    const urlParams = new URLSearchParams(window.location.search);
    const horarioId = urlParams.get('id');

    if (!horarioId) {
        mensaje.style.color = "red";
        mensaje.innerText = "ID de horario no proporcionado.";
        setTimeout(() => { window.location.href = 'adminHorarioList.html'; }, 2000);
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

            const resConsultorios = await fetch(`${API_BASE}/consultorio`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const consultorios = await resConsultorios.json();
            
            selectConsultorio.innerHTML = '<option value="" disabled>Seleccione un consultorio</option>';
            consultorios.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id_consultorio;
                opt.textContent = c.nombre_consultorio || `${c.nombre}`;
                selectConsultorio.appendChild(opt);
            });

            const resHorario = await fetch(`${API_BASE}/horarios/${horarioId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resHorario.json();

            if (resHorario.ok) {
                llenarFormulario(data);
            } else {
                throw new Error("No se pudo obtener la información del horario");
            }

        } catch (error) {
            console.error(error);
            mensaje.style.color = "red";
            mensaje.innerText = error.message;
        }
    };

    const llenarFormulario = (data) => {
        document.getElementById('input-id-horario').value = data.id_horario;
        if(data.fecha_inicio) document.getElementById('finicio').value = data.fecha_inicio.split('T')[0];
        if(data.fecha_fin) document.getElementById('ffin').value = data.fecha_fin.split('T')[0];
        
        selectTrabajador.value = data.id_trabajador;
        selectConsultorio.value = data.id_consultorio;

        const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
        dias.forEach(dia => {
            document.getElementById(`${dia}_ent`).value = data[`${dia}_ent`] || "";
            document.getElementById(`${dia}_sal`).value = data[`${dia}_sal`] || "";
        });
    };

    if (formEdit) {
        formEdit.addEventListener('submit', async (e) => {
            e.preventDefault();
            mensaje.innerText = "";

            const fInicio = document.getElementById('finicio').value;
            const fFin = document.getElementById('ffin').value;

            if (fInicio > fFin) {
                mensaje.style.color = "red";
                mensaje.innerText = "Error: La fecha de inicio no puede ser posterior a la fecha de fin.";
                return;
            }

            const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
            
            for (const dia of dias) {
                const hEntrada = document.getElementById(`${dia}_ent`).value;
                const hSalida = document.getElementById(`${dia}_sal`).value;

                if (hEntrada && hSalida) {
                    if (hEntrada >= hSalida) {
                        mensaje.style.color = "red";
                        mensaje.innerText = `Error en ${dia}: La hora de entrada debe ser menor a la hora de salida.`;
                        return; 
                    }
                } else if ((hEntrada && !hSalida) || (!hEntrada && hSalida)) {
                    mensaje.style.color = "red";
                    mensaje.innerText = `Error en ${dia}: Debe completar tanto entrada como salida.`;
                    return;
                }
            }
            
            btnActualizar.disabled = true;
            mensaje.style.color = "blue";
            mensaje.innerText = "Actualizando información...";

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

                const resultado = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Horario actualizado correctamente!";
                    
                    setTimeout(() => {
                        window.location.href = 'adminHorarioList.html';
                    }, 1500);
                } else {
                    throw new Error(resultado.error || "Error al actualizar el horario");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
                btnActualizar.disabled = false;
                console.error("Error:", error);
            }
        });
    }

    inicializarPagina();
});