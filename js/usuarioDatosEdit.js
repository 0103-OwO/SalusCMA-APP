document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formModificarDatos');
    const mensajeError = document.getElementById('mensajeModificar');
    const checkH = document.getElementById('sexoH');
    const checkM = document.getElementById('sexoM');
    const btnGuardar = document.getElementById('btnActualizar');
    const fechaInput = document.getElementById('fecha_nac');
    const token = localStorage.getItem('token');

    if (fechaInput) {
        fechaInput.max = new Date().toISOString().split('T')[0];
    }

    try {
        const response = await fetch(`${API_BASE}/pacientes/perfil`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("No se pudo obtener la información del perfil.");

        const pac = await response.json();

        document.getElementById('curp').value = pac.curp || '';
        document.getElementById('nombre').value = pac.nombre || '';
        document.getElementById('app').value = pac.apellido_paterno || '';
        document.getElementById('apm').value = pac.apellido_materno || '';
        document.getElementById('correo').value = pac.email || '';
        document.getElementById('usuario').value = pac.usuario || '';

        if (pac.fecha_nacimiento) {
            document.getElementById('fecha_nac').value = pac.fecha_nacimiento.split('T')[0];
        }

        if (pac.sexo === 'H') checkH.checked = true;
        else if (pac.sexo === 'M') checkM.checked = true;

    } catch (error) {
        mensajeError.style.display = 'block';
        mensajeError.style.color = "red";
        mensajeError.innerText = error.message;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        mensajeError.style.display = 'none';

        if (!checkH.checked && !checkM.checked) {
            mensajeError.style.color = "red";
            mensajeError.innerText = "Por favor, seleccione su sexo.";
            mensajeError.style.display = 'block';
            return;
        }

        const datosActualizados = {
            curp: document.getElementById('curp').value.toUpperCase().trim(),
            nombre: document.getElementById('nombre').value.trim(),
            apellido_paterno: document.getElementById('app').value.trim(),
            apellido_materno: document.getElementById('apm').value.trim(),
            sexo: checkH.checked ? 'H' : 'M',
            fecha_nacimiento: document.getElementById('fecha_nac').value,
            email: document.getElementById('correo').value.trim(),
            usuario: document.getElementById('usuario').value.trim()
        };

        try {
            btnGuardar.disabled = true;
            btnGuardar.innerText = "Guardando...";

            const response = await fetch(`${API_BASE}/pacientes/actualizar-perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosActualizados)
            });

            const resData = await response.json();

            if (response.ok) {
                mensajeError.style.color = "green";
                mensajeError.innerText = resData.msg || "Datos actualizados.";
                mensajeError.style.display = 'block';
                setTimeout(() => window.location.href = 'usuarioPrincipal.html', 1500);
            } else {
                throw new Error(resData.msg || "Error al actualizar.");
            }
        } catch (error) {
            mensajeError.style.color = "red";
            mensajeError.innerText = error.message;
            mensajeError.style.display = 'block';
            btnGuardar.disabled = false;
            btnGuardar.innerText = "Guardar Cambios";
        }
    });
});