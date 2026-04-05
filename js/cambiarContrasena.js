document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formCambiarContrasena');
    const mensajeCambio = document.getElementById('mensajeCambio');
    const token = localStorage.getItem('token');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        mensajeCambio.style.display = 'none';
        mensajeCambio.innerText = '';
        mensajeCambio.style.color = 'red';

        const conActual = form.conActual.value;
        const conNueva = form.conNueva.value;
        const conConfirmacion = form.conConfirmacion.value;

        if (conNueva !== conConfirmacion) {
            mensajeCambio.innerText = "La nueva contraseña y su confirmación no coinciden.";
            mensajeCambio.style.display = 'block';
            return;
        }
        if (conActual === conNueva) {
            mensajeCambio.innerText = "La nueva contraseña no puede ser igual a la anterior.";
            mensajeCambio.style.display = 'block';
            return;
        }

        const btnSubmit = form.querySelector('button[type="submit"]');

        try {
            btnSubmit.disabled = true;
            btnSubmit.innerText = "Actualizando...";

            const response = await fetch(`${API_BASE}/usuarios/cambiar-contrasena`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conActual,
                    conNueva
                })
            });

            const resData = await response.json();

            if (response.ok) {
                // Éxito
                mensajeCambio.style.color = "green";
                mensajeCambio.innerText = "¡Contraseña actualizada correctamente!";
                mensajeCambio.style.display = 'block';
                form.reset();
            } else {
                mensajeCambio.innerText = resData.msg || "Error al cambiar la contraseña.";
                mensajeCambio.style.display = 'block';
            }

        } catch (error) {
            console.error("Error en la conexión:", error);
            mensajeCambio.innerText = "Error de conexión con el servidor.";
            mensajeCambio.style.display = 'block';
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Confirmar";
        }
    });
});