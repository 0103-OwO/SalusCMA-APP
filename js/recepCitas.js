document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formCita');
    const inputFecha = document.getElementById('fecha');
    const inputHora = document.getElementById('hora');
    const mensaje = document.getElementById('mensajeCita');
    const btnGuardar = document.getElementById('btnGuardar');
    
    const selPaciente = document.getElementById('select-paciente');
    const selMedico = document.getElementById('select-medico');
    const selConsultorio = document.getElementById('select-consultorio');

    const token = localStorage.getItem('token');

    const hoy = new Date();
    const fechaMin = hoy.toISOString().split('T')[0]; 
    inputFecha.setAttribute('min', fechaMin);

    const cargarCatalogos = async () => {
        try {
            const [resP, resM, resC] = await Promise.all([
                fetch(`${API_BASE}/pacientes/activos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/trabajadores/medicos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/consultorio`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const pacientes = await resP.json();
            const medicos = await resM.json();
            const consultorios = await resC.json();

            selPaciente.innerHTML = '<option value="" disabled selected>Seleccione un Paciente</option>';
            pacientes.forEach(p => {
                selPaciente.innerHTML += `<option value="${p.id_pacientes}">${p.curp} - ${p.nombre} ${p.apellido_paterno}</option>`;
            });

            selMedico.innerHTML = '<option value="" disabled selected>Seleccione un Médico</option>';
            medicos.forEach(m => {
                selMedico.innerHTML += `<option value="${m.id_trabajador}">Dr(a). ${m.nombre} ${m.apellido_paterno}</option>`;
            });

            selConsultorio.innerHTML = '<option value="" disabled selected>Seleccione un Consultorio</option>';
            consultorios.forEach(c => {
                selConsultorio.innerHTML += `<option value="${c.id_consultorio}">${c.nombre}</option>`;
            });

        } catch (error) {
            mensaje.style.color = "red";
            mensaje.innerText = "Error al conectar con el servidor para cargar los datos.";
            console.error(error);
        }
    };

    cargarCatalogos();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        mensaje.innerText = "";
        
        const fechaSel = inputFecha.value;
        const horaSel = inputHora.value;
        
        const ahora = new Date();
        const citaDateTime = new Date(`${fechaSel}T${horaSel}`);

        if (citaDateTime < ahora) {
            mensaje.style.color = "red";
            mensaje.innerText = "La cita no puede ser en el pasado (revisa la hora).";
            return;
        }

        btnGuardar.disabled = true;
        btnGuardar.innerText = "Validando disponibilidad...";

        const datos = {
            fecha: fechaSel,
            hora: horaSel,
            id_paciente: selPaciente.value,
            id_medico: selMedico.value,
            id_consultorio: selConsultorio.value
        };

        try {
            const response = await fetch(`${API_BASE}/citas`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            const resData = await response.json();

            if (response.ok) {
                mensaje.style.color = "green";
                mensaje.innerText = "¡Cita agendada con éxito!";
                setTimeout(() => window.location.href = 'recepcionistaCitaList.html', 1500);
            } else {
                throw new Error(resData.error || "Error al agendar");
            }
        } catch (error) {
            mensaje.style.color = "red";
            mensaje.innerText = error.message;
            btnGuardar.disabled = false;
            btnGuardar.innerText = "Guardar";
        }
    });
});