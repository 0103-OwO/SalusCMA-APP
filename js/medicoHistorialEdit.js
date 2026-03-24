document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formActualizarHistorial');
    const mensaje = document.getElementById('mensajeEdit');
    const btnActualizar = document.getElementById('btnActualizar');
    const token = localStorage.getItem('token');

    const params = new URLSearchParams(window.location.search);
    const idHistorial = params.get('id_historial');

    if (!idHistorial) {
        window.location.href = 'medicoHistorialList.html';
        return;
    }

    const cargarDatos = async () => {
        try {
            const response = await fetch(`${API_BASE}/historial/${idHistorial}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("No se pudo obtener el historial");

            const h = await response.json();

            document.getElementById('input-id-historial').value = h.id_historial;

            document.getElementById('input-tension').value = h.tension_arterial;
            document.getElementById('input-peso').value = h.peso;
            document.getElementById('input-talla').value = h.talla;
            document.getElementById('input-temperatura').value = h.temperatura;
            document.getElementById('textarea-descripcion').value = h.descripcion;
        } catch (error) {
            mensaje.style.color = "red";
            mensaje.innerText = "Error al cargar los datos del registro";
        }
    };

    await cargarDatos();

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            btnActualizar.disabled = true;
            btnActualizar.innerText = "Actualizando...";
            mensaje.innerText = "";

            const datosActualizados = {
                tension_arterial: document.getElementById('input-tension').value,
                peso: document.getElementById('input-peso').value,
                talla: document.getElementById('input-talla').value,
                temperatura: document.getElementById('input-temperatura').value,
                descripcion: document.getElementById('textarea-descripcion').value
            };

            try {
                const response = await fetch(`${API_BASE}/historial/${idHistorial}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosActualizados)
                });

                const resData = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Historial actualizado con éxito!";
                    setTimeout(() => {
                        window.location.href = 'medicoHistorialList.html';
                    }, 1500);
                } else {
                    throw new Error(resData.error || "Error al actualizar");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
                btnActualizar.disabled = false;
                btnActualizar.innerText = "Actualizar";
            }
        });
    }
});