const API_BASE = 'https://saluscma-api-1.onrender.com/api';

async function cargarContenidoGlobal() {
    try {
        const resFooter = await fetch(`${API_BASE}/footer`);
        const dataFooter = await resFooter.json();

        if (dataFooter) {
            const info = Array.isArray(dataFooter) ? dataFooter[0] : dataFooter;

            const aFb = document.getElementById('link-fb');
            const aIg = document.getElementById('link-ig');
            const aX = document.getElementById('link-x');

            if (aFb && info.facebook) aFb.href = info.facebook;
            if (aIg && info.instagram) aIg.href = info.instagram;
            if (aX && info.x) aX.href = info.x;

            const imgFb = document.getElementById('icon-fb');
            const imgIg = document.getElementById('icon-ig');
            const imgX = document.getElementById('icon-x');

            if (imgFb && info.img_facebook) imgFb.src = info.img_facebook;
            if (imgIg && info.img_instagram) imgIg.src = info.img_instagram;
            if (imgX && info.img_x) imgX.src = info.img_x;

            const mapaCont = document.getElementById('footer-mapa-container');
            if (mapaCont && info.mapa) {
                mapaCont.innerHTML = `
        <iframe 
            src="${info.mapa}" 
            width="400" 
            height="250" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
        </iframe>`;
            }
        }
        const resBanners = await fetch(`${API_BASE}/publicidad`);
        const dataBanners = await resBanners.json();
        const slides = document.querySelectorAll('.carrusel-slide img');
        if (slides.length > 0) {

            if (dataBanners) {
                if (dataBanners.img_uno) slides[0].src = dataBanners.img_uno;
                if (dataBanners.img_dos) slides[1].src = dataBanners.img_dos;
                if (dataBanners.img_tres) slides[2].src = dataBanners.img_tres;
            }
        }

        const imgPrincipal = document.getElementById('principal');
        if (imgPrincipal && dataBanners.img_uno) {
            imgPrincipal.src = dataBanners.img_uno;
        }

        const logoImg = document.getElementById('logo');
        if (logoImg) {
            try {
                const resImg = await fetch(`${API_BASE}/imagenes`);
                const dataImg = await resImg.json();
                const infoImg = Array.isArray(dataImg) ? dataImg[0] : dataImg;
                if (infoImg && infoImg.logo) {
                    logoImg.src = infoImg.logo;
                }
            } catch (err) {
                console.error("Error al cargar el logo:", err);
            }
        }

        const resContacto = await fetch(`${API_BASE}/contacto`);
        const dataCon = await resContacto.json();

        if (dataCon) {
            const dir = document.getElementById('info-direccion');
            const tel = document.getElementById('info-tel');
            const mail = document.getElementById('info-email');

            if (dir && dataCon.direccion) dir.innerText = dataCon.direccion;
            if (tel && dataCon.telefono) tel.innerText = dataCon.telefono;
            if (mail && dataCon.correo) mail.innerText = dataCon.correo;
        }

    } catch (error) {
        console.error("Error en la carga global:", error);
    }
    const urlImagenPerfil = "https://res.cloudinary.com/dqnncunbj/image/upload/v1773847782/perfil_ylrrpf.png";

    const imgPerfil = document.getElementById("perfil");
    const textoPerfil = document.querySelector("#perfil-dinamico p");

    if (imgPerfil) {
        imgPerfil.src = urlImagenPerfil;
    }
}

document.addEventListener('DOMContentLoaded', cargarContenidoGlobal);