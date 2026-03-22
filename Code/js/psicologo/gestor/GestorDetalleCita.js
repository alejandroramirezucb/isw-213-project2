class GestorDetalleCita {
  static mostrar(citaId) {
    const citas = EstadoPsicologo.obtener('citasCargadas');
    const cita = citas.find((c) => c.id === citaId);
    if (!cita) return;

    EstadoPsicologo.establecer('citaSeleccionada', citaId);

    const detallePaciente = document.getElementById('detalle-paciente');
    const detalleCorreo = document.getElementById('detalle-correo');
    const detalleTelefono = document.getElementById('detalle-telefono');
    const detalleFecha = document.getElementById('detalle-fecha');
    const detalleHora = document.getElementById('detalle-hora');
    const detalleEstado = document.getElementById('detalle-estado');

    if (detallePaciente) {
      detallePaciente.textContent = `${cita.pacientes.nombre} ${cita.pacientes.apellido}`;
    }
    if (detalleCorreo) {
      detalleCorreo.textContent = cita.pacientes.correo;
    }
    if (detalleTelefono) {
      detalleTelefono.textContent = cita.pacientes.telefono || 'No registrado';
    }
    if (detalleFecha) {
      detalleFecha.textContent = FormateadorFecha.aTexto(
        new Date(cita.bloques_horario.fecha + 'T00:00:00'),
      );
    }
    if (detalleHora) {
      detalleHora.textContent = `${FormateadorHora.formatear(cita.bloques_horario.hora_inicio)} - ${FormateadorHora.formatear(cita.bloques_horario.hora_fin)}`;
    }
    if (detalleEstado) {
      detalleEstado.textContent = cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);
    }

    const btnBloquear = document.getElementById('btn-bloquear-paciente');
    if (btnBloquear) {
      const bloqueado = cita.pacientes?.bloqueado;
      btnBloquear.textContent = bloqueado
        ? 'Desbloquear Paciente'
        : 'Bloquear Paciente';
      btnBloquear.dataset.pacienteId = cita.pacientes.id;
      btnBloquear.dataset.bloqueado = bloqueado ? 'true' : 'false';
    }

    NavigacionFachada.abrirModal('modal-detalle-cita');
  }

  static async cancelar() {
    const citaId = EstadoPsicologo.obtener('citaSeleccionada');
    if (!citaId) return;

    const exito =
      await RepositorioCitasPsicologo.cancelarConNotificacion(citaId);

    if (exito) {
      MensajesFachada.mostrar(
        'Cita cancelada. Se ha notificado al paciente.',
        'exito',
      );
      NavigacionFachada.cerrarModal('modal-detalle-cita');

      const periodoActivo = document.querySelector('.periodo__boton--activo');
      const periodo = periodoActivo ? periodoActivo.dataset.periodo : 'hoy';
      RenderizadorCitas.cargarPeriodo(periodo);
    } else {
      MensajesFachada.mostrar('Error al cancelar la cita', 'error');
    }
  }
}
