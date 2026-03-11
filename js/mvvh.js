async function cargarContenidoInstitucional() {
    try {
        const res = await fetch(`${API_BASE}/mvvh`);
        const data = await res.json();
        
        const info = Array.isArray(data) ? data[0] : data;

        if (info) {
            const txtMision = document.getElementById('texto-mision');
            const imgMision = document.getElementById('img-mision');
            if (txtMision && info.mision) txtMision.innerText = info.mision;
            if (imgMision && info.img_mision) imgMision.src = info.img_mision;

            const txtVision = document.getElementById('texto-vision');
            const imgVision = document.getElementById('img-vision');
            if (txtVision && info.vision) txtVision.innerText = info.vision;
            if (imgVision && info.img_vision) imgVision.src = info.img_vision;

            const txtValores = document.getElementById('texto-valores');
            const imgValores = document.getElementById('img-valores');
            if (txtValores && info.valores) txtValores.innerHTML = info.valores;
            if (imgValores && info.img_valores) imgValores.src = info.img_valores;

            const txtHistoria = document.getElementById('texto-historia');
            const imgHistoria = document.getElementById('img-historia');
            if (txtHistoria && info.historia) txtHistoria.innerText = info.historia;
            if (imgHistoria && info.img_historia) imgHistoria.src = info.img_historia;

        } else {
            const mosaico = document.getElementById('mosaico-info');
            const msgError = document.getElementById('msg-sin-info');
            if (mosaico) mosaico.style.display = 'none';
            if (msgError) msgError.style.display = 'block';
        }
    } catch (error) {
        console.error("Error al cargar la información institucional:", error);
    }
}

document.addEventListener('DOMContentLoaded', cargarContenidoInstitucional);