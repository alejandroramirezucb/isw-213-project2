class GestorRestriccion {
  static async toggleBloqueo(pacienteId, bloqueadoActual) {
    await this.#actualizarYNotificar(pacienteId, !bloqueadoActual);
    const busqueda = document.getElementById('busqueda-paciente')?.value || '';
    await GestorHistorial.cargar(busqueda);
  }

  static async bloquearDesdeCita(pacienteId, bloqueadoActual) {
    await this.#actualizarYNotificar(pacienteId, !bloqueadoActual);
    NavigacionFachada.cerrarModal('modal-detalle-cita');
  }

  static async #actualizarYNotificar(pacienteId, bloqueado) {
    const exito = await RepositorioPacientes.actualizarBloqueo(
      pacienteId,
      bloqueado,
    );

    if (!exito) {
      MensajesFachada.mostrar(
        'Error al actualizar el estado del paciente',
        'error',
      );
      return;
    }

    const accion = bloqueado ? 'bloqueado' : 'desbloqueado';
    MensajesFachada.mostrar(`Paciente ${accion} exitosamente`, 'exito');
  }
}
