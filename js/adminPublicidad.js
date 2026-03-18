document.addEventListener('DOMContentLoaded', async () => {
    const msg = document.getElementById('mensajePublicidad');
    const form = document.getElementById('formPublicidad');

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_BASE}/publicidad`);
        const data = await res.json();
        if (data) {
            if (data.img_uno) document.getElementById('preview-banner-1').src = data.img_uno;
            if (data.img_dos) document.getElementById('preview-banner-2').src = data.img_dos;
            if (data.img_tres) document.getElementById('preview-banner-3').src = data.img_tres;
        }
    } catch (err) {
        console.error("Error al cargar publicidad:", err);
    }

    [1, 2, 3].forEach(num => {
        const input = document.getElementById(`file-banner-${num}`);
        const img = document.getElementById(`preview-banner-${num}`);
        if (input && img) {
            input.addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    img.src = URL.createObjectURL(this.files[0]);
                }
            });
        }
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnGuardarBanners');
            const formData = new FormData();

            const f1 = document.getElementById('file-banner-1').files[0];
            const f2 = document.getElementById('file-banner-2').files[0];
            const f3 = document.getElementById('file-banner-3').files[0];

            if (f1) formData.append('img_uno', f1);
            if (f2) formData.append('img_dos', f2);
            if (f3) formData.append('img_tres', f3);

            if (!f1 && !f2 && !f3) {
                msg.innerText = "No hay cambios para guardar.";
                msg.style.color = "orange";
                return;
            }

            try {
                btn.disabled = true;
                msg.innerText = "Subiendo imágenes...";
                msg.style.color = "blue";

                const response = await fetch(`${API_BASE}/publicidad/update`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    msg.innerText = "¡Publicidad actualizada!";
                    msg.style.color = "green";
                    setTimeout(() => location.reload(), 1500);
                }
                else if (response.status === 401) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Sesión expirada. Inicia sesión de nuevo.");
                }
                else {
                    throw new Error("Error en el servidor");
                }
            } catch (error) {
                msg.innerText = "Error: " + error.message;
                msg.style.color = "red";
                btn.disabled = false;
            }
        });
    }
});