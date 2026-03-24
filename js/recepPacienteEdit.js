document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formPacienteEdit');
    const mensajeError = document.getElementById('mensajePacienteEdit');
    const checkH = document.getElementById('sexoH');
    const checkM = document.getElementById('sexoM');

    const params = new URLSearchParams(window.location.search);
    const idPaciente = params.get('id_pacientes');

    if (!idPaciente) {
        alert("ID no válido");
        window.location.href = 'recepcionistaPacienteList.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/pacientes/${idPaciente}`);
        if (!response.ok) throw new Error("No se pudo obtener el paciente");
        
        const pac = await response.json();

        document.getElementById('id_pacientes').value = pac.id_pacientes;
        document.getElementById('curp').value = pac.curp;
        document.getElementById('nombre').value = pac.nombre;
        document.getElementById('apellido_paterno').value = pac.apellido_paterno;
        document.getElementById('apellido_materno').value = pac.apellido_materno;
        document.getElementById('fecha_nacimiento').value = pac.fecha_nacimiento.split('T')[0];

        if (pac.sexo === 'H') checkH.checked = true;
        if (pac.sexo === 'M') checkM.checked = true;

    } catch (error) {
        console.error(error);
        alert("Error al cargar datos del paciente");
    }

    checkH.addEventListener('change', () => { if (checkH.checked) checkM.checked = false; });
    checkM.addEventListener('change', () => { if (checkM.checked) checkH.checked = false; });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        mensajeError.style.display = 'none';

        if (!checkH.checked && !checkM.checked) {
            mensajeError.innerText = "Seleccione el sexo.";
            mensajeError.style.display = 'block';
            return;
        }

        const datosActualizados = {
            curp: document.getElementById('curp').value.toUpperCase(),
            nombre: document.getElementById('nombre').value,
            apellido_paterno: document.getElementById('apellido_paterno').value,
            apellido_materno: document.getElementById('apellido_materno').value,
            sexo: checkH.checked ? 'H' : 'M',
            fecha_nacimiento: document.getElementById('fecha_nacimiento').value
        };

        try {
            const response = await fetch(`${API_BASE}/pacientes/${idPaciente}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            });

            if (response.ok) {
                alert("Datos personales actualizados con éxito");
                window.location.href = 'recepcionistaPacienteList.html';
            } else {
                const res = await response.json();
                mensajeError.innerText = res.msg || "Error al actualizar";
                mensajeError.style.display = 'block';
            }
        } catch (error) {
            alert("Error de conexión");
        }
    });

    document.getElementById('btnCancelar').onclick = () => {
        window.location.href = 'recepcionistaPacienteList.html';
    };
});