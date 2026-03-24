document.addEventListener('DOMContentLoaded', () => {
    const formHorario = document.getElementById('formHorario');
    const mensajeHorario = document.getElementById('mensajeHorario');
    const token = localStorage.getItem('token'); 
    
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