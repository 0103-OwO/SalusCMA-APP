document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formUsuario');
    const mensaje = document.getElementById('mensajeUsuario');
    const selectRol = document.getElementById('select-rol');
    const selectTrabajador = document.getElementById('select-trabajador');
    const token = localStorage.getItem('token');

    const cargarRoles = async () => {
        try {
            const res = await fetch(`${API_BASE}/roles`,{
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const roles = await res.json();
            
            selectRol.innerHTML = '<option value="" disabled selected>-- Seleccione un rol --</option>';
            roles.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.id_rol;
                option.textContent = rol.nombre; 
                selectRol.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar roles:", error);
        }
    };

    const cargarTrabajadores = async () => {
        try {
            const res = await fetch(`${API_BASE}/trabajadores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const trabajadores = await res.json();
            
            selectTrabajador.innerHTML = '<option value="" disabled selected>-- Seleccione trabajador --</option>';
            trabajadores.forEach(t => {
                const option = document.createElement('option');
                option.value = t.id_trabajador;
                option.textContent = `${t.nombre} ${t.apellido_paterno}`;
                selectTrabajador.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar trabajadores:", error);
            selectTrabajador.innerHTML = '<option value="" disabled>Error al cargar</option>';
        }
    };

    // Ejecutar cargas
    cargarRoles();
    cargarTrabajadores();

    //Lógica para guardar el usuario
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnGuardar');
            btn.disabled = true;
            btn.innerText = "Guardando...";

            // Convertimos los datos del formulario a JSON (no FormData, porque no hay archivos)
            const data = {
                usuario: document.getElementById('nombre-usuario').value,
                contrasena: document.getElementById('password').value,
                id_rol: selectRol.value,
                id_trabajador: selectTrabajador.value
            };

            try {
                const response = await fetch(`${API_BASE}/usuarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                const resData = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Usuario registrado con éxito!";
                    form.reset();
                    setTimeout(() => window.location.href = 'adminUsuarioList.html', 1500);
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