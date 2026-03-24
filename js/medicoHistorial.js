document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formHistorial');
    const mensaje = document.getElementById('mensajeHistorial');
    const selectCita = document.getElementById('select-cita');
    const token = localStorage.getItem('token');
    const btnGuardar = form.querySelector('button[type="submit"]');

    const cargarCitasPendientes = async () => {
        try {
            const response = await fetch(`${API_BASE}/citas/mis-citas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const citas = await response.json();

            selectCita.innerHTML = '<option value="" disabled selected>Seleccione una cita</option>';
            citas.forEach(cita => {
                const option = document.createElement('option');
                option.value = cita.id_cita;
                option.textContent = `${cita.fecha} ${cita.hora} - ${cita.curp_paciente}`;
                selectCita.appendChild(option);
            });
        } catch (error) {
            mensaje.style.color = "red";
            mensaje.innerText = "Error al cargar citas pendientes";
        }
    };

    cargarCitasPendientes();

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            btnGuardar.disabled = true;
            btnGuardar.innerText = "Guardando...";
            mensaje.innerText = "";

            const datos = {
                id_cita: selectCita.value,
                tension: document.getElementById('input-tension').value,
                peso: document.getElementById('input-peso').value,
                talla: document.getElementById('input-talla').value,
                temperatura: document.getElementById('input-temperatura').value,
                descripcion: document.getElementById('textarea-descripcion').value
            };

            try {
                const response = await fetch(`${API_BASE}/historiales/registrar`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });

                const resData = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Historial registrado y cita finalizada!";
                    form.reset();
                    setTimeout(() => {
                        window.location.href = 'medicoHistorialList.html';
                    }, 1500);
                } else {
                    throw new Error(resData.error || "Error al registrar");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
                btnGuardar.disabled = false;
                btnGuardar.innerText = "Guardar";
            }
        });
    }
});