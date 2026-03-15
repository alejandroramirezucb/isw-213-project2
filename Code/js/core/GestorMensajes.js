class GestorMensajes {
  static #temporizador = null;
  static #duracionDefecto = 3000;
  static #contenedor = null;
  static #textoElemento = null;

  static #inicializar() {
    if (!this.#contenedor) {
      this.#contenedor = document.querySelector('#mensaje-estado');
      if (this.#contenedor) {
        this.#textoElemento = this.#contenedor.querySelector('.mensaje__texto');
      }
    }
  }

  static mostrar(texto, tipo = 'info', duracion = null) {
    this.#inicializar();
    if (!this.#contenedor || !this.#textoElemento) return;

    if (this.#temporizador) clearTimeout(this.#temporizador);

    this.#contenedor.classList.remove(
      'mensaje--exito',
      'mensaje--error',
      'mensaje--info',
      'mensaje--oculto',
    );
    this.#contenedor.classList.add(`mensaje--${tipo}`);
    this.#textoElemento.textContent = texto;

    const tiempoMuestra = duracion ?? this.#duracionDefecto;
    this.#temporizador = setTimeout(() => {
      this.#contenedor.classList.add('mensaje--oculto');
    }, tiempoMuestra);
  }
}
