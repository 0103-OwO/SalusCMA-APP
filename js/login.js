document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('formLogin');
    const mensaje = document.getElementById('mensajeLogin');
    const btn = loginForm.querySelector('button[type="submit"]');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const identificador = document.getElementById('input-usuario').value;
            const contrasena = document.getElementById('input-contrasena').value;

            try {
                btn.disabled = true;
                const textoOriginal = btn.innerText;
                btn.innerText = "Verificando...";
                mensaje.style.color = "blue";
                mensaje.innerText = "Iniciando sesión...";

                const response = await fetch(`${API_BASE}/login`, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ identificador, contrasena })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('nombre', data.nombre);
                    localStorage.setItem('rol', data.rol);

                    mensaje.style.color = "green";
                    mensaje.innerText = `¡Bienvenido, ${data.nombre}! Redirigiendo...`;

                    setTimeout(() => {
                        switch (parseInt(data.rol)) {
                            case 7: window.location.href = 'adminPrincipal.html'; break;
                            case 8: window.location.href = 'medicoPrincipal.html'; break;
                            case 9: window.location.href = 'recepcionistaPrincipal.html'; break;
                            default: window.location.href = 'usuarioPrincipal.html'; break;
                        }
                    }, 1500);

                } else {
                    throw new Error(data.error || "Credenciales incorrectas");
                }

            } catch (error) {
                mensaje.style.color = "red";
                mensaje.innerText = error.message;
                btn.disabled = false;
                btn.innerText = "Entrar";
            }
        });
    }
});