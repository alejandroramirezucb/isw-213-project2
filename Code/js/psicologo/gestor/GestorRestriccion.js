class GestorRestriccion {
  static async toggleBloqueo(pacienteId, bloqueadoActual) {
    const exito = await this.#actualizarYNotificar(pacienteId, !bloqueadoActual);
    if (exito) {
      RepositorioCitasPsicologo.invalidarCacheHistorial(EstadoPsicologo.obtener('psicologoId'));
    }
  }

  static async bloquearDesdeCita(pacienteId, bloqueadoActual) {
    const btnBloquear = document.getElementById('btn-bloquear-paciente');
    const nuevoEstado = !bloqueadoActual;
    
    if (btnBloquear) {
      btnBloquear.disabled = true;
      btnBloquear.textContent = nuevoEstado ? 'Desbloqueando...' : 'Bloqueando...';
    }
    
    const exito = await RepositorioPacientes.actualizarBloqueo(pacienteId, nuevoEstado);
    
    if (exito) {
      if (btnBloquear) {
        btnBloquear.textContent = nuevoEstado ? 'Desbloquear Paciente' : 'Bloquear Paciente';
      }
      const accion = nuevoEstado ? 'bloqueado' : 'desbloqueado';
      MensajesFachada.mostrar(`Paciente ${accion} exitosamente`, 'exito');
    } else {
      if (btnBloquear) {
        btnBloquear.textContent = bloqueadoActual ? 'Desbloquear Paciente' : 'Bloquear Paciente';
      }
      MensajesFachada.mostrar('Error al actualizar el estado del paciente', 'error');
    }
    
    if (btnBloquear) {
      btnBloquear.disabled = false;
    }
    
    const periodoActivo = document.querySelector('.periodo__boton--activo');
    const periodo = periodoActivo ? periodoActivo.dataset.periodo : 'hoy';
    await RenderizadorCitas.cargarPeriodo(periodo);
    
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
      return false;
    }

    const accion = bloqueado ? 'bloqueado' : 'desbloqueado';
    MensajesFachada.mostrar(`Paciente ${accion} exitosamente`, 'exito');
    return true;
  }
}
