import { FormateadorFecha } from '../../compartido/formateadores/FormateadorFecha.js';

export class VistaHorarios {
  constructor() { this._suscribirEventos(); }

  inicializar() {
    this._establecerFechasPorDefecto();
    this._bindEventos();
  }

  _bindEventos() {
    document.querySelector('#formulario-horarios')?.addEventListener('submit', (e) => {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('psicologo:horariosGuardar', {
        detail: {
          configuraciones: this._obtenerConfiguraciones(),
          fechaDesde: document.getElementById('fecha-desde')?.value,
          fechaHasta: document.getElementById('fecha-hasta')?.value,
        },
      }));
    });

    document.querySelectorAll('.configuracion__checkbox').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const horariosDiv = e.target.closest('.configuracion__dia')?.querySelector('.configuracion__horarios');
        horariosDiv?.classList.toggle('configuracion__horarios--oculto', !e.target.checked);
      });
    });
  }

  _suscribirEventos() {
    document.addEventListener('psicologo:configuracionCargada', (e) => this._renderizarConfig(e.detail.configuraciones));
  }

  _renderizarConfig(configuraciones) {
    configuraciones.forEach((config) => {
      const articulo = document.querySelector(`.configuracion__dia[data-dia="${config.dia_semana}"]`);
      if (!articulo) return;
      const checkbox = articulo.querySelector('.configuracion__checkbox');
      const horariosDiv = articulo.querySelector('.configuracion__horarios');
      if (config.activo && checkbox) { checkbox.checked = true; horariosDiv?.classList.remove('configuracion__horarios--oculto'); }
      const inicio = articulo.querySelector('[data-tipo="inicio"]'); if (inicio) inicio.value = config.hora_inicio.substring(0, 5);
      const fin = articulo.querySelector('[data-tipo="fin"]'); if (fin) fin.value = config.hora_fin.substring(0, 5);
      const dur = articulo.querySelector('.configuracion__duracion'); if (dur) dur.value = config.duracion_bloque_minutos;
    });
  }

  _obtenerConfiguraciones() {
    const result = [];
    document.querySelectorAll('.configuracion__dia').forEach((art) => {
      const cb = art.querySelector('.configuracion__checkbox');
      if (!cb?.checked) return;
      let hI = art.querySelector('[data-tipo="inicio"]').value;
      let hF = art.querySelector('[data-tipo="fin"]').value;
      if (hI && !hI.includes(':')) hI += ':00';
      if (hI && hI.split(':').length === 2) hI += ':00';
      if (hF && !hF.includes(':')) hF += ':00';
      if (hF && hF.split(':').length === 2) hF += ':00';
      result.push({
        dia_semana: parseInt(art.dataset.dia),
        hora_inicio: hI,
        hora_fin: hF,
        duracion_bloque_minutos: parseInt(art.querySelector('.configuracion__duracion').value),
        activo: true,
      });
    });
    return result;
  }

  _establecerFechasPorDefecto() {
    const hoy = new Date();
    const enUnMes = new Date(); enUnMes.setMonth(enUnMes.getMonth() + 1);
    const desde = document.getElementById('fecha-desde'); if (desde) desde.value = FormateadorFecha.aISO(hoy);
    const hasta = document.getElementById('fecha-hasta'); if (hasta) hasta.value = FormateadorFecha.aISO(enUnMes);
  }
}
