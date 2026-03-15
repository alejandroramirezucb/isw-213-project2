class GestorModales {
  static #modalesCache = new Map();

  static #obtenerModal(modalId) {
    if (!this.#modalesCache.has(modalId)) {
      const modal = document.getElementById(modalId);
      if (modal) {
        this.#modalesCache.set(modalId, modal);
      }
    }
    return this.#modalesCache.get(modalId);
  }

  static abrir(modalId) {
    const modal = this.#obtenerModal(modalId);
    if (modal) {
      modal.classList.remove('modal--oculto');
    }
  }

  static cerrar(modalId) {
    const modal = this.#obtenerModal(modalId);
    if (modal) {
      modal.classList.add('modal--oculto');
    }
  }
}
