class GestorMensajesAuth {
  static #contenedor = null;
  static #temporizador = null;

  static inicializar() {
    this.#contenedor = document.getElementById('mensaje-estado');
  }

  static mostrar(texto, tipo = 'info') {
    if (!this.#contenedor) this.inicializar();
    if (!this.#contenedor) return;

    const textoElemento = this.#contenedor.querySelector('.mensaje__texto');
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
    }, 4000);
  }
}
