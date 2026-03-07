const USUARIOS_SIMULADOS = [
    {
        usuario:   'admin',
        contrasena:'Admin123',
        id_rol:    7,
        nombre:    'Diego',
        panel:     'adminPrincipal.html',
        id_usuario: 1,
        id_paciente: null
    },
    {
        usuario:   'medico',
        contrasena:'Medico123',
        id_rol:    8,
        nombre:    'Dr. García',
        panel:     'medicoPrincipal.html',
        id_usuario: 2,
        id_paciente: null
    },
    {
        usuario:   'recepcion',
        contrasena:'Recep123',
        id_rol:    9,
        nombre:    'María López',
        panel:     'recepcionistaPrincipal.html',
        id_usuario: 3,
        id_paciente: null
    },
    {
        usuario:   'paciente',
        contrasena:'Paciente1',
        id_rol:    19,
        nombre:    'Carlos González',
        panel:     'usuarioPrincipal.html',
        id_usuario: 4,
        id_paciente: 1
    }
];

function guardarSesion(datos) {
    localStorage.setItem('token',       datos.token       || 'simulado-token-123');
    localStorage.setItem('id_rol',      datos.id_rol);
    localStorage.setItem('nombre',      datos.nombre);
    localStorage.setItem('id_usuario',  datos.id_usuario);
    localStorage.setItem('panel',       datos.panel);
    if (datos.id_paciente) {
        localStorage.setItem('id_paciente', datos.id_paciente);
    }
}

function validarLoginSimulado(usuario, contrasena) {
    return USUARIOS_SIMULADOS.find(
        u => u.usuario === usuario.trim() && u.contrasena === contrasena
    ) || null;
}

document.addEventListener('DOMContentLoaded', () => {

    if (localStorage.getItem('token')) {
        const panel = localStorage.getItem('panel') || 'index.html';
        window.location.href = panel;
        return;
    }

    const form    = document.getElementById('formLogin');
    const mensaje = document.getElementById('mensajeLogin');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usuario    = form.usuario    ? form.usuario.value.trim()    : '';
        const contrasena = form.contrasena ? form.contrasena.value        : '';

        if (!usuario || !contrasena) {
            mensaje.style.color   = 'red';
            mensaje.textContent   = 'Por favor ingresa usuario y contraseña.';
            return;
        }

        const datosUsuario = validarLoginSimulado(usuario, contrasena);

        if (datosUsuario) {
            guardarSesion(datosUsuario);
            window.location.href = datosUsuario.panel;
        } else {
            mensaje.style.color = 'red';
            mensaje.textContent = 'Usuario o contraseña incorrectos.';
        }
    });
});
