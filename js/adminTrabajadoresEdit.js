document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formEditTrabajador');
    const mensaje = document.getElementById('mensajeEdit');
    const selectEsp = document.getElementById('select-especialidad');
    const token = localStorage.getItem('token');

    // Obtener ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idTrabajador = urlParams.get('id_trabajador');

    if (!idTrabajador) {
        mensaje.innerText = "Error: No se proporcionó un ID de trabajador.";
        return;
    }

    //Función para cargar las especialidades 
    const cargarEspecialidades = async () => {
        try {
            const res = await fetch(`${API_BASE}/especialidades`);
            const especialidades = await res.json();
            selectEsp.innerHTML = '<option value="" disabled>Seleccione una especialidad</option>';
            especialidades.forEach(esp => {
                const option = document.createElement('option');
                option.value = esp.id_especialidad;
                option.textContent = esp.especialidad;
                selectEsp.appendChild(option);
            });
        } catch (error) {
            console.error("Error cargando especialidades:", error);
        }
    };

    //Función para cargar los datos del trabajador actual
    const cargarDatosTrabajador = async () => {
        try {
            // Esperamos a que las especialidades estén cargadas primero
            await cargarEspecialidades();

            const res = await fetch(`${API_BASE}/trabajadores/${idTrabajador}`);
            if (!res.ok) throw new Error("No se pudo obtener la información del trabajador");

            const tra = await res.json();

            // Rellenar los campos del formulario
            document.getElementById('input-id-trabajador').value = tra.id_trabajador;
            document.getElementById('nombre').value = tra.nombre;
            document.getElementById('cedula').value = tra.cedula;
            document.getElementById('rfc').value = tra.rfc;
            document.getElementById('correo').value = tra.correo;
            document.getElementById('informacion').value = tra.informacion;

            // Seleccionar la especialidad correcta en el combo
            selectEsp.value = tra.id_especialidad;

            // Mostrar la foto actual en la vista previa
            if (tra.foto) {
                document.getElementById('img-preview-foto').src = tra.foto;
            }

        } catch (error) {
            mensaje.style.color = "red";
            mensaje.innerText = "Error al cargar datos: " + error.message;
        }
    };

    // Ejecutar la carga inicial
    await cargarDatosTrabajador();

    //Lógica de actualizar trabajador
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.getElementById('btnActualizar');
            btn.disabled = true;
            btn.innerText = "Actualizando...";

            const formData = new FormData(form);

            try {
                const response = await fetch(`${API_BASE}/trabajadores/${idTrabajador}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData 
                });

                const resData = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Datos actualizados correctamente!";
                    setTimeout(() => {
                        window.location.href = 'adminTrabajadorList.html';
                    }, 1500);
                } else {
                    throw new Error(resData.error || "Error al actualizar");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
                btn.disabled = false;
                btn.innerText = "Actualizar Información";
            }
        });
    }
});