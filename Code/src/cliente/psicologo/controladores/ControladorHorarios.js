export class ControladorHorarios {
  constructor(modeloHorarios) {
    this._modeloHorarios = modeloHorarios;
    this._bindEventos();
  }

  _bindEventos() {
    document.addEventListener('psicologo:horariosGuardar', (e) =>
      this._modeloHorarios.guardar(e.detail.configuraciones, e.detail.fechaDesde, e.detail.fechaHasta),
    );
  }
}
