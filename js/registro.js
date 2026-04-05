document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formRegistro');
    const mensajeRegistro = document.getElementById('mensajeRegistro');
    const inputFecha = document.getElementById('fecha_nac');
    const checkH = document.getElementById('sexoH');
    const checkM = document.getElementById('sexoM');

    // 1. Limitar fecha de nacimiento a "hoy" como máximo
    if (inputFecha) {
        inputFecha.max = new Date().toISOString().split('T')[0];
    }

    // 2. Lógica de Checkboxes (Solo uno activo a la vez)
    checkH.addEventListener('change', () => { if (checkH.checked) checkM.checked = false; });
    checkM.addEventListener('change', () => { if (checkM.checked) checkH.checked = false; });

    // 3. Evento Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpiar mensajes previos
        mensajeRegistro.style.display = 'none';
        mensajeRegistro.innerText = '';
        mensajeRegistro.style.color = 'red';

        // Validar que se seleccionó un sexo
        if (!checkH.checked && !checkM.checked) {
            mensajeRegistro.innerText = "Por favor, seleccione su sexo (H o M).";
            mensajeRegistro.style.display = 'block';
            return;
        }

        // Mapeo de datos (Ajustado a los 'name' de tu HTML)
        const datosNuevoPaciente = {
            curp: form.curp.value.toUpperCase().trim(),
            nombre: form.nombre.value.trim(),
            apellido_paterno: form.app.value.trim(),
            apellido_materno: form.apm.value.trim(),
            sexo: checkH.checked ? 'H' : 'M',
            fecha_nacimiento: inputFecha.value,
            correo: form.correo.value.trim(),
            usuario: form.usuario.value.trim(),
            contrasena: form.contrasena.value
        };

        const btnSubmit = form.querySelector('button[type="submit"]');

        try {
            btnSubmit.disabled = true;
            btnSubmit.innerText = "Procesando registro...";

            // IMPORTANTE: Aquí la URL debe ser tu ruta pública de registro
            const response = await fetch(`${API_BASE}/pacientes/crear-public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosNuevoPaciente)
            });

            const resData = await response.json();

            if (response.ok) {
                mensajeRegistro.style.color = "green";
                mensajeRegistro.innerText = "¡Registro exitoso! Redirigiendo al inicio de sesión...";
                mensajeRegistro.style.display = 'block';

                setTimeout(() => {
                    window.location.href = 'loginn.html';
                }, 2000);
            } else {
                mensajeRegistro.innerText = resData.msg || "Error al registrarse.";
                mensajeRegistro.style.display = 'block';
                btnSubmit.disabled = false;
                btnSubmit.innerText = "Registrar";
            }

        } catch (error) {
            console.error("Error:", error);
            mensajeRegistro.innerText = "Error de conexión con el servidor.";
            mensajeRegistro.style.display = 'block';
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Registrar";
        }
    });
});