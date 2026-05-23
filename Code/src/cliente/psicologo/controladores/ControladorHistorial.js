export class ControladorHistorial {
  constructor(modeloHistorial) {
    this._modeloHistorial = modeloHistorial;
    this._bindEventos();
  }

  _bindEventos() {
    document.addEventListener('psicologo:historialBuscar', (e) =>
      this._modeloHistorial.cargar(e.detail.busqueda),
    );
    document.addEventListener('psicologo:toggleBloqueo', (e) =>
      this._modeloHistorial.toggleBloqueo(e.detail.pacienteId, e.detail.bloqueadoActual),
    );
    document.addEventListener('psicologo:descargarHistorial', (e) =>
      this._modeloHistorial.exportarPdf(e.detail.item),
    );
  }
}
