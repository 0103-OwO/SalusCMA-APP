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

    const inpPac = document.getElementById('input-paciente');
    const inpMed = document.getElementById('input-medico');
    const inpCon = document.getElementById('input-consultorio');

    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const idCita = urlParams.get('id_cita');

    let listaPacientes = [];
    let listaMedicos = [];
    let listaConsultorios = [];
    let asignacionesGlobal = []; // Cambiado de listaHorarios a asignacionesGlobal

    if (!idCita) {
        alert("ID de cita no proporcionado.");
        window.location.href = 'recepcionistaCitaList.html';
        return;
    }

    const configurarBuscador = (input, hidden, data, esMedico = false) => {
        if (!input) return;
        input.addEventListener('input', (e) => {
            const valor = e.target.value;
            const item = data.find(i => {
                const label = i.curp ? `${i.curp} - ${i.nombre} ${i.apellido_paterno}` : 
                              (i.id_trabajador ? `Dr(a). ${i.nombre} ${i.apellido_paterno}` : i.nombre);
                return label === valor;
            });

            if (item) {
                hidden.value = item.id_pacientes || item.id_trabajador || item.id_consultorio;
                
                if (esMedico) {
                    // Usar la lógica del endpoint especializado
                    const asignacion = asignacionesGlobal.find(a => Number(a.id_trabajador) === Number(item.id_trabajador));
                    if (asignacion) {
                        inpCon.value = asignacion.nombre_consultorio;
                        selConsultorio.value = asignacion.id_consultorio;
                    }
                }
            } else {
                hidden.value = "";
                if (esMedico) {
                    inpCon.value = "";
                    selConsultorio.value = "";
                }
            }
        });
    };

    const cargarDatosYCatalogos = async () => {
        try {
            const [resP, resM, resC, resA, resCita] = await Promise.all([
                fetch(`${API_BASE}/pacientes`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/trabajadores/medicos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/consultorio`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/horarios/activas`, { headers: { 'Authorization': `Bearer ${token}` } }), // Nuevo endpoint
                fetch(`${API_BASE}/citas/${idCita}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            listaPacientes = await resP.json();
            listaMedicos = await resM.json();
            listaConsultorios = await resC.json();
            asignacionesGlobal = await resA.json();
            const cita = await resCita.json();

            document.getElementById('lista-pacientes').innerHTML = listaPacientes.map(p => 
                `<option value="${p.curp} - ${p.nombre} ${p.apellido_paterno}">`
            ).join('');
            document.getElementById('lista-medicos').innerHTML = listaMedicos.map(m => 
                `<option value="Dr(a). ${m.nombre} ${m.apellido_paterno}">`
            ).join('');
            document.getElementById('lista-consultorios').innerHTML = listaConsultorios.map(c => 
                `<option value="${c.nombre}">`
            ).join('');

            configurarBuscador(inpPac, selPaciente, listaPacientes);
            configurarBuscador(inpMed, selMedico, listaMedicos, true);
            configurarBuscador(inpCon, selConsultorio, listaConsultorios);

            if (cita) {
                const pac = listaPacientes.find(p => p.id_pacientes == cita.id_paciente);
                if (pac) {
                    inpPac.value = `${pac.curp} - ${pac.nombre} ${pac.apellido_paterno}`;
                    selPaciente.value = pac.id_pacientes;
                }

                const med = listaMedicos.find(m => m.id_trabajador == cita.id_medico);
                if (med) {
                    inpMed.value = `Dr(a). ${med.nombre} ${med.apellido_paterno}`;
                    selMedico.value = med.id_trabajador;
                }

                const con = listaConsultorios.find(c => c.id_consultorio == cita.id_consultorio);
                if (con) {
                    inpCon.value = con.nombre;
                    selConsultorio.value = con.id_consultorio;
                }

                inputId.value = cita.id_cita;
                inputFecha.value = cita.fecha ? cita.fecha.split('T')[0] : "";
                inputHora.value = cita.hora || "";
            }

        } catch (error) {
            console.error("Error detallado:", error);
            mensaje.style.color = "red";
            mensaje.innerText = "Error al recuperar los datos de la cita.";
        }
    };

    cargarDatosYCatalogos();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!selPaciente.value || !selMedico.value || !selConsultorio.value) {
            mensaje.style.color = "red";
            mensaje.innerText = "Seleccione opciones válidas de la lista.";
            return;
        }

        btnActualizar.disabled = true;
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
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                mensaje.style.color = "green";
                mensaje.innerText = "Actualizado con éxito.";
                setTimeout(() => window.location.href = 'recepcionistaCitaList.html', 1500);
            } else {
                const err = await response.json();
                throw new Error(err.error || "Error al actualizar");
            }
        } catch (error) {
            mensaje.style.color = "red";
            mensaje.innerText = error.message;
            btnActualizar.disabled = false;
        }
    });
});