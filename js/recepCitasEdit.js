document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formEditCita');
    const inputId = document.getElementById('input-id-cita');
    const inputFecha = document.getElementById('fecha');
    const inputHora = document.getElementById('hora');
    const mensaje = document.getElementById('mensajeEdit');
    const btnActualizar = document.getElementById('btnActualizar');
    
    const selPaciente = document.getElementById('select-paciente');
    const selMedico = document.getElementById('select-medico');
    const selConsultorio = document.getElementById('select-consultorio');

    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const idCita = urlParams.get('id_cita');

    const hoy = new Date();
    const fechaMin = hoy.toISOString().split('T')[0];
    inputFecha.setAttribute('min', fechaMin);

    const cargarDatosYCatalogos = async () => {
        try {
            const [resP, resM, resC, resCita] = await Promise.all([
                fetch(`${API_BASE}/pacientes`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/trabajadores/medicos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/consultorio`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/citas/${idCita}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const pacientes = await resP.json();
            const medicos = await resM.json();
            const consultorios = await resC.json();
            const cita = await resCita.json();

            selPaciente.innerHTML = '<option value="" disabled>Seleccione un Paciente</option>';
            pacientes.forEach(p => {
                const selected = p.id_pacientes == cita.id_paciente ? 'selected' : '';
                selPaciente.innerHTML += `<option value="${p.id_pacientes}" ${selected}>${p.curp} - ${p.nombre}</option>`;
            });

            selMedico.innerHTML = '<option value="" disabled>Seleccione un Médico</option>';
            medicos.forEach(m => {
                const selected = m.id_trabajador == cita.id_medico ? 'selected' : '';
                selMedico.innerHTML += `<option value="${m.id_trabajador}" ${selected}>Dr. ${m.nombre} ${m.apellido_paterno}</option>`;
            });

            selConsultorio.innerHTML = '<option value="" disabled>Seleccione un Consultorio</option>';
            consultorios.forEach(c => {
                const selected = c.id_consultorio == cita.id_consultorio ? 'selected' : '';
                selConsultorio.innerHTML += `<option value="${c.id_consultorio}" ${selected}>${c.nombre}</option>`;
            });

            inputId.value = cita.id_cita;
            inputFecha.value = cita.fecha;
            inputHora.value = cita.hora;

        } catch (error) {
            mensaje.innerText = "Error al cargar los datos de la cita.";
        }
    };

    cargarDatosYCatalogos();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        mensaje.innerText = "";

        const ahora = new Date();
        const citaDateTime = new Date(`${inputFecha.value}T${inputHora.value}`);

        if (citaDateTime < ahora) {
            mensaje.style.color = "red";
            mensaje.innerText = "No puedes reprogramar la cita a una fecha u hora pasada.";
            return;
        }

        btnActualizar.disabled = true;
        btnActualizar.innerText = "Guardando cambios...";

        const datos = {
            fecha: inputFecha.value,
            hora: inputHora.value,
            id_paciente: selPaciente.value,
            id_medico: selMedico.value,
            id_consultorio: selConsultorio.value
        };

        try {
            const response = await fetch(`${API_BASE}/citas/${idCita}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            const resData = await response.json();

            if (response.ok) {
                mensaje.style.color = "green";
                mensaje.innerText = "Cita actualizada correctamente.";
                setTimeout(() => window.location.href = 'recepcionistaCitaList.html', 1500);
            } else {
                throw new Error(resData.error || "Error al actualizar");
            }
        } catch (error) {
            mensaje.style.color = "red";
            mensaje.innerText = error.message;
            btnActualizar.disabled = false;
            btnActualizar.innerText = "Guardar";
        }
    });
});