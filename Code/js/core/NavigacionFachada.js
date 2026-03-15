class NavigacionFachada {
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
