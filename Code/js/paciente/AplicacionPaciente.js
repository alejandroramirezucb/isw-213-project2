class AplicacionPaciente {
  static async inicializar() {
    const sesion = await Fachada.verificarAutenticacion();
    if (!sesion) return;

    const usuario = await Fachada.obtenerUsuarioActual();
    if (!usuario || usuario.rol !== 'paciente') {
      window.location.href = 'index.html';
      return;
    }

    EstadoPaciente.establecer('usuario', usuario);
    EstadoPaciente.establecer('pacienteId', usuario.paciente_id);

    const nombreElemento = document.getElementById('nombre-usuario');
    if (nombreElemento && usuario.pacientes) {
      nombreElemento.textContent = `${usuario.pacientes.nombre} ${usuario.pacientes.apellido}`;
    }

    if (usuario.pacientes?.bloqueado) {
      Fachada.mostrarMensaje(
        'No es posible agendar en este momento, comuníquese directamente con administración.',
        'error',
        10000,
      );
    }

    RenderizadorCalendario.inicializar();
    RenderizadorHorarios.inicializar();
    GestorProximaCita.inicializar();
    GestorMisCitas.inicializar();
    ControladorEventosPaciente.inicializar();

    await RenderizadorCalendario.renderizar();
    await GestorProximaCita.cargar();
  }
}

document.addEventListener('DOMContentLoaded', () =>
  AplicacionPaciente.inicializar(),
);
