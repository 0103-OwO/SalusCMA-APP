document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formUsuario');
    const mensaje = document.getElementById('mensajeUsuario');
    const selectTrabajador = document.getElementById('select-trabajador');
    const token = localStorage.getItem('token');

    // 1. Cargar la lista de trabajadores para el select
    const cargarTrabajadores = async () => {
        try {
            const res = await fetch(`${API_BASE}/trabajadores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const trabajadores = await res.json();
            
            selectTrabajador.innerHTML = '<option value="" disabled selected>-- Seleccione un trabajador --</option>';
            trabajadores.forEach(t => {
                const option = document.createElement('option');
                option.value = t.id_trabajador;
                option.textContent = t.nombre; 
                selectTrabajador.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar trabajadores:", error);
            selectTrabajador.innerHTML = '<option value="" disabled>Error al cargar datos</option>';
        }
    };

    // Manejar el envío del formulario
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('btnGuardar');
            btn.disabled = true;
            btn.innerText = "Guardando...";

            const formData = {
                usuario: document.getElementById('nombre-usuario').value.trim(),
                contrasena: document.getElementById('password').value,
                id_rol: document.getElementById('select-rol').value,
                id_trabajador: document.getElementById('select-trabajador').value
            };

            try {
                const response = await fetch(`${API_BASE}/usuarios`, {
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
                    mensaje.innerText = "¡Usuario registrado con éxito!";
                    form.reset();
                    setTimeout(() => {
                        window.location.href = 'adminUsuarioList.html';
                    }, 1500);
                } else {
                    // Aquí capturamos los errores del TRIGGER (SIGNAL SQLSTATE)
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

    cargarTrabajadores();
});