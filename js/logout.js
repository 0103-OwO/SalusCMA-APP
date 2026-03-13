function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
    window.location.href = 'loginn.html';
}