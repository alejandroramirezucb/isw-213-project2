class GestorPerfil {
  static inicializar() {
    this.crearComponenteModal();
    this.cargarPerfil();
    this.configurarEventos();
  }

  static crearComponenteModal() {
    this.modal = new ComponenteModal('modal-cambiar-contrasena');
    this.modal.inicializar();
    this.modal.agregarBotonesAbrir(['#btn-cambiar-contrasena']);
    this.modal.agregarBotonesCerrar([
      '#btn-cerrar-modal-contrasena',
    ]);
    this.modal.agregarFormulario('#formulario-cambiar-contrasena');
  }

  static cargarPerfil() {
    const usuario = EstadoPsicologo.obtener('usuario');
    if (!usuario?.psicologos) return;

    const { psicologos } = usuario;
    const perfil = (id) => document.getElementById(id);

    const elementoNombre = perfil('perfil-nombre');
    const elementoApellido = perfil('perfil-apellido');

    const correo = usuario.email || usuario.user?.email || '—';
    const elementoCorreo = perfil('perfil-correo');

    if (elementoNombre) elementoNombre.textContent = psicologos.nombre || '—';
    if (elementoApellido) elementoApellido.textContent = psicologos.apellido || '—';
    if (elementoCorreo) elementoCorreo.textContent = correo;
  }

  static configurarEventos() {
    const guardarBtn = document.getElementById('btn-guardar-contrasena');
    const cerrarBtn = document.getElementById('btn-cerrar-sesion-perfil');

    guardarBtn?.addEventListener('click', () => this.guardarPassword());
    cerrarBtn?.addEventListener('click', () => this.cerrarSesion());
  }

  static async guardarPassword() {
    const nueva = document.getElementById('nueva-contrasena')?.value;
    const confirmar = document.getElementById('confirmar-contrasena')?.value;

    if (!ValidadorFormulario.noEstaVacio(nueva) ||
        !ValidadorFormulario.noEstaVacio(confirmar)) {
      MensajesFachada.mostrar('Por favor completa todos los campos', 'error');
      return;
    }

    if (!ValidadorFormulario.sonIguales(nueva, confirmar)) {
      MensajesFachada.mostrar('Las passwords no coinciden', 'error');
      return;
    }

    if (!ValidadorFormulario.esPasswordValida(nueva)) {
      MensajesFachada.mostrar(
        'La password debe tener al menos 6 caracteres',
        'error',
      );
      return;
    }

    try {
      const { error } = await clienteSupabase.auth.updateUser({
        password: nueva,
      });

      if (error) throw error;

      MensajesFachada.mostrar('Password actualizado correctamente', 'exito');
      this.modal?.cerrar();
    } catch (error) {
      MensajesFachada.mostrar('Error al cambiar password', 'error');
    }
  }

  static async cerrarSesion() {
    const confirmacion = confirm('¿Deseas cerrar sesión?');
    if (!confirmacion) return;

    try {
      await AutenticacionFachada.cerrarSesion();
    } catch (error) {
      MensajesFachada.mostrar('Error al cerrar sesión', 'error');
    }
  }
}

GestorPerfil.modal = null;
