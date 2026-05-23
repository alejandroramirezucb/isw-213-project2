import { Configuracion } from '../config/Configuracion.js';

export class GestorModales {
  static _cache = new Map();

  static _obtener(modalId) {
    if (!this._cache.has(modalId)) {
      const modal = document.getElementById(modalId);
      if (modal) this._cache.set(modalId, modal);
    }
    return this._cache.get(modalId);
  }

  static abrir(modalId) {
    const modal = this._obtener(modalId);
    if (!modal) return;
    modal.classList.remove(Configuracion.CLASES_CSS.MODAL_OCULTO);
    modal.setAttribute('aria-hidden', 'false');
    modal.removeAttribute('inert');
  }

  static cerrar(modalId) {
    const modal = this._obtener(modalId);
    if (!modal) return;
    modal.querySelector(':focus')?.blur();
    modal.classList.add(Configuracion.CLASES_CSS.MODAL_OCULTO);
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
  }

  static estaAbierto(modalId) {
    const modal = this._obtener(modalId);
    return !!modal && !modal.classList.contains(Configuracion.CLASES_CSS.MODAL_OCULTO);
  }

  static limpiarCache() {
    this._cache.clear();
  }
}
