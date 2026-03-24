document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formPaciente');
    const inputFecha = document.getElementById('fecha_nacimiento');
    const checkH = document.getElementById('sexoH');
    const checkM = document.getElementById('sexoM');
    const btnCancelar = document.getElementById('btnCancelar');
    const mensajeError = document.getElementById('mensajeError');

    if (inputFecha) {
        inputFecha.max = new Date().toISOString().split('T')[0];
    }

    checkH.addEventListener('change', () => {
        if (checkH.checked) checkM.checked = false;
    });

    checkM.addEventListener('change', () => {
        if (checkM.checked) checkH.checked = false;
    });

    btnCancelar.addEventListener('click', () => {
        window.location.href = 'recepcionistaPacienteList.html';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        mensajeError.style.display = 'none';
        mensajeError.innerText = '';

        if (!checkH.checked && !checkM.checked) {
            mensajeError.innerText = "Por favor, seleccione el sexo (H o M).";
            mensajeError.style.display = 'block';
            return;
        }

        const datosPaciente = {
            curp: document.getElementById('curp').value.toUpperCase().trim(),
            nombre: document.getElementById('nombre').value.trim(),
            apellido_paterno: document.getElementById('apellido_paterno').value.trim(),
            apellido_materno: document.getElementById('apellido_materno').value.trim(),
            sexo: checkH.checked ? 'H' : 'M',
            fecha_nacimiento: inputFecha.value,
            correo: document.getElementById('correo').value.trim(),
            usuario: document.getElementById('usuario').value.trim(),
            contrasena: document.getElementById('contrasena').value
        };

        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = "Registrando...";

            const response = await fetch(`${API_BASE}/pacientes`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosPaciente)
            });

            const resData = await response.json();

            if (response.ok) {
                alert("¡Paciente y cuenta de usuario registrados con éxito!");
                window.location.href = 'recepcionistaPacienteList.html';
            } else {
                mensajeError.innerText = resData.msg || "Ocurrió un error al procesar el registro.";
                mensajeError.style.display = 'block';
                
                submitBtn.disabled = false;
                submitBtn.innerText = "Guardar";
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
            alert("No se pudo conectar con el servidor. Verifique que la API esté corriendo.");
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerText = "Guardar";
        }
    });
});