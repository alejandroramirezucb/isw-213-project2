class AutenticacionFachada {
  static verificar() {
    return ServicioAutenticacionPagina.verificar();
  }

  static obtenerUsuario() {
    return ServicioAutenticacionPagina.obtenerUsuario();
  }

  static cerrarSesion() {
    return ServicioAutenticacionPagina.cerrarSesion();
  }
}
