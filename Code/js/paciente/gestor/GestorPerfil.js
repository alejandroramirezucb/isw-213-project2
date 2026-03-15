class GestorPerfil {
  static #modalContrasena = null;
  static #formularioContrasena = null;

  static inicializar() {
    this.#modalContrasena = document.getElementById('modal-cambiar-contrasena');
    this.#formularioContrasena = document.getElementById(
      'formulario-cambiar-contrasena',
    );

    this.#cargarPerfil();
    this.#agregarEventos();
  }

  static #cargarPerfil() {
    const usuario = EstadoPaciente.obtener('usuario');
    if (!usuario || !usuario.pacientes) return;

    const { pacientes } = usuario;
    document.getElementById('perfil-nombre').textContent =
      pacientes.nombre || '—';
    document.getElementById('perfil-apellido').textContent =
      pacientes.apellido || '—';

    const correo = usuario.email || usuario.user?.email || '—';
    const correoElement = document.getElementById('perfil-correo');
    if (correoElement) {
      correoElement.textContent = correo;
    }
  }

  static #agregarEventos() {
    document
      .getElementById('btn-cambiar-contrasena')
      ?.addEventListener('click', () => {
        this.#abrirModalContrasena();
      });

    document
      .getElementById('btn-cerrar-modal-contrasena')
      ?.addEventListener('click', () => {
        this.#cerrarModalContrasena();
      });

    document
      .getElementById('btn-cancelar-contrasena')
      ?.addEventListener('click', () => {
        this.#cerrarModalContrasena();
      });

    document
      .getElementById('btn-guardar-contrasena')
      ?.addEventListener('click', () => {
        this.#guardarContrasena();
      });

    document
      .getElementById('btn-cerrar-sesion-perfil')
      ?.addEventListener('click', () => {
        this.#cerrarSesion();
      });

    this.#formularioContrasena?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.#guardarContrasena();
    });
  }

  static #abrirModalContrasena() {
    this.#formularioContrasena.reset();
    this.#modalContrasena?.classList.remove('modal--oculto');
    document.getElementById('nueva-contrasena')?.focus();
  }

  static #cerrarModalContrasena() {
    this.#modalContrasena?.classList.add('modal--oculto');
    this.#formularioContrasena.reset();
  }

  static async #guardarContrasena() {
    const nueva = document.getElementById('nueva-contrasena')?.value;
    const confirmar = document.getElementById('confirmar-contrasena')?.value;

    if (!nueva || !confirmar) {
      MensajesFachada.mostrar('Por favor completa todos los campos', 'error');
      return;
    }

    if (nueva !== confirmar) {
      MensajesFachada.mostrar('Las contraseñas no coinciden', 'error');
      return;
    }

    if (nueva.length < 6) {
      MensajesFachada.mostrar(
        'La contraseña debe tener al menos 6 caracteres',
        'error',
      );
      return;
    }

    try {
      const { error } = await clienteSupabase.auth.updateUser({
        password: nueva,
      });

      if (error) {
        MensajesFachada.mostrar(
          'Error al cambiar contraseña: ' + error.message,
          'error',
        );
        return;
      }

      MensajesFachada.mostrar('Contraseña actualizada correctamente', 'exito');
      this.#cerrarModalContrasena();
    } catch (error) {
      MensajesFachada.mostrar('Error al cambiar contraseña', 'error');
    }
  }

  static async #cerrarSesion() {
    const confirmacion = confirm('¿Deseas cerrar sesión?');
    if (!confirmacion) return;

    try {
      await AutenticacionFachada.cerrarSesion();
      window.location.href = 'index.html';
    } catch (error) {
      MensajesFachada.mostrar('Error al cerrar sesión', 'error');
    }
  }
}
