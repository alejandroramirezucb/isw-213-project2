import { Configuracion } from '../config/Configuracion.js';

export class GestorMensajes {
  static _temporizador = null;
  static _contenedor = null;

  static mostrar(texto, tipo = 'info', duracion = null) {
    if (!this._contenedor) {
      this._contenedor = document.querySelector(Configuracion.SELECTORES_MENSAJES.CONTENEDOR);
    }

    const textoEl = this._contenedor?.querySelector(Configuracion.SELECTORES_MENSAJES.TEXTO);
    if (!this._contenedor || !textoEl) return;

    if (this._temporizador) clearTimeout(this._temporizador);

    this._contenedor.className = `mensaje mensaje--${tipo}`;
    textoEl.textContent = texto;

    const tiempo = duracion ?? Configuracion.DURACIONES.MENSAJE_DASHBOARD;
    this._temporizador = setTimeout(() => {
      this._contenedor.classList.add(Configuracion.CLASES_CSS.MENSAJE_OCULTO);
    }, tiempo);
  }
}
