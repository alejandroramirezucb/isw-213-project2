class AplicacionPaciente {
  static async inicializar() {
    const sesion = await AutenticacionFachada.verificar();
    if (!sesion) return;

    const usuario = await AutenticacionFachada.obtenerUsuario();
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
      MensajesFachada.mostrar(
        'No es posible agendar en este momento, comuníquese directamente con administración.',
        'error',
        10000,
      );
    }

    RenderizadorCalendario.inicializar();
    RenderizadorHorarios.inicializar();
    GestorProximaCita.inicializar();
    GestorMisCitas.inicializar();
    GestorPerfil.inicializar();
    ControladorEventosPaciente.inicializar();

    await RenderizadorCalendario.renderizar();
    await GestorProximaCita.cargar();
    await GestorMisCitas.cargar('proximas');
  }
}

document.addEventListener('DOMContentLoaded', () =>
  AplicacionPaciente.inicializar(),
);
