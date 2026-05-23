import { FormateadorFecha } from '../../compartido/formateadores/FormateadorFecha.js';

const HORAS_MIN = 24;

export class ModeloReprogramacion {
  constructor() {
    this._modoActivo = false;
    this._citaId = null;
  }

  getModoActivo() { return this._modoActivo; }
  getCitaId() { return this._citaId; }

  iniciar(citaId, fechaTexto, horaTexto) {
    if (!citaId) return;

    if (!this._validar24h(fechaTexto, horaTexto)) {
      document.dispatchEvent(new CustomEvent('paciente:mensaje', {
        detail: { texto: 'No es posible reprogramar con menos de 24 horas de anticipación', tipo: 'error' },
      }));
      return;
    }

    this._modoActivo = true;
    this._citaId = citaId;
    document.dispatchEvent(new CustomEvent('paciente:reprogramacionIniciada', { detail: { citaId } }));
  }

  salir() {
    this._modoActivo = false;
    this._citaId = null;
    document.dispatchEvent(new CustomEvent('paciente:reprogramacionCancelada'));
  }

  _validar24h(fechaTexto, horaTexto) {
    if (!fechaTexto || !horaTexto) return false;
    const partes = fechaTexto.split(' de ');
    if (partes.length < 2) return true;
    const mesIndex = FormateadorFecha.MESES.indexOf(partes[1]);
    if (mesIndex === -1) return true;
    const horaPartes = horaTexto.split(':');
    const ahora = new Date();
    const fechaCita = new Date(ahora.getFullYear(), mesIndex, parseInt(partes[0]), parseInt(horaPartes[0]), parseInt(horaPartes[1]));
    return (fechaCita.getTime() - ahora.getTime()) / 3600000 >= HORAS_MIN;
  }
}
