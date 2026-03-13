document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formFooter');
    const mensaje = document.getElementById('mensajeFooter');
    const btn = document.getElementById('btnActualizar');

    const fbLink = document.getElementById('facebook');
    const igLink = document.getElementById('instagram');
    const xLink = document.getElementById('x');
    const mapaLink = document.getElementById('mapa');
    const inputId = document.getElementById('input-id-footer');

    const fileFb = document.getElementById('img_facebook');
    const fileIg = document.getElementById('img_instagram');
    const fileX = document.getElementById('img_x');

    const previewFb = document.getElementById('img-preview-facebook');
    const previewIg = document.getElementById('img-preview-instagram');
    const previewX = document.getElementById('img-preview-x');

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_BASE}/footer`);
        if (res.ok) {
            const data = await res.json();
            const info = Array.isArray(data) ? data[0] : data;

            if (info) {
                if (info.facebook) fbLink.value = info.facebook;
                if (info.instagram) igLink.value = info.instagram;
                if (info.x) xLink.value = info.x;
                if (info.mapa) mapaLink.value = info.mapa;
                if (info.id_footer) inputId.value = info.id_footer;

                if (info.img_facebook) previewFb.src = info.img_facebook;
                if (info.img_instagram) previewIg.src = info.img_instagram;
                if (info.img_x) previewX.src = info.img_x;
            }
        }
    } catch (error) {
        console.error("Error al cargar footer:", error);
    }

    const setupPreview = (input, img) => {
        input.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                img.src = URL.createObjectURL(this.files[0]);
            }
        });
    };

    setupPreview(fileFb, previewFb);
    setupPreview(fileIg, previewIg);
    setupPreview(fileX, previewX);

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('id_footer', inputId.value);
            formData.append('facebook', fbLink.value);
            formData.append('instagram', igLink.value);
            formData.append('x', xLink.value);
            formData.append('mapa', mapaLink.value);

            if (fileFb.files[0]) formData.append('img_facebook', fileFb.files[0]);
            if (fileIg.files[0]) formData.append('img_instagram', fileIg.files[0]);
            if (fileX.files[0]) formData.append('img_x', fileX.files[0]);

            try {
                btn.disabled = true;
                btn.innerText = "Guardando...";

                mensaje.style.color = "blue";
                mensaje.innerText = "Actualizando información del footer...";

                const response = await fetch(`${API_BASE}/footer/update`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (response.ok) {
                    mensaje.style.color = "green";
                    mensaje.innerText = "¡Footer actualizado correctamente!";
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