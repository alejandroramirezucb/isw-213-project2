export class ModeloHorarios {
  constructor(repositorio) {
    this._repositorio = repositorio;
    this._psicologoId = null;
  }

  inicializar(psicologoId) { this._psicologoId = psicologoId; }
  getPsicologoId() { return this._psicologoId; }

  async cargarConfiguracion() {
    const configuraciones = await this._repositorio.obtener(this._psicologoId);
    document.dispatchEvent(new CustomEvent('psicologo:configuracionCargada', { detail: { configuraciones } }));
  }

  async guardar(configuraciones, fechaDesde, fechaHasta) {
    const msg = (texto, tipo) =>
      document.dispatchEvent(new CustomEvent('psicologo:mensaje', { detail: { texto, tipo } }));

    if (!configuraciones?.length) return msg('Selecciona al menos un día con horarios', 'error');
    if (!fechaDesde || !fechaHasta) return msg('Completa las fechas de inicio y fin', 'error');
    if (fechaDesde > fechaHasta) return msg('La fecha de inicio debe ser anterior a la de fin', 'error');

    const configConId = configuraciones.map((c) => ({ ...c, psicologo_id: this._psicologoId }));
    try {
      const exito = await this._repositorio.guardarYGenerarBloques(this._psicologoId, configConId, fechaDesde, fechaHasta);
      if (exito) msg('Configuración guardada y bloques generados', 'exito');
      else msg('Error al guardar la configuración', 'error');
    } catch (e) {
      msg('Error al guardar la configuración: ' + e.message, 'error');
    }
  }
}
