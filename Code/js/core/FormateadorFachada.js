class FormateadorFachada {
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
}
