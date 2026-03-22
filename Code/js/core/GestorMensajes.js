class GestorMensajes extends GestorMensajesBase {
  static #temporizador = null;
  static #contenedor = null;
  static #textoElemento = null;

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
    return this.#textoElemento;
  }

  static asignarTextoElemento(valor) {
    this.#textoElemento = valor;
  }

  static obtenerDuracion() {
    return Configuracion.DURACIONES.MENSAJE_DASHBOARD;
  }
}
