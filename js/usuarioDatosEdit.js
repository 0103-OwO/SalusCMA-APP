document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formModificarDatos');
    const mensaje = document.getElementById('mensajeModificar');
    const fechaInput = document.getElementById('fecha_nac');
    const token = localStorage.getItem('token');

    if (fechaInput) {
        fechaInput.max = new Date().toISOString().split('T')[0];
    }

    const cargarDatosActuales = async () => {
        try {
            const res = await fetch(`${API_BASE}/pacientes/perfil`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error("Error al obtener datos del perfil");

            const pac = await res.json();

            document.getElementById('id_pacientes').value = pac.id_pacientes;
            document.getElementById('curp').value = pac.curp;
            document.getElementById('nombre').value = pac.nombre;
            document.getElementById('app').value = pac.apellido_paterno;
            document.getElementById('apm').value = pac.apellido_materno;
            document.getElementById('sexo').value = pac.sexo || ""; // Nuevo campo
            document.getElementById('correo').value = pac.correo;
            document.getElementById('usuario').value = pac.usuario;

            if (pac.fecha_nacimiento) {
                document.getElementById('fecha_nac').value = pac.fecha_nacimiento.split('T')[0];
            }

        } catch (error) {
            console.error("Error al cargar perfil:", error);
            mensaje.innerText = "No se pudo cargar su información personal.";
        }
    };

    // 3. Evento para guardar los cambios
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        mensaje.innerText = "";

        const id = document.getElementById('id_pacientes').value;

        const datosActualizados = {
            curp: document.getElementById('curp').value,
            nombre: document.getElementById('nombre').value,
            apellido_paterno: document.getElementById('app').value,
            apellido_materno: document.getElementById('apm').value,
            sexo: document.getElementById('sexo').value, // Nuevo campo
            fecha_nacimiento: document.getElementById('fecha_nac').value,
            correo: document.getElementById('correo').value
        };

        try {
            const res = await fetch(`${API_BASE}/pacientes/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosActualizados)
            });

            const resultado = await res.json();

            if (res.ok) {
                alert("¡Datos actualizados con éxito!");
                window.location.href = 'usuarioPrincipal.html';
            } else {
                mensaje.innerText = resultado.msg || "Error al actualizar los datos.";
            }

        } catch (error) {
            console.error("Error en la petición:", error);
            mensaje.innerText = "Error de conexión con el servidor.";
        }
    });

    cargarDatosActuales();
});