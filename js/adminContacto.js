document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formContacto');
    const mensaje = document.getElementById('mensajeContacto');
    const btn = document.getElementById('btnActualizar');

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_BASE}/contacto`);
        if (res.ok) {
            const info = await res.json();
            if (info) {
                if (document.getElementById('direccion')) document.getElementById('direccion').value = info.direccion || '';
                if (document.getElementById('correo')) document.getElementById('correo').value = info.correo || '';
                if (document.getElementById('telefono')) document.getElementById('telefono').value = info.telefono || '';
            }
        }
    } catch (err) {
        console.error("Error al cargar contacto:", err);
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                id_contacto: 1,
                direccion: document.getElementById('direccion').value,
                correo: document.getElementById('correo').value,
                telefono: document.getElementById('telefono').value
            };

            try {
                if (btn) {
                    btn.disabled = true;
                    btn.innerText = "Guardando...";
                }

                mensaje.style.color = "blue";
                mensaje.innerText = "Actualizando información de contacto...";

                const response = await fetch(`${API_BASE}/contacto/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Contacto actualizado correctamente!";
                    setTimeout(() => { window.location.reload(); }, 1500);
                }
                else if (response.status === 401) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Sesión expirada. Inicia sesión de nuevo.");
                }
                else {
                    throw new Error("Error en el servidor");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = "Error: " + error.message;
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = "Guardar";
                }
            }
        });
    }
});