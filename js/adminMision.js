document.addEventListener('DOMContentLoaded', async () => {
    const preview = document.getElementById('img-preview-mision');
    const textarea = document.getElementById('textarea-mision');
    const inputId = document.getElementById('input-id-mision-vision');
    const fileInput = document.getElementById('img_mision');
    const form = document.getElementById('formMision');
    const mensaje = document.getElementById('mensajeMision');
    const btn = document.getElementById('btnActualizar');

    try {
        const res = await fetch(`${API_BASE}/mvvh`);
        if (res.ok) {
            const data = await res.json();
            const info = Array.isArray(data) ? data[0] : data;
            
            if (info) {
                if (info.mision) textarea.value = info.mision;
                if (info.img_mision) preview.src = info.img_mision;
                if (info.id_mision_vision) inputId.value = info.id_mision_vision;
            }
        }
    } catch (error) {
        console.error("Error al cargar misión:", error);
    }

    if (fileInput && preview) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                preview.src = URL.createObjectURL(this.files[0]);
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('mision', textarea.value);
            formData.append('id_mision_vision', inputId.value);
            if (fileInput.files[0]) {
                formData.append('imagen', fileInput.files[0]);
            }

            try {
                btn.disabled = true;
                btn.innerText = "Guardando...";
                mensaje.style.color = "blue";
                mensaje.innerText = "Actualizando misión...";

                const response = await fetch(`${API_BASE}/mvvh/update`, {
                    method: 'PUT',
                    body: formData
                });

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Misión actualizada correctamente!";
                    setTimeout(() => { window.location.reload(); }, 1500);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error al guardar");
                }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = "Error: " + error.message;
                btn.disabled = false;
                btn.innerText = "Guardar";
            }
        });
    }
});