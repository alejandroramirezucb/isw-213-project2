class GestorMensajes {
  static #temporizador = null;

  static mostrar(texto, tipo = 'info', duracion = 3000) {
    const contenedor = document.getElementById('mensaje-estado');
    if (!contenedor) return;

    const textoElemento = contenedor.querySelector('.mensaje__texto');
    if (this.#temporizador) clearTimeout(this.#temporizador);

    contenedor.classList.remove(
      'mensaje--exito',
      'mensaje--error',
      'mensaje--info',
      'mensaje--oculto',
    );
    contenedor.classList.add(`mensaje--${tipo}`);
    textoElemento.textContent = texto;

    this.#temporizador = setTimeout(() => {
      contenedor.classList.add('mensaje--oculto');
    }, duracion);
  }
}
