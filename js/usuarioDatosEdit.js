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
            document.getElementById('id_pacientes').value = p.id_pacientes;
            document.getElementById('curp').value = p.curp;
            document.getElementById('nombre').value = p.nombre;
            document.getElementById('app').value = p.apellido_paterno;
            document.getElementById('apm').value = p.apellido_materno;
            document.getElementById('correo').value = p.email;
            document.getElementById('usuario').value = p.usuario;

            if (p.sexo === 'H') document.getElementById('sexoH').checked = true;
            if (p.sexo === 'M') document.getElementById('sexoM').checked = true;

            if (p.fecha_nacimiento) {
                document.getElementById('fecha_nac').value = p.fecha_nacimiento.split('T')[0];
            }
        }
    } catch (error) {
        console.error("Error cargando perfil:", error);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const botonActivo = e.submitter;

        if (botonActivo.name === 'btnDesactivar') {
            const confirmar = confirm("¿Estás seguro de que deseas desactivar tu cuenta? No podrás iniciar sesión hasta que la reactives.");
            if (!confirmar) return;

            try {
                mensaje.style.color = "orange";
                mensaje.textContent = "Procesando desactivación...";
                botonActivo.disabled = true;

                const response = await fetch(`${API_BASE}/usuarios/desactivar`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();

                if (data.success) {
                    alert("Cuenta desactivada correctamente.");
                    localStorage.clear(); 
                    window.location.href = '../index.html';
                } else {
                    mensaje.style.color = "red";
                    mensaje.textContent = data.error || "No se pudo desactivar la cuenta.";
                    botonActivo.disabled = false;
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.textContent = "Error de conexión al desactivar.";
                botonActivo.disabled = false;
            }
            return; 
        }

        const btnGuardar = e.target.querySelector('button[name="btnActualizar"]');
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
            btnGuardar.disabled = true;

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
                mensaje.style.color = "green";
                mensaje.textContent = "¡Datos actualizados correctamente! Redirigiendo...";
                setTimeout(() => {
                    window.location.href = 'usuarioPrincipal.html';
                }, 2000);
            } else {
                mensaje.style.color = "red";
                mensaje.textContent = data.error || "No se pudo actualizar la información.";
                btnGuardar.disabled = false;
            }
        } catch (error) {
            mensaje.style.color = "red";
            mensaje.textContent = "Error de conexión con el servidor.";
            btnGuardar.disabled = false;
        }
    });
});