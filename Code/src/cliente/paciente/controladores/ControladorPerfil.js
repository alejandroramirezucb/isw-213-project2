export class ControladorPerfil {
  constructor(modeloPerfil) {
    this._modeloPerfil = modeloPerfil;
    this._bindEventos();
  }

  _bindEventos() {
    document.addEventListener('paciente:perfilPasswordGuardar', (e) =>
      this._modeloPerfil.actualizarPassword(e.detail.nueva, e.detail.confirmar),
    );
    document.addEventListener('paciente:sesionCerrar', () =>
      this._modeloPerfil.cerrarSesion(),
    );
  }
}
