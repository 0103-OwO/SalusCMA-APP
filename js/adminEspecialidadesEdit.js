document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formEditEspecialidad');
    const inputNombre = document.getElementById('especialidad');
    const inputId = document.getElementById('input-id-especialidad');
    const mensaje = document.getElementById('mensajeEdit');
    const token = localStorage.getItem('token');

    //Obtiene id
    const urlParams = new URLSearchParams(window.location.search);
    const idEspecialidad = urlParams.get('id');

    if (!idEspecialidad) {
        window.location.href = 'adminEspecialidadList.html';
        return;
    }

    //Carga los datos
    try {
        const res = await fetch(`${API_BASE}/especialidades/${idEspecialidad}`);
        if (res.ok) {
            const data = await res.json();
            inputNombre.value = data.especialidad;
            inputId.value = data.id_especialidad;
        }
    } catch (error) {
        console.error("Error al cargar:", error);
    }

    //Proceso de actualizar 
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const response = await fetch(`${API_BASE}/especialidades/${idEspecialidad}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ especialidad: inputNombre.value.trim() })
                });

                const data = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "Actualizado correctamente";
                    setTimeout(() => {
                        window.location.href = 'adminEspecialidadList.html';
                    }, 1500);
                } else {
                    throw new Error(data.error || "Error al actualizar");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
            }
        });
    }
});