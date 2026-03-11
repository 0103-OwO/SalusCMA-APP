document.addEventListener('DOMContentLoaded', async () => {
    const preview = document.getElementById('img-preview-vision');
    const textarea = document.getElementById('textarea-vision');
    const inputId = document.getElementById('input-id-mision-vision');
    const fileInput = document.getElementById('input-img-vision');
    const form = document.getElementById('formVision');
    const mensaje = document.getElementById('mensajeVision');
    const btn = form.querySelector('button[type="submit"]');

    // 1. CARGAR DATOS ACTUALES
    try {
        const res = await fetch(`${API_BASE}/mvvh`);
        if (res.ok) {
            const data = await res.json();
            const info = Array.isArray(data) ? data[0] : data;
            if (info) {
                if (info.vision) textarea.value = info.vision;
                if (info.img_vision) preview.src = info.img_vision;
                if (info.id_mision_vision) inputId.value = info.id_mision_vision;
            }
        }
    } catch (error) { console.error("Error al cargar visión:", error); }

    // 2. PREVISUALIZACIÓN
    if (fileInput && preview) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) preview.src = URL.createObjectURL(this.files[0]);
        });
    }

    // 3. ENVÍO
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('vision', textarea.value);
            formData.append('id_mision_vision', inputId.value);
            if (fileInput.files[0]) formData.append('imagen', fileInput.files[0]);

            try {
                btn.disabled = true;
                mensaje.style.color = "blue";
                mensaje.innerText = "Actualizando visión...";

                const response = await fetch(`${API_BASE}/mvvh/update`, { method: 'PUT', body: formData });
                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Visión actualizada correctamente!";
                    setTimeout(() => location.reload(), 1500);
                } else { throw new Error("Error al guardar"); }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = "Error: " + error.message;
                btn.disabled = false;
            }
        });
    }
});