document.addEventListener('DOMContentLoaded', async () => {
    const preview = document.getElementById('img-preview-valores');
    const textarea = document.getElementById('textarea-valores');
    const inputId = document.getElementById('input-id-mision-vision');
    const fileInput = document.getElementById('input-img-valores');
    const form = document.getElementById('formValores');
    const mensaje = document.getElementById('mensajeValores');
    const btn = form.querySelector('button[type="submit"]');

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_BASE}/mvvh`);
        if (res.ok) {
            const data = await res.json();
            const info = Array.isArray(data) ? data[0] : data;
            if (info) {
                if (info.valores) textarea.value = info.valores;
                if (info.img_valores) preview.src = info.img_valores;
                if (info.id_mision_vision) inputId.value = info.id_mision_vision;
            }
        }
    } catch (error) { console.error("Error al cargar valores:", error); }

    if (fileInput && preview) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) preview.src = URL.createObjectURL(this.files[0]);
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('valores', textarea.value);
            formData.append('id_mision_vision', inputId.value);
            if (fileInput.files[0]) formData.append('imagen', fileInput.files[0]);

            try {
                btn.disabled = true;
                mensaje.style.color = "blue";
                mensaje.innerText = "Actualizando valores...";

                const response = await fetch(`${API_BASE}/mvvh/update`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Valores actualizados correctamente!";
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