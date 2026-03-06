class GestorCancelacion {
  static mostrarModal() {
    Fachada.abrirModal('modal-cancelacion');
  }

  static async cancelar() {
    const citaId = EstadoPaciente.obtener('citaACancelar');
    if (!citaId) return;

    const exito = await RepositorioCitas.cancelar(citaId);

    if (exito) {
      Fachada.mostrarMensaje('Cita cancelada exitosamente', 'exito');
      Fachada.cerrarModal('modal-cancelacion');

      const fechaSel = EstadoPaciente.obtener('fechaSeleccionada');
      if (fechaSel) {
        await RepositorioListaEspera.notificarLiberacion(fechaSel);
      }

      await GestorProximaCita.cargar();
      await RenderizadorCalendario.renderizar();
    } else {
      Fachada.mostrarMensaje('Error al cancelar la cita', 'error');
    }
  }
}
