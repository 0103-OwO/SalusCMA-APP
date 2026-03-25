document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formPacienteEdit');
    const mensajeError = document.getElementById('mensajePacienteEdit');
    const checkH = document.getElementById('sexoH');
    const checkM = document.getElementById('sexoM');
    const btnGuardar = form.querySelector('button[type="submit"]');

    const token = localStorage.getItem('token');
    const params = new URLSearchParams(window.location.search);
    const idPaciente = params.get('id_pacientes');

    if (!idPaciente) {
        alert("ID no válido");
        window.location.href = 'recepcionistaPacienteList.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/pacientes/${idPaciente}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("No se pudo obtener el paciente");

        const pac = await response.json();

        document.getElementById('id_pacientes').value = pac.id_pacientes;
        document.getElementById('curp').value = pac.curp;
        document.getElementById('nombre').value = pac.nombre;
        document.getElementById('apellido_paterno').value = pac.apellido_paterno;
        document.getElementById('apellido_materno').value = pac.apellido_materno;

        if (pac.fecha_nacimiento) {
            document.getElementById('fecha_nacimiento').value = pac.fecha_nacimiento.split('T')[0];
        }

        if (pac.sexo === 'H') checkH.checked = true;
        if (pac.sexo === 'M') checkM.checked = true;

    } catch (error) {
        console.error(error);
        mensajeError.style.color = "red";
        mensajeError.innerText = "Error al cargar datos del paciente.";
        mensajeError.style.display = 'block';
    }

    checkH.addEventListener('change', () => { if (checkH.checked) checkM.checked = false; });
    checkM.addEventListener('change', () => { if (checkM.checked) checkH.checked = false; });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        mensajeError.style.display = 'none';
        mensajeError.innerText = '';

        if (!checkH.checked && !checkM.checked) {
            mensajeError.style.color = "red";
            mensajeError.innerText = "Seleccione el sexo.";
            mensajeError.style.display = 'block';
            return;
        }

        const datosActualizados = {
            curp: document.getElementById('curp').value.toUpperCase().trim(),
            nombre: document.getElementById('nombre').value.trim(),
            apellido_paterno: document.getElementById('apellido_paterno').value.trim(),
            apellido_materno: document.getElementById('apellido_materno').value.trim(),
            sexo: checkH.checked ? 'H' : 'M',
            fecha_nacimiento: document.getElementById('fecha_nacimiento').value
        };

        try {
            btnGuardar.disabled = true;
            btnGuardar.innerText = "Guardando...";

            const response = await fetch(`${API_BASE}/pacientes/${idPaciente}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosActualizados)
            });

            const resData = await response.json();

            if (response.ok) {
                mensajeError.style.color = "green";
                mensajeError.innerText = "Datos personales actualizados con éxito.";
                mensajeError.style.display = 'block';

                setTimeout(() => {
                    window.location.href = 'recepcionistaPacienteList.html';
                }, 1500);

            } else {
                mensajeError.style.color = "red";
                mensajeError.innerText = resData.msg || "Error al actualizar";
                mensajeError.style.display = 'block';

                btnGuardar.disabled = false;
                btnGuardar.innerText = "Guardar Cambios";
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
            mensajeError.style.color = "red";
            mensajeError.innerText = "Error de conexión con el servidor.";
            mensajeError.style.display = 'block';

            btnGuardar.disabled = false;
            btnGuardar.innerText = "Guardar Cambios";
        }
    });

    document.getElementById('btnCancelar').onclick = (e) => {
        e.preventDefault();
        window.location.href = 'recepcionistaPacienteList.html';
    };
});