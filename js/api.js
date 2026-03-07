const API_BASE = 'https://tu-dominio.com/api'; 

async function apiRequest(method, endpoint, body = null) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(API_BASE + endpoint, options);
        if (res.status === 401) {
            localStorage.clear();
            window.location.href = 'loginn.html';
            return null;
        }
        return await res.json();
    } catch (err) {
        console.warn('API no disponible — modo simulación activo.');
        return null;
    }
}
