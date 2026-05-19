const GestorRestriccion = require('../js/psicologo/gestor/GestorRestriccion.js');
const RepositorioPacientes = require('../js/psicologo/repositorio/RepositorioPacientes.js');

describe('HU-15: Restricción de Pacientes', () => {
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

  describe('GestorRestriccion.bloquearDesdeCita', () => {
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

    test('LÍMITE: Bloquea sin botón en DOM', async () => {
      global.document.getElementById = jest.fn(() => null);
      await GestorRestriccion.bloquearDesdeCita('pac-1', false);
      expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(expect.stringContaining('bloqueado'), 'exito');
    });

    test('LÍMITE: Falla sin botón en DOM', async () => {
      global.document.getElementById = jest.fn(() => null);
      global.RepositorioPacientes.actualizarBloqueo.mockResolvedValue(false);
      await GestorRestriccion.bloquearDesdeCita('pac-1', false);
      expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(
        'Error al actualizar el estado del paciente',
        'error',
      );
    });

    test('LÍMITE: Usa período hoy cuando no hay botón activo', async () => {
      global.document.querySelector = jest.fn(() => null);
      await GestorRestriccion.bloquearDesdeCita('pac-1', false);
      expect(global.RenderizadorCitas.cargarPeriodo).toHaveBeenCalledWith('hoy');
    });
  });

  describe('GestorRestriccion.toggleBloqueo', () => {
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

  describe('RepositorioPacientes.actualizarBloqueo', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      global.clienteSupabase = {};
    });

    test('VÁLIDO: Bloquea paciente correctamente', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: { id: 'pac-1', bloqueado: true },
          error: null
        }),
      }));

      const resultado = await RepositorioPacientes.actualizarBloqueo('pac-1', true);
      expect(resultado).toBe(true);
      expect(global.clienteSupabase.from).toHaveBeenCalledWith('pacientes');
    });

    test('VÁLIDO: Desbloquea paciente correctamente', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: { id: 'pac-1', bloqueado: false },
          error: null
        }),
      }));

      const resultado = await RepositorioPacientes.actualizarBloqueo('pac-1', false);
      expect(resultado).toBe(true);
    });

    test('LÍMITE: Bloquea paciente recién agregado', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: { id: 'pac-nuevo', bloqueado: true },
          error: null
        }),
      }));

      const resultado = await RepositorioPacientes.actualizarBloqueo('pac-nuevo', true);
      expect(resultado).toBe(true);
    });

    test('INVÁLIDO: Retorna false si Supabase falla', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        }),
      }));

      const resultado = await RepositorioPacientes.actualizarBloqueo('pac-1', true);
      expect(resultado).toBe(false);
    });

    test('INVÁLIDO: No persiste si BD rechaza', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Permission denied' }
        }),
      }));

      const resultado = await RepositorioPacientes.actualizarBloqueo('pac-1', true);
      expect(resultado).toBe(false);
    });
  });
});
