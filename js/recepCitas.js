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

    const inpPac = document.getElementById('input-paciente');
    const inpMed = document.getElementById('input-medico');
    const inpCon = document.getElementById('input-consultorio');

    let listaMedicos = [];
    let listaPacientes = [];
    let listaConsultorios = [];

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

            listaPacientes = await resP.json();
            listaMedicos = await resM.json();
            listaConsultorios = await resC.json();
            const cita = await resCita.json();

            document.getElementById('lista-pacientes').innerHTML = listaPacientes.map(p => `<option value="${p.curp} - ${p.nombre} ${p.apellido_paterno}">`).join('');
            document.getElementById('lista-medicos').innerHTML = listaMedicos.map(m => `<option value="Dr(a). ${m.nombre} ${m.apellido_paterno}">`).join('');
            document.getElementById('lista-consultorios').innerHTML = listaConsultorios.map(c => `<option value="${c.nombre}">`).join('');

            const pacActual = listaPacientes.find(p => p.id_pacientes == cita.id_paciente);
            if (pacActual) {
                inpPac.value = `${pacActual.curp} - ${pacActual.nombre} ${pacActual.apellido_paterno}`;
                selPaciente.value = pacActual.id_pacientes;
            }

            const medActual = listaMedicos.find(m => m.id_trabajador == cita.id_medico);
            if (medActual) {
                inpMed.value = `Dr(a). ${medActual.nombre} ${medActual.apellido_paterno}`;
                selMedico.value = medActual.id_trabajador;
            }

            const conActual = listaConsultorios.find(c => c.id_consultorio == cita.id_consultorio);
            if (conActual) {
                inpCon.value = conActual.nombre;
                selConsultorio.value = conActual.id_consultorio;
            }

            inputId.value = cita.id_cita;
            if (cita.fecha) inputFecha.value = cita.fecha.split('T')[0];
            inputHora.value = cita.hora;
            txtEstado.innerText = cita.estado || "N/A";

        } catch (error) {
            console.error(error);
            mensaje.style.color = "red";
            mensaje.innerText = "Error al cargar datos.";
        }
    };

    const vincularBuscador = (inputVisual, hiddenId, dataArray, esMedico = false) => {
        inputVisual.addEventListener('input', (e) => {
            const texto = e.target.value;
            const encontrado = dataArray.find(item => {
                const etiqueta = item.curp ? `${item.curp} - ${item.nombre} ${item.apellido_paterno}` : 
                                 (item.id_trabajador ? `Dr(a). ${item.nombre} ${item.apellido_paterno}` : item.nombre);
                return etiqueta === texto;
            });

            if (encontrado) {
                hiddenId.value = encontrado.id_pacientes || encontrado.id_trabajador || encontrado.id_consultorio;
                if (esMedico && encontrado.id_consultorio) {
                    const con = listaConsultorios.find(c => c.id_consultorio == encontrado.id_consultorio);
                    if (con) {
                        inpCon.value = con.nombre;
                        selConsultorio.value = con.id_consultorio;
                    }
                }
            } else {
                hiddenId.value = "";
            }
        });
    };

    vincularBuscador(inpPac, selPaciente, listaPacientes);
    vincularBuscador(inpMed, selMedico, listaMedicos, true);
    vincularBuscador(inpCon, selConsultorio, listaConsultorios);

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

        if (!selPaciente.value || !selMedico.value || !selConsultorio.value) {
            mensaje.style.color = "red";
            mensaje.innerText = "Por favor, seleccione elementos válidos de la lista.";
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