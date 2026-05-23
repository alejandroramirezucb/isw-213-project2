export class ModeloCancelacion {
  constructor(repositorioCitas) {
    this._repositorioCitas = repositorioCitas;
    this._citaId = null;
  }

  setCitaId(citaId) { this._citaId = citaId; }
  getCitaId() { return this._citaId; }

  mostrarModal() {
    document.dispatchEvent(new CustomEvent('paciente:modalCancelacionAbrir'));
  }

  async cancelar() {
    if (!this._citaId) return;
    try {
      const exito = await this._repositorioCitas.cancelar(this._citaId);
      if (exito) {
        document.dispatchEvent(new CustomEvent('paciente:mensaje', { detail: { texto: 'Cita cancelada exitosamente', tipo: 'exito' } }));
        document.dispatchEvent(new CustomEvent('paciente:cancelacionConfirmada'));
      } else {
        document.dispatchEvent(new CustomEvent('paciente:mensaje', { detail: { texto: 'Error al cancelar la cita', tipo: 'error' } }));
      }
    } catch (_) {
      document.dispatchEvent(new CustomEvent('paciente:mensaje', { detail: { texto: 'Error al cancelar la cita', tipo: 'error' } }));
    }
  }
}
