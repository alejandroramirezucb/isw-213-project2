export class ControladorCalendario {
  constructor(modeloCalendario, modeloReserva, modeloReprogramacion, vistaCalendario) {
    this._modeloCalendario = modeloCalendario;
    this._modeloReserva = modeloReserva;
    this._modeloReprogramacion = modeloReprogramacion;
    this._vistaCalendario = vistaCalendario;
    this._bindEventos();
  }

  _bindEventos() {
    document.addEventListener('paciente:calendarioNavegado', (e) =>
      this._modeloCalendario.navegar(e.detail.direccion),
    );
    document.addEventListener('paciente:fechaSeleccionada', (e) =>
      this._modeloCalendario.seleccionarFecha(e.detail.fecha),
    );
    document.addEventListener('paciente:fechaSeleccionadaRecargar', (e) =>
      this._modeloCalendario.seleccionarFecha(e.detail.fecha),
    );
    document.addEventListener('paciente:calendarioRefrescar', () =>
      this._modeloCalendario.renderizarMes(),
    );
    document.addEventListener('paciente:bloqueSeleccionado', (e) => {
      const esReprog = this._modeloReprogramacion.getModoActivo();
      this._vistaCalendario.actualizarTituloModal(esReprog);
      this._modeloReserva.seleccionarBloque(e.detail.bloqueId, e.detail.fecha);
    });
    document.addEventListener('paciente:reservaConfirmarSolicitada', () => {
      const esReprog = this._modeloReprogramacion.getModoActivo();
      const citaAnterior = this._modeloReprogramacion.getCitaId();
      this._modeloReserva.confirmar(esReprog, citaAnterior);
      if (esReprog) this._modeloReprogramacion.salir();
    });
    document.addEventListener('paciente:reservaCerrarModalSolicitado', () =>
      this._modeloReserva.cerrarModal(false),
    );
  }
}
