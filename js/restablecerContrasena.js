document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formRestablecer');
    const mensaje = document.getElementById('mensajeRestablecer');
    
    // 1. Capturar parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const token = params.get('token');
    const tipo = params.get('tipo');

    // 2. Validar que existan los datos necesarios, si no, redirigir
    if (!id || !token || !tipo) {
        alert('El enlace de recuperación es inválido o está incompleto.');
        window.location.href = 'recuperarContrasena.html';
        return;
    }

    // 3. Llenar los campos ocultos
    document.getElementById('userId').value = id;
    document.getElementById('userToken').value = token;
    document.getElementById('userTipo').value = tipo;

    // 4. Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevaPassword = document.getElementById('conNueva').value;
        const confirmacion = document.getElementById('conConfirmacion').value;

        // Validación de coincidencia en el cliente
        if (nuevaPassword !== confirmacion) {
            mensaje.style.color = "red";
            mensaje.textContent = "Las contraseñas no coinciden.";
            return;
        }

        mensaje.style.color = "blue";
        mensaje.textContent = "Actualizando contraseña...";

        try {
            const response = await fetch(`${API_BASE}/usuarios/restablecer-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id, 
                    token, 
                    tipo, 
                    nuevaPassword 
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('¡Contraseña actualizada con éxito!');
                window.location.href = 'loginn.html';
            } else {
                mensaje.style.color = "red";
                mensaje.textContent = data.error || "No se pudo restablecer la contraseña.";
            }
        } catch (error) {
            mensaje.style.color = "red";
            mensaje.textContent = "Error de conexión con el servidor.";
        }
    });
});