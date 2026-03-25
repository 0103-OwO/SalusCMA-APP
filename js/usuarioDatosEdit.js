document.addEventListener('DOMContentLoaded', async () => {
    const mensajeError = document.getElementById('mensajeModificar');
    const token = localStorage.getItem('token');
    const checkH = document.getElementById('sexoH');
    const checkM = document.getElementById('sexoM');

    try {
        const response = await fetch(`${API_BASE}/pacientes/perfil`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("Error al obtener los datos del servidor.");

        const pac = await response.json();

        // Mapeo de datos a los IDs de tu HTML
        document.getElementById('curp').value = pac.curp || '';
        document.getElementById('nombre').value = pac.nombre || '';
        document.getElementById('app').value = pac.apellido_paterno || '';
        document.getElementById('apm').value = pac.apellido_materno || '';
        document.getElementById('correo').value = pac.email || '';
        document.getElementById('usuario').value = pac.usuario || '';

        // Formatear fecha (YYYY-MM-DD) para el input type="date"
        if (pac.fecha_nacimiento) {
            document.getElementById('fecha_nac').value = pac.fecha_nacimiento.split('T')[0];
        }

        // Marcar el radio button correcto según el ENUM ('H', 'M')
        if (pac.sexo === 'H') {
            checkH.checked = true;
        } else if (pac.sexo === 'M') {
            checkM.checked = true;
        }

    } catch (error) {
        console.error(error);
        mensajeError.style.display = 'block';
        mensajeError.style.color = "red";
        mensajeError.innerText = "Fallo: " + error.message;
    }
});