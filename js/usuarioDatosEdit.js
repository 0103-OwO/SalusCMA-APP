document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formModificarDatos');
    const mensajeError = document.getElementById('mensajeModificar');
    const checkH = document.getElementById('sexoH');
    const checkM = document.getElementById('sexoM');
    const btnGuardar = form.querySelector('button[type="submit"]');
    const fechaInput = document.getElementById('fecha_nac');

    const token = localStorage.getItem('token');

    // 1. Restricción de fecha máxima
    if (fechaInput) {
        fechaInput.max = new Date().toISOString().split('T')[0];
    }

    // 2. Cargar los datos actuales del perfil del paciente
    try {
        const response = await fetch(`${API_BASE}/pacientes/perfil`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("No se pudo obtener el perfil");

        const pac = await response.json();

        // Llenar los campos del formulario
        document.getElementById('id_pacientes').value = pac.id_pacientes;
        document.getElementById('curp').value = pac.curp;
        document.getElementById('nombre').value = pac.nombre;
        document.getElementById('app').value = pac.apellido_paterno;
        document.getElementById('apm').value = pac.apellido_materno;
        document.getElementById('correo').value = pac.email;
        document.getElementById('usuario').value = pac.usuario;

        if (pac.fecha_nacimiento) {
            document.getElementById('fecha_nac').value = pac.fecha_nacimiento.split('T')[0];
        }

        if (pac.sexo === 'H') checkH.checked = true;
        if (pac.sexo === 'M') checkM.checked = true;

    } catch (error) {
        console.error(error);
        mensajeError.style.color = "red";
        mensajeError.innerText = "Error al cargar su información personal.";
        mensajeError.style.display = 'block';
    }

    // Lógica de checks para Sexo (comportamiento de Radio)
    checkH.addEventListener('change', () => { if (checkH.checked) checkM.checked = false; });
    checkM.addEventListener('change', () => { if (checkM.checked) checkH.checked = false; });

    // 3. Evento Submit para Guardar Cambios
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        mensajeError.style.display = 'none';
        mensajeError.innerText = '';

        if (!checkH.checked && !checkM.checked) {
            mensajeError.style.color = "red";
            mensajeError.innerText = "Por favor, seleccione su sexo.";
            mensajeError.style.display = 'block';
            return;
        }

        const idPaciente = document.getElementById('id_pacientes').value;

        const datosActualizados = {
            curp: document.getElementById('curp').value.toUpperCase().trim(),
            nombre: document.getElementById('nombre').value.trim(),
            apellido_paterno: document.getElementById('app').value.trim(),
            apellido_materno: document.getElementById('apm').value.trim(),
            sexo: checkH.checked ? 'H' : 'M',
            fecha_nacimiento: document.getElementById('fecha_nac').value,
            email: document.getElementById('correo').value.trim(),
            usuario: document.getElementById('usuario').value.trim()
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
                mensajeError.innerText = "Información actualizada con éxito.";
                mensajeError.style.display = 'block';

                setTimeout(() => {
                    window.location.href = 'usuarioPrincipal.html';
                }, 1500);

            } else {
                mensajeError.style.color = "red";
                mensajeError.innerText = resData.msg || "Error al actualizar la información.";
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
});