document.addEventListener('DOMContentLoaded', async () => {
    const preview = document.getElementById('img-preview-logo');
    const inputId = document.getElementById('input-id-img');
    const fileInput = document.getElementById('uLogo');
    const formLogo = document.getElementById('formLogo');
    const mensaje = document.getElementById('mensajeLogo');
    const btn = document.getElementById('btnActualizar');

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_BASE}/imagenes`);
        const data = await res.json();
        const info = Array.isArray(data) ? data[0] : data;

        if (info && info.logo) {
            if (preview) preview.src = info.logo;
            if (info.id_img && inputId) inputId.value = info.id_img;
        }
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
    }

    if (fileInput && preview) {
        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const urlTemporal = URL.createObjectURL(file);
                preview.src = urlTemporal;
            }
        });
    }

    if (formLogo) {
        formLogo.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!fileInput || fileInput.files.length === 0) {
                if (mensaje) {
                    mensaje.innerText = "Por favor, selecciona una imagen primero.";
                    mensaje.style.color = "red";
                }
                return;
            }

            const formData = new FormData();
            formData.append('logo', fileInput.files[0]);
            const idImg = inputId ? inputId.value : '1';

            try {
                if (btn) {
                    btn.disabled = true;
                    btn.innerText = "Subiendo...";
                }
                if (mensaje) {
                    mensaje.style.color = "blue";
                    mensaje.innerText = "Actualizando logotipo...";
                }

                const response = await fetch(`${API_BASE}/imagenes/${idImg}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    if (mensaje) {
                        mensaje.style.color = "green";
                        mensaje.innerText = "¡Logotipo actualizado con éxito!";
                    }
                    if (result.url && preview) preview.src = result.url;
                    setTimeout(() => { window.location.reload(); }, 1500);
                }
                else if (response.status === 401) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Sesión expirada. Inicia sesión de nuevo.");
                }
                else {
                    throw new Error(result.error || "Error al actualizar");
                }
            } catch (error) {
                if (mensaje) {
                    mensaje.style.color = "red";
                    mensaje.innerText = "Error: " + error.message;
                }
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = "Guardar";
                }
            }
        });
    }
});