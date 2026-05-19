const RepositorioPacientes = require('../../../js/psicologo/repositorio/RepositorioPacientes.js');

describe('RepositorioPacientes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('actualizarBloqueo', () => {
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
