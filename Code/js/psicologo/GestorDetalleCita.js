class GestorDetalleCita {
  static mostrar(citaId) {
    const citas = EstadoPsicologo.obtener('citasCargadas');
    const cita = citas.find((c) => c.id === citaId);
    if (!cita) return;

    EstadoPsicologo.establecer('citaSeleccionada', citaId);

    document.getElementById('detalle-paciente').textContent =
      `${cita.pacientes.nombre} ${cita.pacientes.apellido}`;
    document.getElementById('detalle-correo').textContent =
      cita.pacientes.correo;
    document.getElementById('detalle-telefono').textContent =
      cita.pacientes.telefono || 'No registrado';
    document.getElementById('detalle-fecha').textContent =
      Fachada.formatearFecha(
        new Date(cita.bloques_horario.fecha + 'T00:00:00'),
      );
    document.getElementById('detalle-hora').textContent =
      `${Fachada.formatearHora(cita.bloques_horario.hora_inicio)} - ${Fachada.formatearHora(cita.bloques_horario.hora_fin)}`;
    document.getElementById('detalle-estado').textContent =
      cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);

    const btnBloquear = document.getElementById('btn-bloquear-paciente');
    if (btnBloquear) {
      const bloqueado = cita.pacientes?.bloqueado;
      btnBloquear.textContent = bloqueado
        ? 'Desbloquear Paciente'
        : 'Bloquear Paciente';
      btnBloquear.dataset.pacienteId = cita.pacientes.id;
      btnBloquear.dataset.bloqueado = bloqueado ? 'true' : 'false';
    }

    Fachada.abrirModal('modal-detalle-cita');
  }

  static async cancelar() {
    const citaId = EstadoPsicologo.obtener('citaSeleccionada');
    if (!citaId) return;

    const exito = await RepositorioCitasPsicologo.cancelar(citaId);

    if (exito) {
      const pacienteId =
        await RepositorioCitasPsicologo.obtenerPacienteId(citaId);
      if (pacienteId) {
        await RepositorioCitasPsicologo.crearNotificacion(pacienteId, citaId);
      }

      Fachada.mostrarMensaje(
        'Cita cancelada. Se ha notificado al paciente.',
        'exito',
      );
      Fachada.cerrarModal('modal-detalle-cita');

      const periodoActivo = document.querySelector('.periodo__boton--activo');
      const periodo = periodoActivo ? periodoActivo.dataset.periodo : 'hoy';
      RenderizadorCitas.cargarPeriodo(periodo);
    } else {
      Fachada.mostrarMensaje('Error al cancelar la cita', 'error');
    }
  }
}
