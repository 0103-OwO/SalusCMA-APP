document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formEditEspecialidad');
    const inputNombre = document.getElementById('especialidad');
    const inputId = document.getElementById('input-id-especialidad');
    const mensaje = document.getElementById('mensajeEdit');
    const token = localStorage.getItem('token');

    //Proceso para obtener el ID de la especialidad desde la URL para cargar los datos correspondientes
    const urlParams = new URLSearchParams(window.location.search);
    const idEspecialidad = urlParams.get('id_especialidad'); 

    if (!idEspecialidad) {
        console.warn("No se encontró ID en la URL, regresando a la lista...");
        window.location.href = 'adminEspecialidadList.html';
        return;
    }

    //Obitenemos los datos de la especialidad para llenar el formulario
    try {
        const res = await fetch(`${API_BASE}/especialidades/${idEspecialidad}`);
        
        if (res.ok) {
            const data = await res.json();
            
            // Llenamos los campos del formulario
            if (inputNombre) inputNombre.value = data.especialidad;
            if (inputId) inputId.value = data.id_especialidad;
        } else {
            throw new Error("No se pudo obtener la información de la especialidad");
        }
    } catch (error) {
        console.error("Error al cargar:", error);
        alert("Error al cargar los datos. Regresando...");
        window.location.href = 'adminEspecialidadList.html';
        return;
    }

    //Proceso para actualizar la especialidad
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('btnActualizar');
            btn.disabled = true;
            btn.innerText = "Actualizando...";

            try {
                const response = await fetch(`${API_BASE}/especialidades/${idEspecialidad}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        especialidad: inputNombre.value.trim() 
                    })
                });

                const resData = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Actualizado con éxito!";
                    setTimeout(() => {
                        window.location.href = 'adminEspecialidadList.html';
                    }, 1500);
                } else {
                    throw new Error(resData.error || "Error al actualizar");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = "Error: " + error.message;
                btn.disabled = false;
                btn.innerText = "Guardar";
            }
        });
    }
});