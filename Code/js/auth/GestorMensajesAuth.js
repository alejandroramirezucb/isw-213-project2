class GestorMensajesAuth extends GestorMensajesBase {
  static #temporizador = null;
  static #contenedor = null;

  static obtenerTemporizador() {
    return this.#temporizador;
  }

  static asignarTemporizador(valor) {
    this.#temporizador = valor;
  }

  static obtenerContenedor() {
    return this.#contenedor;
  }

  static asignarContenedor(valor) {
    this.#contenedor = valor;
  }

  static obtenerTextoElemento() {
    if (this.#contenedor) {
      return this.#contenedor.querySelector(
        Configuracion.SELECTORES_MENSAJES.TEXTO_MENSAJES,
      );
    }
    return null;
  }

  static asignarTextoElemento(valor) {}

  static obtenerDuracion() {
    return Configuracion.DURACIONES.MENSAJE_AUTENTICACION;
  }

  static inicializar() {
    this.#contenedor = document.querySelector(
      Configuracion.SELECTORES_MENSAJES.CONTENEDOR_MENSAJES,
    );
  }
}
