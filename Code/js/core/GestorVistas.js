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

    this.#vistasCache.forEach((v) =>
      v.classList.remove(Configuracion.CLASES_CSS.ACTIVO_VISTA),
    );

    const vista = document.getElementById(`vista-${vistaId}`);
    if (vista) {
      vista.classList.add(Configuracion.CLASES_CSS.ACTIVO_VISTA);
    }

    this.#botonesCache.forEach((boton) => {
      boton.classList.toggle(
        Configuracion.CLASES_CSS.ACTIVO_BOTON_NAVEGACION,
        boton.dataset.vista === vistaId,
      );
    });

    this.#vistaActualId = vistaId;
  }
}
