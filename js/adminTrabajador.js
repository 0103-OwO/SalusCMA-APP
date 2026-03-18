document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formTrabajador');
    const mensaje = document.getElementById('mensajeTrabajador');
    const token = localStorage.getItem('token');
    const selectEspecialidad = document.getElementById('id_especialidad');

    const cargarEspecialidades = async () => {
        try {
            const response = await fetch(`${API_BASE}/especialidades`); 
            const especialidades = await response.json();

            selectEspecialidad.innerHTML = '<option value="" disabled selected>Seleccione una especialidad</option>';

            especialidades.forEach(esp => {
                const option = document.createElement('option');
                option.value = esp.id_especialidad;
                option.textContent = esp.especialidad;
                selectEspecialidad.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar especialidades:", error);
            mensaje.innerText = "Error al cargar el catálogo de especialidades";
        }
    };

    cargarEspecialidades();

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.getElementById('btnGuardar');
            btn.disabled = true;
            btn.innerText = "Guardando...";

            const formData = new FormData(form);

            try {
                const response = await fetch(`${API_BASE}/trabajadores`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const resData = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Trabajador registrado con éxito!";
                    form.reset();
                    setTimeout(() => {
                        window.location.href = 'adminTrabajadorList.html';
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