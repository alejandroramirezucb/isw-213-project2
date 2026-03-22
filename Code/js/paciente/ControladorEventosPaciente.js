class ControladorEventosPaciente {
  static inicializar() {
    this.#configurarNavegacion();
    this.#configurarCalendario();
    this.#configurarSesion();
    this.#configurarReservas();
    this.#configurarCancelacion();
    this.#configurarReprogramacion();
    this.#configurarFiltros();
  }

  static #configurarNavegacion() {
    MejoradorEventos.mapearEventosPorData(
      '.navegacion__boton',
      'vista',
      (vista) => {
        NavigacionFachada.cambiarVista(vista);
        if (vista === 'mis-citas') {
          GestorMisCitas.cargar('proximas');
        }
      },
    );
  }

  static #configurarCalendario() {
    MejoradorEventos.mapearEventos({
      '#btn-mes-anterior': {
        click: () => this.#cambiarMes(-1),
      },
      '#btn-mes-siguiente': {
        click: () => this.#cambiarMes(1),
      },
    });
  }

  static #cambiarMes(incremento) {
    const fecha = EstadoPaciente.obtener('fechaActual');
    fecha.setMonth(fecha.getMonth() + incremento);
    RenderizadorCalendario.renderizar();
  }

  static #configurarSesion() {
    MejoradorEventos.mapearEventos({
      '#btn-cerrar-sesion': {
        click: () => AutenticacionFachada.cerrarSesion(),
      },
    });
  }

  static #configurarReservas() {
    MejoradorEventos.mapearEventos({
      '#btn-cerrar-modal': {
        click: () => GestorReservas.cerrarModal(),
      },
      '#btn-cancelar-reserva': {
        click: () => GestorReservas.cerrarModal(),
      },
      '#btn-confirmar-reserva': {
        click: () => GestorReservas.confirmar(),
      },
    });

    const modal = document.getElementById('modal-reserva');
    modal?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) GestorReservas.cerrarModal();
    });
  }

  static #configurarCancelacion() {
    MejoradorEventos.mapearEventos({
      '#btn-cerrar-modal-cancelacion': {
        click: () =>
          NavigacionFachada.cerrarModal('modal-cancelacion'),
      },
      '#btn-no-cancelar': {
        click: () =>
          NavigacionFachada.cerrarModal('modal-cancelacion'),
      },
      '#btn-si-cancelar': {
        click: () => GestorCancelacion.cancelar(),
      },
      '#btn-cancelar-proxima': {
        click: () => GestorCancelacion.mostrarModal(),
      },
    });
  }

  static #configurarReprogramacion() {
    MejoradorEventos.mapearEventos({
      '#btn-reprogramar-proxima': {
        click: () => GestorReprogramacion.iniciar(),
      },
      '#btn-cancelar-reprogramacion': {
        click: () => GestorReprogramacion.salir(),
      },
    });
  }

  static #configurarFiltros() {
    MejoradorEventos.mapearEventosPorData(
      '.filtros__boton',
      'filtro',
      (filtro, e, elemento) => {
        document
          .querySelectorAll('.filtros__boton')
          .forEach((b) => b.classList.remove('filtros__boton--activo'));
        elemento.classList.add('filtros__boton--activo');
        GestorMisCitas.cargar(filtro);
      },
    );
  }
}
