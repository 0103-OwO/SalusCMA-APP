document.addEventListener('DOMContentLoaded', async () => {
    const formHorario = document.getElementById('formHorario');
    const mensaje = document.getElementById('mensajeHorario');
    const selectMedico = document.getElementById('select-medico');
    const selectConsultorio = document.getElementById('select-consultorio');
    const btnGuardar = document.getElementById('btnGuardar');
    const token = localStorage.getItem('token');

    const cargarMedicos = async () => {
        try {
            const res = await fetch(`${API_BASE}/trabajadores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("No se pudieron cargar los médicos");
            const medicos = await res.json();
            selectMedico.innerHTML = '<option value="" disabled selected>Seleccione un médico</option>';
            medicos.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id_trabajador;
                opt.textContent = `${m.nombre} ${m.apellido_paterno} ${m.apellido_materno}`;
                selectMedico.appendChild(opt);
            });
        } catch (error) {
            console.error(error);
            mensaje.style.color = "red";
            mensaje.innerText = "Error al conectar con la lista de médicos.";
        }
    };
    const cargarConsultorios = async () => {
        try {
            const res = await fetch(`${API_BASE}/consultorios`, { // Asegúrate que esta ruta exista en tu API
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("No se pudieron cargar los consultorios");
            const consultorios = await res.json();
            selectConsultorio.innerHTML = '<option value="" disabled selected>Seleccione un consultorio</option>';
            consultorios.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id_consultorio;
                opt.textContent = c.nombre_consultorio || `Consultorio ${c.id_consultorio}`;
                selectConsultorio.appendChild(opt);
            });
        } catch (error) {
            console.error(error);
            if(selectConsultorio) selectConsultorio.innerHTML = '<option value="">Error al cargar</option>';
        }
    };
    await cargarConsultorios();
    await cargarMedicos();

    if (formHorario) {
        formHorario.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fInicio = document.getElementById('finicio').value;
            const fFin = document.getElementById('ffin').value;

            if (fInicio > fFin) {
                mensaje.style.color = "red";
                mensaje.innerText = "Error: La fecha de inicio no puede ser posterior a la fecha de fin.";
                return;
            }

            const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

            for (const dia of dias) {
                const hEntrada = document.getElementsByName(`${dia}_ent`)[0].value;
                const hSalida = document.getElementsByName(`${dia}_sal`)[0].value;

                if (hEntrada && hSalida) {
                    if (hEntrada >= hSalida) {
                        mensaje.style.color = "red";
                        mensaje.innerText = `Error en ${dia}: La hora de entrada debe ser menor a la hora de salida.`;
                        return;
                    }
                }
            }
            btnGuardar.disabled = true;
            mensaje.style.color = "blue";
            mensaje.innerText = "Procesando horario...";

            const formData = new FormData(formHorario);
            const datos = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE}/horarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(datos)
                });

                const resultado = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Horario registrado con éxito!";
                    setTimeout(() => {
                        window.location.href = 'adminHorarioList.html';
                    }, 1500);
                } else {
                    throw new Error(resultado.error || "Error al guardar el horario");
                }

            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
                btnGuardar.disabled = false;
                btnGuardar.innerText = "Guardar";
            }
        });
    }
});