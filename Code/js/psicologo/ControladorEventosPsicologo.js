class ControladorEventosPsicologo {
  static inicializar() {
    document.querySelectorAll('.navegacion__boton').forEach((boton) => {
      boton.addEventListener('click', () => {
        Fachada.cambiarVista(boton.dataset.vista);
        if (boton.dataset.vista === 'historial') {
          GestorHistorial.cargar();
        }
      });
    });

    document.querySelectorAll('.periodo__boton').forEach((boton) => {
      boton.addEventListener('click', () => {
        document
          .querySelectorAll('.periodo__boton')
          .forEach((b) => b.classList.remove('periodo__boton--activo'));
        boton.classList.add('periodo__boton--activo');
        RenderizadorCitas.cargarPeriodo(boton.dataset.periodo);
      });
    });

    document
      .getElementById('btn-cerrar-sesion')
      ?.addEventListener('click', () => Fachada.cerrarSesion());

    document
      .getElementById('formulario-horarios')
      ?.addEventListener('submit', (e) => GestorHorarios.guardar(e));

    document
      .querySelectorAll('.configuracion__checkbox')
      .forEach((checkbox) => {
        checkbox.addEventListener(
          'change',
          GestorConfiguracionUI.toggleHorariosDia,
        );
      });

    document
      .getElementById('btn-cerrar-detalle')
      ?.addEventListener('click', () =>
        Fachada.cerrarModal('modal-detalle-cita'),
      );
    document
      .getElementById('btn-cerrar-detalle-2')
      ?.addEventListener('click', () =>
        Fachada.cerrarModal('modal-detalle-cita'),
      );
    document
      .getElementById('btn-cancelar-cita-psicologo')
      ?.addEventListener('click', () => GestorDetalleCita.cancelar());

    document
      .getElementById('btn-bloquear-paciente')
      ?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        GestorRestriccion.bloquearDesdeCita(
          btn.dataset.pacienteId,
          btn.dataset.bloqueado === 'true',
        );
      });

    document
      .getElementById('busqueda-paciente')
      ?.addEventListener('input', (e) => {
        GestorHistorial.cargar(e.target.value);
      });

    document
      .getElementById('btn-cerrar-historial-paciente')
      ?.addEventListener('click', () =>
        Fachada.cerrarModal('modal-historial-paciente'),
      );
  }
}
