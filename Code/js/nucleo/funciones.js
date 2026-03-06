class Fachada {
  static formatearFecha(fecha) {
    return FormateadorFecha.aTexto(fecha);
  }

  static formatearFechaCorta(fecha) {
    return FormateadorFecha.aTextoCorto(fecha);
  }

  static formatearHora(hora) {
    return FormateadorHora.formatear(hora);
  }

  static obtenerFechaISO(fecha) {
    return FormateadorFecha.aISO(fecha);
  }

  static mostrarMensaje(texto, tipo, duracion) {
    GestorMensajes.mostrar(texto, tipo, duracion);
  }

  static verificarAutenticacion() {
    return ServicioAutenticacionPagina.verificar();
  }

  static obtenerUsuarioActual() {
    return ServicioAutenticacionPagina.obtenerUsuario();
  }

  static cerrarSesion() {
    return ServicioAutenticacionPagina.cerrarSesion();
  }

  static cambiarVista(vistaId) {
    GestorVistas.cambiar(vistaId);
  }

  static abrirModal(modalId) {
    GestorModales.abrir(modalId);
  }

  static cerrarModal(modalId) {
    GestorModales.cerrar(modalId);
  }
}
