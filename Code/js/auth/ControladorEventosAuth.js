class ControladorEventosAuth {
  static inicializar() {
    const btnMostrarRegistro = document.getElementById('btn-mostrar-registro');
    const btnMostrarLogin = document.getElementById('btn-mostrar-login');
    const formularioLogin = document.getElementById('formulario-login');
    const formularioRegistro = document.getElementById('formulario-registro');

    btnMostrarRegistro?.addEventListener('click', (e) => {
      e.preventDefault();
      GestorFormularios.mostrarRegistro();
    });

    btnMostrarLogin?.addEventListener('click', (e) => {
      e.preventDefault();
      GestorFormularios.mostrarLogin();
    });

    formularioLogin?.addEventListener('submit', (e) => {
      e.preventDefault();
      ServicioAutenticacion.iniciarSesion(
        document.getElementById('correo-login').value,
        document.getElementById('contrasena-login').value,
      );
    });

    formularioRegistro?.addEventListener('submit', (e) => {
      e.preventDefault();
      const tipoSeleccionado = document.querySelector(
        'input[name="tipo-cuenta"]:checked',
      );
      ServicioAutenticacion.registrar({
        nombre: document.getElementById('nombre-registro').value,
        apellido: document.getElementById('apellido-registro').value,
        correo: document.getElementById('correo-registro').value,
        telefono: document.getElementById('telefono-registro').value,
        contrasena: document.getElementById('contrasena-registro').value,
        tipoCuenta: tipoSeleccionado ? tipoSeleccionado.value : 'paciente',
      });
    });
  }
}
