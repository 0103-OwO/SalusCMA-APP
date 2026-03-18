document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formConsultorio');
    const mensaje = document.getElementById('mensajeConsultorio');
    const token = localStorage.getItem('token');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('btnGuardar');
            btn.disabled = true;
            btn.innerText = "Guardando...";

            const formData = {
                nombre: document.getElementById('nombre').value.trim(),
                area: document.getElementById('select-area').value,
                piso: document.getElementById('select-piso').value,
                descripcion: document.getElementById('descripcion').value.trim()
            };

            try {
                const response = await fetch(`${API_BASE}/consultorio`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                const resData = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Consultorio registrado con éxito!";
                    form.reset();
                    setTimeout(() => {
                        window.location.href = 'adminConsultorioList.html';
                    }, 1500);
                } else {
                    throw new Error(resData.error || "Error al registrar");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
                btn.disabled = false;
                btn.innerText = "Guardar";
            }
        });
    }
});