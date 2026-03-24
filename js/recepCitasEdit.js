document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formEditCita');
    const inputId = document.getElementById('input-id-cita');
    const inputFecha = document.getElementById('fecha');
    const inputHora = document.getElementById('hora');
    const mensaje = document.getElementById('mensajeEdit');
    const btnActualizar = document.getElementById('btnActualizar');
    const txtEstado = document.getElementById('txt-estado');

    const selPaciente = document.getElementById('select-paciente');
    const selMedico = document.getElementById('select-medico');
    const selConsultorio = document.getElementById('select-consultorio');

    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const idCita = urlParams.get('id_cita');

    if (!idCita) {
        alert("ID de cita no proporcionado.");
        window.location.href = 'recepcionistaCitaList.html';
        return;
    }

    const cargarDatosYCatalogos = async () => {
        try {
            const [resP, resM, resC, resCita] = await Promise.all([
                fetch(`${API_BASE}/pacientes`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/trabajadores/medicos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/consultorio`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/citas/${idCita}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!resCita.ok) throw new Error("No se pudo obtener los datos de la cita.");

            const pacientes = await resP.json();
            const medicos = await resM.json();
            const consultorios = await resC.json();
            const cita = await resCita.json();

            selPaciente.innerHTML = '<option value="" disabled>Seleccione un Paciente</option>';
            pacientes.forEach(p => {
                const isSelected = p.id_pacientes == cita.id_paciente ? 'selected' : '';
                selPaciente.innerHTML += `<option value="${p.id_pacientes}" ${isSelected}>${p.curp} - ${p.nombre}</option>`;
            });

            selMedico.innerHTML = '<option value="" disabled>Seleccione un Médico</option>';
            medicos.forEach(m => {
                const isSelected = m.id_trabajador == cita.id_medico ? 'selected' : '';
                selMedico.innerHTML += `<option value="${m.id_trabajador}" ${isSelected}>Dr. ${m.nombre} ${m.apellido_paterno}</option>`;
            });

            selConsultorio.innerHTML = '<option value="" disabled>Seleccione un Consultorio</option>';
            consultorios.forEach(c => {
                const isSelected = c.id_consultorio == cita.id_consultorio ? 'selected' : '';
                selConsultorio.innerHTML += `<option value="${c.id_consultorio}" ${isSelected}>${c.nombre}</option>`;
            });

            inputId.value = cita.id_cita;

            if (cita.fecha) {
                inputFecha.value = cita.fecha.split('T')[0];
            }
            inputHora.value = cita.hora;
            txtEstado.innerText = cita.estado || "N/A";

        } catch (error) {
            console.error(error);
            mensaje.style.color = "red";
            mensaje.innerText = "Error al cargar datos. Verifique su conexión o sesión.";
            selPaciente.innerHTML = '<option>Error al cargar</option>';
            selMedico.innerHTML = '<option>Error al cargar</option>';
            selConsultorio.innerHTML = '<option>Error al cargar</option>';
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