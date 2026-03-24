document.addEventListener('DOMContentLoaded', async () => { 
    const formHorario = document.getElementById('formHorario');
    const mensajeHorario = document.getElementById('mensajeHorario');
    const selectMedico = document.getElementById('select-medico'); 
    const token = localStorage.getItem('token');

    const cargarMedicos = async () => {
        try {
            const res = await fetch(`${API_BASE}/trabajadores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error al obtener trabajadores");

            const medicos = await res.json();

            selectMedico.innerHTML = '<option value="" disabled selected>Seleccione un médico</option>';

            medicos.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id_trabajador; 
                opt.textContent = `${m.nombre} ${m.apellido_paterno} ${m.apellido_materno}`;
                selectMedico.appendChild(opt);
            });
        } catch (error) {
            console.error("Error cargando médicos:", error);
            selectMedico.innerHTML = '<option value="" disabled>Error al cargar médicos</option>';
        }
    };

    await cargarMedicos();
    
    formHorario.addEventListener('submit', async (e) => {
        e.preventDefault();
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
                alert("Horario registrado exitosamente.");
                window.location.href = 'adminHorarioList.html';
            } else {
                mensajeHorario.innerText = resultado.error || "Error al guardar el horario";
            }

        } catch (error) {
            console.error("Error en la petición:", error);
            mensajeHorario.innerText = "No se pudo conectar con el servidor.";
        }
    });
});