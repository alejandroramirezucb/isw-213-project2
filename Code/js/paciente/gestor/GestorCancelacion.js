class GestorCancelacion {
  static #MODAL_ID = 'modal-cancelacion';

  static mostrarModal() {
    NavigacionFachada.abrirModal(this.#MODAL_ID);
  }

  static async cancelar() {
    const citaId = EstadoPaciente.obtener('citaACancelar');
    if (!citaId) return;

    try {
      const exito = await RepositorioCitas.cancelar(citaId);

      if (exito) {
        MensajesFachada.mostrar('Cita cancelada exitosamente', 'exito');
        NavigacionFachada.cerrarModal(this.#MODAL_ID);
        await GestorProximaCita.cargar();
        await RenderizadorCalendario.renderizar();
      } else {
        MensajesFachada.mostrar('Error al cancelar la cita', 'error');
      }
    } catch (error) {
      MensajesFachada.mostrar('Error al cancelar la cita', 'error');
    }
  }
}
