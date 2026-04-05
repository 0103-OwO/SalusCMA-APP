document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const form = document.getElementById('formModificarDatos');
    const mensaje = document.getElementById('mensajeModificar');

    if (!token) {
        window.location.href = 'loginn.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/pacientes/perfil-paciente`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();

        if (result.success) {
            const p = result.datos;
            // Llenar inputs
            document.getElementById('id_pacientes').value = p.id_pacientes;
            document.getElementById('curp').value = p.curp;
            document.getElementById('nombre').value = p.nombre;
            document.getElementById('app').value = p.apellido_paterno;
            document.getElementById('apm').value = p.apellido_materno;
            document.getElementById('correo').value = p.email;
            document.getElementById('usuario').value = p.usuario;

            // Sexo (Radio buttons)
            if (p.sexo === 'H') document.getElementById('sexoH').checked = true;
            if (p.sexo === 'M') document.getElementById('sexoM').checked = true;

            // Fecha (Formato YYYY-MM-DD)
            if (p.fecha_nacimiento) {
                document.getElementById('fecha_nac').value = p.fecha_nacimiento.split('T')[0];
            }
        }
    } catch (error) {
        console.error("Error cargando perfil:", error);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = e.target.querySelector('button[type="submit"]');

        const sexoSeleccionado = document.querySelector('input[name="sexo"]:checked')?.value;

        const formData = {
            curp: document.getElementById('curp').value,
            nombre: document.getElementById('nombre').value,
            app: document.getElementById('app').value,
            apm: document.getElementById('apm').value,
            fecha_nac: document.getElementById('fecha_nac').value,
            correo: document.getElementById('correo').value,
            usuario: document.getElementById('usuario').value,
            sexo: sexoSeleccionado
        };
        try {
            mensaje.style.color = "blue";
            mensaje.textContent = "Validando y guardando cambios...";
            btn.disabled = true; // Evita múltiples clics

            const response = await fetch(`${API_BASE}/pacientes/actualizar-perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // ÉXITO: Mensaje en verde y redirección tras una pequeña pausa
                mensaje.style.color = "green";
                mensaje.textContent = "¡Datos actualizados correctamente! Redirigiendo...";

                setTimeout(() => {
                    window.location.href = 'usuarioPrincipal.html';
                }, 2000); // 2 segundos de pausa para que el usuario lea el mensaje

            } else {
                // ERROR DE VALIDACIÓN: (CURP en uso, Correo duplicado, etc.)
                mensaje.style.color = "red";
                mensaje.textContent = data.error || "No se pudo actualizar la información.";
                btn.disabled = false;
            }

        } catch (error) {
            // ERROR DE RED
            mensaje.style.color = "red";
            mensaje.textContent = "Error de conexión con el servidor. Intenta más tarde.";
            btn.disabled = false;
        }
    });
});