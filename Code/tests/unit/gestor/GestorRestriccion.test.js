const GestorRestriccion = require('../../../js/psicologo/gestor/GestorRestriccion.js');

describe('GestorRestriccion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.RepositorioPacientes = { actualizarBloqueo: jest.fn().mockResolvedValue(true) };
    global.RepositorioCitasPsicologo = { invalidarCacheHistorial: jest.fn() };
    global.EstadoPsicologo = { obtener: jest.fn(() => 'psi-001') };
    global.MensajesFachada = { mostrar: jest.fn() };
    global.NavigacionFachada = { cerrarModal: jest.fn() };
    global.RenderizadorCitas = { cargarPeriodo: jest.fn().mockResolvedValue(null) };
    global.document = {
      getElementById: jest.fn((id) => {
        const elements = {
          'btn-bloquear-paciente': { disabled: false, textContent: 'Bloquear Paciente' },
        };
        return elements[id];
      }),
      querySelector: jest.fn(() => ({ dataset: { periodo: 'hoy' } })),
    };
  });

  test('VÁLIDO: Bloquea paciente correctamente', async () => {
    await GestorRestriccion.bloquearDesdeCita('pac-1', false);
    expect(global.RepositorioPacientes.actualizarBloqueo).toHaveBeenCalledWith('pac-1', true);
  });

  test('VÁLIDO: Desbloquea paciente correctamente', async () => {
    await GestorRestriccion.bloquearDesdeCita('pac-1', true);
    expect(global.RepositorioPacientes.actualizarBloqueo).toHaveBeenCalledWith('pac-1', false);
  });

  test('LÍMITE: Bloquea paciente recién agregado', async () => {
    await GestorRestriccion.bloquearDesdeCita('pac-nuevo', false);
    expect(global.RepositorioPacientes.actualizarBloqueo).toHaveBeenCalledWith('pac-nuevo', true);
  });

  test('INVÁLIDO: No bloquea si falla actualización', async () => {
    global.RepositorioPacientes.actualizarBloqueo.mockResolvedValue(false);
    await GestorRestriccion.bloquearDesdeCita('pac-1', false);
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(expect.stringContaining('Error'), 'error');
  });

  test('INVÁLIDO: Valida bloqueo en backend', async () => {
    global.RepositorioPacientes.actualizarBloqueo.mockResolvedValue(true);
    await GestorRestriccion.bloquearDesdeCita('pac-1', false);
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(expect.stringContaining('bloqueado'), 'exito');
  });

  test('VÁLIDO: toggleBloqueo bloquea cuando está desbloqueado', async () => {
    global.RepositorioPacientes.actualizarBloqueo.mockResolvedValue(true);
    global.RepositorioCitasPsicologo = { invalidarCacheHistorial: jest.fn() };
    await GestorRestriccion.toggleBloqueo('pac-1', false);
    expect(global.RepositorioPacientes.actualizarBloqueo).toHaveBeenCalledWith('pac-1', true);
  });

  test('VÁLIDO: toggleBloqueo desbloquea cuando está bloqueado', async () => {
    global.RepositorioPacientes.actualizarBloqueo.mockResolvedValue(true);
    global.RepositorioCitasPsicologo = { invalidarCacheHistorial: jest.fn() };
    await GestorRestriccion.toggleBloqueo('pac-1', true);
    expect(global.RepositorioPacientes.actualizarBloqueo).toHaveBeenCalledWith('pac-1', false);
  });

  test('INVÁLIDO: toggleBloqueo maneja error', async () => {
    global.RepositorioPacientes.actualizarBloqueo.mockResolvedValue(false);
    global.RepositorioCitasPsicologo = { invalidarCacheHistorial: jest.fn() };
    await GestorRestriccion.toggleBloqueo('pac-1', false);
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(expect.stringContaining('Error'), 'error');
  });
});
