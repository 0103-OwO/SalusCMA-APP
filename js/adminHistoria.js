document.addEventListener('DOMContentLoaded', async () => {
    const preview = document.getElementById('img-preview-historia');
    const textarea = document.getElementById('historia');
    const inputId = document.getElementById('input-id-mision-vision');
    const fileInput = document.getElementById('img_historia');
    const form = document.getElementById('formHistoria');
    const mensaje = document.getElementById('mensajeHistoria');
    const btn = document.getElementById('btnActualizar');

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_BASE}/mvvh`);
        if (res.ok) {
            const data = await res.json();
            const info = Array.isArray(data) ? data[0] : data;
            if (info) {
                if (info.historia) textarea.value = info.historia;
                if (info.img_historia) preview.src = info.img_historia;
                if (info.id_mision_vision) inputId.value = info.id_mision_vision;
            }
        }
    } catch (error) { console.error("Error al cargar historia:", error); }

    if (fileInput && preview) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) preview.src = URL.createObjectURL(this.files[0]);
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('historia', textarea.value);
            formData.append('id_mision_vision', inputId.value);
            if (fileInput.files[0]) formData.append('imagen', fileInput.files[0]);

            try {
                btn.disabled = true;
                btn.innerText = "Guardando...";
                mensaje.style.color = "blue";
                mensaje.innerText = "Actualizando historia...";

                const response = await fetch(`${API_BASE}/mvvh/update`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Historia actualizada correctamente!";
                    setTimeout(() => location.reload(), 1500);
                } else { throw new Error("Error al guardar"); }
            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = "Error: " + error.message;
                btn.disabled = false;
                btn.innerText = "Guardar";
            }
        });
    }
});