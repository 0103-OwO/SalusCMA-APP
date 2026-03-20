document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formEditUsuario');
    const mensaje = document.getElementById('mensajeEdit');
    const selectRol = document.getElementById('select-rol'); // Agregado
    const selectTrabajador = document.getElementById('select-trabajador');
    const token = localStorage.getItem('token');

    const urlParams = new URLSearchParams(window.location.search);
    const idUsuario = urlParams.get('id_usuario');

    if (!idUsuario) {
        window.location.href = 'adminUsuarioList.html';
        return;
    }

    const inicializarDatos = async () => {
        try {
            // 1. Cargar ROLES desde la base de datos
            const resRoles = await fetch(`${API_BASE}/roles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const roles = await resRoles.json();
            
            selectRol.innerHTML = '<option value="" disabled>-- Seleccione Rol --</option>';
            // Filtramos del 7 al 9 igual que en el registro
            const rolesFiltrados = roles.filter(rol => rol.id_rol >= 7 && rol.id_rol <= 9);
            
            rolesFiltrados.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.id_rol;
                option.textContent = rol.nombre;
                selectRol.appendChild(option);
            });

            // 2. Cargar TRABAJADORES
            const resTrab = await fetch(`${API_BASE}/trabajadores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const trabajadores = await resTrab.json();
            
            selectTrabajador.innerHTML = '<option value="" disabled>-- Seleccione Trabajador --</option>';
            trabajadores.forEach(t => {
                const option = document.createElement('option');
                option.value = t.id_trabajador;
                option.textContent = `${t.nombre} ${t.apellido_paterno || ''}`;
                selectTrabajador.appendChild(option);
            });

            // 3. Cargar DATOS ACTUALES del usuario para rellenar el formulario
            const resUser = await fetch(`${API_BASE}/usuario/${idUsuario}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resUser.ok) {
                const data = await resUser.json();
                document.getElementById('input-id-usuario').value = data.id_usuario;
                document.getElementById('usuario').value = data.usuario;
                
                // IMPORTANTE: Asignamos los valores después de que los select se hayan llenado
                selectRol.value = data.id_rol;
                selectTrabajador.value = data.id_trabajador;
            } else {
                throw new Error("No se encontró el usuario");
            }
        } catch (error) {
            console.error(error);
            alert("Error al inicializar datos: " + error.message);
            window.location.href = 'adminUsuarioList.html';
        }
    };

    // Lógica del Submit (se mantiene igual, solo asegúrate de captar bien los valores)
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnActualizar');
            btn.disabled = true;
            btn.innerText = "Actualizando...";

            const updateData = {
                usuario: document.getElementById('usuario').value.trim(),
                id_rol: selectRol.value,
                id_trabajador: selectTrabajador.value
            };

            try {
                const response = await fetch(`${API_BASE}/usuario/${idUsuario}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updateData)
                });

                const resData = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Usuario actualizado con éxito!";
                    setTimeout(() => window.location.href = 'adminUsuarioList.html', 1500);
                } else {
                    throw new Error(resData.error || "Error al actualizar");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
                btn.disabled = false;
                btn.innerText = "Actualizar Cambios";
            }
        });
    }

    inicializarDatos();
});