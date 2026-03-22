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
      modal.classList.remove(Configuracion.CLASES_CSS.OCULTO_MODAL);
      modal.setAttribute('aria-hidden', 'false');
      modal.removeAttribute('inert');
    }
  }

  static cerrar(modalId) {
    const modal = this.#obtenerModal(modalId);
    if (modal) {
      const elementoConFoco = modal.querySelector(':focus');
      if (elementoConFoco) {
        elementoConFoco.blur();
      }
      
      modal.classList.add(Configuracion.CLASES_CSS.OCULTO_MODAL);
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('inert', '');
    }
  }

  static toggle(modalId) {
    const modal = this.#obtenerModal(modalId);
    if (modal?.classList.contains(Configuracion.CLASES_CSS.OCULTO_MODAL)) {
      this.abrir(modalId);
    } else {
      this.cerrar(modalId);
    }
  }

  static estaAbierto(modalId) {
    const modal = this.#obtenerModal(modalId);
    return modal && !modal.classList.contains(Configuracion.CLASES_CSS.OCULTO_MODAL);
  }

  static limpiarCache() {
    this.#modalesCache.clear();
  }
}
