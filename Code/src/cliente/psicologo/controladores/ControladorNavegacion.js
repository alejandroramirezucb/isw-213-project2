import { GestorVistas } from '../../compartido/gestores/GestorVistas.js';

export class ControladorNavegacionPsicologo {
  constructor(modeloCitas, modeloHistorial, modeloNotificaciones) {
    this._modeloCitas = modeloCitas;
    this._modeloHistorial = modeloHistorial;
    this._modeloNotificaciones = modeloNotificaciones;
    this._bindEventos();
  }

  _bindEventos() {
    document.querySelectorAll('.navegacion__boton').forEach((btn) => {
      btn.addEventListener('click', () => {
        const vista = btn.dataset.vista;
        GestorVistas.cambiar(vista);
        if (vista === 'historial') this._modeloHistorial.cargar();
        if (vista === 'notificaciones') this._modeloNotificaciones.cargar();
      });
    });
    document.getElementById('btn-cerrar-sesion')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('psicologo:sesionCerrar')),
    );
    document.addEventListener('psicologo:notificacionesLimpiar', () =>
      this._modeloNotificaciones.limpiarTodas(),
    );
    document.addEventListener('psicologo:notificacionMarcarLeida', (e) =>
      this._modeloNotificaciones.marcarLeida(e.detail.notifId),
    );
  }
}
