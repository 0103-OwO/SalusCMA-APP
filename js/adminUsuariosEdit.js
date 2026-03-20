document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formEditUsuario');
    const mensaje = document.getElementById('mensajeEdit');
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
            // 1. Cargar trabajadores
            const resTrab = await fetch(`${API_BASE}/trabajador`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const trabajadores = await resTrab.json();
            
            selectTrabajador.innerHTML = '<option value="" disabled>-- Seleccione --</option>';
            trabajadores.forEach(t => {
                const option = document.createElement('option');
                option.value = t.id_trabajador;
                option.textContent = t.nombre;
                selectTrabajador.appendChild(option);
            });

            // 2. Cargar datos del usuario
            const resUser = await fetch(`${API_BASE}/usuario/${idUsuario}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resUser.ok) {
                const data = await resUser.json();
                document.getElementById('input-id-usuario').value = data.id_usuario;
                document.getElementById('usuario').value = data.usuario;
                document.getElementById('select-rol').value = data.id_rol;
                document.getElementById('select-trabajador').value = data.id_trabajador;
            } else {
                throw new Error("No se encontró el usuario");
            }
        } catch (error) {
            alert(error.message);
            window.location.href = 'adminUsuarioList.html';
        }
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnActualizar');
            btn.disabled = true;
            btn.innerText = "Actualizando...";

            // Solo enviamos los datos de identidad, la contraseña no se toca
            const updateData = {
                usuario: document.getElementById('usuario').value.trim(),
                id_rol: document.getElementById('select-rol').value,
                id_trabajador: document.getElementById('select-trabajador').value
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