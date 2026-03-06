class GestorRestriccion {
  static async toggleBloqueo(pacienteId, bloqueadoActual) {
    const nuevoBloqueado = !bloqueadoActual;

    const resultado = await clienteSupabase
      .from('pacientes')
      .update({ bloqueado: nuevoBloqueado })
      .eq('id', pacienteId);

    if (resultado.error) {
      Fachada.mostrarMensaje(
        'Error al actualizar el estado del paciente',
        'error',
      );
      return;
    }

    const accion = nuevoBloqueado ? 'bloqueado' : 'desbloqueado';
    Fachada.mostrarMensaje(`Paciente ${accion} exitosamente`, 'exito');

    const busqueda = document.getElementById('busqueda-paciente')?.value || '';
    await GestorHistorial.cargar(busqueda);
  }

  static async bloquearDesdeCita(pacienteId, bloqueadoActual) {
    const nuevoBloqueado = !bloqueadoActual;

    const resultado = await clienteSupabase
      .from('pacientes')
      .update({ bloqueado: nuevoBloqueado })
      .eq('id', pacienteId);

    if (resultado.error) {
      Fachada.mostrarMensaje(
        'Error al actualizar el estado del paciente',
        'error',
      );
      return;
    }

    const accion = nuevoBloqueado ? 'bloqueado' : 'desbloqueado';
    Fachada.mostrarMensaje(`Paciente ${accion} exitosamente`, 'exito');
    Fachada.cerrarModal('modal-detalle-cita');
  }
}
