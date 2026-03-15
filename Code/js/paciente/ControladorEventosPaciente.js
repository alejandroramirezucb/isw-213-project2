class ControladorEventosPaciente {
  static inicializar() {
    document.querySelectorAll('.navegacion__boton').forEach((boton) => {
      boton.addEventListener('click', () => {
        NavigacionFachada.cambiarVista(boton.dataset.vista);
        if (boton.dataset.vista === 'mis-citas') {
          GestorMisCitas.cargar('proximas');
        }
      });
    });

    document
      .getElementById('btn-mes-anterior')
      ?.addEventListener('click', () => {
        const fecha = EstadoPaciente.obtener('fechaActual');
        fecha.setMonth(fecha.getMonth() - 1);
        RenderizadorCalendario.renderizar();
      });

    document
      .getElementById('btn-mes-siguiente')
      ?.addEventListener('click', () => {
        const fecha = EstadoPaciente.obtener('fechaActual');
        fecha.setMonth(fecha.getMonth() + 1);
        RenderizadorCalendario.renderizar();
      });

    document
      .getElementById('btn-cerrar-sesion')
      ?.addEventListener('click', () => AutenticacionFachada.cerrarSesion());

    document
      .getElementById('btn-cerrar-modal')
      ?.addEventListener('click', () => GestorReservas.cerrarModal());
    document
      .getElementById('btn-cancelar-reserva')
      ?.addEventListener('click', () => GestorReservas.cerrarModal());
    document
      .getElementById('btn-confirmar-reserva')
      ?.addEventListener('click', () => GestorReservas.confirmar());

    document.getElementById('modal-reserva')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) GestorReservas.cerrarModal();
    });

    document
      .getElementById('btn-cerrar-modal-cancelacion')
      ?.addEventListener('click', () =>
        NavigacionFachada.cerrarModal('modal-cancelacion'),
      );
    document
      .getElementById('btn-no-cancelar')
      ?.addEventListener('click', () =>
        NavigacionFachada.cerrarModal('modal-cancelacion'),
      );
    document
      .getElementById('btn-si-cancelar')
      ?.addEventListener('click', () => GestorCancelacion.cancelar());

    document
      .getElementById('btn-cancelar-proxima')
      ?.addEventListener('click', () => GestorCancelacion.mostrarModal());
    document
      .getElementById('btn-reprogramar-proxima')
      ?.addEventListener('click', () => GestorReprogramacion.iniciar());
    document
      .getElementById('btn-cancelar-reprogramacion')
      ?.addEventListener('click', () => GestorReprogramacion.salir());

    document.querySelectorAll('.filtros__boton').forEach((boton) => {
      boton.addEventListener('click', () => {
        document
          .querySelectorAll('.filtros__boton')
          .forEach((b) => b.classList.remove('filtros__boton--activo'));
        boton.classList.add('filtros__boton--activo');
        GestorMisCitas.cargar(boton.dataset.filtro);
      });
    });
  }
}
