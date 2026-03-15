class GestorVistas {
  static #vistasCache = null;
  static #botonesCache = null;
  static #vistaActualId = null;

  static #cachear() {
    if (!this.#vistasCache) {
      this.#vistasCache = document.querySelectorAll('.vista');
    }
    if (!this.#botonesCache) {
      this.#botonesCache = document.querySelectorAll('.navegacion__boton');
    }
  }

  static cambiar(vistaId) {
    if (this.#vistaActualId === vistaId) return;
    this.#cachear();

    this.#vistasCache.forEach((v) => v.classList.remove('vista--activa'));

    const vista = document.getElementById(`vista-${vistaId}`);
    if (vista) {
      vista.classList.add('vista--activa');
    }

    this.#botonesCache.forEach((boton) => {
      boton.classList.toggle(
        'navegacion__boton--activo',
        boton.dataset.vista === vistaId,
      );
    });

    this.#vistaActualId = vistaId;
  }
}
