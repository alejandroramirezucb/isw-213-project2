import { GestorVistas } from '../../compartido/gestores/GestorVistas.js';

export class ControladorNavegacion {
  constructor(modeloCitas, modeloNotificaciones) {
    this._modeloCitas = modeloCitas;
    this._modeloNotificaciones = modeloNotificaciones;
    this._bindEventos();
  }

  _bindEventos() {
    document.querySelectorAll('.navegacion__boton').forEach((btn) => {
      btn.addEventListener('click', () => {
        const vista = btn.dataset.vista;
        GestorVistas.cambiar(vista);
        if (vista === 'mis-citas') this._modeloCitas.cargarMisCitas('proximas');
        if (vista === 'notificaciones') this._modeloNotificaciones.cargar();
      });
    });
    document.getElementById('btn-cerrar-sesion')?.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('paciente:sesionCerrar')),
    );
    document.addEventListener('paciente:notificacionesLimpiar', () =>
      this._modeloNotificaciones.limpiarTodas(),
    );
    document.addEventListener('paciente:notificacionMarcarLeida', (e) =>
      this._modeloNotificaciones.marcarLeida(e.detail.notifId),
    );
  }
}
