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
    let horariosGlobal = [];

    const hoy = new Date();
    const fechaMin = hoy.toISOString().split('T')[0];
    inputFecha.setAttribute('min', fechaMin);

    const cargarCatalogos = async () => {
        try {
            const [resP, resM, resC, resH] = await Promise.all([
                fetch(`${API_BASE}/pacientes/activos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/trabajadores/medicos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/consultorio`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/horarios`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            pacientesGlobal = await resP.json();
            medicosGlobal = await resM.json();
            consultoriosGlobal = await resC.json();
            horariosGlobal = await resH.json();

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
            mensaje.innerText = "Error al conectar con el servidor para cargar los datos.";
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
            console.log("¿Encontró coincidencia?", item); // DEBUG 1
            if (item) {
                hidden.value = item.id_pacientes || item.id_trabajador || item.id_consultorio;

                if (esMedico) {
                    const horario = horariosGlobal.find(h => h.id_trabajador == item.id_trabajador);
                    if (horario) {
                        const con = consultoriosGlobal.find(c => c.id_consultorio == horario.id_consultorio);
                        if (con) {
                            inpCon.value = con.nombre;
                            selConsultorio.value = con.id_consultorio;
                        }
                    }
                }
            } else {
                hidden.value = "";
            }
        });
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

        if (!selPaciente.value || !selMedico.value || !selConsultorio.value) {
            mensaje.style.color = "red";
            mensaje.innerText = "Seleccione opciones válidas de la lista.";
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