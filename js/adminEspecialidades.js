document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formEspecialidad');
    const mensaje = document.getElementById('mensajeEspecialidad');
    const btnGuardar = document.getElementById('btnGuardar');
    const token = localStorage.getItem('token');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const especialidad = document.getElementById('especialidad').value.trim();

            try {
                btnGuardar.disabled = true;
                mensaje.style.color = "blue";
                mensaje.innerText = "Procesando...";

                const response = await fetch(`${API_BASE}/especialidades`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ especialidad })
                });

                const data = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Especialidad agregada con éxito!";
                    setTimeout(() => {
                        window.location.href = 'adminEspecialidadList.html';
                    }, 1500);
                } else {
                    throw new Error(data.error || "Error al registrar");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
                btnGuardar.disabled = false;
            }
        });
    }
});