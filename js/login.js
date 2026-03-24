//esta parte hace que el boton de login se habilite solo cuando se complete el captcha, y luego hace la logica para iniciar sesion
function turnstileCallback() {
  const btn = document.getElementById('btn-login');
  if (btn) btn.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('formLogin');
    const mensaje = document.getElementById('mensajeLogin');
    const btn = document.getElementById('btn-login');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const identificador = document.getElementById('input-usuario').value;
            const contrasena = document.getElementById('input-contrasena').value;
            const token = document.querySelector('[name="cf-turnstile-response"]')?.value;

            if (!token){
                mensaje.style.color = 'red';
                mensaje.innerText = 'Por favor completa la verificación de seguridad.';
                return;
            }
            try {
                btn.disabled = true;
                btn.innerText = "Verificando...";
                mensaje.style.color = "blue";
                mensaje.innerText = "Iniciando sesión...";

                const response = await fetch(`${API_BASE}/login`, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ identificador, contrasena, 'cf-turnstile-response': token})
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

                if(typeof turnstile !== 'undefined') turnstile.reset();
                btn.disabled = true;
                btn.innerText = "Entrar";
            }
        });
    }
});