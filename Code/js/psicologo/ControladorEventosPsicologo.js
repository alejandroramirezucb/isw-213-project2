class ControladorEventosPsicologo {
  static inicializar() {
    this.#configurarNavegacion();
    this.#configurarPeriodos();
    this.#configurarSesion();
    this.#configurarHorarios();
    this.#configurarDetalleCita();
    this.#configurarBusqueda();
  }

  static #configurarNavegacion() {
    MejoradorEventos.mapearEventosPorData(
      '.navegacion__boton',
      'vista',
      (vista) => {
        NavigacionFachada.cambiarVista(vista);
        if (vista === 'historial') {
          GestorHistorial.cargar();
        }
        if (vista === 'notificaciones') {
          GestorNotificaciones.cargar();
        }
      },
    );
  }

  static #configurarPeriodos() {
    MejoradorEventos.mapearEventosPorData(
      '.periodo__boton',
      'periodo',
      (periodo, e, elemento) => {
        document
          .querySelectorAll('.periodo__boton')
          .forEach((b) => b.classList.remove('periodo__boton--activo'));
        elemento.classList.add('periodo__boton--activo');
        RenderizadorCitas.cargarPeriodo(periodo);
      },
    );
  }

  static #configurarSesion() {
    MejoradorEventos.mapearEventos({
      '#btn-cerrar-sesion': {
        click: () => AutenticacionFachada.cerrarSesion(),
      },
    });
  }

  static #configurarHorarios() {
    MejoradorEventos.mapearEventos({
      '#formulario-horarios': {
        submit: (e) => GestorHorarios.guardar(e),
      },
    });

    MejoradorEventos.mapearEventosMultiples({
      '.configuracion__checkbox': {
        change: (e) =>
          GestorConfiguracionUI.toggleHorariosDia.call(
            GestorConfiguracionUI,
            e,
          ),
      },
    });
  }

  static #configurarDetalleCita() {
    MejoradorEventos.mapearEventos({
      '#btn-cerrar-detalle': {
        click: () =>
          NavigacionFachada.cerrarModal('modal-detalle-cita'),
      },
      '#btn-cancelar-cita-psicologo': {
        click: () => GestorDetalleCita.cancelar(),
      },
    });
  }

  static #configurarBusqueda() {
    MejoradorEventos.mapearEventos({
      '#busqueda-paciente': {
        input: (e) => GestorHistorial.cargar(e.target.value),
      },
      '#btn-cerrar-historial-paciente': {
        click: () =>
          NavigacionFachada.cerrarModal('modal-historial-paciente'),
      },
    });
  }
}
