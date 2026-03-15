class GestorMensajesAuth {
  static #contenedor = null;
  static #temporizador = null;
  static #DURACION = 4000;
  static #SELECTOR_CONTENEDOR = '#mensaje-estado';
  static #SELECTOR_TEXTO = '.mensaje__texto';

  static inicializar() {
    this.#contenedor = document.querySelector(this.#SELECTOR_CONTENEDOR);
  }

  static mostrar(texto, tipo = 'info') {
    if (!this.#contenedor) this.inicializar();
    if (!this.#contenedor) return;

    const textoElemento = this.#contenedor.querySelector(this.#SELECTOR_TEXTO);
    if (this.#temporizador) clearTimeout(this.#temporizador);

    this.#contenedor.classList.remove(
      'mensaje--oculto',
      'mensaje--exito',
      'mensaje--error',
      'mensaje--info',
    );

    this.#contenedor.classList.add(`mensaje--${tipo}`);
    textoElemento.textContent = texto;

    this.#temporizador = setTimeout(() => {
      this.#contenedor.classList.add('mensaje--oculto');
    }, this.#DURACION);
  }
}
