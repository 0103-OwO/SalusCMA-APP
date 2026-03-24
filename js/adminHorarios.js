document.addEventListener('DOMContentLoaded', async () => {
    const formHorario = document.getElementById('formHorario');
    const mensaje = document.getElementById('mensajeHorario'); // Usamos el ID de tu HTML
    const selectMedico = document.getElementById('select-medico');
    const btnGuardar = document.getElementById('btnGuardar');
    const token = localStorage.getItem('token');

    const cargarMedicos = async () => {
        try {
            const res = await fetch(`${API_BASE}/trabajadores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("No se pudieron cargar los médicos");

            const medicos = await res.json();
            selectMedico.innerHTML = '<option value="" disabled selected>Seleccione un médico</option>';

            medicos.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id_trabajador;
                opt.textContent = `${m.nombre} ${m.apellido_paterno} ${m.apellido_materno}`;
                selectMedico.appendChild(opt);
            });
        } catch (error) {
            console.error(error);
            mensaje.style.color = "red";
            mensaje.innerText = "Error al conectar con la lista de médicos.";
        }
    };

    await cargarMedicos();

    if (formHorario) {
        formHorario.addEventListener('submit', async (e) => {
            e.preventDefault();

            btnGuardar.disabled = true;
            mensaje.style.color = "blue";
            mensaje.innerText = "Procesando horario...";

            const formData = new FormData(formHorario);
            const datos = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE}/horarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(datos)
                });

                const resultado = await response.json();

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Horario registrado con éxito!";

                    setTimeout(() => {
                        window.location.href = 'adminHorarioList.html';
                    }, 1500);
                } else {
                    throw new Error(resultado.error || "Error al guardar el horario");
                }

            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
                btnGuardar.disabled = false; 
            }
        });
    }
});