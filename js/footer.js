const DATOS_CONTACTO = {
    correo:    'contacto@saluscma.com',
    telefono:  '782-123-4567',
    direccion: 'Av. Ejemplo 123, Poza Rica, Ver.'
};

const DATOS_FOOTER = {
    facebook:      'https://facebook.com/saluscma',
    img_facebook:  'img/facebook.png',
    instagram:     'https://instagram.com/saluscma',
    img_instagram: 'img/instagram.png',
    x:             null,
    img_x:         null,
    mapa:          'https://maps.google.com/maps?q=Poza+Rica+Veracruz&output=embed'
};

(function () {

    const fc = document.getElementById('footer-contacto');
    if (fc) {
        fc.innerHTML = `
            <h3>Contacto</h3>
            ${DATOS_CONTACTO.correo
                ? `<p>Email: <a href="mailto:${DATOS_CONTACTO.correo}">${DATOS_CONTACTO.correo}</a></p>`
                : ''}
            ${DATOS_CONTACTO.telefono
                ? `<p>Teléfono: <a href="tel:${DATOS_CONTACTO.telefono}">${DATOS_CONTACTO.telefono}</a></p>`
                : ''}
            ${DATOS_CONTACTO.direccion
                ? `<p>Dirección: ${DATOS_CONTACTO.direccion}</p>`
                : ''}
        `;
    }

    const fr = document.getElementById('footer-redes');
    if (fr) {
        let redesHTML = '<h3>Enlaces</h3>';
        if (DATOS_FOOTER.facebook)
            redesHTML += `<a href="${DATOS_FOOTER.facebook}" target="_blank"><img src="${DATOS_FOOTER.img_facebook}" alt="Facebook" width="30" height="30"></a> `;
        if (DATOS_FOOTER.instagram)
            redesHTML += `<a href="${DATOS_FOOTER.instagram}" target="_blank"><img src="${DATOS_FOOTER.img_instagram}" alt="Instagram" width="30" height="30"></a> `;
        if (DATOS_FOOTER.x)
            redesHTML += `<a href="${DATOS_FOOTER.x}" target="_blank"><img src="${DATOS_FOOTER.img_x}" alt="X" width="30" height="30"></a>`;
        fr.innerHTML = redesHTML;
    }

    const fm = document.getElementById('footer-mapa-container');
    if (fm && DATOS_FOOTER.mapa) {
        fm.innerHTML = `
            <iframe
                src="${DATOS_FOOTER.mapa}"
                width="400" height="250"
                style="border:0;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
            </iframe>
        `;
    }

})();
