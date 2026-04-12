document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formCita');
    const inputFecha = document.getElementById('fecha');
    const inputHora = document.getElementById('hora'); 
    const mensaje = document.getElementById('mensajeCita');
    const btnGuardar = document.getElementById('btnGuardar');

    const selPaciente = document.getElementById('select-paciente');
    const selMedico = document.getElementById('select-medico');
    const selConsultorio = document.getElementById('select-consultorio');

    const inpPac = document.getElementById('input-paciente');
    const inpMed = document.getElementById('input-medico');
    const inpCon = document.getElementById('input-consultorio');

    const token = localStorage.getItem('token');

    let pacientesGlobal = [];
    let medicosGlobal = [];
    let consultoriosGlobal = [];
    let asignacionesGlobal = [];

    const hoy = new Date();
    const fechaMin = hoy.toISOString().split('T')[0];
    inputFecha.setAttribute('min', fechaMin);

    const generarOpcionesHora = () => {
        if (!inputHora) return;
        inputHora.innerHTML = '<option value="">Seleccione una hora</option>';
        for (let h = 7; h <= 21; h++) {
            const horaPad = h < 10 ? `0${h}` : h;
            const opt0 = document.createElement('option');
            opt0.value = `${horaPad}:00`;
            opt0.textContent = `${horaPad}:00`;
            inputHora.appendChild(opt0);

            if (h < 21) {
                const opt3 = document.createElement('option');
                opt3.value = `${horaPad}:30`;
                opt3.textContent = `${horaPad}:30`;
                inputHora.appendChild(opt3);
            }
        }
    };
    generarOpcionesHora();

    const cargarCatalogos = async () => {
        try {
            const [resP, resM, resC, resA] = await Promise.all([
                fetch(`${API_BASE}/pacientes/activos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/trabajadores/medicos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/consultorio`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/horarios/activas`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            pacientesGlobal = await resP.json();
            medicosGlobal = await resM.json();
            consultoriosGlobal = await resC.json();
            asignacionesGlobal = await resA.json();

            document.getElementById('lista-pacientes').innerHTML = pacientesGlobal.map(p =>
                `<option value="${p.curp} - ${p.nombre} ${p.apellido_paterno}">`
            ).join('');

            document.getElementById('lista-medicos').innerHTML = medicosGlobal.map(m =>
                `<option value="Dr(a). ${m.nombre} ${m.apellido_paterno}">`
            ).join('');

            document.getElementById('lista-consultorios').innerHTML = consultoriosGlobal.map(c =>
                `<option value="${c.nombre}">`
            ).join('');

            configurarBuscador(inpPac, selPaciente, pacientesGlobal);
            configurarBuscador(inpMed, selMedico, medicosGlobal, true);
            configurarBuscador(inpCon, selConsultorio, consultoriosGlobal);

        } catch (error) {
            mensaje.style.color = "red";
            mensaje.innerText = "Error al conectar con el servidor.";
            console.error(error);
        }
    };

    const configurarBuscador = (input, hidden, data, esMedico = false) => {
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

    cargarCatalogos();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        mensaje.innerText = "";

        if (!selPaciente.value || !selMedico.value || !selConsultorio.value) {
            mensaje.style.color = "red";
            mensaje.innerText = "Seleccione opciones válidas de la lista.";
            return;
        }

        btnGuardar.disabled = true;
        btnGuardar.innerText = "Guardando...";

        const datos = {
            fecha: inputFecha.value,
            hora: inputHora.value,
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