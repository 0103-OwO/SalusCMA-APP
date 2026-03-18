document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formEditConsultorio');
    const mensaje = document.getElementById('mensajeEdit');
    const token = localStorage.getItem('token');

    // Obtener ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idConsultorio = urlParams.get('id_consultorio');

    if (!idConsultorio) {
        window.location.href = 'adminConsultorioList.html';
        return;
    }

    // 1. Cargar datos actuales del consultorio
    try {
        const res = await fetch(`${API_BASE}/consultorio/${idConsultorio}`);
        if (res.ok) {
            const data = await res.json();
            document.getElementById('input-id-consultorio').value = data.id_consultorio;
            document.getElementById('nombre').value = data.nombre;
            document.getElementById('select-area').value = data.area;
            document.getElementById('select-piso').value = data.piso;
            document.getElementById('descripcion').value = data.descripcion;
        } else {
            throw new Error("No se encontró el consultorio");
        }
    } catch (error) {
        alert(error.message);
        window.location.href = 'adminConsultorioList.html';
    }

    // 2. Procesar actualización
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnActualizar');
            btn.disabled = true;

            const updateData = {
                nombre: document.getElementById('nombre').value.trim(),
                area: document.getElementById('select-area').value,
                piso: document.getElementById('select-piso').value,
                descripcion: document.getElementById('descripcion').value.trim()
            };

            try {
                const response = await fetch(`${API_BASE}/consultorio/${idConsultorio}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Cambios guardados con éxito!";
                    setTimeout(() => window.location.href = 'adminConsultorioList.html', 1500);
                } else {
                    const errorJson = await response.json();
                    throw new Error(errorJson.error || "Error al actualizar");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
                btn.disabled = false;
            }
        });
    }
});