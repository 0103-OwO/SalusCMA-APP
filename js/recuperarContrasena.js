document.getElementById('formRecuperarPass').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const mensaje = document.getElementById('mensajeRecuperacion');
    const correo = document.getElementById('emailRecuperacion').value;
    const btn = document.getElementById('btnEnviar');

    // Estado de carga
    mensaje.style.color = "blue";
    mensaje.textContent = "Procesando solicitud...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/usuarios/solicitar-recuperacion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo })
        });

        const data = await response.json();

        if (data.success) {
            mensaje.style.color = "green";
            mensaje.textContent = "Se ha enviado un enlace a tu correo.";
            e.target.reset(); // Limpia el formulario
        } else {
            mensaje.style.color = "red";
            mensaje.textContent = data.error || "El correo no está registrado.";
        }
    } catch (error) {
        mensaje.style.color = "red";
        mensaje.textContent = "Error de conexión con el servidor.";
    } finally {
        btn.disabled = false;
    }
});