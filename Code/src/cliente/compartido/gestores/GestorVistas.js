import { Configuracion } from '../config/Configuracion.js';

export class GestorVistas {
  static _vistaActual = null;

  static cambiar(vistaId) {
    if (this._vistaActual === vistaId) return;

    document.querySelectorAll('.vista').forEach((v) =>
      v.classList.remove(Configuracion.CLASES_CSS.VISTA_ACTIVA),
    );

    document.getElementById(`vista-${vistaId}`)
      ?.classList.add(Configuracion.CLASES_CSS.VISTA_ACTIVA);

    document.querySelectorAll('.navegacion__boton').forEach((btn) => {
      const activo = btn.dataset.vista === vistaId;
      btn.classList.toggle(Configuracion.CLASES_CSS.BOTON_NAV_ACTIVO, activo);
      btn.setAttribute('aria-current', activo ? 'page' : 'false');
    });

    this._vistaActual = vistaId;
  }

  static getVistaActual() {
    return this._vistaActual;
  }
}
