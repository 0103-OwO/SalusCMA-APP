const form = document.getElementById('formContacto');
const mensajeContacto = document.getElementById('mensajeContacto');

form.addEventListener('submit', async (e) => {

  // Se previene que la página se recargue
  e.preventDefault();

  // Leemos los valores que escribió el usuario en cada campo
  const nombre  = document.getElementById('nombre').value;
  const telefono = document.getElementById('telefono').value;
  const email   = document.getElementById('correo').value;
  const mensaje = document.getElementById('mensaje').value;

  mensajeContacto.style.color = 'black';
  mensajeContacto.textContent = 'Enviando mensaje...';

  try {
    // Hacemos la petición POST a nuestro endpoint de Express
    const response = await fetch('http://localhost:3000/api/contacto/enviar', {
      method: 'POST',

      // Le decimos al servidor que le mandamos JSON
      headers: {
        'Content-Type': 'application/json'
      },

      // Convertimos el objeto a JSON para enviarlo en el body
      body: JSON.stringify({ nombre, telefono, email, mensaje })
    });

    // Convertimos la respuesta del servidor a JSON para leerla
    const data = await response.json();

    // Si el servidor respondió con éxito mostramos mensaje verde
    if (data.success) {
      mensajeContacto.style.color = 'green';
      mensajeContacto.textContent = '¡Mensaje enviado correctamente!';
      form.reset(); // limpiamos el formulario

    } else {
      // Si el servidor respondió con error mostramos mensaje rojo
      mensajeContacto.style.color = 'red';
      mensajeContacto.textContent = data.error || 'Hubo un error, intenta de nuevo';
    }

  } catch (error) {
    // Si no hubo conexión con el servidor (red caída, servidor apagado, etc.)
    mensajeContacto.style.color = 'red';
    mensajeContacto.textContent = 'No se pudo conectar con el servidor';
  }
});