document.addEventListener('DOMContentLoaded', async () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const idTrabajador = urlParams.get('id'); 

    if (!idTrabajador) {
        console.error("No se proporcionó un ID de trabajador");
        return;
    }

    const cargarDetallesPublicos = async () => {
        try {
            // Hacemos la petición al endpoint de detalles
            const res = await fetch(`${API_BASE}/trabajadores/${idTrabajador}`);
            
            if (!res.ok) throw new Error("Trabajador no encontrado");
            
            const tra = await res.json();

            //Carga los datos en la vista
            document.getElementById('nombre-trabajador').innerText = 
                `${tra.nombre} ${tra.apellido_paterno} ${tra.apellido_materno}`;

            const fotoImg = document.getElementById('foto-trabajador');
            fotoImg.src = tra.foto || ''; 
            fotoImg.alt = `Foto de ${tra.nombre}`;

            // Especialidad
            document.getElementById('especialidad-trabajador').innerText = 
                tra.especialidad || 'Especialidad no definida';

            // Correo 
            const correoLink = document.getElementById('correo-trabajador');
            correoLink.innerText = tra.correo;
            correoLink.href = `mailto:${tra.correo}`;

            // Teléfono 
            const telLink = document.getElementById('telefono-trabajador');
            telLink.innerText = tra.telefono;
            telLink.href = `tel:${tra.telefono}`;

            // Información Adicional / Resumen
            document.getElementById('informacion-trabajador').innerText = 
                tra.informacion || 'No hay información adicional disponible.';

        } catch (error) {
            console.error("Error:", error);
            // Opcional: Redirigir a una página 404 o mostrar mensaje de error
            document.querySelector('.contenedor-principal').innerHTML = 
                `<h2>El perfil del trabajador no está disponible.</h2>`;
        }
    };

    cargarDetallesPublicos();
});